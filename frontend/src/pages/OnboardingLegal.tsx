import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const OnboardingLegal = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const handleNext = async () => {
    if (!accepted) return;

    try {
      await api.post("/lawyer/terms");
      navigate("/onboarding/availability");
    } catch (error) {
      console.error(error);
      alert("Failed to save legal acceptance");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Complete Your Lawyer Profile
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Help clients find and trust you
        </p>

        {/* Progress Bar */}
        <div className="mt-4 h-2 bg-gray-200 rounded">
          <div className="h-2 bg-indigo-600 rounded w-[75%]" />
        </div>
      </div>

      {/* TERMS CARD */}
      <div className="bg-white rounded-xl p-8 border">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Platform Terms & Fees
        </h2>

        <p className="text-sm text-gray-700 mb-4">
          Platform Fee:{" "}
          <span className="font-semibold">20%</span> per completed consultation
        </p>

        <p className="text-sm text-gray-600 mb-6">
          This fee covers payment processing, lead generation,
          platform maintenance, and customer support.
        </p>

        <label className="flex items-center gap-3 text-sm text-gray-800">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="w-4 h-4"
          />
          I accept the platform terms and fee structure
        </label>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate("/onboarding/photo")}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700"
        >
          Back
        </button>

        <button
          disabled={!accepted}
          onClick={handleNext}
          className={`px-6 py-2 rounded-lg text-white ${
            accepted
              ? "bg-indigo-600"
              : "bg-indigo-300 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OnboardingLegal;
