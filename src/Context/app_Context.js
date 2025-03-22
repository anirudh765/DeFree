// src/context/AppContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import contractABI from "../utils/DecentralizedFreelanceMarket.json"; 

// Replace with your deployed contract address or load from env variables
const contractAddress = 0x5FbDB2315678afecb367f032d93F642f64180aa3;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
 
  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        console.log("Please install MetaMask!");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        initializeEthers();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  // Connect wallet function for user interaction
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Please install MetaMask!");
        return;
      }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      initializeEthers();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Initialize ethers, provider, signer and contract instance
  const initializeEthers = () => {
    const tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(tempProvider);
    const signer = tempProvider.getSigner();
    const contractInstance = new ethers.Contract(contractAddress, contractABI.abi, signer);
    setContract(contractInstance);
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  // Example helper function to call a contract function
  // You can add more functions as needed.
  const createProject = async (title, description, budget) => {
    if (!contract) return alert("Contract is not loaded");
    try {
      const tx = await contract.createProject(title, description, budget);
      await tx.wait();
      console.log("Project created successfully");
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <AppContext.Provider value={{ currentAccount, contract, provider, connectWallet, createProject }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
