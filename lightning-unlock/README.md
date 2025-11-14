# ⚡ Qubit Chain Hong Kong - Lightning Pay-To-Unlock

**Instant Digital File Sales with Bitcoin Lightning Network**

A production-ready, static website solution for selling digital files using Lightning Network payments. No backend required - runs entirely on GitHub Pages.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Adding Products](#adding-products)
- [Deployment](#deployment)
- [Security](#security)
- [FAQ](#faq)

---

## 🎯 Overview

This system allows you to sell digital files (PDFs, ZIPs, images, etc.) with instant Lightning Network payments. Users pay with Bitcoin Lightning, and upon confirmation, the download link is automatically revealed.

### How It Works

1. **User browses products** on the homepage
2. **Clicks "Buy Now"** to go to payment page
3. **Generates Lightning invoice** with one click
4. **Pays with Lightning wallet** (Phoenix, Muun, Blue Wallet, etc.)
5. **Download unlocks instantly** after payment confirmation
6. **No registration required** - completely anonymous

---

## ✨ Features

### ⚡ Lightning Network Integration
- Instant payment confirmation (seconds)
- Low fees (perfect for micropayments)
- Uses LNbits public API (no backend needed)

### 🔒 Security
- No admin keys exposed on client side
- Obfuscated file URLs (only revealed after payment)
- Invoice-only API key (read-only, safe to expose)

### 🚀 Fully Static
- Runs on GitHub Pages
- No server maintenance
- No database required
- Zero hosting costs

### 💎 Modern UI
- Clean, professional design
- Mobile-responsive
- Real-time payment status updates
- QR code generation

### 📦 Flexible Product Management
- Easy product configuration
- Support for multiple file types
- Customizable pricing
- Product descriptions

---

## 🚀 Quick Start

### Prerequisites

1. **LNbits Account**: Create a free account at [legend.lnbits.com](https://legend.lnbits.com)
2. **Lightning Wallet**: Get [Phoenix](https://phoenix.acinq.co/), [Muun](https://muun.com/), or [Blue Wallet](https://bluewallet.io/)
3. **GitHub Account**: For hosting on GitHub Pages

### Installation

#### 1. Clone or Download

```bash
git clone https://github.com/yourusername/lightning-unlock.git
cd lightning-unlock
```

#### 2. Configure LNbits

Edit `config.js`:

```javascript
const CONFIG = {
  LNBITS_URL: 'https://legend.lnbits.com',
  LNBITS_INVOICE_KEY: 'YOUR_INVOICE_KEY_HERE',  // Get from LNbits
  // ...
};
```

**Getting your Invoice Key:**

1. Go to [legend.lnbits.com](https://legend.lnbits.com)
2. Create or open a wallet
3. Click "API Info" in the top right
4. Copy the **"Invoice/read key"** (NOT the admin key!)
5. Paste it in `config.js`

#### 3. Add Your Products

Edit `config.js` PRODUCTS section:

```javascript
PRODUCTS: {
  'your-product-id': {
    id: 'your-product-id',
    name: 'Your Product Name',
    description: 'Product description',
    price: 200, // in sats
    fileUrl: 'private/your_file_a1b2c3d4.pdf',
    fileType: 'PDF',
    fileSize: '5 MB'
  }
}
```

#### 4. Add Your Files

1. Place your digital files in the `private/` folder
2. Use obfuscated filenames (e.g., `product_x7k9m2.pdf`)
3. Update `fileUrl` in config.js to match

#### 5. Test Locally

```bash
# Python
python -m http.server 8000

# Or Node.js
npx http-server -p 8000
```

Visit `http://localhost:8000`

---

## ⚙️ Configuration

### config.js Settings

```javascript
const CONFIG = {
  // LNbits Settings
  LNBITS_URL: 'https://legend.lnbits.com',
  LNBITS_INVOICE_KEY: 'YOUR_INVOICE_KEY_HERE',
  
  // App Settings
  APP_NAME: 'Qubit Chain Hong Kong',
  APP_SUBTITLE: 'Lightning Pay-To-Unlock Store',
  
  // Payment Settings
  POLL_INTERVAL: 3000,      // Check payment every 3 seconds
  POLL_MAX_ATTEMPTS: 100,   // Timeout after 5 minutes
  
  // Products
  PRODUCTS: {
    // Add your products here
  },
  
  DEFAULT_PRODUCT: 'ai-art-pack-01'
};
```

### Environment Variables

For build systems that support environment variables:

```bash
LNBITS_URL=https://legend.lnbits.com
LNBITS_INVOICE_KEY=your_key_here
```

---

## 📦 Adding Products

### Step 1: Prepare Your File

1. Choose a digital file (PDF, ZIP, PNG, etc.)
2. Generate a random filename:
   ```
   product_name_[random8chars].[ext]
   Example: ai_art_pack_f8a3c9d2.zip
   ```
3. Place in `private/` folder

### Step 2: Add to Config

Edit `config.js`:

```javascript
PRODUCTS: {
  'my-new-product': {
    id: 'my-new-product',
    name: 'My New Product',
    description: 'A great digital product',
    price: 300,  // in satoshis
    fileUrl: 'private/my_product_a1b2c3d4.pdf',
    fileType: 'PDF',
    fileSize: '10 MB'
  }
}
```

### Step 3: Add to Homepage (Optional)

Edit `index.html` to add a product listing:

```html
<div class="product-info">
  <div class="product-detail">
    <span class="product-label">📄 My New Product</span>
    <span class="product-value">300 sats</span>
  </div>
  <p class="text-muted">A great digital product</p>
  <a href="unlock.html?product=my-new-product" class="btn btn-primary">
    Buy Now
  </a>
</div>
```

### Filename Obfuscation Tips

Generate random filenames to prevent guessing:

```bash
# Using openssl
echo "product_$(openssl rand -hex 4).pdf"

# Using date + random
echo "product_$(date +%s)_$RANDOM.pdf"

# Manual suggestion
# Use: productname_[a-z0-9]{8}.ext
```

---

## 🌐 Deployment

### Deploy to GitHub Pages

#### Method 1: GitHub UI

1. Create new repository on GitHub
2. Upload all files
3. Go to Settings → Pages
4. Select "main" branch as source
5. Save and wait for deployment

Your site will be at: `https://username.github.io/repository-name/`

#### Method 2: Command Line

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit"

# Add remote and push
git remote add origin https://github.com/username/repository-name.git
git branch -M main
git push -u origin main

# Enable Pages in repository settings
```

### Custom Domain (Optional)

1. Add `CNAME` file with your domain:
   ```
   store.yourdomain.com
   ```

2. Configure DNS:
   ```
   Type: CNAME
   Name: store
   Value: username.github.io
   ```

3. Enable "Enforce HTTPS" in GitHub Pages settings

---

## 🔒 Security

### ⚠️ Important Security Notes

#### What This System Provides:

✅ **Obfuscation**: Files have random names  
✅ **No Direct Links**: URLs only revealed after payment  
✅ **Invoice-Only Key**: Can't spend your funds  
✅ **Payment Verification**: Confirms payment before unlock

#### Limitations on GitHub Pages:

⚠️ **Public Files**: All files are technically accessible if URL is known  
⚠️ **No Encryption**: Files are not encrypted at rest  
⚠️ **No Authentication**: GitHub Pages can't enforce authentication

### Improving Security

For high-value content, consider:

1. **File Encryption**
   - Encrypt files before uploading
   - Deliver decryption key after payment
   - Example: Use GPG or AES encryption

2. **Backend Server**
   - Add authentication layer
   - Generate time-limited signed URLs
   - Track downloads per payment

3. **CDN with Protection**
   - Use Cloudflare or AWS S3
   - Implement signed URLs
   - Set expiration times

4. **Watermarking**
   - Add buyer identifier to files
   - Discourage sharing
   - Track leaks

### Best Practices

- ✅ Use unpredictable filenames
- ✅ Don't index `private/` folder
- ✅ Monitor for unusual access patterns
- ✅ Keep admin keys secure (never expose!)
- ✅ Use invoice key only on client side
- ✅ Test payments on testnet first

---

## ❓ FAQ

### General Questions

**Q: Do customers need to create an account?**  
A: No! Completely anonymous. Just pay and download.

**Q: What file types can I sell?**  
A: Any digital file: PDFs, ZIPs, images, audio, video, code, etc.

**Q: What's the minimum price?**  
A: Technically 1 satoshi, but recommend 100+ sats to cover Lightning fees.

**Q: How long does payment take?**  
A: Usually 2-5 seconds for confirmation.

### Technical Questions

**Q: Do I need a server?**  
A: No! Runs entirely on GitHub Pages (static hosting).

**Q: What if payment fails?**  
A: Users can try again. No funds are lost.

**Q: Can files be downloaded multiple times?**  
A: Yes, the link works for the browser session. Implement tracking if needed.

**Q: How do I handle refunds?**  
A: Lightning payments are final. Handle manually if needed.

**Q: Can I use my own Lightning node?**  
A: Yes! Just update `LNBITS_URL` in config.js to point to your node.

### Security Questions

**Q: Are my files secure?**  
A: They're obfuscated but not encrypted. See [Security](#security) section.

**Q: Can people share download links?**  
A: Yes, links work for anyone who has them. Consider:
- Short expiration times (requires backend)
- File encryption with one-time keys
- Watermarking for traceability

**Q: Is the Invoice Key safe to expose?**  
A: Yes! Invoice keys can only create invoices, not spend funds.

**Q: Should I expose Admin Key?**  
A: **NEVER!** Admin keys can spend your Bitcoin. Keep them secret.

---

## 🛠️ Development

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/lightning-unlock.git
cd lightning-unlock

# Start local server
python -m http.server 8000

# Test payments on testnet
# Use https://testnet.lnbits.com for testing
```

### File Structure

```
lightning-unlock/
├── index.html              # Homepage (product listings)
├── unlock.html             # Payment & unlock page
├── config.js               # Configuration
├── css/
│   └── styles.css         # Styling
├── js/
│   ├── lnbits.js          # LNbits API wrapper
│   └── app.js             # Main application logic
├── private/               # Digital products (files to sell)
│   ├── product1.pdf
│   ├── product2.zip
│   └── ...
└── README.md              # This file
```

### Customization

#### Change Colors

Edit `css/styles.css`:

```css
:root {
  --primary-color: #f7931a;  /* Bitcoin orange */
  --secondary-color: #2563eb;
  /* ... */
}
```

#### Add Custom Logo

Edit `index.html` and `unlock.html`:

```html
<h1>
  <img src="logo.png" alt="Logo" style="height: 50px;">
  Your Store Name
</h1>
```

---

## 📄 License

MIT License - See LICENSE file

---

## 🙏 Acknowledgments

- **Lightning Network**: Instant Bitcoin payments
- **LNbits**: Free Lightning wallet and API
- **Qubit Chain Hong Kong**: Powering decentralized commerce

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/lightning-unlock/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/lightning-unlock/discussions)
- **Lightning Tips**: [Your Lightning Address]

---

<div align="center">

**Made with ⚡ and ❤️ by Qubit Chain Hong Kong**

[🚀 Live Demo](#) | [📖 Documentation](#) | [💬 Community](#)

</div>

