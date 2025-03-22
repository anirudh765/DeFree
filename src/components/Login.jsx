import React, { useState } from 'react';
import { UserCircle2, Building2, ArrowRight, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState(null);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row">
        {/* Left Side - Hero Section */}
        <div className="md:w-1/2 p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none text-white flex flex-col justify-center">
          <Link to="/" className="text-white hover:opacity-80 transition-opacity">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">DecentralFreelance</h2>
          </Link>
          <p className="text-lg mb-6 text-indigo-100">Connect, collaborate, and create in a decentralized ecosystem. Your skills, your rules, your success.</p>
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
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h3>
            <p className="text-gray-600 mt-2">
              {isLogin ? 'Sign in to continue your journey' : 'Join our decentralized platform'}
            </p>
          </div>

          {!userType && (
            <div className="space-y-4">
              <button
                onClick={() => setUserType('freelancer')}
                className="w-full p-4 border-2 border-indigo-500 rounded-xl flex items-center justify-between hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center">
                  <UserCircle2 className="w-6 h-6 text-indigo-500 mr-3" />
                  <span className="font-medium text-gray-700">Continue as Freelancer</span>
                </div>
                <ArrowRight className="w-5 h-5 text-indigo-500" />
              </button>

              <button
                onClick={() => setUserType('client')}
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

          {userType && (
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter your password"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setUserType(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>
            </form>
          )}

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