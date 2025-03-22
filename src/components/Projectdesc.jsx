import React from "react";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const ProjectDescription = ({ project, freelancer }) => {
  const navigate = useNavigate();

  // If no props are provided, you can fallback to sample data (optional)
  const defaultProject = {
    name: "Website Redesign",
    description: "Redesign and improve the UI/UX of an existing website.",
    time: "7 days",
    price: "$2,500",
  };

  const defaultFreelancer = {
    name: "John Doe",
    rating: 4.7,
    skills: ["React", "Tailwind", "UI/UX"],
    profileLink: "/freelancerProfile",
  };

  const proj = project || defaultProject;
  const free = freelancer || defaultFreelancer;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">
      {/* Header */}
      <nav className="bg-violet-700 text-white w-full py-4 px-6 shadow-md">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Project Details</h1>
        </div>
      </nav>

      {/* Project Details Card */}
      <div className="bg-white shadow-lg rounded-xl p-8 mt-8 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-violet-700 text-center">
          {proj.name}
        </h2>
        <p className="mt-4 text-gray-600">{proj.description}</p>
        <div className="mt-6 space-y-2">
          <p className="text-gray-700 font-medium">
            Time: <span className="text-gray-900">{proj.time}</span>
          </p>
          <p className="text-gray-700 font-medium">
            Price: <span className="text-gray-900">{proj.price}</span>
          </p>
        </div>
        {/* Approve & Reject Buttons */}
        <div className="mt-6 flex space-x-4">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">
            Approve
          </button>
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg">
            Reject
          </button>
        </div>
      </div>

      {/* Freelancer Profile */}
      <div className="bg-white shadow-lg rounded-xl p-6 mt-8 max-w-lg w-full flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{free.name}</h3>
          {/* Ratings */}
          <div className="flex items-center text-yellow-400 mt-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(free.rating) ? "fill-yellow-400" : "fill-gray-300"
                }`}
              />
            ))}
            <span className="text-gray-700 ml-2">{free.rating}</span>
          </div>
          {/* Skills */}
          <div className="mt-3 flex flex-wrap gap-2">
            {free.skills.map((skill) => (
              <span
                key={skill}
                className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        {/* Profile Button */}
        <button
          className="bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg"
          onClick={() => navigate(free.profileLink)}
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ProjectDescription;
