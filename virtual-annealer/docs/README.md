# 🔬 Virtual Annealing Machine

**Quantum-Inspired Optimization Powered by Blockchain**

A decentralized computational platform that combines simulated annealing algorithms with blockchain payment via LOT tokens (ERC-20).

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [How It Works](#how-it-works)
- [Setup](#setup)
- [Usage](#usage)
- [Technical Details](#technical-details)
- [Configuration](#configuration)
- [Development](#development)
- [Security](#security)
- [FAQ](#faq)

---

## 🎯 Overview

The Virtual Annealing Machine is a web application that allows users to run simulated annealing computations by paying with LOT tokens. The entire system runs client-side in the browser, making it:

- **Decentralized**: No backend servers required
- **Transparent**: All code runs in your browser
- **Blockchain-Powered**: Payments handled via Ethereum smart contracts
- **Accessible**: Deploy on GitHub Pages or any static hosting

### What is Simulated Annealing?

Simulated Annealing is a probabilistic optimization algorithm inspired by the metallurgical process of annealing. It's used to find approximate solutions to optimization problems by exploring the solution space and gradually reducing randomness.

### The Ising Model

The system solves the Ising model energy minimization problem:

```
E = -Σ J_ij s_i s_j - Σ h_i s_i
```

Where:
- `s_i ∈ {+1, -1}` are spin variables
- `J_ij` are interaction strengths between spins
- `h_i` are external magnetic fields

---

## ✨ Features

### 🔐 MetaMask Integration
- Seamless wallet connection
- Automatic network switching
- Real-time balance updates

### 💰 LOT Token Payment
- Pay-per-use model (10 LOT per computation)
- Standard ERC-20 token support
- Transaction confirmation tracking

### ⚛️ Simulated Annealing Engine
- JavaScript-based annealing algorithm
- Configurable parameters:
  - Number of spins (2-100)
  - Initial temperature
  - Cooling rate
  - Number of steps
- Real-time progress updates

### 📊 Result Visualization
- Final energy value
- Optimal spin configuration
- Energy evolution chart
- Step-by-step progress tracking

### 🎨 Modern UI
- Clean, professional design
- Responsive layout
- Real-time status updates
- Interactive parameter configuration

---

## 🔄 How It Works

### 1. **Connect Wallet**
Users connect their MetaMask wallet to the application. The system checks:
- MetaMask installation
- Correct network
- LOT token balance

### 2. **Pay LOT Tokens**
To run an annealing computation, users pay LOT tokens:
```
User → [LOT Transfer] → Payment Recipient
```

The transaction is processed on-chain via MetaMask.

### 3. **Configure Parameters**
After payment confirmation, users can configure:
- **Spin Count (N)**: Number of variables
- **Initial Temperature (T₀)**: Starting temperature
- **Cooling Rate (α)**: How fast temperature decreases
- **Steps**: Total iterations

### 4. **Run Computation**
The annealing algorithm executes in the browser:
```javascript
1. Initialize random spin configuration
2. For each step:
   a. Pick random spin to flip
   b. Calculate energy change ΔE
   c. Accept with probability:
      - If ΔE < 0: Always accept
      - Else: Accept with probability exp(-ΔE/T)
   d. Update temperature: T = T × α
3. Return best configuration found
```

### 5. **View Results**
Results include:
- Best energy found
- Optimal spin configuration
- Energy evolution over time
- Computation statistics

---

## 🚀 Setup

### Prerequisites

1. **MetaMask**: Install [MetaMask browser extension](https://metamask.io/)
2. **LOT Tokens**: Acquire LOT tokens on your chosen network
3. **ETH**: Small amount for gas fees

### Installation

#### Option 1: GitHub Pages (Recommended)

1. **Fork/Clone this repository**
   ```bash
   git clone https://github.com/yourusername/virtual-annealer.git
   cd virtual-annealer
   ```

2. **Configure settings**
   
   Edit `config.js`:
   ```javascript
   const CONFIG = {
     LOT_TOKEN_ADDRESS: '0xYourLOTTokenAddress',
     CHAIN_ID: 11155111, // Sepolia Testnet
     PAYMENT_RECIPIENT: '0xYourRecipientAddress',
     ANNEALING_COST: 10,
     // ...
   };
   ```

3. **Deploy to GitHub Pages**
   ```bash
   git add .
   git commit -m "Configure Virtual Annealer"
   git push origin main
   ```
   
   Enable GitHub Pages in repository settings (Settings → Pages → Source: main branch)

4. **Access your deployment**
   ```
   https://yourusername.github.io/virtual-annealer/
   ```

#### Option 2: Local Development

1. **Start local server**
   ```bash
   # Python
   python -m http.server 8000
   
   # Or Node.js
   npx http-server -p 8000
   ```

2. **Open in browser**
   ```
   http://localhost:8000
   ```

---

## 📖 Usage

### Step-by-Step Guide

#### 1. Connect Your Wallet

- Click "Connect Wallet" button
- Approve MetaMask connection
- Ensure you're on the correct network (Sepolia Testnet by default)

#### 2. Check LOT Balance

- Your LOT token balance will be displayed
- Make sure you have at least 10 LOT tokens

#### 3. Pay for Computation

- Click "Run Annealing (10 LOT)" button
- Approve the transaction in MetaMask
- Wait for transaction confirmation

#### 4. Configure Parameters

After payment confirmation:

- **Spin Count**: Set number of variables (e.g., 10)
- **Initial Temperature**: Set starting temperature (e.g., 100)
- **Cooling Rate**: Set cooling factor (e.g., 0.95)
- **Steps**: Set number of iterations (e.g., 1000)

#### 5. Run Annealing

- Click "Start Annealing" button
- Watch progress in real-time
- Wait for completion (typically 5-30 seconds)

#### 6. View Results

- See final energy value
- Examine optimal spin configuration
- Review energy evolution chart

---

## 🔧 Technical Details

### Architecture

```
┌─────────────────────────────────────────┐
│         Browser (Frontend)              │
│  ┌──────────────────────────────────┐  │
│  │  index.html (UI)                 │  │
│  │  ├─ Wallet Connection            │  │
│  │  ├─ Payment Interface            │  │
│  │  ├─ Parameter Input              │  │
│  │  └─ Result Display               │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  app.js (Logic)                  │  │
│  │  ├─ MetaMask Integration         │  │
│  │  ├─ LOT Token Payment            │  │
│  │  ├─ State Management             │  │
│  │  └─ UI Updates                   │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │  annealer/anneal.js              │  │
│  │  ├─ Simulated Annealing          │  │
│  │  ├─ Energy Calculation           │  │
│  │  ├─ Metropolis Algorithm         │  │
│  │  └─ Result Generation            │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
           │
           │ Web3 (MetaMask)
           ↓
┌─────────────────────────────────────────┐
│      Ethereum Blockchain                │
│  ┌──────────────────────────────────┐  │
│  │  LOT Token Contract (ERC-20)     │  │
│  │  ├─ balanceOf()                  │  │
│  │  ├─ transfer()                   │  │
│  │  └─ approve()                    │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### File Structure

```
virtual-annealer/
├── index.html              # Main UI
├── app.js                  # Application logic
├── config.js               # Configuration
├── styles.css              # Styling
├── annealer/
│   └── anneal.js          # Annealing algorithm
├── contracts/
│   └── LOT.json           # LOT Token ABI
└── docs/
    └── README.md          # This file
```

### Algorithm Details

**Simulated Annealing Implementation:**

```javascript
class VirtualAnnealer {
  constructor(N, T0, α, steps) {
    this.N = N;              // Number of spins
    this.T0 = T0;            // Initial temperature
    this.coolingRate = α;    // Cooling rate
    this.steps = steps;      // Total steps
  }
  
  anneal() {
    let T = this.T0;
    let energy = this.calculateEnergy(spins);
    
    for (let step = 0; step < this.steps; step++) {
      // Pick random spin
      let i = random(0, N);
      
      // Calculate energy change
      let ΔE = this.calculateEnergyChange(i);
      
      // Metropolis criterion
      if (ΔE < 0 || random() < exp(-ΔE/T)) {
        this.flipSpin(i);
        energy += ΔE;
      }
      
      // Cool down
      T *= this.coolingRate;
    }
    
    return result;
  }
}
```

### Energy Function

The Ising model energy:

```
E = -Σᵢⱼ Jᵢⱼ sᵢ sⱼ - Σᵢ hᵢ sᵢ

Where:
- Jᵢⱼ: Interaction matrix (randomly generated)
- hᵢ: External field (randomly generated)
- sᵢ: Spin variables (+1 or -1)
```

---

## ⚙️ Configuration

### config.js Settings

```javascript
const CONFIG = {
  // LOT Token Contract Address
  LOT_TOKEN_ADDRESS: '0x...',
  
  // Blockchain Network
  CHAIN_ID: 11155111,          // Sepolia Testnet
  CHAIN_NAME: 'Sepolia Testnet',
  RPC_URL: 'https://sepolia.infura.io/v3/...',
  BLOCK_EXPLORER_URL: 'https://sepolia.etherscan.io',
  
  // Payment Settings
  ANNEALING_COST: 10,          // LOT tokens per run
  PAYMENT_RECIPIENT: '0x...',  // Where payments go
  
  // Default Parameters
  DEFAULT_PARAMS: {
    spinCount: 10,
    initialTemp: 100.0,
    coolingRate: 0.95,
    steps: 1000
  }
};
```

### Network Configuration

#### Ethereum Mainnet
```javascript
CHAIN_ID: 1
RPC_URL: 'https://mainnet.infura.io/v3/YOUR_KEY'
```

#### Sepolia Testnet (Recommended for testing)
```javascript
CHAIN_ID: 11155111
RPC_URL: 'https://sepolia.infura.io/v3/YOUR_KEY'
```

#### Polygon
```javascript
CHAIN_ID: 137
RPC_URL: 'https://polygon-rpc.com'
```

---

## 👨‍💻 Development

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/virtual-annealer.git
cd virtual-annealer

# Start development server
python -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Testing

1. Use Sepolia Testnet for development
2. Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
3. Deploy a test LOT token or use existing testnet token
4. Update `config.js` with testnet settings

### Customization

#### Modify Annealing Algorithm

Edit `annealer/anneal.js`:

```javascript
// Add new optimization algorithm
class QuantumAnnealer extends VirtualAnnealer {
  anneal() {
    // Your custom implementation
  }
}
```

#### Add New Payment Options

Edit `app.js`:

```javascript
// Support different tokens
async function payWithToken(tokenAddress, amount) {
  // Implementation
}
```

---

## 🔒 Security

### Client-Side Security

✅ **What's Safe:**
- All computation runs in browser
- No backend to hack
- Open source code
- Standard ERC-20 interactions

⚠️ **Important Notes:**
- Never share your private keys
- Always verify contract addresses
- Check transaction details in MetaMask
- Use testnet for testing

### Smart Contract Security

The system uses standard ERC-20 `transfer()` function:

```solidity
function transfer(address to, uint256 amount) 
    external returns (bool);
```

**Recommendations:**
1. Verify LOT token contract is audited
2. Check contract on block explorer
3. Start with small amounts
4. Use multi-sig for payment recipient

### Best Practices

- **Testnet First**: Always test on Sepolia testnet
- **Verify Addresses**: Double-check all contract addresses
- **Gas Limits**: Set appropriate gas limits
- **Error Handling**: Handle transaction failures gracefully

---

## ❓ FAQ

### General Questions

**Q: What is simulated annealing?**
A: A probabilistic optimization algorithm inspired by metallurgical annealing, used to find approximate solutions to complex optimization problems.

**Q: Why use blockchain for this?**
A: Blockchain enables decentralized payments, transparent transactions, and a fair marketplace for computational resources.

**Q: How long does a computation take?**
A: Typically 5-30 seconds depending on parameters (more spins and steps = longer time).

### Technical Questions

**Q: Can I run this without MetaMask?**
A: No, MetaMask (or compatible Web3 wallet) is required for blockchain interactions.

**Q: Does computation happen on-chain?**
A: No, only payment happens on-chain. Computation runs in your browser.

**Q: Can I modify the algorithm?**
A: Yes! The code is open source. Modify `annealer/anneal.js` to implement your own algorithms.

**Q: Why use LOT tokens instead of ETH?**
A: LOT tokens provide:
- Fixed pricing
- Token economy
- Easier accounting
- Potential for staking/rewards

### Payment Questions

**Q: What if transaction fails?**
A: No tokens are deducted. You can retry the transaction.

**Q: Can I get a refund?**
A: Transactions are on-chain and irreversible. The payment recipient would need to send tokens back.

**Q: How do I get LOT tokens?**
A: LOT tokens can be obtained from:
- Decentralized exchanges (DEX)
- Token sale events
- Testnet faucets (for testing)

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Areas for Contribution

- **Algorithms**: Implement new optimization algorithms
- **UI/UX**: Improve interface design
- **Documentation**: Enhance guides and examples
- **Testing**: Add test cases and validation
- **Features**: Add new functionality

### Development Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Make changes
4. Test thoroughly
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing`)
7. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- **Simulated Annealing**: Kirkpatrick, Gelatt, and Vecchi (1983)
- **Ising Model**: Ernst Ising (1925)
- **MetaMask**: ConsenSys
- **Ethereum**: Vitalik Buterin and Ethereum Foundation

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/virtual-annealer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/virtual-annealer/discussions)
- **Email**: support@example.com

---

<div align="center">

**Made with 🔬 and ⚡**

[Back to Top](#-virtual-annealing-machine)

</div>

