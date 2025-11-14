/**
 * Qubitchain Gateway - Main Application Logic
 * 
 * This file contains the following functionality:
 * - API Key generation and management
 * - LNbits API integration
 * - Lightning Network payment processing
 * - Wallet balance retrieval
 */

// ============================================================================
// Constants & State Management
// ============================================================================

const STORAGE_KEY = 'qbhk_api_keys';
const WALLET_KEY = 'qbhk_wallet_data';

let appState = {
  apiKeys: [],
  walletBalance: 0,
  isLoading: false,
  currentInvoice: null
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a random API Key
 * @returns {string} Generated API Key
 */
function generateApiKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 32;
  let apiKey = 'qbhk_';
  
  for (let i = 0; i < length; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return apiKey;
}

/**
 * Generate UUID v4
 * @returns {string} UUID
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format satoshis for display
 * @param {number} sats - Number of satoshis
 * @returns {string} Formatted string
 */
function formatSats(sats) {
  return new Intl.NumberFormat('en-US').format(sats) + ' sats';
}

/**
 * Save API Keys to localStorage
 */
function saveApiKeys() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.apiKeys));
}

/**
 * Load API Keys from localStorage
 */
function loadApiKeys() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      appState.apiKeys = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load API Keys:', e);
      appState.apiKeys = [];
    }
  }
}

/**
 * Show alert message
 * @param {string} message - Message to display
 * @param {string} type - Alert type (success, error, warning, info)
 */
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alert-container');
  if (!alertContainer) return;
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  
  alertContainer.appendChild(alert);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// ============================================================================
// LNbits API Functions
// ============================================================================

/**
 * Helper function for LNbits API requests
 * @param {string} endpoint - API endpoint
 * @param {string} apiKey - LNbits API Key
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
async function lnbitsRequest(endpoint, apiKey, options = {}) {
  const url = `${CONFIG.LNBITS_URL}${endpoint}`;
  
  const headers = {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LNbits API error: ${response.status} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('LNbits API request failed:', error);
    throw error;
  }
}

/**
 * Get wallet balance
 * @returns {Promise<number>} Balance in sats
 */
async function getWalletBalance() {
  try {
    const data = await lnbitsRequest('/api/v1/wallet', CONFIG.LNBITS_ADMIN_KEY);
    return data.balance / 1000; // Convert msat to sat
  } catch (error) {
    console.error('Error fetching balance:', error);
    showAlert('Failed to fetch wallet balance', 'error');
    return 0;
  }
}

/**
 * Create a Lightning Invoice
 * @param {number} amount - Amount in sats
 * @param {string} memo - Invoice memo
 * @returns {Promise<object>} Invoice data
 */
async function createInvoice(amount, memo = '') {
  try {
    const data = await lnbitsRequest('/api/v1/payments', CONFIG.LNBITS_INVOICE_KEY, {
      method: 'POST',
      body: JSON.stringify({
        out: false,
        amount: amount,
        memo: memo || `Qubitchain Gateway - ${amount} sats`,
        unit: 'sat'
      })
    });
    
    return data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
}

/**
 * Check invoice payment status
 * @param {string} paymentHash - Payment hash
 * @returns {Promise<boolean>} Whether the invoice is paid
 */
async function checkInvoiceStatus(paymentHash) {
  try {
    const data = await lnbitsRequest(`/api/v1/payments/${paymentHash}`, CONFIG.LNBITS_INVOICE_KEY);
    return data.paid === true;
  } catch (error) {
    console.error('Error checking invoice status:', error);
    return false;
  }
}

/**
 * Wait for invoice payment (polling)
 * @param {string} paymentHash - Payment hash
 * @param {number} maxAttempts - Maximum number of attempts
 * @param {number} interval - Check interval in milliseconds
 * @returns {Promise<boolean>} Whether payment was completed
 */
async function waitForPayment(paymentHash, maxAttempts = 60, interval = 2000) {
  for (let i = 0; i < maxAttempts; i++) {
    const isPaid = await checkInvoiceStatus(paymentHash);
    if (isPaid) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  return false;
}

// ============================================================================
// API Key Management
// ============================================================================

/**
 * Create and save a new API Key
 * @returns {object} Generated API Key data
 */
function createNewApiKey() {
  const apiKey = generateApiKey();
  const keyData = {
    key: apiKey,
    id: generateUUID(),
    createdAt: new Date().toISOString(),
    usageCount: 0,
    totalCharged: 0
  };
  
  appState.apiKeys.push(keyData);
  saveApiKeys();
  
  showAlert('New API Key generated successfully!', 'success');
  return keyData;
}

/**
 * Delete an API Key
 * @param {string} keyId - API Key ID to delete
 */
function deleteApiKey(keyId) {
  const index = appState.apiKeys.findIndex(k => k.id === keyId);
  if (index !== -1) {
    appState.apiKeys.splice(index, 1);
    saveApiKeys();
    showAlert('API Key deleted successfully', 'success');
  }
}

/**
 * Validate an API Key
 * @param {string} apiKey - API Key to validate
 * @returns {object|null} Found API Key data, or null
 */
function validateApiKey(apiKey) {
  return appState.apiKeys.find(k => k.key === apiKey) || null;
}

/**
 * Update API Key usage statistics
 * @param {string} apiKey - API Key
 * @param {number} charged - Amount charged in sats
 */
function updateApiKeyUsage(apiKey, charged) {
  const keyData = appState.apiKeys.find(k => k.key === apiKey);
  if (keyData) {
    keyData.usageCount++;
    keyData.totalCharged += charged;
    saveApiKeys();
  }
}

// ============================================================================
// API Endpoint Simulation
// ============================================================================

/**
 * Test Hello API
 * @param {string} apiKey - API Key
 * @returns {Promise<object>} API response
 */
async function callHelloAPI(apiKey) {
  // Validate API Key
  const keyData = validateApiKey(apiKey);
  if (!keyData) {
    throw new Error('Invalid API Key');
  }
  
  // Create invoice
  showAlert('Creating Lightning Invoice...', 'info');
  const invoice = await createInvoice(CONFIG.API_COST_SATS, `Hello API - ${apiKey.substring(0, 12)}...`);
  
  appState.currentInvoice = invoice;
  
  // Display invoice and wait for user payment
  displayInvoice(invoice);
  
  showAlert('Please complete payment via Lightning Invoice', 'warning');
  
  // Wait for payment
  const paid = await waitForPayment(invoice.payment_hash);
  
  if (paid) {
    // Payment successful
    updateApiKeyUsage(apiKey, CONFIG.API_COST_SATS);
    showAlert('Payment confirmed!', 'success');
    
    // Return API response
    return {
      success: true,
      message: 'Hello from Qubitchain Gateway! ⚡',
      credits_charged: CONFIG.API_COST_SATS,
      timestamp: new Date().toISOString(),
      api_key_id: keyData.id
    };
  } else {
    // Payment timeout
    throw new Error('Payment timed out. Please try again.');
  }
}

// ============================================================================
// UI Functions
// ============================================================================

/**
 * Render API Keys list
 */
function renderApiKeys() {
  const container = document.getElementById('api-keys-list');
  if (!container) return;
  
  // No API Keys
  if (appState.apiKeys.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔑</div>
        <div class="empty-state-text">No API Keys yet</div>
        <p class="text-muted">Click "Generate API Key" button to create a new API Key</p>
      </div>
    `;
    return;
  }
  
  // Display API Keys
  container.innerHTML = appState.apiKeys.map(keyData => `
    <div class="api-key-item">
      <div>
        <div class="api-key-text">${keyData.key}</div>
        <small class="text-muted">
          Created: ${new Date(keyData.createdAt).toLocaleString('en-US')} | 
          Usage: ${keyData.usageCount} | 
          Total Charged: ${formatSats(keyData.totalCharged)}
        </small>
      </div>
      <div class="api-key-actions">
        <button class="btn btn-secondary btn-small" onclick="copyApiKey('${keyData.key}')">
          📋 Copy
        </button>
        <button class="btn btn-danger btn-small" onclick="confirmDeleteApiKey('${keyData.id}')">
          🗑️ Delete
        </button>
      </div>
    </div>
  `).join('');
}

/**
 * Update statistics display
 */
function updateStats() {
  const balanceElement = document.getElementById('wallet-balance');
  const keysCountElement = document.getElementById('keys-count');
  const totalUsageElement = document.getElementById('total-usage');
  
  if (balanceElement) {
    balanceElement.textContent = formatSats(appState.walletBalance);
  }
  
  if (keysCountElement) {
    keysCountElement.textContent = appState.apiKeys.length;
  }
  
  if (totalUsageElement) {
    const totalUsage = appState.apiKeys.reduce((sum, k) => sum + k.usageCount, 0);
    totalUsageElement.textContent = totalUsage;
  }
}

/**
 * Display invoice with QR code
 * @param {object} invoice - Invoice data
 */
function displayInvoice(invoice) {
  const invoiceContainer = document.getElementById('invoice-display');
  if (!invoiceContainer) return;
  
  // Generate QR code (simple version)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(invoice.payment_request)}`;
  
  invoiceContainer.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">⚡ Lightning Invoice</h3>
      </div>
      <div class="text-center">
        <img src="${qrCodeUrl}" alt="QR Code" style="max-width: 300px; border-radius: 8px;">
        <div class="mt-2">
          <strong>Amount:</strong> ${CONFIG.API_COST_SATS} sats
        </div>
        <div class="code-block mt-2" style="font-size: 0.7rem; word-break: break-all;">
          ${invoice.payment_request}
        </div>
        <button class="btn btn-secondary mt-1" onclick="copyInvoice('${invoice.payment_request}')">
          📋 Copy Invoice
        </button>
      </div>
      <div class="alert alert-info mt-2">
        <strong>Waiting for payment...</strong><br>
        Scan this invoice with your Lightning wallet to complete the payment.
        API response will be displayed automatically after payment confirmation.
      </div>
    </div>
  `;
  
  invoiceContainer.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Copy API Key to clipboard
 * @param {string} apiKey - API Key to copy
 */
function copyApiKey(apiKey) {
  navigator.clipboard.writeText(apiKey).then(() => {
    showAlert('API Key copied to clipboard', 'success');
  }).catch(() => {
    showAlert('Failed to copy', 'error');
  });
}

/**
 * Copy invoice to clipboard
 * @param {string} invoice - Invoice to copy
 */
function copyInvoice(invoice) {
  navigator.clipboard.writeText(invoice).then(() => {
    showAlert('Invoice copied to clipboard', 'success');
  }).catch(() => {
    showAlert('Failed to copy', 'error');
  });
}

/**
 * Confirm API Key deletion
 * @param {string} keyId - API Key ID to delete
 */
function confirmDeleteApiKey(keyId) {
  if (confirm('Are you sure you want to delete this API Key?')) {
    deleteApiKey(keyId);
    renderApiKeys();
    updateStats();
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Generate a new API Key
 */
async function handleGenerateApiKey() {
  createNewApiKey();
  renderApiKeys();
  updateStats();
}

/**
 * Refresh wallet balance
 */
async function handleRefreshBalance() {
  const button = document.getElementById('refresh-balance-btn');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<span class="spinner"></span> Refreshing...';
  }
  
  appState.walletBalance = await getWalletBalance();
  updateStats();
  
  if (button) {
    button.disabled = false;
    button.innerHTML = '🔄 Refresh Balance';
  }
  
  showAlert('Wallet balance updated', 'success');
}

/**
 * Test API call
 */
async function handleTestAPI() {
  const apiKeyInput = document.getElementById('test-api-key');
  const apiKey = apiKeyInput?.value?.trim();
  
  if (!apiKey) {
    showAlert('Please enter an API Key', 'warning');
    return;
  }
  
  const button = document.getElementById('test-api-btn');
  const resultContainer = document.getElementById('api-result');
  
  try {
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="spinner"></span> Processing...';
    }
    
    const result = await callHelloAPI(apiKey);
    
    if (resultContainer) {
      resultContainer.innerHTML = `
        <div class="alert alert-success">
          <strong>✅ API Call Success!</strong>
        </div>
        <div class="code-block">
          <pre>${JSON.stringify(result, null, 2)}</pre>
        </div>
      `;
    }
    
    // Update UI
    renderApiKeys();
    updateStats();
    await handleRefreshBalance();
    
  } catch (error) {
    showAlert(`API error: ${error.message}`, 'error');
    if (resultContainer) {
      resultContainer.innerHTML = `
        <div class="alert alert-error">
          <strong>❌ Error:</strong> ${error.message}
        </div>
      `;
    }
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = '⚡ Test API Call';
    }
  }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the application
 */
async function initializeApp() {
  console.log('🚀 Initializing Qubitchain Gateway...');
  
  // Validate configuration
  if (CONFIG.LNBITS_INVOICE_KEY === 'YOUR_INVOICE_KEY_HERE') {
    showAlert('⚠️ LNbits API keys are not configured. Please edit config.js', 'warning');
  }
  
  // Load API Keys
  loadApiKeys();
  
  // Fetch wallet balance
  appState.walletBalance = await getWalletBalance();
  
  // Initialize UI
  renderApiKeys();
  updateStats();
  
  console.log('✅ Initialization complete');
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
