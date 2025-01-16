import React, { useState } from 'react';
import { ArrowDownUp, Plus, Minus } from 'lucide-react';
import { ethers } from 'ethers';

const AddLiquidity = ({ contract, tokens, deployedAddress, signer,connected,account }) => {
      const [token1Amount, setToken1Amount] = useState('');
      const [loading, setLoading] = useState(false);
      const [token2Amount, setToken2Amount] = useState('');
      const [activeTab, setActiveTab] = useState('swap');
      const [swapDirection, setSwapDirection] = useState(true);
      const [token1Balance, setToken1Balance] = useState('');
      const [token2Balance, setToken2Balance] = useState('');
      const [poolShare, setPoolShare] = useState('0.0');
      
      const [error, setError] = useState('');
      

        const handleAddLiquidity = async () => {
          if (!contract || !token1Amount || !token2Amount) return;
          
          try {
            setLoading(true);
            setError('');
            
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
      
  
  return (
    <>
    <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token 1 Amount
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Token 1 amount"
                    value={token1Amount}
                    onChange={(e) => setToken1Amount(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Token 2 Amount
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter Token 2 amount"
                    value={token2Amount}
                    onChange={(e) => setToken2Amount(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleAddLiquidity}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:hover:bg-blue-500 flex items-center justify-center"
                  disabled={loading || !token1Amount || !token2Amount}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {loading ? 'Processing...' : 'Add Liquidity'}
                </button>
              </div>

    </>
     )
}

export default AddLiquidity
