import React, { useEffect, useState } from 'react';
import { ArrowDownUp, Plus, Minus } from 'lucide-react';
import { ethers } from 'ethers';
import { abi } from '../scdata/abi.json';
import depadd from '../scdata/deployed_address.json'
const deployedAddress =depadd.LiquidityModuleLiquidityPool;

const tokens = {
  TK1: "0x50E00bC33d107108D935B07EF7D82594651B1968", 
  TK2: "0x3070ef83F647838DB86f276c7D9E58B83559a788",
};

const LiquidityPool = () => {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('swap');
    const [swapAmount, setSwapAmount] = useState('');
    const [swapDirection, setSwapDirection] = useState(true);
    const [token1Amount, setToken1Amount] = useState('');
    const [token2Amount, setToken2Amount] = useState('');
    const [removeAmount, setRemoveAmount] = useState('');
    const [token1Balance, setToken1Balance] = useState('0.0');
    const [token2Balance, setToken2Balance] = useState('0.0' );
    const [poolShare, setPoolShare] = useState('0.0');
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [error, setError] = useState('');
  
    async function updateBalances() {
      if (!contract || !connected || !account) return;

      try {
        setError('');

        // Get reserves
        const [reserve1, reserve2] = await contract.getReserves();
        setToken1Balance(ethers.formatEther(reserve1));
        setToken2Balance(ethers.formatEther(reserve2));

        console.log("tkn1 balance :",token1Balance);

        // Get total shares and user shares as numbers
        const totalShares = await contract.totalShares();
        const userShares = await contract.shares(account);

        console.log("user shares :",userShares);
        console.log("total shares :",totalShares);

        // Calculate pool share percentage
        if (totalShares && Number(totalShares) > 0) {
          const sharePercentage = (Number(userShares) / Number(totalShares) * 100);
          setPoolShare(sharePercentage.toFixed(2));
        } else {
          setPoolShare('0.00');
        }
      } catch (error) {
        console.error("Error updating balances:", error);
        setError('Failed to fetch pool data. Please check your connection and try again.');
      }
    }

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const newSigner = await provider.getSigner();
        const lpContract = new ethers.Contract(deployedAddress, abi, newSigner);

  
        setSigner(newSigner);
        setContract(lpContract);
        setAccount(accounts[0]);
        setConnected(true);
  
        // Call updateBalances after setting the contract
        await updateBalances();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("Please install MetaMask!");
    }
  };
  
  
  const handleSwap = async () => {
    if (!contract || !swapAmount) return;
    
    try {
      setLoading(true);
      setError('');
      
      // First approve the token being swapped
      const tokenContract = new ethers.Contract(
        swapDirection ? tokens.TK1 : tokens.TK2,
        ['function approve(address spender, uint256 amount) public returns (bool)'],
        signer
      );
      
      const amount = ethers.parseEther(swapAmount);
      
      // Approve token transfer
      const approveTx = await tokenContract.approve(deployedAddress, amount);
      await approveTx.wait();
      
      // Execute swap
      const tx = await contract.swap(amount, swapDirection);
      await tx.wait();
      await updateBalances();
      setSwapAmount('');
    } catch (error) {
      console.error("Swap failed:", error);
      setError(error.message || 'Swap failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLiquidity = async () => {
    if (!contract || !token1Amount || !token2Amount) return;
    
    try {
      setLoading(true);
      setError('');

      const [beforeReserve1, beforeReserve2] = await contract.getReserves();
      const beforeTotalShares = await contract.totalShares();
      const beforeUserShares = await contract.shares(account);
      console.log("Before adding liquidity:");
      console.log("Reserves:", ethers.formatEther(beforeReserve1), ethers.formatEther(beforeReserve2));
      console.log("Total shares:", beforeTotalShares.toString());
      console.log("User shares:", beforeUserShares.toString());
      
      const amount1 = ethers.parseEther(token1Amount);
      const amount2 = ethers.parseEther(token2Amount);
      
      // Approve both tokens
      const token1Contract = new ethers.Contract(
        tokens.TK1,
        ['function approve(address spender, uint256 amount) public returns (bool)'],
        signer
      );
      const token2Contract = new ethers.Contract(
        tokens.TK2,
        ['function approve(address spender, uint256 amount) public returns (bool)'],
        signer
      );
      
      // Wait for both approvals
      const approve1Tx = await token1Contract.approve(deployedAddress, amount1);
      await approve1Tx.wait();
      
      const approve2Tx = await token2Contract.approve(deployedAddress, amount2);
      await approve2Tx.wait();
      
      // Add liquidity
      const tx = await contract.addLiquidity(amount1, amount2);
      await tx.wait();

      const [afterReserve1, afterReserve2] = await contract.getReserves();
      const afterTotalShares = await contract.totalShares();
      const afterUserShares = await contract.shares(account);
      console.log("After adding liquidity:");
      console.log("Reserves:", ethers.formatEther(afterReserve1), ethers.formatEther(afterReserve2));
      console.log("Total shares:", afterTotalShares.toString());
      console.log("User shares:", afterUserShares.toString());
      await updateBalances();
      
      setToken1Amount('');
      setToken2Amount('');
    } catch (error) {
      console.error("Adding liquidity failed:", error);
      setError(error.message || 'Failed to add liquidity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!contract || !removeAmount) return;
    
    try {
      setLoading(true);
      setError('');
      const amount = ethers.parseEther(removeAmount);
      
      const tx = await contract.removeLiquidity(amount);
      await tx.wait();
      await updateBalances();
      setRemoveAmount('');
    } catch (error) {
      console.error("Removing liquidity failed:", error);
      setError(error.message || 'Failed to remove liquidity. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
    <div className="max-w-lg mx-auto p-4 space-y-6">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-purple-100">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Liquidity Pool
          </h1>
          <button
            onClick={connectWallet}
            disabled={loading}
            className={`px-6 py-2 rounded-xl font-medium transition-all shadow-sm ${
              connected 
                ? 'bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
            } disabled:opacity-50`}
          >
            {loading ? "Loading..." : connected ? `${account.slice(0, 6)}...` : "Connect Wallet"}
          </button>
        </div>

        {!connected ? (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 p-6 rounded-xl border border-purple-100">
            Please connect your wallet to interact with the pool
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex space-x-1 bg-gray-50 p-1 rounded-xl">
              {['swap', 'add', 'remove'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 rounded-lg capitalize font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white text-purple-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'swap' && (
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {swapDirection ? 'Token 1 Amount' : 'Token 2 Amount'}
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 border border-purple-100 rounded-xl bg-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    placeholder="Enter amount"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={() => setSwapDirection(!swapDirection)}
                  className="w-full p-4 flex items-center justify-center text-purple-600 hover:bg-purple-50 rounded-xl border border-purple-100 transition-colors"
                  disabled={loading}
                >
                  <ArrowDownUp className="h-5 w-5 mr-2" />
                  Swap Direction
                </button>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <p className="text-sm text-purple-700">
                    Estimated Output: {swapAmount ? (Number(swapAmount) * 0.997).toFixed(6) : '0.00'} 
                    {swapDirection ? ' Token 2' : ' Token 1'}
                  </p>
                </div>

                <button
                  onClick={handleSwap}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all"
                  disabled={loading || !swapAmount || Number(swapAmount) <= 0}
                >
                  {loading ? 'Processing...' : 'Swap'}
                </button>
              </div>
            )}

            {activeTab === 'add' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token 1 Amount
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 border border-purple-100 rounded-xl bg-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    placeholder="Enter Token 1 amount"
                    value={token1Amount}
                    onChange={(e) => setToken1Amount(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Token 2 Amount
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 border border-purple-100 rounded-xl bg-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    placeholder="Enter Token 2 amount"
                    value={token2Amount}
                    onChange={(e) => setToken2Amount(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleAddLiquidity}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all flex items-center justify-center"
                  disabled={loading || !token1Amount || !token2Amount}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {loading ? 'Processing...' : 'Add Liquidity'}
                </button>
              </div>
            )}

            {activeTab === 'remove' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                  <p className="text-sm text-purple-700">
                    Your Pool Share: {poolShare}%
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount to Remove
                  </label>
                  <input
                    type="number"
                    className="w-full p-4 border border-purple-100 rounded-xl bg-white/50 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    placeholder="Enter amount to remove"
                    value={removeAmount}
                    onChange={(e) => setRemoveAmount(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleRemoveLiquidity}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-medium disabled:opacity-50 transition-all flex items-center justify-center"
                  disabled={loading || !removeAmount}
                >
                  <Minus className="h-5 w-5 mr-2" />
                  {loading ? 'Processing...' : 'Remove Liquidity'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {connected && (
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-purple-100">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Your Balances
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <span className="text-purple-700 font-medium">Token 1 (TK1)</span>
              <span className="font-mono text-purple-800">{token1Balance}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <span className="text-purple-700 font-medium">Token 2 (TK2)</span>
              <span className="font-mono text-purple-800">{token2Balance}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default LiquidityPool;