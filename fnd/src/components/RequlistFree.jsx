import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X } from "lucide-react";
import { ethers } from "ethers";
import contractArtifact from "../../../artifacts/contracts/DecentralizedFreelanceMarket.sol/DecentralizedFreelanceMarket.json";

const contractAddress = "0x246f33CC52c4fcF82Ae43E2284E27414702A3A40";

const FreelancerRequests = () => {
  const { JobId } = useParams(); // Project ID from route params
  const navigate = useNavigate();
  const [freelancers, setFreelancers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Function to calculate average rating from an array of review numbers
  const calculateAverage = (reviews) => {
    if (reviews.length === 0) return "N/A";
    const sum = reviews.reduce((acc, r) => acc + Number(r), 0);
    return (sum / reviews.length).toFixed(1);
  };

  // Load freelancers who applied for this project from the contract
  useEffect(() => {
    async function loadFreelancers() {
      if (!window.ethereum) {
        setError("MetaMask not installed");
        setLoading(false);
        return;
      }
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          contractArtifact.abi || contractArtifact,
          signer
        );
        // Call the getFreelancerApplied function to get addresses
        const appliedAddresses = await contract.callStatic.getFreelancerApplied(JobId);
        // For each freelancer address, fetch their user details from the public mapping `users`
        const freelancerDetails = await Promise.all(
          appliedAddresses.map(async (addr) => {
            const userData = await contract.callStatic.users(addr);
            // For users mapping, assuming:
            // userData[0]: wallet, [1]: userType, [2]: name, [3]: description, [4]: email, [5]: credits, [6]: skills, [7]: documents, [8]: reviews
            return {
              walletId: addr,
              name: userData[2],
              rating: calculateAverage(userData[8]),
              skills: userData[6],
            };
          })
        );
        setFreelancers(freelancerDetails);
      } catch (err) {
        console.error("Error loading freelancers:", err);
        setError("Error loading freelancers from blockchain");
      }
      setLoading(false);
    }
    loadFreelancers();
  }, [JobId]);

  // Filter freelancers based on search input
  const filteredFreelancers = freelancers.filter((freelancer) =>
    freelancer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler to approve a freelancer (calls acceptProjectRequest in contract)
  const handleApprove = async (freelancerWallet) => {
    if (!window.ethereum) {
      alert("MetaMask not installed");
      return;
    }
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi || contractArtifact,
        signer
      );
      // Call the acceptProjectRequest function with project id and freelancer's wallet
      const tx = await contract.acceptProjectRequest(JobId, freelancerWallet);
      await tx.wait();
      alert("Freelancer approved!");
      // Optionally reload the list or navigate
      // For instance, you might want to refresh the page:
      window.location.reload();
    } catch (err) {
      console.error("Error approving freelancer:", err);
      alert("Error approving freelancer: " + err.message);
    }
  };

  // Handler for Reject (you can implement a rejection mechanism as needed)
  const handleReject = (freelancerWallet) => {
    // For now, we'll just log the rejection
    console.log("Rejected freelancer:", freelancerWallet);
    alert("Freelancer rejected (this is a placeholder action).");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-700">Loading freelancer requests...</p>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen py-10">
      <div className="max-w-5xl mx-auto p-6 bg-black">
        {/* Header */}
        <div className="bg-violet-700 text-white py-4 px-6 rounded-lg mb-6">
          <h1 className="text-2xl font-bold text-center">
            Freelancers requested for Project {JobId}
          </h1>
        </div>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search freelancers..."
          className="w-full px-4 py-2 text-white border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-violet-500 bg-gray-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Freelancer List */}
        <div className="space-y-4 overflow-y-auto">
          {filteredFreelancers.length > 0 ? (
            filteredFreelancers.map((freelancer) => (
              <div
                key={freelancer.walletId}
                className="bg-white shadow-md rounded-lg p-5 border border-gray-200 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{freelancer.name}</h3>
                    <p className="text-sm text-gray-600">⭐ {freelancer.rating} / 5</p>
                    <p className="text-sm text-gray-600">
                      Skills: {freelancer.skills.join(", ")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-green-600 px-4 py-2 hover:bg-green-700 text-white rounded-lg"
                      onClick={() => handleApprove(freelancer.walletId)}
                    >
                      Approve
                    </button>
                    <button
                      className="bg-red-600 px-4 py-2 hover:bg-red-700 text-white rounded-lg"
                      onClick={() => handleReject(freelancer.walletId)}
                    >
                      Reject
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/project/profile/${freelancer.walletId}`);
                      }}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">
              No freelancers have requested this project yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerRequests;
