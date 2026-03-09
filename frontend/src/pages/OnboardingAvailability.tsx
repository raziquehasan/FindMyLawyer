import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const OnboardingAvailability = () => {
  const navigate = useNavigate();
  const [available, setAvailable] = useState(true);

  const handleSubmit = async () => {
    try {
      await api.post("/lawyer/complete", {
        available,
      });

      navigate("/lawyer/dashboard");
    } catch (error) {
      console.error(error);
      alert("Failed to complete onboarding");
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

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-200 rounded">
          <div className="h-2 bg-indigo-600 rounded w-full" />
        </div>
      </div>

      {/* AVAILABILITY CARD */}
      <div className="bg-white border rounded-xl p-6 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">
            Available for Consultations
          </p>
          <p className="text-sm text-gray-600">
            Turn this on when you're ready to receive leads
          </p>
        </div>

        <button
          onClick={() => setAvailable(!available)}
          className={`w-14 h-7 flex items-center rounded-full p-1 transition ${
            available ? "bg-indigo-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`bg-white w-5 h-5 rounded-full shadow transform transition ${
              available ? "translate-x-7" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* INFO BOX */}
      <div className="bg-indigo-50 border rounded-xl p-6 flex gap-3">
        <div className="text-indigo-600 text-xl">✔</div>
        <div>
          <p className="font-medium text-gray-900">
            Ready to Submit!
          </p>
          <p className="text-sm text-gray-600">
            Your profile will be reviewed by our admin team.
            You will be notified once it is approved.
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex justify-between">
        <button
          onClick={() => navigate("/onboarding/legal")}
          className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          className="px-6 py-2 rounded-lg bg-indigo-600 text-white"
        >
          Complete Onboarding
        </button>
      </div>
    </div>
  );
};

export default OnboardingAvailability;
