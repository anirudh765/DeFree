import React, { useState, useEffect } from "react";

const DisputeResolution = () => {
  const [dispute, setDispute] = useState(null);
  const [votes, setVotes] = useState({ client: 0, freelancer: 0 });

  useEffect(() => {
    const storedDispute = JSON.parse(localStorage.getItem("dispute"));
    setDispute(storedDispute);

    // Load votes from localStorage
    const storedVotes = JSON.parse(localStorage.getItem("votes")) || { client: 0, freelancer: 0 };
    setVotes(storedVotes);
  }, []);

  const handleVote = (side) => {
    const newVotes = { ...votes, [side]: votes[side] + 1 };
    setVotes(newVotes);
    localStorage.setItem("votes", JSON.stringify(newVotes));
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-lg w-full">
        <h2 className="text-2xl font-semibold text-red-600 text-center">Dispute Resolution</h2>

        {dispute ? (
          <>
            {/* Dispute Issue Section */}
            <div className="mt-4 p-4 border border-red-300 bg-red-50 rounded-lg">
              <h3 className="text-xl font-medium text-red-700">Dispute Issue</h3>
              <p className="text-gray-800 mt-2">{dispute.reason}</p>
            </div>

            {/* Demo File Section */}
            <div className="mt-4 p-4 border border-gray-300 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium text-gray-900">Demo File</h3>
              <p className="text-gray-700">File Name: {dispute.fileName}</p>
              <a
                href={dispute.fileUrl}
                download={dispute.fileName}
                className="block mt-2 text-blue-600 hover:underline"
              >
                Download File
              </a>
            </div>

            {/* Voting Section */}
            <div className="mt-6 p-4 border border-gray-300 bg-white rounded-lg">
              <h3 className="text-xl font-medium text-gray-900 text-center">Vote for Resolution</h3>
              <div className="flex justify-around mt-4">
                <button
                  onClick={() => handleVote("client")}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  Vote for Client
                </button>
                <button
                  onClick={() => handleVote("freelancer")}
                  className="bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-lg"
                >
                  Vote for Freelancer
                </button>
              </div>

              {/* Display Votes */}
              <div className="mt-4 text-center">
                <p className="text-gray-800 font-medium">Client Votes: {votes.client}</p>
                <p className="text-gray-800 font-medium">Freelancer Votes: {votes.freelancer}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No dispute found.</p>
        )}
      </div>
    </div>
  );
};

export default DisputeResolution;
