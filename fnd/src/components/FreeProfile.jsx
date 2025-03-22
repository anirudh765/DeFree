import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Award, 
  Briefcase, 
  Edit3, 
  Mail, 
  MapPin, 
  Star 
} from 'lucide-react';
import { ethers } from 'ethers';
import contractArtifact from '../../../artifacts/contracts/DecentralizedFreelanceMarket.sol/DecentralizedFreelanceMarket.json';

const contractAddress = "0x246f33CC52c4fcF82Ae43E2284E27414702A3A40";

function Profile() {
  const [account, setAccount] = useState("");
  const [profile, setProfile] = useState({
    name: "",
    description: "",
    email: "",
    skills: [],
    documents: [],
    credits: 0,
    reviews: [],
    userType: 1 // default to client (1), Freelancer: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load the profile from the blockchain
  useEffect(() => {
    async function loadProfile() {
      if (!window.ethereum) {
        setError("MetaMask not installed");
        setLoading(false);
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
        // getProfile returns: (name, description, email, skills, documents, credits, reviews, userType)
        const result = await contract.getProfile();
        setProfile({
          name: result[0],
          description: result[1],
          email: result[2],
          skills: result[3],
          documents: result[4],
          credits: result[5].toString(),
          reviews: result[6],
          userType: result[7]  // Freelancer: 0, Client: 1
        });
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Error loading profile from blockchain");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  // Calculate dynamic stats (for freelancers)
  const projectsCompleted = profile.reviews.length;
  const averageRating =
    profile.reviews.length > 0
      ? (
          profile.reviews.reduce((acc, r) => acc + Number(r), 0) /
          profile.reviews.length
        ).toFixed(1)
      : "N/A";
  const certifications = profile.documents.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header / Navbar */}
      <div className="bg-violet-700 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <button
            onClick={() => navigate("/profile/edit")}
            className="bg-violet-600 hover:bg-violet-800 px-4 py-2 rounded-md"
          >
            <Edit3 className="h-4 w-4 inline mr-1" />
            Edit Profile
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-violet-500 to-purple-600" />

          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            <div className="flex justify-between items-start">
              <div className="flex items-end -mt-12">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
                  alt={profile.name}
                  className="w-24 h-24 rounded-full border-4 border-white"
                />
                <div className="ml-4 mb-2">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {profile.description && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">About Me</h3>
                <p className="text-gray-700">{profile.description}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="mt-6 flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>{profile.email}</span>
              </div>
              {/* You can add location info here if available */}
            </div>

            {/* Stats (for freelancers only) */}
            {!profile.userType && (
              <div className="mt-6 grid grid-cols-3 gap-6 py-6 border-y border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Briefcase className="h-5 w-5 text-violet-600" />
                    <span className="text-2xl font-bold">{projectsCompleted}</span>
                  </div>
                  <p className="text-gray-600 mt-1">Projects Completed</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-5 w-5 text-violet-600" />
                    <span className="text-2xl font-bold">{averageRating}</span>
                  </div>
                  <p className="text-gray-600 mt-1">Average Rating</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <Award className="h-5 w-5 text-violet-600" />
                    <span className="text-2xl font-bold">{certifications}</span>
                  </div>
                  <p className="text-gray-600 mt-1">Certifications</p>
                </div>
              </div>
            )}

            {/* Role-based Content */}
            {!profile.userType ? (
              <>
                {/* Freelancer: Skills */}
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Skills</h2>
                  {profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, idx) => (
                        <span key={idx} className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No skills added.</p>
                  )}
                </div>

                {/* Freelancer: Documents */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Certificates / Documents</h2>
                  {profile.documents.length > 0 ? (
                    <div className="mt-8 grid grid-cols-1 gap-4">
                      {profile.documents.map((document, idx) => (
  <div key={idx} className="border p-4 rounded-lg">
    <iframe
      src={`https://ipfs.io/ipfs/${document.cid}`}
      title={`Document ${idx + 1}`}
      className="w-full h-64 border rounded-lg"
    />
    <div className="mt-2">
      <a
        href={`https://ipfs.io/ipfs/${document.cid}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-violet-600 hover:underline"
      >
        Open Document in a New Tab
      </a>
    </div>
  </div>
))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No documents uploaded.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-2">Client Information</h2>
                <p className="text-gray-700">
                  As a client, you can create projects and manage your engagements.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
