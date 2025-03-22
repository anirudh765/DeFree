import {React, useState} from 'react';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  User,
  Bell,
  Search
} from 'lucide-react';
import {Link , useNavigate} from "react-router-dom";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  const availableJobs = [
    { id: 1, title: "Website Redesign", budget: "$2,500", deadline: "7 days", skills: ["React", "Tailwind"] },
    { id: 2, title: "E-commerce Platform", budget: "$4,000", deadline: "14 days", skills: ["React", "Node.js"] },
    { id: 3, title: "Mobile App UI", budget: "$3,000", deadline: "10 days", skills: ["React Native", "UI/UX"] },
  ];

  const ongoingProjects = [
    { id: 1, title: "Dashboard Development", progress: 75, dueDate: "Mar 25" },
    { id: 2, title: "API Integration", progress: 40, dueDate: "Mar 30" },
  ];

  const completedProjects = [
    { id: 1, title: "Portfolio Website", date: "Mar 1", rating: 5 },
    { id: 2, title: "Blog Platform", date: "Feb 25", rating: 4.5 },
  ];

  const submittedProjects = [
    { id: 1, title: "Website Redesign", status: "Submitted", client: "Virat Kohli" },
    { id: 2, title: "E-commerce Platform", status: "Rejected", client: "Ajinkya Rahane" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-violet-700 text-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">FreelanceHub</h1>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
                {/* <input
                  type="text"
                  placeholder="Search..."
                  className="bg-violet-600 text-white placeholder-violet-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-400"
                /> */}
              {/* <Search className="absolute right-3 top-2.5 h-5 w-5 text-violet-300" /> */}
            </div>
            
            <button className="relative">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs flex items-center justify-center">3</span>
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
        <span className="font-medium">Sarah Parker</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2">
          <a
            href="/profile"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            View Profile
          </a>
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
                    <span>{job.budget}</span>
                    <span>{job.deadline}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skills.map(skill => (
                      <span key={skill} className="bg-violet-50 text-violet-600 px-2 py-1 rounded text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
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
                </div>
              ))}
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
                        className={`w-4 h-4 ${
                          i < project.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Submitted */}

          <div className="max-w-7xl mx-auto px-6 py-8">
      <h2 className="text-2xl font-semibold mb-4">Submitted Projects</h2>
      <div className="space-y-4">
        {submittedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">{project.title}</h3>
              <span
                className={`text-sm font-medium ${
                  project.status === "Submitted"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {project.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">Client: {project.client}</p>
            {project.status === "Rejected" && (
              <button className="mt-2 bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded-lg text-sm">
                Raise Dispute
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
        </div>
      </div>
    </div>
  );
}

export default App;