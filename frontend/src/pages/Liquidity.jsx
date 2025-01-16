import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers';
import { ArrowDownUp, Plus, Minus } from 'lucide-react';
import {abi} from '../scdata/abi.json';
import SwapComponent from './../components/SwapComponent';
import AddLiquidity from './../components/AddLiquidity';
import RemoveLiquidity from './../components/RemoveLiquidity';

const Liquidity = () => {

     const [connected, setConnected] = useState(false);
      const [loading, setLoading] = useState(false);
      const [activeTab, setActiveTab] = useState('swap');
      const [account, setAccount] = useState('');
      const [signer, setSigner] = useState(null);
      const [contract, setContract] = useState(null);
      const [error, setError] = useState('');
      const [token1Balance, setToken1Balance] = useState('0.0');
      const [token2Balance, setToken2Balance] = useState('0.0' );     
      const [poolShare, setPoolShare] = useState('0.0');
      

      const deployedAddress="0xfF9b782697076e893e78b25Dc008eea2EBD58660";
      const tokens = {
        TK1: "0x50E00bC33d107108D935B07EF7D82594651B1968", 
        TK2: "0x3070ef83F647838DB86f276c7D9E58B83559a788",
      };
    
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
      } catch (error) {
        console.error("Failed to connect wallet:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("Please install MetaMask!");
    }
  };

    useEffect(() => {
      connectWallet();

    }, []);

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
    <div className="max-w-md mx-auto p-4 space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Liquidity Pool</h1>
          <button
           
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              connected 
                ? 'bg-gray-100 hover:bg-gray-200' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } disabled:opacity-50`}
          >
            {loading ? "Loading..." : connected ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
          </button>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {['swap', 'add', 'remove'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-2 rounded-md capitalize font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
        <div>
        {activeTab === 'swap' && (
              <div className="space-y-4">
              <SwapComponent contract={contract} tokens={tokens} signer={signer}deployedAddress={deployedAddress} connected={connected} />
          
              </div>
            )}

        {activeTab === 'add' && (
              <div className="space-y-4">
                <AddLiquidity contract={contract} tokens={tokens} signer={signer}deployedAddress={deployedAddress} connected={connected} account={account}/>
          
              </div>
            )}

            {activeTab === 'remove' && (
              <div className="space-y-4">
                <RemoveLiquidity contract={contract}/>
              </div>
            )}
          </div>
      
    </div>
    {connected && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold mb-4">Your Balances</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span>Token 1 (TK1)</span>
              <span className="font-mono">{token1Balance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Token 2 (TK2)</span>
              <span className="font-mono">{token2Balance}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Liquidity
