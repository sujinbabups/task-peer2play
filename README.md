# Decentralized Liquidity Pool

A simple implementation of a decentralized liquidity pool using Solidity smart contracts. This project allows users to provide liquidity with two ERC20 tokens, swap between them, and earn fees from trades. 

## ✨ Features

- 💱 ERC20 token pair trading
- 💧 Liquidity provision and removal
- 🤖 Constant product AMM (Automated Market Maker)
- 🛡️ Anti-flash loan protection with minimum liquidity
- 🔒 Reentrancy protection
- 💰 0.3% swap fee for liquidity providers

## 🚀 Live Demo

Check out the live application deployed on Vercel:
- ✨ Demo URL: [https://task-peer2play.vercel.app/](https://task-peer2play.vercel.app/)
  
### Deployment Status
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?logo=vercel)](https://your-liquidity-pool.vercel.app)

## 🚀 Screen Recording
<a href="https://youtu.be/-GKNNymG1rg"><img src="https://t4.ftcdn.net/jpg/04/83/19/75/240_F_483197552_oPKoqWdY2L37ajS6qzw99x8NMOajBOAS.jpg"/></a>



## 📝 Smart Contracts

### Token Contracts 🪙
- `Token1 (TK1)`: First ERC20 token used in the pool
- `Token2 (TK2)`: Second ERC20 token used in the pool

### Liquidity Pool Contract 🏊‍♂️
The main contract that handles:
- ➕ Liquidity addition and removal
- 🔄 Token swaps
- 📊 Pool share calculations
- 💸 Fee collection

## 🔧 Technical Details

### Dependencies 📚
- OpenZeppelin Contracts v4.8.0
  - 💎 ERC20
  - 🛡️ ReentrancyGuard
  - 🧮 Math utilities

### Key Functions 🔑

#### addLiquidity() 📥
```solidity
function addLiquidity(uint256 amount1, uint256 amount2) external returns (uint256 share)
```
- Adds liquidity to the pool
- Calculates and mints LP tokens (shares)
- First liquidity provider sets the initial exchange rate

#### removeLiquidity() 📤
```solidity
function removeLiquidity(uint256 share) external returns (uint256 amount1, uint256 amount2)
```
- Removes liquidity from the pool
- Burns LP tokens
- Returns proportional amounts of both tokens

#### swap() 🔄
```solidity
function swap(uint256 amountIn, bool token1ToToken2) external returns (uint256 amountOut)
```
- Executes token swaps
- Implements constant product formula
- Includes 0.3% swap fee

## 🔐 Security Features

1. **Minimum Liquidity Lock** 🔒
   - Prevents total drainage of the pool
   - Minimum of 1000 shares locked forever

2. **Reentrancy Protection** 🛡️
   - Uses OpenZeppelin's ReentrancyGuard
   - Prevents reentrancy attacks on all key functions

3. **Safe Math Operations** ➗
   - Uses OpenZeppelin's Math library
   - Prevents overflow/underflow

## 🖥️ Frontend Integration

The project includes a React-based frontend that provides:
- 👛 Wallet connection
- 💧 Liquidity provision interface
- 💱 Swap interface
- 📊 Pool share and balance display

## 🚀 Setup and Installation

1. Clone the repository
```bash
git clone https://github.com/sujinbabups/task-peer2play.git
```

2. Install dependencies
```bash
npm install
```

3. Compile contracts
```bash
npx hardhat compile
```

4. Deploy contracts
```bash
npx hardhat ignition deploy .\ignition\modules\LiquidityPool.js
```

5. Start frontend
```bash
npm run dev
```

## ⚙️ Environment Setup

Create a `.env` file with the following variables:
```
PRIVATE_KEY=your_private_key
INFURA_PROJECT_ID=your_infura_project_id
```


## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
## 🤝 Contributing

1. 🍴 Fork the repository
2. 🌿 Create your feature branch
3. 💾 Commit your changes
4. 🚀 Push to the branch
5. 📬 Open a pull request

For questions and support, please open an issue in the repository.
