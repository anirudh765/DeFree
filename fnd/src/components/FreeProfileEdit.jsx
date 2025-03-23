import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { ethers } from 'ethers';
import axios from 'axios';
import contractArtifact from '../../../artifacts/contracts/DecentralizedFreelanceMarket.sol/DecentralizedFreelanceMarket.json';

const contractAddress = "0xa261f0f9740e7eb019d6e0311f0327fe205290f1";

function EditProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    description: "",
    email: "",
    skills: [],
    documents: [],
    userType: 1 // default to client (1); Freelancer: 0
  });
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load profile from blockchain
  useEffect(() => {
    async function loadProfile() {
      if (!window.ethereum) {
        setError("MetaMask not installed");
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const userAddress = await signer.getAddress();
        const contract = new ethers.Contract(
          contractAddress,
          contractArtifact.abi || contractArtifact,
          signer
        );
        // getProfile returns: (name, description, email, skills, documents, credits, reviews, userType)
        const result = await contract.getProfile(userAddress);
        setProfile({
          name: result[0],
          description: result[1],
          email: result[2],
          skills: [...result[3]],
          documents: [...result[4]],
          userType: Number(result[7]) // Freelancer: 0, Client: 1
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Error loading profile from blockchain");
      }
    }
    loadProfile(userAddress);
  }, []);

  // Add a new skill (only for freelancers)
  const handleAddSkill = (e) => {
    e.preventDefault();
    const skill = newSkill.trim();
    if (skill && !profile.skills.includes(skill)) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setNewSkill("");
    }
  };

  // Remove an existing skill (only for freelancers)
  const handleRemoveSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove)
    }));
  };

  // File upload to Pinata (only for freelancers)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("file", file);

    const metadata = JSON.stringify({ name: file.name });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({ cidVersion: 1 });
    formData.append("pinataOptions", options);

    try {
      const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          headers: {
            pinata_api_key: "631aba7bba8a85658b57",
            pinata_secret_api_key: "ed236116b957abe0293ab4e1101662b755cb01051d78719021b7c9c3114cc693",
          },
        }
      );
      const cid = response.data.IpfsHash;
      console.log("File CID:", cid);
      setProfile((prev) => ({
        ...prev,
        documents: [...prev.documents, cid]
      }));
    } catch (err) {
      console.error("Error uploading file to Pinata:", err);
      setError("Error uploading file to Pinata");
    }
  };

  // Submit the updated profile to the blockchain
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi || contractArtifact,
        signer
      );
      
      // For clients, we pass empty arrays for skills and documents
      const skillsToSubmit = profile.userType === 0 ? [...profile.skills] : [];
      const documentsToSubmit = profile.userType === 0 ? [...profile.documents] : [];
      
      // updateProfile parameters: name, description, email, skills, documents
      const tx = await contract.updateProfile(
        profile.name,
        profile.description,
        profile.email,
        skillsToSubmit,
        documentsToSubmit
      );
      await tx.wait();
      navigate("/profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Error updating profile: " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <div className="bg-violet-700 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/profile" className="inline-flex items-center space-x-2 text-white hover:text-violet-200">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Profile</span>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                  alt="Current profile"
                  className="w-20 h-20 rounded-full"
                />
                <button
                  type="button"
                  className="bg-violet-50 text-violet-600 px-4 py-2 rounded-lg hover:bg-violet-100"
                >
                  Change Photo
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Role-based fields for Freelancer only */}
            {profile.userType === 0 && (
              <>
                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 hover:text-violet-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Certificates / Documents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificates / Documents (Uploaded to Pinata)
                  </label>
                  {profile.documents && profile.documents.length > 0 ? (
                    <div className="space-y-4 mb-4">
                      {profile.documents.map((cid, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <input
                              type="text"
                              value={cid}
                              readOnly
                              className="font-medium text-gray-900 border-none p-0 focus:ring-0 w-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No certificates/documents added.</p>
                  )}
                  <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="border border-gray-300 rounded-lg p-2"
                    />
                    <p className="text-sm text-gray-500">
                      Select a file to upload to Pinata. The returned CID will be stored on-chain.
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Save Changes */}
            <div className="flex justify-end space-x-4">
              <Link
                to="/profile"
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
