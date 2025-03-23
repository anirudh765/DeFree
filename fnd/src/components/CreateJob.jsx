import React, { useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import contractArtifact from '../../../artifacts/contracts/DecentralizedFreelanceMarket.sol/DecentralizedFreelanceMarket.json';

const contractAddress = "0xa261f0f9740e7eb019d6e0311f0327fe205290f1";

const CreateJob = () => {
  const [projectName, setProjectName] = useState("");
  const [timeLimit, setTimeLimit] = useState("");
  const [pay, setPay] = useState("");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!window.ethereum) {
      setError("MetaMask not installed");
      setLoading(false);
      return;
    }

    try {
      // ethers v6 syntax for provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi,
        signer
      );

      // Combine description with extra details.
      const fullDescription = `${description}\nTime Limit: ${timeLimit} days\nPreferred Technologies: ${technologies}`;

      // Convert pay from ETH to wei (ethers v6 syntax)
      const budget = ethers.parseEther(pay);
      
      // Create project by calling the smart contract function
      // Based on your contract: function createProject(string memory title, string memory description, uint256 budget)
      const tx = await contract.createProject(
        projectName, 
        fullDescription, 
        budget
      );
      
      await tx.wait();
      
      // On success, navigate back to the dashboard or a confirmation page.
      navigate("/clientdashboard");
    } catch (err) {
      console.error("Error creating project:", err);
      setError("Error creating project: " + (err.message || err.toString()));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-violet-700 text-center">Create Project</h2>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-gray-700 font-medium">
            Project Name:
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-gray-900"
              required
            />
          </label>

          <label className="block text-gray-700 font-medium">
            Time Limit (in days):
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-gray-900"
              required
            />
          </label>

          <label className="block text-gray-700 font-medium">
            Pay for Project (in Ether):
            <input
              type="number"
              step="0.01"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-gray-900"
              required
            />
          </label>

          <label className="block text-gray-700 font-medium">
            Job Description:
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-gray-900"
              rows="4"
              required
            />
          </label>

          <label className="block text-gray-700 font-medium">
            Preferred Technologies:
            <input
              type="text"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-gray-900"
              placeholder="React, Node.js, Python, etc."
              required
            />
          </label>

          <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
            <p>Note: After creating the project, you will need to transfer funds to escrow separately when a freelancer is assigned.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg"
          >
            {loading ? "Submitting..." : "Submit Project"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateJob;