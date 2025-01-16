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
    
    uint256 public totalShares; 
    mapping(address => uint256) public shares; 
    
    uint256 private constant MINIMUM_LIQUIDITY = 1000;
    
    event LiquidityAdded(address indexed provider, uint256 amount1, uint256 amount2, uint256 shares, uint256 newReserve1, uint256 newReserve2);
    event LiquidityRemoved(address indexed provider, uint256 amount1, uint256 amount2, uint256 shares, uint256 newReserve1, uint256 newReserve2);
    event Swap(address indexed user, uint256 amountIn, uint256 amountOut, bool token1ToToken2);
    
    constructor(address _token1, address _token2) {
        require(_token1 != address(0) && _token2 != address(0), "Invalid token addresses");
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
    }
    
    function getReserves() public view returns (uint256 reserve1, uint256 reserve2) {
        reserve1 = token1.balanceOf(address(this));
        reserve2 = token2.balanceOf(address(this));
    }
    
    function addLiquidity(uint256 amount1, uint256 amount2) external nonReentrant returns (uint256 share) {
        require(amount1 > 0 && amount2 > 0, "Amounts must be greater than 0");
        
        (uint256 reserve1, uint256 reserve2) = getReserves();
        
        require(token1.transferFrom(msg.sender, address(this), amount1), "Transfer of token1 failed");
        require(token2.transferFrom(msg.sender, address(this), amount2), "Transfer of token2 failed");
        
        if (totalShares == 0) {
            share = Math.sqrt(amount1 * amount2) - MINIMUM_LIQUIDITY;
            totalShares = share + MINIMUM_LIQUIDITY;
        } else {
            share = Math.min(
                (amount1 * totalShares) / reserve1,
                (amount2 * totalShares) / reserve2
            );
        }
        
        require(share > 0, "Insufficient liquidity minted");
        shares[msg.sender] += share;
        totalShares += share;

        emit LiquidityAdded(msg.sender, amount1, amount2, share, reserve1 + amount1, reserve2 + amount2);
    }
    
    function removeLiquidity(uint256 share) external nonReentrant returns (uint256 amount1, uint256 amount2) {
        require(share > 0 && shares[msg.sender] >= share, "Insufficient shares");
        
        (uint256 reserve1, uint256 reserve2) = getReserves();
        
        amount1 = (share * reserve1) / totalShares;
        amount2 = (share * reserve2) / totalShares;
        
        require(amount1 > 0 && amount2 > 0, "Insufficient liquidity burned");
        
        shares[msg.sender] -= share;
        totalShares -= share;
        
        require(totalShares >= MINIMUM_LIQUIDITY, "Cannot remove below minimum liquidity");
        
        require(token1.transfer(msg.sender, amount1), "Transfer of token1 failed");
        require(token2.transfer(msg.sender, amount2), "Transfer of token2 failed");
        
        emit LiquidityRemoved(msg.sender, amount1, amount2, share, reserve1 - amount1, reserve2 - amount2);
    }
    
    function swap(uint256 amountIn, bool token1ToToken2) external nonReentrant returns (uint256 amountOut) {
        require(amountIn > 0, "Amount must be greater than 0");
        
        (uint256 reserve1, uint256 reserve2) = getReserves();
        
        if (token1ToToken2) {
            require(token1.transferFrom(msg.sender, address(this), amountIn), "Transfer of token1 failed");
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
