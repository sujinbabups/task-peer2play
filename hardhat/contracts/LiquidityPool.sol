// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// First Token
contract Token1 is ERC20 {
    constructor() ERC20("Token1", "TK1") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

// Second Token
contract Token2 is ERC20 {
    constructor() ERC20("Token2", "TK2") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}

// Liquidity Pool Contract
contract LiquidityPool is ReentrancyGuard {
    IERC20 public token1;
    IERC20 public token2;
    
    uint256 public totalShares; // Total liquidity shares
    mapping(address => uint256) public shares; // Liquidity shares per user
    
    // Minimum liquidity to prevent division by zero
    uint256 private constant MINIMUM_LIQUIDITY = 1000;
    
    event LiquidityAdded(address indexed provider, uint256 amount1, uint256 amount2, uint256 shares);
    event LiquidityRemoved(address indexed provider, uint256 amount1, uint256 amount2, uint256 shares);
    event Swap(address indexed user, uint256 amountIn, uint256 amountOut, bool token1ToToken2);
    
    constructor(address _token1, address _token2) {
        require(_token1 != address(0) && _token2 != address(0), "Invalid token addresses");
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }
    
    // Get reserves of both tokens
    function getReserves() public view returns (uint256 reserve1, uint256 reserve2) {
        reserve1 = token1.balanceOf(address(this));
        reserve2 = token2.balanceOf(address(this));
    }
    
    // Add liquidity to the pool
    function addLiquidity(uint256 amount1, uint256 amount2) external nonReentrant returns (uint256 share) {
        require(amount1 > 0 && amount2 > 0, "Amounts must be greater than 0");
        
        // Transfer tokens to the contract
        require(token1.transferFrom(msg.sender, address(this), amount1), "Transfer of token1 failed");
        require(token2.transferFrom(msg.sender, address(this), amount2), "Transfer of token2 failed");
        
        // Calculate shares
        if (totalShares == 0) {
            share = Math.sqrt(amount1 * amount2) - MINIMUM_LIQUIDITY;
            totalShares = share + MINIMUM_LIQUIDITY;
        } else {
            (uint256 reserve1, uint256 reserve2) = getReserves();
            share = Math.min(
                (amount1 * totalShares) / reserve1,
                (amount2 * totalShares) / reserve2
            );
        }
        
        require(share > 0, "Insufficient liquidity minted");
        shares[msg.sender] += share;
        
        emit LiquidityAdded(msg.sender, amount1, amount2, share);
    }
    
    // Remove liquidity from the pool
    function removeLiquidity(uint256 share) external nonReentrant returns (uint256 amount1, uint256 amount2) {
        require(share > 0 && shares[msg.sender] >= share, "Insufficient shares");
        
        (uint256 reserve1, uint256 reserve2) = getReserves();
        
        // Calculate token amounts to return
        amount1 = (share * reserve1) / totalShares;
        amount2 = (share * reserve2) / totalShares;
        
        require(amount1 > 0 && amount2 > 0, "Insufficient liquidity burned");
        
        shares[msg.sender] -= share;
        totalShares -= share;
        
        // Transfer tokens back to user
        require(token1.transfer(msg.sender, amount1), "Transfer of token1 failed");
        require(token2.transfer(msg.sender, amount2), "Transfer of token2 failed");
        
        emit LiquidityRemoved(msg.sender, amount1, amount2, share);
    }
    
    // Swap tokens
    function swap(uint256 amountIn, bool token1ToToken2) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");
        
        (uint256 reserve1, uint256 reserve2) = getReserves();
        
        if (token1ToToken2) {
            require(token1.transferFrom(msg.sender, address(this), amountIn), "Transfer of token1 failed");
            // Calculate amount out using constant product formula (x * y = k)
            // Fee of 0.3% is applied
            uint256 amountInWithFee = amountIn * 997;
            amountOut = (amountInWithFee * reserve2) / ((reserve1 * 1000) + amountInWithFee);
            require(token2.transfer(msg.sender, amountOut), "Transfer of token2 failed");
        } else {
            require(token2.transferFrom(msg.sender, address(this), amountIn), "Transfer of token2 failed");
            uint256 amountInWithFee = amountIn * 997;
            amountOut = (amountInWithFee * reserve1) / ((reserve2 * 1000) + amountInWithFee);
            require(token1.transfer(msg.sender, amountOut), "Transfer of token1 failed");
        }
        
        emit Swap(msg.sender, amountIn, amountOut, token1ToToken2);
    }
}

// Math library for safe math operations
library Math {
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}