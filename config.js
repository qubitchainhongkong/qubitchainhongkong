/**
 * Qubitchain Gateway - Configuration File
 * 
 * This file contains LNbits configuration settings.
 * In production, these should be injected from environment variables at build time.
 * 
 * Security Warning:
 * - NEVER expose Admin Key on the client side
 * - Only use Invoice Key (read-only) for client-side operations
 */

const CONFIG = {
  // LNbits instance URL
  // Example: 'https://legend.lnbits.com' or 'https://testnet.lnbits.com'
  LNBITS_URL: 'https://legend.lnbits.com',
  
  // LNbits Wallet Invoice Key (read-only)
  // Expected to be loaded from LNBITS_INVOICE_KEY environment variable
  // Note: Can only create invoices, cannot send funds
  LNBITS_INVOICE_KEY: 'YOUR_INVOICE_KEY_HERE',
  
  // LNbits Wallet Admin Key (for demo purposes)
  // WARNING: NEVER expose this on client side in production!
  // Use only for demo/testing purposes
  LNBITS_ADMIN_KEY: 'YOUR_ADMIN_KEY_HERE',
  
  // Cost per API request (in sats)
  API_COST_SATS: 5,
  
  // Project name
  PROJECT_NAME: 'Qubitchain Gateway',
  
  // GitHub Pages base URL
  // Example: 'https://username.github.io/qbhk'
  BASE_URL: window.location.origin + window.location.pathname.replace(/\/$/, ''),
};

// Override with environment variables if available
// (When using build tools to inject process.env)
if (typeof process !== 'undefined' && process.env) {
  if (process.env.LNBITS_URL) {
    CONFIG.LNBITS_URL = process.env.LNBITS_URL;
  }
  if (process.env.LNBITS_INVOICE_KEY) {
    CONFIG.LNBITS_INVOICE_KEY = process.env.LNBITS_INVOICE_KEY;
  }
  if (process.env.LNBITS_ADMIN_KEY) {
    CONFIG.LNBITS_ADMIN_KEY = process.env.LNBITS_ADMIN_KEY;
  }
}

// Validate configuration
if (CONFIG.LNBITS_INVOICE_KEY === 'YOUR_INVOICE_KEY_HERE' || 
    CONFIG.LNBITS_ADMIN_KEY === 'YOUR_ADMIN_KEY_HERE') {
  console.warn('⚠️ LNbits API keys are not configured. Please edit config.js');
}

