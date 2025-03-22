import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, X } from 'lucide-react';

function EditProfile() {
  const [skills, setSkills] = useState([
    "React", "TypeScript", "Node.js", "Tailwind CSS", 
    "UI/UX Design", "API Development", "MongoDB"
  ]);
  const [newSkill, setNewSkill] = useState("");

//   const handleAddSkill = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (newSkill.trim() && !skills.includes(newSkill.trim())) {
//       setSkills([...skills, newSkill.trim()]);
//       setNewSkill("");
//     }
//   };

//   const handleRemoveSkill = (skillToRemove: string) => {
//     setSkills(skills.filter(skill => skill !== skillToRemove));
//   };

  return (
    <div className="min-h-screen bg-gray-50">
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

          <form className="space-y-6">
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
                  defaultValue="Sarah Parker"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  defaultValue="Senior Frontend Developer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="sarah.parker@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  defaultValue="San Francisco, CA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                    //   onClick={() => handleRemoveSkill(skill)}
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
                //   onClick={handleAddSkill}
                  className="bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Certificates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificates
              </label>
              <div className="space-y-4 mb-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <input
                        type="text"
                        defaultValue="Advanced React Development"
                        className="font-medium text-gray-900 border-none p-0 focus:ring-0 w-full"
                      />
                      <input
                        type="text"
                        defaultValue="Frontend Masters"
                        className="text-gray-600 text-sm border-none p-0 focus:ring-0 w-full mt-1"
                      />
                    </div>
                    <input
                      type="text"
                      defaultValue="2024"
                      className="text-gray-500 text-sm border-none p-0 focus:ring-0 w-24 text-right"
                    />
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-violet-500 hover:text-violet-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Add New Certificate</span>
              </button>
            </div>

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
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;