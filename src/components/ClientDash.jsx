import React, { useState } from "react";
import { Briefcase, CheckCircle, Clock, User, Bell, PlusCircle } from "lucide-react";
import Profile from './FreeProfile'
function ClientDashboard() {
  const [isOpen, setIsOpen] = useState(false);

  const createdJobs = [
    { id: 1, title: "Landing Page", skills: ["HTML", "CSS", "JS"], price: "$500", time: "5 days" },
    { id: 2, title: "Mobile App Design", skills: ["Figma", "UI/UX"], price: "$1,200", time: "10 days" },
  ];

  const jobRequests = [
    { id: 1, freelancer: "John Doe", skills: ["React", "Node.js"], rating: 4.8 },
    { id: 2, freelancer: "Emma Brown", skills: ["Python", "Django"], rating: 4.5 },
  ];

  const ongoingProjects = [
    { id: 1, title: "E-commerce Store", freelancer: "David Smith", progress: 60, dueDate: "Apr 5" },
  ];

  const completedProjects = [
    { id: 1, title: "Portfolio Website", freelancer: "Alice Johnson", date: "Mar 20", rating: 5 },
  ];

  const submittedProjects = [
    { id: 1, title: "Website Redesign", freelancer: "John Doe" },
    { id: 2, title: "Mobile App Design", freelancer: "Emma Brown" },
  ];


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
                3
              </span>
            </button>

            <div className="relative">
              <button className="flex items-center space-x-2 focus:outline-none" onClick={() => setIsOpen(!isOpen)}>
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Profile" className="w-8 h-8 rounded-full" />
                <span className="font-medium">Sarah Parker</span>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2">
                  {/* <a href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    View Profile
                  </a> */}
                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => console.log("Logout clicked")}>
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
          
          {/* Created Jobs */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <PlusCircle className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Created Jobs</h2>
              </div>
            </div>

            <div className="space-y-4">
              {createdJobs.map((job) => (
                <div key={job.id} className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors">
                  <h3 className="font-medium text-gray-900">{job.title}</h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <span>{job.price}</span> • <span>{job.time}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map((skill) => (
                      <span key={skill} className="bg-violet-50 text-blue-600 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Job Requests */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Job Requests</h2>
            </div>

            <div className="space-y-4">
              {jobRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => navigate(`/project/${request.id}`)} // Navigate to project description
                >
                  <h3 className="font-medium text-gray-900">{request.freelancer}</h3>
                  <p className="text-sm text-gray-600">Skills: {request.skills.join(", ")}</p>
                  <p className="text-sm text-gray-600">Rating: ⭐ {request.rating}</p>

                  {/* Profile Button */}
                  <button
                    className="mt-3 bg-violet-600 hover:bg-violet-700 text-white px-3 py-1 rounded-lg text-sm"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent navigating to project when clicking profile
                      navigate(`/profile/${request.profileId}`);
                    }}
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Ongoing Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Clock className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Ongoing Projects</h2>
            </div>

            <div className="space-y-4">
              {ongoingProjects.map((project) => (
                <div key={project.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <span className="text-sm text-gray-500">Freelancer: {project.freelancer}</span>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-violet-600 rounded-full h-2" 
                      // style={{ width: ${project.progress}% }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-6">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Completed Projects</h2>
            </div>

            <div className="space-y-4">
              {completedProjects.map((project) => (
                <div key={project.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    <span className="text-sm text-gray-500">Freelancer: {project.freelancer}</span>
                  </div>
                  <div className="mt-2">Rating: ⭐ {project.rating}</div>
                </div>
              ))}
            </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-semibold mb-4">Submitted Projects</h2>
      <div className="space-y-4">
        {submittedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
          >
            <h3 className="font-medium text-gray-900">{project.title}</h3>
            <p className="text-sm text-gray-600">Freelancer: {project.freelancer}</p>
            <div className="mt-2 flex space-x-4">
              <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm">
                Buy
              </button>
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
          
          
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;