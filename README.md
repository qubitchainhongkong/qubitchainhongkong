# ⚡ Qubitchain Gateway

**Lightning Network Powered Micro-Payment API Gateway**

<div align="center">

![Lightning Network](https://img.shields.io/badge/Lightning-Network-yellow?style=for-the-badge&logo=lightning)
![Bitcoin](https://img.shields.io/badge/Bitcoin-BTC-orange?style=for-the-badge&logo=bitcoin)
![LNbits](https://img.shields.io/badge/LNbits-API-blue?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-black?style=for-the-badge&logo=github)

*Pay-per-request API with Bitcoin Lightning - 5 sats per call*

[🚀 Live Demo](#) | [📖 Documentation](docs/api.html) | [⚡ Lightning Network](https://lightning.network/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Demo](#-demo)
- [Setup](#-setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Development](#-development)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Qubitchain Gateway** is a micro-payment API Gateway powered by the Lightning Network. Implemented as a fully static site that runs on GitHub Pages, it provides an innovative system where each API request is charged via Bitcoin Lightning.

### Why Qubitchain Gateway?

- **💰 Micropayments**: Ultra-low cost at just 5 sats per request
- **⚡ Instant Settlement**: Payment confirmation in seconds via Lightning Network
- **🌐 Decentralized**: Runs entirely on the decentralized Bitcoin network
- **🚀 Easy Integration**: Simple REST API for seamless integration with existing apps

---

## ✨ Key Features

### ⚡ Lightning Fast Payments
Instant payment confirmation via Lightning Network. Dramatically faster than traditional payment systems.

### 🔑 API Key Management
Easy API Key generation and management. Track usage and billing history in real-time.

### 💎 Micro-Transactions
Ultra-low cost at 5 sats per request. True pay-as-you-go model, not subscriptions.

### 🎨 Modern UI
Gaming/NFT-inspired modern design. Responsive and works great on all devices.

### 📊 Real-time Tracking
Display wallet balance, usage count, and total charges in real-time for each API Key.

### 🔒 Secure by Design
Secure payments backed by Lightning Network cryptography. Proper access control via API Keys.

---

## 🖼️ Demo

### Dashboard
![Dashboard Screenshot](https://via.placeholder.com/800x400/0a0e27/00ff88?text=Qubitchain+Gateway+Dashboard)

### API Documentation
![API Docs Screenshot](https://via.placeholder.com/800x400/0a0e27/00d4ff?text=API+Documentation)

---

## 🚀 Setup

### Prerequisites

- Git
- Lightning wallet (Phoenix, Muun, Blue Wallet, etc.)
- LNbits account (free to create)

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/qbhk.git
cd qbhk
```

### 2. Setup LNbits

#### A. Create LNbits Wallet

1. Visit [LNbits](https://legend.lnbits.com) (or [Testnet](https://testnet.lnbits.com))
2. Click "Create Wallet"
3. Enter a wallet name and create

#### B. Get API Keys

1. Open your created wallet
2. Click "API Info" in the top right
3. Copy the following:
   - **Invoice/read key** (read-only)
   - **Admin key** (administrative - handle with care)

### 3. Edit Configuration File

Open `config.js` and enter your LNbits information:

```javascript
const CONFIG = {
  LNBITS_URL: 'https://legend.lnbits.com',
  LNBITS_INVOICE_KEY: 'YOUR_INVOICE_KEY_HERE',  // Enter Invoice key
  LNBITS_ADMIN_KEY: 'YOUR_ADMIN_KEY_HERE',      // Enter Admin key
  API_COST_SATS: 5,
  // ... other settings
};
```

⚠️ **Important**: Admin Key is sensitive! NEVER expose it on the client side in production.

### 4. Run Locally

```bash
# Using Python
python -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000
```

Access `http://localhost:8000` in your browser.

### 5. Deploy to GitHub Pages

#### A. Create GitHub Repository

1. Create a new repository on GitHub
2. Push your local repository:

```bash
git add .
git commit -m "Initial commit: Qubitchain Gateway"
git remote add origin https://github.com/yourusername/qbhk.git
git push -u origin main
```

#### B. Enable GitHub Pages

1. Go to repository "Settings" → "Pages"
2. Select "main" branch as Source
3. Click "Save"

Your site will be live at `https://yourusername.github.io/qbhk/` in a few minutes!

---

## 📖 Usage

### 1. Generate API Key

1. Click "Generate API Key" button on the Dashboard
2. Copy and save the generated API Key
3. The API Key is stored in localStorage

### 2. Add Funds to Wallet

1. Check the "Wallet Balance" section on Dashboard
2. Deposit to your LNbits wallet via Lightning
3. Click "Refresh Balance" button to get latest balance

### 3. Test API

1. Enter your API Key in the "Test API" section
2. Click "Test API Call" button
3. Pay the generated Lightning Invoice
4. API response will be displayed after payment confirmation

### 4. Integrate with Your Application

#### JavaScript Example

```javascript
const apiKey = 'qbhk_your_api_key_here';
const response = await fetch(
  `https://yourusername.github.io/qbhk/api/hello?key=${apiKey}`
);

const data = await response.json();
console.log(data);
```

#### cURL Example

```bash
curl -X GET \
  "https://yourusername.github.io/qbhk/api/hello?key=qbhk_your_api_key_here"
```

See [API Documentation](docs/api.html) for details.

---

## 📚 API Documentation

Full API documentation is available at [docs/api.html](docs/api.html).

### Quick Reference

#### Endpoint: Hello API

```
GET /api/hello?key={API_KEY}
```

**Response:**

```json
{
  "success": true,
  "message": "Hello from Qubitchain Gateway! ⚡",
  "credits_charged": 5,
  "timestamp": "2025-11-14T10:30:00.000Z",
  "api_key_id": "uuid-here"
}
```

**Cost:** 5 sats per request

---

## 🛠️ Development

### Project Structure

```
qbhk/
├── index.html          # Main dashboard UI
├── app.js              # Application logic
├── config.js           # LNbits configuration
├── styles.css          # Stylesheets
├── docs/
│   └── api.html        # API documentation
└── README.md           # This file
```

### Customization

#### Change Pricing

Modify in `config.js`:

```javascript
API_COST_SATS: 10,  // Change to 10 sats
```

#### Add New API Endpoint

Add a new function in `app.js`:

```javascript
async function callMyCustomAPI(apiKey) {
  const keyData = validateApiKey(apiKey);
  if (!keyData) {
    throw new Error('Invalid API Key');
  }
  
  // Create invoice
  const invoice = await createInvoice(CONFIG.API_COST_SATS, 'My Custom API');
  displayInvoice(invoice);
  
  // Wait for payment
  const paid = await waitForPayment(invoice.payment_hash);
  
  if (paid) {
    updateApiKeyUsage(apiKey, CONFIG.API_COST_SATS);
    return {
      success: true,
      data: {
        // Your custom data
      }
    };
  }
}
```

#### Customize UI

Change colors and layout in `styles.css`:

```css
:root {
  --primary-color: #00ff88;    /* Main color */
  --secondary-color: #ff0080;  /* Accent color */
  --accent-color: #00d4ff;     /* Additional accent */
}
```

---

## 🔐 Security

### ⚠️ Important Notes

#### 1. Handling Admin Keys

**NEVER** expose Admin Keys on the client side. This demo is for educational purposes.

**Recommended architecture for production:**

```
Frontend (GitHub Pages)
    ↓
Backend API Server (Node.js/Python/Go)
    ↓
LNbits API (Admin Key stored here)
```

#### 2. API Key Management

- API Keys are stored in localStorage
- Clearing your browser will delete API Keys
- Backup important API Keys in a secure location

#### 3. Use HTTPS

GitHub Pages automatically uses HTTPS, but if using a custom domain, ensure HTTPS is enabled.

#### 4. Rate Limiting

Rate limiting is not currently implemented. For production, implement proper rate limiting.

### Security Best Practices

1. **Use Environment Variables**: Inject API keys from environment variables at build time
2. **Implement Backend**: Handle actual billing on the backend
3. **Monitoring & Logging**: Implement monitoring to detect fraudulent usage
4. **Regular Updates**: Keep dependencies and security patches up to date

---

## 🧪 Testing

### Testing on Testnet

Strongly recommended to test on Testnet before production deployment.

1. Create a wallet on [LNbits Testnet](https://testnet.lnbits.com)
2. Change the URL in `config.js`:
   ```javascript
   LNBITS_URL: 'https://testnet.lnbits.com',
   ```
3. Get Testnet Bitcoin:
   - [Bitcoin Testnet Faucet](https://testnet-faucet.mempool.co/)
   - [Coinfaucet](https://coinfaucet.eu/en/btc-testnet/)

4. Open Lightning Channel (LNbits handles automatically)

---

## 🌟 Use Cases

### 1. API Monetization
Monetize your own APIs. Pay-as-you-go instead of subscriptions.

### 2. Content Paywalls
Micro-paywalls for articles, videos, music, and other content.

### 3. AI API Services
Charge for access to AI/ML APIs (OpenAI, Stable Diffusion, etc.).

### 4. IoT Data Access
Charge for real-time access to data from IoT devices.

### 5. Game Services
Micro-transactions for in-game items, skins, and features.

---

## 🤝 Contributing

Contributions are welcome! You can contribute in the following ways:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Contribution Ideas

- [ ] Add new API endpoints
- [ ] Develop SDKs (Python, Go, Rust, etc.)
- [ ] Improve documentation
- [ ] Enhance UI/UX
- [ ] Add tests
- [ ] Performance optimization
- [ ] Multi-language support

---

## 🐛 Bug Reports

If you find a bug, please report it in [Issues](https://github.com/yourusername/qbhk/issues).

When reporting, please include:
- Bug description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if possible)
- Browser and OS information

---

## 📊 Roadmap

### Phase 1: MVP ✅
- [x] Basic API Key management
- [x] LNbits integration
- [x] Lightning Invoice generation
- [x] Payment confirmation
- [x] UI/UX design

### Phase 2: Enhanced Features 🚧
- [ ] Webhook support
- [ ] Detailed analytics dashboard
- [ ] Rate limiting implementation
- [ ] Custom endpoint addition
- [ ] Backend implementation examples

### Phase 3: Ecosystem 🔮
- [ ] JavaScript/TypeScript SDK
- [ ] Python SDK
- [ ] Go SDK
- [ ] Plugin system
- [ ] Marketplace

---

## 🔗 Links

- **Lightning Network**: https://lightning.network/
- **LNbits**: https://lnbits.com/
- **Bitcoin**: https://bitcoin.org/
- **GitHub Pages**: https://pages.github.com/

### Recommended Lightning Wallets

- [Phoenix Wallet](https://phoenix.acinq.co/) - iOS/Android
- [Muun Wallet](https://muun.com/) - iOS/Android
- [Blue Wallet](https://bluewallet.io/) - iOS/Android
- [Breez](https://breez.technology/) - iOS/Android

---

## 💬 Community

- **GitHub Discussions**: [Join the discussion](https://github.com/yourusername/qbhk/discussions)
- **Twitter**: [@QubitchainGW](https://twitter.com/)
- **Discord**: [Join our Discord](#)

---

## 📄 License

This project is released under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Lightning Network** team - Revolutionary payment technology
- **LNbits** team - Excellent API and tools
- **Bitcoin** community - Paving the way to a decentralized future

---

## ⚡ Lightning Tips

If you find this project helpful, send a Lightning tip!

```
[Your Lightning Address or LNURL]
```

---

<div align="center">

**Made with ⚡ and ❤️**

[⬆ Back to Top](#-qubitchain-gateway)

</div>
