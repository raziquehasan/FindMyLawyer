import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LawyerUpload() {
  const [uploaded, setUploaded] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F5F7FB] flex justify-center items-center">
      <div className="bg-white p-10 rounded-xl shadow w-[450px] text-center">
        <h2 className="text-2xl font-bold text-[#1E2A8A] mb-2">
          Upload Lawyer Certificate
        </h2>

        <p className="text-gray-600 mb-5">
          Upload your Bar Council certificate (PDF / JPG / PNG).
        </p>

        {uploaded && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            Documents uploaded successfully. Pending admin verification.
          </div>
        )}

        <input type="file" className="mb-4" />

        <button
          onClick={() => {
            setUploaded(true);
            setTimeout(() => navigate("/lawyer/dashboard"), 1200);
          }}
          className="w-full bg-[#C47A3D] text-white py-3 rounded"
        >
          Upload Certificate
        </button>
      </div>
    </div>
  );
}
