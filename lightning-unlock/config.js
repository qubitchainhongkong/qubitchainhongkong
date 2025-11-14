/**
 * Qubit Chain Hong Kong - Lightning Pay-To-Unlock
 * Configuration File
 * 
 * SECURITY NOTE:
 * - Only Invoice Key (read-only) should be placed here
 * - NEVER expose Admin Keys on the client side
 */

const CONFIG = {
  // LNbits Instance URL
  LNBITS_URL: 'https://legend.lnbits.com',
  
  // LNbits Invoice Key (read-only, safe to expose)
  // This key can only create invoices, NOT spend funds
  LNBITS_INVOICE_KEY: 'YOUR_INVOICE_KEY_HERE',
  
  // Application Settings
  APP_NAME: 'Qubit Chain Hong Kong',
  APP_SUBTITLE: 'Lightning Pay-To-Unlock Store',
  
  // Payment Polling Settings
  POLL_INTERVAL: 3000, // Check payment status every 3 seconds
  POLL_MAX_ATTEMPTS: 100, // Maximum polling attempts (5 minutes)
  
  // QR Code API
  QR_CODE_API: 'https://api.qrserver.com/v1/create-qr-code/',
  
  // Products Configuration
  // Add your digital products here
  PRODUCTS: {
    'ai-art-pack-01': {
      id: 'ai-art-pack-01',
      name: 'AI Art Pack #01',
      description: 'Collection of 10 unique AI-generated artworks in high resolution',
      price: 200, // in sats
      fileUrl: 'private/ai_art_pack_01_f8a3c9d2.zip',
      fileType: 'ZIP',
      fileSize: '15 MB'
    },
    'sat-study-guide': {
      id: 'sat-study-guide',
      name: 'SAT Study Guide 2025',
      description: 'Comprehensive SAT preparation materials and practice tests',
      price: 150,
      fileUrl: 'private/sat_guide_2025_b4e7f1a9.pdf',
      fileType: 'PDF',
      fileSize: '8 MB'
    },
    'trading-bot-config': {
      id: 'trading-bot-config',
      name: 'Trading Bot Configuration',
      description: 'Pre-configured trading bot settings for cryptocurrency markets',
      price: 500,
      fileUrl: 'private/bot_config_v2_9c3d8f7b.json',
      fileType: 'JSON',
      fileSize: '2 KB'
    },
    'nft-collection': {
      id: 'nft-collection',
      name: 'Digital NFT Collection',
      description: 'Exclusive collection of 5 digital NFT artworks',
      price: 1000,
      fileUrl: 'private/nft_collection_a1b2c3d4.zip',
      fileType: 'ZIP',
      fileSize: '25 MB'
    }
  },
  
  // Default product (if no product ID specified)
  DEFAULT_PRODUCT: 'ai-art-pack-01'
};

// Configuration validation
if (CONFIG.LNBITS_INVOICE_KEY === 'YOUR_INVOICE_KEY_HERE') {
  console.warn('⚠️ LNbits Invoice Key is not configured. Please update config.js');
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

