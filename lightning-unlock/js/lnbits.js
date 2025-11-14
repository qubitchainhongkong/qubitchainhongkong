/**
 * Qubit Chain Hong Kong - LNbits API Wrapper
 * 
 * Clean wrapper functions for interacting with LNbits API
 */

class LNbitsAPI {
  constructor(baseUrl, invoiceKey) {
    this.baseUrl = baseUrl;
    this.invoiceKey = invoiceKey;
  }
  
  /**
   * Create a Lightning Invoice
   * @param {number} amount - Amount in satoshis
   * @param {string} memo - Payment memo/description
   * @returns {Promise<object>} Invoice data including payment_hash and payment_request
   */
  async createInvoice(amount, memo) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.invoiceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          out: false, // incoming payment
          amount: amount,
          memo: memo || 'Lightning Payment',
          unit: 'sat'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create invoice: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      return {
        payment_hash: data.payment_hash,
        payment_request: data.payment_request,
        checking_id: data.checking_id,
        amount: amount,
        memo: memo
      };
      
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }
  
  /**
   * Check payment status
   * @param {string} paymentHash - Payment hash from invoice
   * @returns {Promise<object>} Payment status data
   */
  async checkPayment(paymentHash) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/payments/${paymentHash}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': this.invoiceKey,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to check payment: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      return {
        paid: data.paid === true,
        payment_hash: data.payment_hash,
        amount: data.amount,
        memo: data.memo,
        time: data.time,
        checking_id: data.checking_id
      };
      
    } catch (error) {
      console.error('Error checking payment:', error);
      throw error;
    }
  }
  
  /**
   * Poll payment status until paid or timeout
   * @param {string} paymentHash - Payment hash to monitor
   * @param {Function} onUpdate - Callback function called on each poll
   * @param {number} maxAttempts - Maximum number of polling attempts
   * @param {number} interval - Polling interval in milliseconds
   * @returns {Promise<boolean>} True if payment confirmed, false if timeout
   */
  async pollPayment(paymentHash, onUpdate, maxAttempts = 100, interval = 3000) {
    let attempts = 0;
    
    return new Promise((resolve) => {
      const poll = async () => {
        attempts++;
        
        try {
          const status = await this.checkPayment(paymentHash);
          
          // Call update callback
          if (onUpdate) {
            onUpdate({
              attempts: attempts,
              maxAttempts: maxAttempts,
              paid: status.paid,
              status: status
            });
          }
          
          // Check if paid
          if (status.paid) {
            resolve(true);
            return;
          }
          
          // Check if max attempts reached
          if (attempts >= maxAttempts) {
            resolve(false);
            return;
          }
          
          // Continue polling
          setTimeout(poll, interval);
          
        } catch (error) {
          console.error('Polling error:', error);
          
          // Retry on error
          if (attempts < maxAttempts) {
            setTimeout(poll, interval);
          } else {
            resolve(false);
          }
        }
      };
      
      // Start polling
      poll();
    });
  }
  
  /**
   * Generate QR code URL for payment request
   * @param {string} paymentRequest - BOLT11 payment request
   * @param {number} size - QR code size in pixels
   * @returns {string} QR code image URL
   */
  generateQRCodeUrl(paymentRequest, size = 300) {
    const qrApiUrl = CONFIG.QR_CODE_API || 'https://api.qrserver.com/v1/create-qr-code/';
    return `${qrApiUrl}?size=${size}x${size}&data=${encodeURIComponent(paymentRequest)}`;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LNbitsAPI;
}

