import React, { useState } from 'react';
import { UserCircle2, Building2, ArrowRight, Github, Twitter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import contractArtifact from '../../../artifacts/contracts/DecentralizedFreelanceMarket.sol/DecentralizedFreelanceMarket.json';

const contractAddress = "0xa261f0f9740e7eb019d6e0311f0327fe205290f1";

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setUserType(role);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed! Please install MetaMask and try again.");
        setLoading(false);
        return;
      }
      
      // Create a provider and signer (assuming ethers v6, use BrowserProvider; if using v5, change accordingly)
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // Create contract instance using the ABI from your artifact
      const contract = new ethers.Contract(
        contractAddress,
        contractArtifact.abi || contractArtifact,
        signer
      );

      // Determine user type: Freelancer = 0, Client = 1
      const userTypeVal = userType === "freelancer" ? 0 : 1;
      
      // Call registerUser on the contract. Adjust parameters as required by your contract.
      const tx = await contract.registerUser(userTypeVal, name, email);
      await tx.wait(); // Wait for the transaction to be mined

      // Navigate to different dashboards based on user type
      if(userType === "freelancer") {
        navigate("/freelancedashboard");
      } else {
        navigate("/clientdashboard");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Error registering user. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row">
        {/* Left Side - Hero Section */}
        <div className="md:w-1/2 p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none text-white flex flex-col justify-center">
          <Link to="/" className="text-white hover:opacity-80 transition-opacity">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">DecentralFreelance</h2>
          </Link>
          <p className="text-lg mb-6 text-indigo-100">
            Connect, collaborate, and create in a decentralized ecosystem. Your skills, your rules, your success.
          </p>
          <div className="space-y-4">
            <img 
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&q=80&w=500" 
              alt="Collaboration" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="md:w-1/2 p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Welcome' : 'Create Account'}
            </h3>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Sign in to continue your journey' : 'Join our decentralized platform'}
            </p>
          </div>

          {/* Role selection */}
          {!userType && (
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelect('freelancer')}
                className="w-full p-4 border-2 border-indigo-500 rounded-xl flex items-center justify-between hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center">
                  <UserCircle2 className="w-6 h-6 text-indigo-500 mr-3" />
                  <span className="font-medium text-gray-700">Continue as Freelancer</span>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-500" />
              </button>

              <button
                onClick={() => handleRoleSelect('client')}
                className="w-full p-4 border-2 border-purple-500 rounded-xl flex items-center justify-between hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center">
                  <Building2 className="w-6 h-6 text-purple-500 mr-3" />
                  <span className="font-medium text-gray-700">Continue as Client</span>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-500" />
              </button>
            </div>
          )}

          {/* Registration Form */}
          {userType && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your name"
                />
              </div>
            
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your email"
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                {loading ? "Registering..." : "Register"}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    // Reset the state to go back to role selection
                    setUserType(null);
                    setError("");
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Go Back
                </button>
              </div>
            </form>
          )}

          {/* Social Links */}
          <div className="mt-8 flex items-center justify-center space-x-4">
            <a href="#" className="text-gray-600 hover:text-gray-800">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-600 hover:text-gray-800">
              <Twitter className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
