import React, { useState, useEffect } from "react";
import { Briefcase, CheckCircle, Clock, User, Bell, PlusCircle, DollarSign } from "lucide-react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import contractArtifact from '../../../artifacts/contracts/DecentralizedFreelanceMarket.sol/DecentralizedFreelanceMarket.json';

const contractAddress = "0xa261f0f9740e7eb019d6e0311f0327fe205290f1";

function ClientDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [activeProjects, setActiveProjects] = useState([]);
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [completedProjects, setCompletedProjects] = useState([]);
  const [submittedProjects, setSubmittedProjects] = useState([]);
  const [jobRequests, setJobRequests] = useState([]);
  const [createdJobs, setCreatedJobs] = useState([]);
  const [contractInstance, setContractInstance] = useState(null);
  const [account, setAccount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const navigate = useNavigate();

  // On component mount, connect to blockchain and fetch projects/profile
  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        try {
          // Connect to provider
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          setAccount(userAddress);
          
          // Create contract instance
          const instance = new ethers.Contract(
            contractAddress,
            contractArtifact.abi,
            signer
          );
          setContractInstance(instance);
          
          // Now fetch data after contract is initialized
          await fetchProfile(instance, userAddress);
          await fetchProjects(instance);
          await fetchCreatedJobs(instance);
          
        } catch (error) {
          console.error("Error connecting to blockchain:", error);
          alert("Error connecting to blockchain. Check console for details.");
        }
      } else {
        console.error("No web3 provider found. Please install MetaMask.");
        alert("Please install MetaMask to use this application.");
      }
    }
    init();
  }, []);

  // Fetch profile
  async function fetchProfile(instance, address) {
    try {
      // Note: Using the account address instead of assuming msg.sender
      const profile = await instance.getProfile(address);
      setUserName(profile[0]); // First item in returned tuple is name
    } catch (err) {
      console.error("Error fetching profile: ", err);
      setUserName("Unknown User");
    }
  }

  // Fetch projects by status from the contract
  async function fetchProjects(instance) {
    try {
      // Convert numeric enum to actual enum values for clarity
      const STATUS = {
        ACTIVE: 0,
        ONGOING: 1,
        COMPLETED: 2,
        ON_DISPUTE: 3,
        REJECTED: 4,
        DONE_BY_FREELANCER: 5
      };

      // Fetch projects by status
      const active = await instance.getClientProjectsByStatus(STATUS.ACTIVE);
      setActiveProjects(active);
      
      const ongoing = await instance.getClientProjectsByStatus(STATUS.ONGOING);
      setOngoingProjects(ongoing);
      
      const completed = await instance.getClientProjectsByStatus(STATUS.COMPLETED);
      setCompletedProjects(completed);
      
      const submitted = await instance.getClientProjectsByStatus(STATUS.DONE_BY_FREELANCER);
      setSubmittedProjects(submitted);
      
      // After getting active projects, fetch job requests for them
      await fetchJobRequests(instance, active);
      
    } catch (err) {
      console.error("Error fetching projects: ", err);
      alert("Error fetching projects. Please check console for details.");
    }
  }

  // For each active project, fetch job requests (freelancer applicants) from the contract
  async function fetchJobRequests(instance, activeProjectsArray) {
    try {
      const requests = [];
      
      for (const project of activeProjectsArray) {
        // Using the properly defined method from contract
        const applicantAddresses = await instance.getFreelancerApplied(project.id);
        
        if (applicantAddresses && applicantAddresses.length > 0) {
          // Get profiles for each applicant
          const applicants = await Promise.all(
            applicantAddresses.map(async (addr) => {
              try {
                const userProfile = await instance.getProfile(addr);
                return { 
                  address: addr, 
                  name: userProfile[0] || addr.slice(0, 6) + '...' + addr.slice(-4)
                };
              } catch (error) {
                console.error(`Error fetching profile for ${addr}:`, error);
                return { address: addr, name: addr.slice(0, 6) + '...' + addr.slice(-4) };
              }
            })
          );
          
          requests.push({ 
            projectId: project.id, 
            title: project.title, 
            applicants 
          });
        }
      }
      
      setJobRequests(requests);
    } catch (err) {
      console.error("Error fetching job requests: ", err);
    }
  }

  // Fetch created jobs (active projects with freelancer applications)
  const fetchCreatedJobs = async (instance) => {
    try {
      const STATUS = { ACTIVE: 0 };
      const jobs = await instance.getClientProjectsByStatus(STATUS.ACTIVE);
      const jobsWithApplications = [];

      for (let job of jobs) {
        try {
          const applicants = await instance.getFreelancerApplied(job.id);
          
          // Create a more structured job object with parsed values
          const processedJob = {
            id: job.id.toString(),
            title: job.title,
            description: job.description,
            budget: ethers.formatEther(job.budget) + " ETH",
            status: job.status,
            applicantCount: applicants.length,
            applicants: applicants
          };
          
          jobsWithApplications.push(processedJob);
        } catch (error) {
          console.error(`Error processing job ${job.id}:`, error);
        }
      }
      
      setCreatedJobs(jobsWithApplications);
    } catch (error) {
      console.error("Error fetching created jobs:", error);
    }
  };

  // Handle submitted project actions (approve or reject)
  const handleSubmittedProjectAction = async (projectId, ONGOING) => {
    try {
      setIsProcessing(true);
      
      if (ONGOING) {
        // Show transferring funds status
        setProcessingStatus("Transferring funds to freelancer...");
        
        // First we need to send ETH to the contract for escrow
        const project = submittedProjects.find(p => p.id.toString() === projectId.toString());
        
        if (!project) {
          throw new Error("Project not found");
        }
        
        // First transfer funds to escrow
        const tx1 = await contractInstance.transferToEscrow(projectId, {
          value: project.budget
        });
        
        setProcessingStatus("Funds sent to escrow. Finalizing approval...");
        await tx1.wait();
        
        // Then approve the project (assuming a rating of 5)
        const tx2 = await contractInstance.projectApprove(projectId, 5);
        setProcessingStatus("Approving project and releasing payment...");
        await tx2.wait();
        
        setProcessingStatus("Project approved successfully! Funds transferred to freelancer.");
        setTimeout(() => {
          setProcessingStatus("");
          alert("Project approved successfully! Funds transferred to freelancer.");
        }, 2000);
      } else {
        // For rejection, we would need to add this feature to the smart contract
        setProcessingStatus("Rejecting project...");
        
        // Since the contract doesn't have a specific reject function, we could:
        // 1. Raise a dispute, or
        // 2. Add a rejectProject function to the contract
        
        alert("Project rejection functionality is not yet implemented in the contract.");
        setProcessingStatus("");
      }
      
      // Refresh the projects after action
      await fetchProjects(contractInstance);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error handling project action:", error);
      setProcessingStatus("Error processing your request. See console for details.");
      setTimeout(() => {
        setProcessingStatus("");
        alert("Error processing your request. See console for details.");
      }, 2000);
      setIsProcessing(false);
    }
  };

  // Handle active project applicant selection
  const handleAcceptApplicant = async (projectId, freelancerAddress) => {
    try {
      setIsProcessing(true);
      setProcessingStatus("Accepting freelancer for the project...");
      
      const tx = await contractInstance.acceptProjectRequest(projectId, freelancerAddress);
      await tx.wait();
      
      setProcessingStatus("Freelancer accepted successfully!");
      setTimeout(() => {
        setProcessingStatus("");
        alert("Freelancer accepted successfully!");
      }, 2000);
      
      // Refresh the projects after action
      await fetchProjects(contractInstance);
      await fetchCreatedJobs(contractInstance);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error accepting freelancer:", error);
      setProcessingStatus("Error accepting freelancer. See console for details.");
      setTimeout(() => {
        setProcessingStatus("");
        alert("Error accepting freelancer. See console for details.");
      }, 2000);
      setIsProcessing(false);
    }
  };

  // Handler for logout action
  const handleLogout = () => {
    navigate("/");
  };

  // Navigate to project description page for ongoing projects
  const handleOngoingProjectClick = (projectId) => {
    navigate(`/projectdesc/${projectId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-violet-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">ClientHub</h1>
          <div className="flex items-center space-x-6">
            <button className="relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs flex items-center justify-center">
                {jobRequests.length}
              </span>
            </button>
            <div className="relative">
              <button
                className="flex items-center space-x-2 focus:outline-none"
                onClick={() => setIsOpen(!isOpen)}
              >
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-medium">{userName}</span>
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2 z-10">
                  <button
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/profile");
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-700 mx-auto mb-4"></div>
            <p className="text-lg font-semibold">{processingStatus}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Created Jobs (Active Projects) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <PlusCircle className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Created Jobs</h2>
              </div>
              {/* Create New Job Button */}
              <button
                onClick={() => navigate("/createjob")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Create New Job</span>
              </button>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {activeProjects.length > 0 ? (
                activeProjects.map((job, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <span>Budget: {ethers.formatEther(job.budget)} ETH</span>
                    </div>
                    <div className="mt-3 text-sm">
                      <p className="line-clamp-2">{job.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No active projects found.</p>
              )}
            </div>
          </div>

          {/* Job Requests (Active Projects with Freelancer Applications) */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Job Requests</h2>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {createdJobs.length > 0 ? (
                createdJobs.map((job) => (
                  <div
                    key={job.id}
                    className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">{job.title}</h3>
                    <div className="mt-2 text-sm text-gray-600">
                      <span>Budget: {job.budget}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      Applicants: {job.applicantCount}
                    </div>
                    
                    {/* Applicant section */}
                    {job.applicants && job.applicants.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <h4 className="font-medium text-sm mb-2">Freelancer Applications:</h4>
                        <div className="space-y-2">
                          {job.applicants.map((applicantAddress, idx) => {
                            // Find the applicant details if available
                            const applicant = jobRequests.find(req => req.projectId.toString() === job.id)?.applicants.find(
                              app => app.address === applicantAddress
                            );
                            
                            return (
                              <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                <span>
                                  {applicant ? applicant.name : applicantAddress.slice(0, 6) + '...' + applicantAddress.slice(-4)}
                                </span>
                                <button 
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                                  onClick={() => handleAcceptApplicant(job.id, applicantAddress)}
                                >
                                  Accept
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No job requests found.</p>
              )}
            </div>
          </div>

          {/* Ongoing Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Ongoing Projects</h2>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {ongoingProjects.length > 0 ? (
                ongoingProjects.map((project, index) => (
                  <div
                    key={index}
                    className="border border-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => handleOngoingProjectClick(project.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{project.title}</h3>
                      <span className="text-sm text-gray-500">
                        Freelancer: {project.freelancer.slice(0, 6)}...{project.freelancer.slice(-4)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Budget: {ethers.formatEther(project.budget)} ETH
                    </div>
                    <div className="mt-4">
                      {/* Progress bar (hardcoded for now) */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-violet-600 rounded-full h-2" style={{ width: "60%" }} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No ongoing projects found.</p>
              )}
            </div>
          </div>

          {/* Completed Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Completed Projects</h2>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {completedProjects.length > 0 ? (
                completedProjects.map((project, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-gray-900">{project.title}</h3>
                      <span className="text-sm text-gray-500">
                        Freelancer: {project.freelancer.slice(0, 6)}...{project.freelancer.slice(-4)}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Budget: {ethers.formatEther(project.budget)} ETH
                    </div>
                    <div className="mt-2 text-sm flex items-center text-green-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>Payment sent to freelancer</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No completed projects found.</p>
              )}
            </div>
          </div>

          {/* Submitted Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Submitted Projects</h2>
            </div>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {submittedProjects.length > 0 ? (
                submittedProjects.map((project, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Freelancer: {project.freelancer.slice(0, 6)}...{project.freelancer.slice(-4)}
                    </p>
                    <div className="mt-2 text-sm text-gray-600">
                      Budget: {ethers.formatEther(project.budget)} ETH
                    </div>
                    {project.demo && (
                      <div className="mt-2 text-sm text-blue-600">
                        <a href={`https://ipfs.io/ipfs/${project.demo}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          View Submission Demo
                        </a>
                      </div>
                    )}
                    <div className="mt-2 flex space-x-4">
                      <button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm"
                        onClick={() => handleSubmittedProjectAction(project.id, true)}
                      >
                        Approve & Pay
                      </button>
                      <button 
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm"
                        onClick={() => handleSubmittedProjectAction(project.id, false)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No submitted projects found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;