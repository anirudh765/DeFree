import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ethers } from "ethers";
import axios from "axios";
import FormData from "form-data";
//import DecentralizedFreelanceMarket from "../contracts/DecentralizedFreelanceMarket.json"; // Adjust path as needed

const RaiseDispute = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // Get projectId from URL
  
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [contract, setContract] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [account, setAccount] = useState("");
  const [uploading, setUploading] = useState(false);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);
  const [disputeId, setDisputeId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(60); // 60 seconds = 1 minute
  const [disputeStatus, setDisputeStatus] = useState("");
  
  // IPFS configuration - using Pinata as an example, but could use Infura or other IPFS services
  const PINATA_API_KEY = "631aba7bba8a85658b57";
  const PINATA_SECRET_KEY = "ed236116b957abe0293ab4e1101662b755cb01051d78719021b7c9c3114cc693";
  const PINATA_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  
  useEffect(() => {
    const connectToBlockchain = async () => {
      try {
        setIsLoading(true);
        if (window.ethereum) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          setAccount(accounts[0]);
          
          const signer = provider.getSigner();
          
          // Get contract address from deployment or environment
          const contractAddress = "0xa261f0f9740e7eb019d6e0311f0327fe205290f1";
          
          // Create contract instance
          const marketContract = new ethers.Contract(
            contractAddress,
            DecentralizedFreelanceMarket.abi,
            signer
          );
          setContract(marketContract);
          
          // Get project details
          if (projectId) {
            const project = await marketContract.projects(projectId);
            setProjectDetails(project);
            
            // Check if user is client or freelancer of this project
            if (project.client.toLowerCase() !== accounts[0].toLowerCase() && 
                project.freelancer.toLowerCase() !== accounts[0].toLowerCase()) {
              setError("You must be the client or freelancer for this project to raise a dispute");
            }
          } else {
            setError("Project ID is required");
          }
        } else {
          setError("Please install MetaMask to use this application");
        }
      } catch (err) {
        console.error("Error connecting to blockchain:", err);
        setError("Failed to connect to blockchain");
      } finally {
        setIsLoading(false);
      }
    };
    
    connectToBlockchain();
  }, [projectId]);
  
  // Countdown timer effect for dispute resolution
  useEffect(() => {
    let timer;
    if (disputeSubmitted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            checkDisputeResolution();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [disputeSubmitted, timeRemaining]);
  
  const checkDisputeResolution = async () => {
    try {
      if (!disputeId || !contract) return;
      
      // Call contract to check if dispute needs resolution
      const tx = await contract.checkDisputeExpiry(disputeId);
      await tx.wait();
      
      // Get updated dispute status
      const dispute = await contract.disputes(disputeId);
      
      if (dispute.resolved) {
        const project = await contract.projects(projectId);
        if (project.status === 2) { // Completed
          setDisputeStatus("Dispute resolved: Freelancer won");
        } else if (project.status === 4) { // Rejected
          setDisputeStatus("Dispute resolved: Client won");
        } else {
          setDisputeStatus("Dispute resolved");
        }
      } else {
        setDisputeStatus("Waiting for dispute resolution...");
      }
    } catch (err) {
      console.error("Error checking dispute resolution:", err);
      setDisputeStatus("Error checking dispute resolution");
    }
  };
  
  const uploadToIPFS = async (file) => {
    try {
      setUploading(true);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append("file", file);
      
      // Add metadata
      const metadata = JSON.stringify({
        name: `dispute-evidence-project-${projectId}`,
        keyvalues: {
          projectId: projectId,
          uploader: account,
          timestamp: Date.now()
        }
      });
      formData.append('pinataMetadata', metadata);
      
      // Optional pinata options
      const pinataOptions = JSON.stringify({
        cidVersion: 0
      });
      formData.append('pinataOptions', pinataOptions);
      
      // Upload to Pinata
      const response = await axios.post(PINATA_ENDPOINT, formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_KEY
        }
      });
      
      // Return the IPFS CID
      return response.data.IpfsHash;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      throw new Error("Failed to upload file to IPFS");
    } finally {
      setUploading(false);
    }
  };
  
  // Alternative function for using nft.storage (another popular IPFS service)
  const uploadToNFTStorage = async (file) => {
    try {
      setUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(
        'https://api.nft.storage/upload', 
        formData, 
        {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3OGEyOTQzZS1mZTNjLTRmZjctOGJiOC0yYTA1ZDFmMjZlMzUiLCJlbWFpbCI6ImNoYXJhbi5jbTc4OUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNjMxYWJhN2JiYThhODU2NThiNTciLCJzY29wZWRLZXlTZWNyZXQiOiJlZDIzNjExNmI5NTdhYmUwMjkzYWI0ZTExMDE2NjJiNzU1Y2IwMTA1MWQ3ODcxOTAyMWI3YzljMzExNGNjNjkzIiwiZXhwIjoxNzY5MTkzMTcxfQ.Tlybw67-kYQD-m-d-t0vmcmsgt_cB6d1Gl-eJcCQMRE`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data.value.cid;
    } catch (error) {
      console.error("Error uploading to NFT.Storage:", error);
      throw new Error("Failed to upload file to IPFS");
    } finally {
      setUploading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason || !file) {
      alert("Please provide a reason and upload a file.");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Upload file to IPFS using axios
      const ipfsCid = await uploadToIPFS(file);
      console.log("File uploaded to IPFS with CID:", ipfsCid);
      
      // Create explanation JSON with reason and file CID
      const explanationData = {
        reason: reason,
        evidenceFile: `ipfs://${ipfsCid}`,
        fileName: file.name,
        fileType: file.type,
        timestamp: new Date().toISOString()
      };
      
      // Convert to string
      const explanationStr = JSON.stringify(explanationData);
      
      // Submit dispute to smart contract
      const tx = await contract.raiseDispute(projectId, explanationStr);
      console.log("Transaction sent:", tx.hash);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
      
      // Get the dispute ID from events
      for (const event of receipt.events) {
        if (event.event === "DisputeRaised") {
          setDisputeId(event.args.disputeId.toNumber());
          break;
        }
      }
      
      setDisputeSubmitted(true);
      setTimeRemaining(60); // Reset timer to 60 seconds (1 minute)
      setDisputeStatus("Dispute raised successfully! Waiting for resolution in 1 minute...");
      
    } catch (err) {
      console.error("Error raising dispute:", err);
      setError("Failed to raise dispute: " + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && !disputeSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-10 bg-gray-100">
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-lg w-full text-center">
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error && !disputeSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-10 bg-gray-100">
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-lg w-full text-center">
          <p className="text-red-600">{error}</p>
          <button 
            className="mt-4 bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg"
            onClick={() => navigate("/my-projects")}
          >
            Back to My Projects
          </button>
        </div>
      </div>
    );
  }
  
  if (disputeSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-10 bg-gray-100">
        <div className="bg-white shadow-lg rounded-xl p-6 max-w-lg w-full text-center">
          <h2 className="text-2xl font-semibold text-violet-700 mb-4">Dispute Submitted</h2>
          <p className="text-gray-700 mb-4">{disputeStatus}</p>
          
          {timeRemaining > 0 && (
            <div className="mb-6">
              <p className="text-lg font-medium">Time remaining for voting:</p>
              <div className="mt-2 p-3 bg-violet-100 rounded-lg text-2xl font-bold text-violet-800">
                {timeRemaining} seconds
              </div>
            </div>
          )}
          
          {timeRemaining === 0 && (
            <p className="text-gray-700 mt-4">
              Time expired. The dispute will be automatically resolved based on votes.
            </p>
          )}
          
          <div className="mt-6 flex justify-center">
            <button 
              className="bg-violet-600 hover:bg-violet-700 text-white py-2 px-6 rounded-lg mr-4"
              onClick={checkDisputeResolution}
            >
              Check Resolution
            </button>
            
            <button 
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-lg"
              onClick={() => navigate("/my-projects")}
            >
              Back to My Projects
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-violet-700 text-center">Raise Dispute</h2>
        
        {projectDetails && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800">Project: {projectDetails.title}</h3>
            <p className="text-sm text-gray-600">Budget: {ethers.utils.formatEther(projectDetails.budget)} ETH</p>
            <p className="text-sm text-gray-600">
              Status: {
                projectDetails.status === 0 ? "Active" :
                projectDetails.status === 1 ? "Ongoing" :
                projectDetails.status === 2 ? "Completed" :
                projectDetails.status === 3 ? "On Dispute" :
                projectDetails.status === 4 ? "Rejected" :
                projectDetails.status === 5 ? "Done by freelancer" : "Unknown"
              }
            </p>
          </div>
        )}
        
        <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Once submitted, disputes have a 1-minute voting period. After this period, the dispute will be automatically resolved based on votes, and funds will be transferred accordingly.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-gray-700 font-medium">
            Reason for Dispute:
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-gray-900"
              rows="4"
              required
              placeholder="Explain why you're raising this dispute..."
            />
          </label>
          
          <label className="block text-gray-700 font-medium">
            Upload Evidence File:
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-gray-900"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload supporting evidence (code, screenshots, communications)
            </p>
          </label>
          
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg disabled:bg-gray-400"
            disabled={isLoading || uploading}
          >
            {isLoading ? "Submitting..." : uploading ? "Uploading to IPFS..." : "Submit Dispute"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaiseDispute;