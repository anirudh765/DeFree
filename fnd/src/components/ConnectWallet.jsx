import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useLocation, useNavigate } from "react-router-dom";
import contractArtifact from "../../../artifacts/contracts/DecentralizedFreelanceMarket.sol/DecentralizedFreelanceMarket.json";

const contractAddress = "0x246f33CC52c4fcF82Ae43E2284E27414702A3A40"; 

const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [status, setStatus] = useState("No Wallet Connected");
  const [contractMessage, setContractMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const fetchBalance = async (provider, userAccount) => {
    try {
      const walletBalance = await provider.getBalance(userAccount);
      const formattedBalance = ethers.formatEther
        ? ethers.formatEther(walletBalance)
        : ethers.utils.formatEther(walletBalance);
      setBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    }
  };

  const fetchContractMessage = async (signer) => {
    try {
      const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi || contractArtifact,
        signer
      );
      if (contract.getMessage) {
        const message = await contract.getMessage();
        setContractMessage(message);
      } else {
        setContractMessage("No message function");
      }
    } catch (error) {
      console.error("Error fetching contract message:", error);
      setContractMessage("Error fetching data");
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed! Please install MetaMask and try again.");
      setStatus("MetaMask Not Installed");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const connectedAccount = accounts[0];
  
      setAccount(connectedAccount);
      setStatus("Wallet Connected");
  
      await fetchBalance(provider, connectedAccount);
      await fetchContractMessage(signer);
  
      const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi || contractArtifact,
        signer
      );
  
      // Retrieve user data (tuple-like array)
      const userData = await contract.users(connectedAccount);
      console.log("User Data:", userData);
  
      // Destructure the array
      const [walletAddress, userType, name, description, email, credits] = userData;
  
      if (walletAddress !== "0x0000000000000000000000000000000000000000") {
        // Compare userType with BigInt in ethers v6
        if (userType === 0n) { // Freelancer
          navigate("/freelancedashboard");
        } else if (userType === 1n) { // Client
          navigate("/clientdashboard");
        }
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      setStatus("Error connecting to Wallet");
    }
  }, [navigate]);
  
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        setAccount(accounts[0] || null);
        setStatus(accounts[0] ? "Wallet Connected" : "No Wallet Connected");
      };

      const handleChainChanged = () => window.location.reload();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {/* Header */}
      <nav className="bg-violet-700 text-white w-full py-4 px-6 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Decentralized Freelancing Platform</h1>
        </div>
      </nav>

      {/* Wallet Connection Card */}
      <div className="bg-white shadow-lg rounded-xl p-8 mt-8 max-w-lg w-full">
        <h1 className="text-2xl font-semibold text-violet-700 text-center mb-4">
          MetaMask Wallet Connection
        </h1>

        {/* Status */}
        <p
          className={`text-center py-2 rounded font-medium ${
            status === "Wallet Connected"
              ? "bg-green-100 text-green-700"
              : status === "MetaMask Not Installed"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status}
        </p>

        {/* Connect Wallet Button */}
        <button
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 px-4 rounded-lg mt-4"
          onClick={connectWallet}
        >
          {account ? "Reconnect Wallet" : "Connect Wallet"}
        </button>

        {/* Wallet Info */}
        {account && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-700 font-medium">Wallet Address:</p>
            <p className="text-sm break-all text-gray-900">{account}</p>

            <p className="text-gray-700 font-medium mt-2">Balance:</p>
            <p className="text-sm text-gray-900">
              {balance ? `${balance} ETH` : "Fetching balance..."}
            </p>

            <p className="text-gray-700 font-medium mt-2">Contract Message:</p>
            <p className="text-sm text-gray-900">
              {contractMessage || "Fetching data..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletConnect;
