/**
 * Virtual Annealing Machine - Configuration
 * 
 * This file contains blockchain and token configuration.
 * Update these values according to your deployment environment.
 */

const CONFIG = {
  // LOT Token ERC-20 Contract Address
  // Replace with your deployed LOT token address
  LOT_TOKEN_ADDRESS: '0x0000000000000000000000000000000000000000',
  
  // Default Chain ID (Ethereum Mainnet: 1, Sepolia: 11155111, Polygon: 137, etc.)
  CHAIN_ID: 11155111, // Sepolia Testnet by default
  
  // Chain Name
  CHAIN_NAME: 'Sepolia Testnet',
  
  // RPC URL (optional - MetaMask will use its own RPC)
  RPC_URL: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
  
  // Block Explorer URL
  BLOCK_EXPLORER_URL: 'https://sepolia.etherscan.io',
  
  // Annealing Cost (in LOT tokens)
  ANNEALING_COST: 10,
  
  // Payment Recipient Address (where LOT tokens are sent)
  PAYMENT_RECIPIENT: '0x0000000000000000000000000000000000000000',
  
  // Application Settings
  APP_NAME: 'Virtual Annealing Machine',
  APP_VERSION: '1.0.0',
  
  // Default Annealing Parameters
  DEFAULT_PARAMS: {
    spinCount: 10,
    initialTemp: 100.0,
    coolingRate: 0.95,
    steps: 1000
  }
};

// Chain Configuration Details
const CHAIN_CONFIG = {
  chainId: `0x${CONFIG.CHAIN_ID.toString(16)}`,
  chainName: CONFIG.CHAIN_NAME,
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18
  },
  rpcUrls: [CONFIG.RPC_URL],
  blockExplorerUrls: [CONFIG.BLOCK_EXPLORER_URL]
};

// Validation
if (CONFIG.LOT_TOKEN_ADDRESS === '0x0000000000000000000000000000000000000000') {
  console.warn('⚠️ LOT Token address is not configured. Please update config.js');
}

if (CONFIG.PAYMENT_RECIPIENT === '0x0000000000000000000000000000000000000000') {
  console.warn('⚠️ Payment recipient address is not configured. Please update config.js');
}

