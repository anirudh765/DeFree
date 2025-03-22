import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Award, 
  Briefcase, 
  Edit3, 
  Mail, 
  MapPin, 
  Star 
} from 'lucide-react';

function Profile(props) {
  const skills = [
    "React", "TypeScript", "Node.js", "Tailwind CSS", 
    "UI/UX Design", "API Development", "MongoDB"
  ];

  const certificates = [
    {
      id: 1,
      name: "Advanced React Development",
      issuer: "Frontend Masters",
      date: "2024"
    },
    {
      id: 2,
      name: "UI/UX Design Specialization",
      issuer: "Google",
      date: "2023"
    },
    {
      id: 3,
      name: "Full Stack Development",
      issuer: "Udacity",
      date: "2023"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-violet-700 text-white px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/freelancedashboard" className="inline-flex items-center space-x-2 text-white hover:text-violet-200">
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

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
                  alt="Sarah Parker"
                  className="w-24 h-24 rounded-full border-4 border-white"
                />
                <div className="ml-4 mb-2">
                  <h1 className="text-2xl font-bold">Sarah Parker</h1>
                  <p className="text-gray-600">Senior Frontend Developer</p>
                </div>
              </div>
              <Link
                to="/profile/edit"
                className="mt-4 inline-flex items-center space-x-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
            </div>

            {/* Contact Info */}
            <div className="mt-6 flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <Mail className="h-4 w-4" />
                <span>sarah.parker@example.com</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-6 py-6 border-y border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Briefcase className="h-5 w-5 text-violet-600" />
                  <span className="text-2xl font-bold">45</span>
                </div>
                <p className="text-gray-600 mt-1">Projects Completed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Star className="h-5 w-5 text-violet-600" />
                  <span className="text-2xl font-bold">4.9</span>
                </div>
                <p className="text-gray-600 mt-1">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Award className="h-5 w-5 text-violet-600" />
                  <span className="text-2xl font-bold">12</span>
                </div>
                <p className="text-gray-600 mt-1">Certifications</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className="bg-violet-50 text-violet-600 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Certificates */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Certificates</h2>
              <div className="space-y-4">
                {certificates.map(cert => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">{cert.name}</h3>
                      <p className="text-gray-600 text-sm">{cert.issuer}</p>
                    </div>
                    <span className="text-gray-500 text-sm">{cert.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;