/**
 * Virtual Annealing Machine - Main Application Logic
 * 
 * This file handles:
 * - MetaMask wallet connection
 * - LOT token balance and payment
 * - Annealing execution and visualization
 */

// ============================================================================
// Global State
// ============================================================================

const appState = {
  web3: null,
  account: null,
  lotContract: null,
  lotBalance: 0,
  isConnected: false,
  isPaid: false,
  isAnnealing: false,
  currentResult: null
};

// ============================================================================
// MetaMask Connection
// ============================================================================

/**
 * Check if MetaMask is installed
 * @returns {boolean}
 */
function isMetaMaskInstalled() {
  return typeof window.ethereum !== 'undefined';
}

/**
 * Connect to MetaMask wallet
 */
async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    showAlert('MetaMask is not installed. Please install MetaMask extension.', 'error');
    window.open('https://metamask.io/', '_blank');
    return;
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    appState.account = accounts[0];
    appState.web3 = window.ethereum;
    appState.isConnected = true;
    
    // Initialize LOT contract
    await initializeLOTContract();
    
    // Check if on correct chain
    await checkChainId();
    
    // Get LOT balance
    await updateLOTBalance();
    
    // Update UI
    updateWalletUI();
    showAlert('Wallet connected successfully!', 'success');
    
    // Listen for account changes
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    
  } catch (error) {
    console.error('Error connecting wallet:', error);
    showAlert(`Failed to connect wallet: ${error.message}`, 'error');
  }
}

/**
 * Disconnect wallet
 */
function disconnectWallet() {
  appState.account = null;
  appState.isConnected = false;
  appState.lotBalance = 0;
  appState.isPaid = false;
  
  sessionStorage.removeItem('paid');
  
  updateWalletUI();
  showAlert('Wallet disconnected', 'info');
}

/**
 * Handle account changes
 */
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    disconnectWallet();
  } else if (accounts[0] !== appState.account) {
    appState.account = accounts[0];
    appState.isPaid = false;
    sessionStorage.removeItem('paid');
    updateLOTBalance();
    updateWalletUI();
  }
}

/**
 * Handle chain changes
 */
function handleChainChanged() {
  window.location.reload();
}

/**
 * Check if on correct chain
 */
async function checkChainId() {
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  const expectedChainId = `0x${CONFIG.CHAIN_ID.toString(16)}`;
  
  if (chainId !== expectedChainId) {
    showAlert(`Please switch to ${CONFIG.CHAIN_NAME}`, 'warning');
    
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: expectedChainId }],
      });
    } catch (switchError) {
      // Chain not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CHAIN_CONFIG],
          });
        } catch (addError) {
          console.error('Error adding chain:', addError);
        }
      }
    }
  }
}

// ============================================================================
// LOT Token Interaction
// ============================================================================

/**
 * Initialize LOT token contract
 */
async function initializeLOTContract() {
  try {
    const response = await fetch('contracts/LOT.json');
    const lotABI = await response.json();
    
    // Create contract instance using ethers.js-like interface
    appState.lotContract = {
      address: CONFIG.LOT_TOKEN_ADDRESS,
      abi: lotABI.abi
    };
    
  } catch (error) {
    console.error('Error initializing LOT contract:', error);
    showAlert('Failed to initialize LOT token contract', 'error');
  }
}

/**
 * Get LOT token balance
 */
async function updateLOTBalance() {
  if (!appState.account || !appState.lotContract) {
    return;
  }
  
  try {
    // Call balanceOf method
    const data = encodeFunctionCall(
      'balanceOf',
      ['address'],
      [appState.account]
    );
    
    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: CONFIG.LOT_TOKEN_ADDRESS,
        data: data
      }, 'latest']
    });
    
    // Decode result (assumes 18 decimals)
    const balance = parseInt(result, 16) / 1e18;
    appState.lotBalance = balance;
    
    // Update UI
    const balanceElement = document.getElementById('lot-balance');
    if (balanceElement) {
      balanceElement.textContent = `${balance.toFixed(2)} LOT`;
    }
    
  } catch (error) {
    console.error('Error getting LOT balance:', error);
  }
}

/**
 * Pay LOT tokens for annealing
 */
async function payWithLOT() {
  if (!appState.isConnected) {
    showAlert('Please connect your wallet first', 'warning');
    return;
  }
  
  if (appState.lotBalance < CONFIG.ANNEALING_COST) {
    showAlert(`Insufficient LOT balance. Need ${CONFIG.ANNEALING_COST} LOT`, 'error');
    return;
  }
  
  if (CONFIG.PAYMENT_RECIPIENT === '0x0000000000000000000000000000000000000000') {
    showAlert('Payment recipient address is not configured', 'error');
    return;
  }
  
  try {
    const button = document.getElementById('pay-button');
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="spinner"></span> Processing Payment...';
    }
    
    // Encode transfer function call
    const amount = BigInt(CONFIG.ANNEALING_COST * 1e18).toString(16);
    const data = encodeFunctionCall(
      'transfer',
      ['address', 'uint256'],
      [CONFIG.PAYMENT_RECIPIENT, '0x' + amount]
    );
    
    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        from: appState.account,
        to: CONFIG.LOT_TOKEN_ADDRESS,
        data: data,
        gas: '0x186A0', // 100,000 gas
      }],
    });
    
    showAlert('Payment transaction submitted. Waiting for confirmation...', 'info');
    
    // Wait for transaction confirmation
    await waitForTransaction(txHash);
    
    // Mark as paid
    appState.isPaid = true;
    sessionStorage.setItem('paid', 'true');
    
    // Update balance
    await updateLOTBalance();
    
    // Show annealing panel
    showAnnealingPanel();
    
    showAlert('Payment confirmed! You can now run annealing.', 'success');
    
  } catch (error) {
    console.error('Payment error:', error);
    showAlert(`Payment failed: ${error.message}`, 'error');
  } finally {
    const button = document.getElementById('pay-button');
    if (button) {
      button.disabled = false;
      button.innerHTML = `⚡ Run Annealing (${CONFIG.ANNEALING_COST} LOT)`;
    }
  }
}

/**
 * Wait for transaction confirmation
 */
async function waitForTransaction(txHash) {
  return new Promise((resolve, reject) => {
    const checkReceipt = async () => {
      try {
        const receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });
        
        if (receipt) {
          if (receipt.status === '0x1') {
            resolve(receipt);
          } else {
            reject(new Error('Transaction failed'));
          }
        } else {
          setTimeout(checkReceipt, 2000);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    checkReceipt();
  });
}

/**
 * Encode function call for ERC-20
 */
function encodeFunctionCall(functionName, types, values) {
  const functionSignatures = {
    'balanceOf': '70a08231',
    'transfer': 'a9059cbb',
    'approve': '095ea7b3',
  };
  
  let data = '0x' + functionSignatures[functionName];
  
  // Simple encoding for common types
  types.forEach((type, index) => {
    const value = values[index];
    if (type === 'address') {
      data += value.slice(2).padStart(64, '0');
    } else if (type === 'uint256') {
      data += value.slice(2).padStart(64, '0');
    }
  });
  
  return data;
}

// ============================================================================
// Annealing Execution
// ============================================================================

/**
 * Show annealing parameter panel
 */
function showAnnealingPanel() {
  const panel = document.getElementById('annealing-panel');
  if (panel) {
    panel.classList.remove('hidden');
    panel.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Run annealing computation
 */
async function runAnnealing() {
  if (!appState.isPaid && sessionStorage.getItem('paid') !== 'true') {
    showAlert('Please pay LOT tokens first', 'warning');
    return;
  }
  
  if (appState.isAnnealing) {
    showAlert('Annealing is already running', 'warning');
    return;
  }
  
  try {
    appState.isAnnealing = true;
    
    // Get parameters from form
    const spinCount = parseInt(document.getElementById('spin-count').value);
    const initialTemp = parseFloat(document.getElementById('initial-temp').value);
    const coolingRate = parseFloat(document.getElementById('cooling-rate').value);
    const steps = parseInt(document.getElementById('steps').value);
    
    // Validate parameters
    if (spinCount < 2 || spinCount > 100) {
      showAlert('Spin count must be between 2 and 100', 'error');
      appState.isAnnealing = false;
      return;
    }
    
    if (coolingRate <= 0 || coolingRate >= 1) {
      showAlert('Cooling rate must be between 0 and 1', 'error');
      appState.isAnnealing = false;
      return;
    }
    
    // Update UI
    const button = document.getElementById('run-annealing-button');
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="spinner"></span> Running Annealing...';
    }
    
    const resultPanel = document.getElementById('result-panel');
    if (resultPanel) {
      resultPanel.classList.add('hidden');
    }
    
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) {
      progressContainer.classList.remove('hidden');
    }
    
    showAlert('Starting annealing computation...', 'info');
    
    // Create annealer instance
    const annealer = new VirtualAnnealer(spinCount, initialTemp, coolingRate, steps);
    
    // Run annealing with progress callback
    const result = await annealer.annealAsync((progress) => {
      updateProgress(progress);
    });
    
    // Store result
    appState.currentResult = result;
    
    // Display results
    displayResults(result);
    
    // Clear payment flag (one payment = one job)
    appState.isPaid = false;
    sessionStorage.removeItem('paid');
    
    // Hide annealing panel
    const panel = document.getElementById('annealing-panel');
    if (panel) {
      panel.classList.add('hidden');
    }
    
    showAlert('Annealing completed successfully!', 'success');
    
  } catch (error) {
    console.error('Annealing error:', error);
    showAlert(`Annealing failed: ${error.message}`, 'error');
  } finally {
    appState.isAnnealing = false;
    
    const button = document.getElementById('run-annealing-button');
    if (button) {
      button.disabled = false;
      button.innerHTML = '🚀 Start Annealing';
    }
    
    const progressContainer = document.getElementById('progress-container');
    if (progressContainer) {
      progressContainer.classList.add('hidden');
    }
  }
}

/**
 * Update progress display
 */
function updateProgress(progress) {
  const progressBar = document.getElementById('progress-fill');
  if (progressBar) {
    progressBar.style.width = `${progress.progress}%`;
  }
  
  const progressText = document.getElementById('progress-text');
  if (progressText) {
    progressText.textContent = `Step ${progress.step} / ${progress.totalSteps}`;
  }
  
  const energyText = document.getElementById('progress-energy');
  if (energyText) {
    energyText.textContent = `Energy: ${progress.bestEnergy.toFixed(4)}`;
  }
}

/**
 * Display annealing results
 */
function displayResults(result) {
  const resultPanel = document.getElementById('result-panel');
  if (!resultPanel) return;
  
  resultPanel.classList.remove('hidden');
  
  // Display energy values
  document.getElementById('final-energy').textContent = result.bestEnergy.toFixed(6);
  document.getElementById('steps-completed').textContent = result.energyHistory.length * 10;
  
  // Display spin configuration
  displaySpinConfiguration(result.bestSpins);
  
  // Display energy chart
  displayEnergyChart(result.energyHistory);
  
  resultPanel.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Display spin configuration
 */
function displaySpinConfiguration(spins) {
  const container = document.getElementById('spin-grid');
  if (!container) return;
  
  container.innerHTML = '';
  
  spins.forEach((spin, index) => {
    const cell = document.createElement('div');
    cell.className = `spin-cell ${spin === 1 ? 'spin-up' : 'spin-down'}`;
    cell.textContent = spin === 1 ? '↑' : '↓';
    cell.title = `Spin ${index}: ${spin}`;
    container.appendChild(cell);
  });
}

/**
 * Display energy chart (simple ASCII-style)
 */
function displayEnergyChart(energyHistory) {
  const container = document.getElementById('energy-chart');
  if (!container) return;
  
  const maxEnergy = Math.max(...energyHistory);
  const minEnergy = Math.min(...energyHistory);
  const range = maxEnergy - minEnergy;
  
  let chartHTML = '<div style="font-family: monospace; font-size: 0.75rem; line-height: 1.2;">';
  chartHTML += `<div>Energy Evolution (${energyHistory.length} samples)</div>`;
  chartHTML += `<div>Max: ${maxEnergy.toFixed(4)}, Min: ${minEnergy.toFixed(4)}</div>`;
  chartHTML += '<div style="margin-top: 0.5rem; background: var(--bg-secondary); padding: 0.5rem; border-radius: 4px;">';
  
  // Simple bar chart
  const sampleEvery = Math.max(1, Math.floor(energyHistory.length / 50));
  for (let i = 0; i < energyHistory.length; i += sampleEvery) {
    const energy = energyHistory[i];
    const normalized = range > 0 ? (energy - minEnergy) / range : 0;
    const barLength = Math.round(normalized * 40);
    const bar = '█'.repeat(barLength) + '░'.repeat(40 - barLength);
    chartHTML += `<div>${bar} ${energy.toFixed(4)}</div>`;
  }
  
  chartHTML += '</div></div>';
  container.innerHTML = chartHTML;
}

// ============================================================================
// UI Updates
// ============================================================================

/**
 * Update wallet UI
 */
function updateWalletUI() {
  const connectButton = document.getElementById('connect-button');
  const walletInfo = document.getElementById('wallet-info');
  const walletAddress = document.getElementById('wallet-address');
  const statusBadge = document.getElementById('status-badge');
  const paySection = document.getElementById('pay-section');
  
  if (appState.isConnected) {
    if (connectButton) {
      connectButton.textContent = 'Disconnect Wallet';
      connectButton.onclick = disconnectWallet;
    }
    if (walletInfo) walletInfo.classList.remove('hidden');
    if (walletAddress) {
      walletAddress.textContent = `${appState.account.slice(0, 6)}...${appState.account.slice(-4)}`;
    }
    if (statusBadge) {
      statusBadge.innerHTML = '<span class="status-dot"></span> Connected';
      statusBadge.className = 'status-badge status-connected';
    }
    if (paySection) paySection.classList.remove('hidden');
  } else {
    if (connectButton) {
      connectButton.textContent = 'Connect Wallet';
      connectButton.onclick = connectWallet;
    }
    if (walletInfo) walletInfo.classList.add('hidden');
    if (statusBadge) {
      statusBadge.innerHTML = '<span class="status-dot"></span> Disconnected';
      statusBadge.className = 'status-badge status-disconnected';
    }
    if (paySection) paySection.classList.add('hidden');
  }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
  const container = document.getElementById('alert-container');
  if (!container) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    <span style="font-size: 1.25rem;">${
      type === 'success' ? '✅' :
      type === 'error' ? '❌' :
      type === 'warning' ? '⚠️' : 'ℹ️'
    }</span>
    <span>${message}</span>
  `;
  
  container.appendChild(alert);
  
  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the application
 */
function initializeApp() {
  console.log('🚀 Initializing Virtual Annealing Machine...');
  
  // Check for existing paid session
  if (sessionStorage.getItem('paid') === 'true') {
    appState.isPaid = true;
  }
  
  // Set default values
  document.getElementById('spin-count').value = CONFIG.DEFAULT_PARAMS.spinCount;
  document.getElementById('initial-temp').value = CONFIG.DEFAULT_PARAMS.initialTemp;
  document.getElementById('cooling-rate').value = CONFIG.DEFAULT_PARAMS.coolingRate;
  document.getElementById('steps').value = CONFIG.DEFAULT_PARAMS.steps;
  
  // Update UI
  updateWalletUI();
  
  // Check if MetaMask is already connected
  if (isMetaMaskInstalled() && window.ethereum.selectedAddress) {
    connectWallet();
  }
  
  console.log('✅ Initialization complete');
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

