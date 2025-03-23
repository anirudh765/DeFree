import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Bell,
  Search
} from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { ethers } from 'ethers';
import contractArtifact from '../../../artifacts/contracts/DecentralizedFreelanceMarket.sol/DecentralizedFreelanceMarket.json';

const contractAddress = "0xa261f0f9740e7eb019d6e0311f0327fe205290f1";

function App() {
  const [account, setAccount] = useState("");
  const [profileName, setProfileName] = useState("");
  const [availableJobs, setAvailableJobs] = useState([]);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [submittedProjects, setSubmittedProjects] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [submissionCid, setSubmissionCid] = useState("");
  const [submittingProjectId, setSubmittingProjectId] = useState(null);
  const navigate = useNavigate();

  // Function to connect wallet manually if not already connected
  async function connectWallet() {
    if (!window.ethereum) {
      alert("MetaMask is not installed! Please install MetaMask and try again.");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);
      // Attempt to load the user's profile from the contract
      const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi || contractArtifact,
        signer
      );
      try {
        // getProfile returns a tuple; the first element is the name
        const profile = await contract.getProfile();
        setProfileName(profile[0]); // Assuming profile[0] is the user's name
      } catch (err) {
        console.error("Error fetching profile (user might not be registered):", err);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
    }
  }

  async function fetchProfileName(signer) {
    const contract = new ethers.Contract(
      contractAddress,
      contractArtifact.abi || contractArtifact,
      signer
    );
    try {
      // getProfile() returns a tuple; assuming the first element is the user's name.
      const profile = await contract.getProfile();
      setProfileName(profile[0]);
    } catch (err) {
      console.error("Error fetching profile name:", err);
    }
  }
  // Helper to shorten the wallet address for fallback display
  const shortenAddress = (addr) =>
    addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : "";

  // Submit project function
  async function submitProject(projectId, cid) {
    if (!cid.trim()) {
      alert("Please enter a valid submission CID (IPFS hash)");
      return;
    }
    
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi || contractArtifact,
        signer
      );
      
      await contract.projectDone(projectId, cid);
      
      // Update the project lists after submission
      const updatedOngoing = ongoingProjects.filter(proj => proj.id !== projectId);
      setOngoingProjects(updatedOngoing);
      
      // Add to submitted projects
      const newSubmittedProject = {
        id: projectId,
        title: ongoingProjects.find(p => p.id === projectId)?.title || "Project",
        status: "Submitted",
        client: "Awaiting review" // This would ideally be populated with actual client info
      };
      
      setSubmittedProjects([...submittedProjects, newSubmittedProject]);
      setSubmittingProjectId(null);
      setSubmissionCid("");
      
      alert("Project successfully submitted for client review!");
      
      // Reload blockchain data to get fresh project statuses
      loadBlockchainData();
      
    } catch (err) {
      console.error("Error submitting project:", err);
      alert(`Error submitting project: ${err.message || err}`);
    }
  }

  // Helper: load blockchain data (jobs, projects, etc.)
  async function loadBlockchainData() {
    if (!window.ethereum) {
      console.error("MetaMask not installed");
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);
      
      const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi || contractArtifact,
        signer
      );
      
      // ----- Load Available Jobs -----
      const projectCountBN = await contract.projectCounter();
      const projectCount = projectCountBN;
      const available = [];
      for (let i = 1; i <= projectCount; i++) {
        const proj = await contract.projects(i);
        // Check if status is Active (0n) and project not created by current user
        if (proj[5] === 0n && proj[1].toLowerCase() !== userAddress.toLowerCase()) {
          available.push({
            id: Number(proj[0]),
            title: proj[2],
            budget: ethers.formatEther
              ? ethers.formatEther(proj[4])
              : ethers.utils.formatEther(proj[4]),
            deadline: "N/A", // Not stored on-chain
            skills: []       // Not stored on-chain
          });
        }
      }
      setAvailableJobs(available);

      // ----- Load Ongoing Projects -----
      const ongoingData = await contract.getFreelancerProjectsByStatus(1);
      const ongoingParsed = ongoingData.map(proj => ({
        id: Number(proj.id),
        title: proj.title,
        progress: 50,      // Dummy progress value
        dueDate: "N/A",     // Not stored on-chain
        budget: ethers.formatEther
          ? ethers.formatEther(proj[4])
          : ethers.utils.formatEther(proj[4])
      }));
      setOngoingProjects(ongoingParsed);

      // ----- Load Completed Projects -----
      const completedData = await contract.getFreelancerProjectsByStatus(2);
      const completedParsed = completedData.map(proj => ({
        id: Number(proj.id),
        title: proj.title,
        date: "N/A",       // No date info on-chain
        rating: 0          // Rating not aggregated here
      }));
      setCompletedProjects(completedParsed);

      // ----- Load Submitted Projects -----
      const rejectedData = await contract.getFreelancerProjectsByStatus(4);
      const doneData = await contract.getFreelancerProjectsByStatus(5);
      const submittedParsed = [
        ...rejectedData.map(proj => ({
          id: Number(proj.id),
          title: proj.title,
          status: "Rejected",
          client: proj.client
        })),
        ...doneData.map(proj => ({
          id: Number(proj.id),
          title: proj.title,
          status: "Submitted",
          client: proj.client
        }))
      ];
      setSubmittedProjects(submittedParsed);

    } catch (err) {
      console.error("Error loading blockchain data:", err);
    }
  }

  useEffect(() => {
    loadBlockchainData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-violet-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/">
            <h1 className="text-2xl font-bold">FreelanceHub</h1>
          </Link>
          
          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <input
                type="text"
                placeholder="Search..."
                className="bg-violet-600 text-white placeholder-violet-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-violet-300" />
            </div>
            
            <button className="relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs flex items-center justify-center">
                3
              </span>
            </button>
            
            <div className="relative">
              {account ? (
                <button
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="font-medium">
                    {profileName ? profileName : shortenAddress(account)}
                  </span>
                </button>
              ) : (
                <button
                  onClick={connectWallet}
                  className="bg-violet-600 hover:bg-violet-800 px-4 py-2 rounded-md font-medium"
                >
                  Connect Wallet
                </button>
              )}

              {isOpen && account && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    View Profile
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => console.log("Logout clicked")}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-violet-600" />
                <h2 className="text-xl font-semibold">Available Jobs</h2>
              </div>
              <span className="bg-violet-100 text-violet-600 px-3 py-1 rounded-full text-sm">
                {availableJobs.length} new
              </span>
            </div>
            
            <div className="space-y-4">
              {availableJobs.map(job => (
                <div key={job.id} className="border border-gray-100 rounded-lg p-4 hover:border-violet-200 transition-colors">
                  <h3 className="font-medium text-gray-900">{job.title}</h3>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                    <span>{job.budget} ETH</span>
                    <span>{job.deadline}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map(skill => (
                      <span key={skill} className="bg-violet-50 text-violet-600 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button 
                      onClick={async () => {
                        try {
                          const provider = new ethers.BrowserProvider(window.ethereum);
                          const signer = await provider.getSigner();
                          const contract = new ethers.Contract(
                            contractAddress,
                            contractArtifact.abi || contractArtifact,
                            signer
                          );
                          
                          await contract.applyProject(job.id);
                          alert(`Successfully applied to project: ${job.title}`);
                        } catch (err) {
                          console.error("Error applying to project:", err);
                          alert(`Error applying to project: ${err.message || err}`);
                        }
                      }}
                      className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Apply
                    </button>
                    <button 
                      onClick={() => {
                        // Just skip this job (visual only - no blockchain interaction)
                        const updatedJobs = availableJobs.filter(j => j.id !== job.id);
                        setAvailableJobs(updatedJobs);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              ))}
              {availableJobs.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No available jobs at the moment.
                </div>
              )}
            </div>
          </div>

          {/* Ongoing Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="h-5 w-5 text-violet-600" />
              <h2 className="text-xl font-semibold">Ongoing Projects</h2>
            </div>
            
            <div className="space-y-4">
              {ongoingProjects.map(project => (
                <div key={project.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <span className="text-sm text-gray-500">Due {project.dueDate}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span>Budget: {project.budget} ETH</span>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-violet-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-violet-600 rounded-full h-2"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Submit button section - new addition */}
                  <div className="mt-4">
                    {submittingProjectId === project.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Enter submission CID (IPFS hash)"
                          value={submissionCid}
                          onChange={(e) => setSubmissionCid(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => submitProject(project.id, submissionCid)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex-1"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => {
                              setSubmittingProjectId(null);
                              setSubmissionCid("");
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSubmittingProjectId(project.id)}
                        className="w-full mt-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Submit Project
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {ongoingProjects.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No ongoing projects at the moment.
                </div>
              )}
            </div>
          </div>

          {/* Completed Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <CheckCircle className="h-5 w-5 text-violet-600" />
              <h2 className="text-xl font-semibold">Completed Projects</h2>
            </div>
            
            <div className="space-y-4">
              {completedProjects.map(project => (
                <div key={project.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <span className="text-sm text-gray-500">{project.date}</span>
                  </div>
                  <div className="mt-2 flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < project.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
              {completedProjects.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No completed projects yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submitted Projects */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Submitted Projects</h2>
          <div className="space-y-4">
            {submittedProjects.map(project => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900">{project.title}</h3>
                  <span className={`text-sm font-medium ${project.status === "Submitted" ? "text-green-600" : "text-red-600"}`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Client: {project.client}</p>
                {project.status === "Rejected" && (
                  <button 
                    className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-lg text-sm"
                    onClick={() => navigate("/raisedispute")}
                  >
                    Raise Dispute
                  </button>
                )}
              </div>
            ))}
            {submittedProjects.length === 0 && (
              <div className="text-center py-4 text-gray-500 bg-white rounded-xl shadow-sm p-4">
                No submitted projects yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;