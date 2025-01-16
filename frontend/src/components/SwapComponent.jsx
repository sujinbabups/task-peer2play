import React, { useState } from 'react'
import { ArrowDownUp } from 'lucide-react';
import { ethers } from 'ethers';


const SwapComponent = ({ contract, tokens, deployedAddress, signer }) => {


      const [loading, setLoading] = useState(false);
      const [swapAmount, setSwapAmount] = useState('');
      const [error, setError] = useState('');
      const [swapDirection, setSwapDirection] = useState(true);
      

      const handleSwap = async () => {
        
        if (!contract || !swapAmount || !signer) return;
    
        try {
          setLoading(true);
          setError('');
    
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
    
          setSwapAmount('');
          console.log('Swap successful!');
        } catch (error) {
          console.error('Swap failed:', error);
          setError(error.message || 'Swap failed. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      
      
  return (
    <div>
         <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {swapDirection ? 'Token 1 Amount' : 'Token 2 Amount'}
                  </label>
                  <input
                    type="number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter amount"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={() => setSwapDirection(!swapDirection)}
                  className="w-full p-3 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200"
                  disabled={loading}
                >
                  <ArrowDownUp className="h-5 w-5 mr-2" />
                  Swap Direction
                </button>

                {/* <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Estimated Output: {swapAmount ? (Number(swapAmount) * 0.997).toFixed(6) : '0.00'} 
                    {swapDirection ? ' Token 2' : ' Token 1'}
                  </p>
                </div> */}

                <button
                  onClick={handleSwap}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-medium disabled:opacity-50 disabled:hover:bg-blue-500"
                  disabled={loading || !swapAmount || Number(swapAmount) <= 0}
                >
                  {loading ? 'Processing...' : 'Swap'}
                </button>
              </div>
    </div>
  )
}

export default SwapComponent
