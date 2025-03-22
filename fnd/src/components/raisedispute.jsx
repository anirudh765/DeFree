import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const RaiseDispute = () => {
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!reason || !file) {
      alert("Please provide a reason and upload a file.");
      return;
    }

    // Create a dispute object
    const disputeData = {
      reason,
      fileName: file.name, // Only storing the file name, as localStorage can't store files
      fileUrl: URL.createObjectURL(file), // Creating a temporary URL for the file
    };

    // Save to localStorage
    localStorage.setItem("dispute", JSON.stringify(disputeData));

    // Redirect to dispute resolution page
    navigate("/dispute-resolution");
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-violet-700 text-center">Raise Dispute</h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-gray-700 font-medium">
            Reason for Dispute:
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full border-gray-300 rounded-lg p-2 text-gray-900"
              rows="4"
              required
            />
          </label>

          <label className="block text-gray-700 font-medium">
            Upload Demo File:
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 w-full border-gray-300 rounded-lg p-2 text-gray-900"
              required
            />
          </label>

          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg"
          >
            Submit Dispute
          </button>
        </form>
      </div>
    </div>
  );
};

export default RaiseDispute;
