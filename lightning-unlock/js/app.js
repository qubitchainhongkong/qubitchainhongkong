/**
 * Qubit Chain Hong Kong - Lightning Pay-To-Unlock
 * Main Application Logic
 */

// Global state
const appState = {
  currentProduct: null,
  invoice: null,
  isPolling: false,
  isPaid: false,
  lnbits: null
};

/**
 * Initialize the application
 */
function initApp() {
  console.log('🚀 Initializing Qubit Chain Lightning Unlock...');
  
  // Initialize LNbits API
  appState.lnbits = new LNbitsAPI(CONFIG.LNBITS_URL, CONFIG.LNBITS_INVOICE_KEY);
  
  // Get product ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product') || CONFIG.DEFAULT_PRODUCT;
  
  // Load product
  loadProduct(productId);
  
  // Setup event listeners
  setupEventListeners();
  
  console.log('✅ Initialization complete');
}

/**
 * Load product information
 */
function loadProduct(productId) {
  const product = CONFIG.PRODUCTS[productId];
  
  if (!product) {
    showError(`Product "${productId}" not found`);
    return;
  }
  
  appState.currentProduct = product;
  
  // Update UI with product information
  document.getElementById('product-name').textContent = product.name;
  document.getElementById('product-description').textContent = product.description;
  document.getElementById('product-price').textContent = `${product.price} sats`;
  document.getElementById('product-type').textContent = product.fileType;
  document.getElementById('product-size').textContent = product.fileSize;
  
  console.log('📦 Product loaded:', product.name);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const generateBtn = document.getElementById('generate-invoice-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', handleGenerateInvoice);
  }
  
  const copyBtn = document.getElementById('copy-invoice-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', handleCopyInvoice);
  }
  
  const downloadBtn = document.getElementById('download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', handleDownload);
  }
}

/**
 * Handle invoice generation
 */
async function handleGenerateInvoice() {
  if (!appState.currentProduct) {
    showError('No product selected');
    return;
  }
  
  const button = document.getElementById('generate-invoice-btn');
  
  try {
    // Disable button
    button.disabled = true;
    button.textContent = 'Generating...';
    
    // Create invoice
    const invoice = await appState.lnbits.createInvoice(
      appState.currentProduct.price,
      `${CONFIG.APP_NAME} - ${appState.currentProduct.name}`
    );
    
    appState.invoice = invoice;
    
    // Show invoice section
    displayInvoice(invoice);
    
    // Hide product section, show invoice section
    document.getElementById('product-section').classList.add('hidden');
    document.getElementById('invoice-section').classList.remove('hidden');
    
    // Start polling for payment
    startPaymentPolling(invoice.payment_hash);
    
    showSuccess('Invoice generated! Please pay to unlock your file.');
    
  } catch (error) {
    console.error('Error generating invoice:', error);
    showError(`Failed to generate invoice: ${error.message}`);
    button.disabled = false;
    button.textContent = '⚡ Generate Invoice';
  }
}

/**
 * Display invoice with QR code
 */
function displayInvoice(invoice) {
  // Generate QR code URL
  const qrUrl = appState.lnbits.generateQRCodeUrl(invoice.payment_request);
  
  // Update UI
  document.getElementById('qr-code').src = qrUrl;
  document.getElementById('invoice-text').value = invoice.payment_request;
  document.getElementById('invoice-amount').textContent = `${invoice.amount} sats`;
  
  console.log('📱 Invoice displayed');
}

/**
 * Start polling for payment confirmation
 */
async function startPaymentPolling(paymentHash) {
  if (appState.isPolling) {
    return;
  }
  
  appState.isPolling = true;
  
  console.log('🔄 Starting payment polling...');
  
  // Show polling status
  const statusElement = document.getElementById('payment-status');
  statusElement.textContent = 'Waiting for payment...';
  statusElement.className = 'payment-status waiting';
  
  // Start polling
  const paid = await appState.lnbits.pollPayment(
    paymentHash,
    (update) => {
      // Update progress
      const progress = (update.attempts / update.maxAttempts) * 100;
      statusElement.textContent = `Checking payment... (${update.attempts}/${update.maxAttempts})`;
    },
    CONFIG.POLL_MAX_ATTEMPTS,
    CONFIG.POLL_INTERVAL
  );
  
  appState.isPolling = false;
  
  if (paid) {
    // Payment confirmed!
    handlePaymentConfirmed();
  } else {
    // Timeout
    statusElement.textContent = 'Payment timeout. Please try again.';
    statusElement.className = 'payment-status error';
    showError('Payment confirmation timeout. Please check your payment and refresh the page.');
  }
}

/**
 * Handle payment confirmation
 */
function handlePaymentConfirmed() {
  console.log('✅ Payment confirmed!');
  
  appState.isPaid = true;
  
  // Update status
  const statusElement = document.getElementById('payment-status');
  statusElement.textContent = 'Payment confirmed! ✅';
  statusElement.className = 'payment-status success';
  
  // Hide invoice section
  document.getElementById('invoice-section').classList.add('hidden');
  
  // Show unlock section
  document.getElementById('unlock-section').classList.remove('hidden');
  
  // Reveal download link (obfuscated)
  revealDownloadLink();
  
  showSuccess('🎉 Payment confirmed! Your file is now unlocked.');
}

/**
 * Reveal download link (obfuscated until payment)
 */
function revealDownloadLink() {
  if (!appState.currentProduct || !appState.isPaid) {
    return;
  }
  
  // Get the obfuscated file URL
  const fileUrl = appState.currentProduct.fileUrl;
  
  // Create download button with actual link
  const downloadBtn = document.getElementById('download-btn');
  downloadBtn.href = fileUrl;
  downloadBtn.download = `${appState.currentProduct.name}.${appState.currentProduct.fileType.toLowerCase()}`;
  
  console.log('🔓 Download link revealed');
}

/**
 * Handle download button click
 */
function handleDownload() {
  if (!appState.isPaid) {
    showError('Please complete payment first');
    return;
  }
  
  showSuccess('Download started! Thank you for your purchase.');
  
  // Track download (you could send to analytics here)
  console.log('📥 Download initiated:', appState.currentProduct.name);
}

/**
 * Handle copy invoice to clipboard
 */
function handleCopyInvoice() {
  const invoiceText = document.getElementById('invoice-text');
  
  // Select and copy
  invoiceText.select();
  invoiceText.setSelectionRange(0, 99999); // For mobile
  
  try {
    document.execCommand('copy');
    showSuccess('Invoice copied to clipboard!');
  } catch (error) {
    // Fallback for modern browsers
    navigator.clipboard.writeText(invoiceText.value).then(() => {
      showSuccess('Invoice copied to clipboard!');
    }).catch(() => {
      showError('Failed to copy invoice');
    });
  }
}

/**
 * Show success message
 */
function showSuccess(message) {
  showAlert(message, 'success');
}

/**
 * Show error message
 */
function showError(message) {
  showAlert(message, 'error');
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
    <span class="alert-icon">${
      type === 'success' ? '✅' :
      type === 'error' ? '❌' :
      type === 'warning' ? '⚠️' : 'ℹ️'
    }</span>
    <span class="alert-text">${message}</span>
  `;
  
  container.appendChild(alert);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 300);
  }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

