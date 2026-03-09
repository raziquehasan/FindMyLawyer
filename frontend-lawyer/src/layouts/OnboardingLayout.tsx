import { Outlet } from "react-router-dom";

const OnboardingLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-3xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Complete Your Lawyer Profile
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Help clients find and trust you
          </p>
        </div>

        {/* Progress bar (Step 1 of 4 for now) */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: "25%" }}
          />
        </div>

        {/* Page content */}
        <div className="bg-white rounded-xl shadow p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default OnboardingLayout;
