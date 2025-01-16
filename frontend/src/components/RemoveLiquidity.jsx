import React, { useState } from 'react'
import { Minus } from 'lucide-react';
import { ethers } from 'ethers';

const RemoveLiquidity = ({ contract}) => {

      const [poolShare, setPoolShare] = useState('0.0');
      const [removeAmount, setRemoveAmount] = useState('');
      const [loading, setLoading] = useState(false);

 
      const [error, setError] = useState('');
    

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
    <div className="space-y-4">
       <div className="bg-gray-50 p-4 rounded-lg">
         <p className="text-sm text-gray-600">
             Your Pool Share: {poolShare}%
          </p>
        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Remove
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount to remove"
                    value={removeAmount}
                    onChange={(e) => setRemoveAmount(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={handleRemoveLiquidity}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:hover:bg-blue-500 flex items-center justify-center"
                  disabled={loading || !removeAmount}
                >
                  <Minus className="h-5 w-5 mr-2" />
                  {loading ? 'Processing...' : 'Remove Liquidity'}
                </button>
              </div>
            
  )
}

export default RemoveLiquidity
