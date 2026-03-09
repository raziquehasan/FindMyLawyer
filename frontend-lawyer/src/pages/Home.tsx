import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-5xl font-bold text-[#1E2A8A] mb-4">
        FindMyLawyer
      </h1>

      <p className="text-gray-600 mb-10 text-lg">
        Connect with usage verified legal experts or grow your practice.
      </p>

      <div className="flex gap-6">
        <button
          className="bg-[#1E2A8A] text-white px-10 py-3 rounded-lg shadow"
          onClick={() => navigate("/register/client")}
        >
          Register as Client
        </button>

        <button
          className="bg-[#C47A3D] text-white px-10 py-3 rounded-lg shadow"
          onClick={() => navigate("/register/lawyer")}
        >
          Register as Lawyer
        </button>
      </div>

      <p className="mt-6 text-gray-600">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-[#1E2A8A] font-semibold cursor-pointer"
        >
          Login here
        </span>
      </p>
    </div>
  );
}
