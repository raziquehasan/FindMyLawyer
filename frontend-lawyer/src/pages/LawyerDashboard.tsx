import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

interface LawyerProfile {
  status: string;
  admin_comment: string | null;
  state: string;
  city: string;
  languages: string[];
  practice_areas: string[];
  case_types: string[];
  experience: string;
  courts: string[];
  profile_photo_url?: string;
  enrollment_number: string;
  users: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/lawyer/profile");
      setProfile(res.data.profile);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) return <p className="p-8">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      {/* NAVBAR */}
      <div className="bg-[#1E2A8A] text-white px-6 py-4 flex justify-between">
        <h2 className="text-lg font-bold">Lawyer Portal</h2>
        <button
          onClick={handleLogout}
          className="bg-white text-[#1E2A8A] px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <div className="p-8">
        {/* HEADER */}
        <h2 className="text-3xl font-bold text-[#1E2A8A] mb-6">
          Welcome
          {profile?.users?.name ? `, Advocate ${profile.users.name}` : ", Advocate"}
        </h2>

        {/* STATUS */}
        <div className="bg-white border-l-4 border-[#C47A3D] p-5 rounded mb-6">
          <h3 className="font-semibold text-lg mb-2">Account Status</h3>

          {profile?.status === "VERIFIED" && (
            <p className="text-green-600 font-medium">
              ✅ Your account is verified and live!
            </p>
          )}

          {profile?.status === "PENDING" && (
            <p className="text-yellow-600 font-medium">
              ⏳ Your profile is under admin review
            </p>
          )}

          {profile?.status === "REJECTED" && (
            <div>
              <p className="text-red-600 font-semibold mb-2">
                ❌ Your profile was rejected
              </p>
              {profile.admin_comment && (
                <p className="text-gray-700 bg-red-50 p-3 rounded">
                  <strong>Reason:</strong> {profile.admin_comment}
                </p>
              )}
              <button
                onClick={() => navigate("/onboarding/profile")}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded"
              >
                Update & Resubmit Profile
              </button>
            </div>
          )}
        </div>

        {/* VERIFIED PROFILE VIEW */}
        {profile?.status === "VERIFIED" && (
          <div className="bg-white p-6 rounded shadow mb-6">
            <div className="flex gap-6">
              {/* Photo */}
              {profile.profile_photo_url && (
                <img
                  src={profile.profile_photo_url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              )}

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-2">
                  Advocate {profile.users.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  📍 {profile.city}, {profile.state}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p className="font-medium">{profile.experience}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Enrollment No.</p>
                    <p className="font-medium">{profile.enrollment_number}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Courts</p>
                    <p className="font-medium">{profile.courts.join(", ")}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Languages</p>
                    <p className="font-medium">{profile.languages.join(", ")}</p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Practice Areas</p>
                    <p className="font-medium">
                      {profile.practice_areas.join(", ")}
                    </p>
                  </div>

                  {profile.case_types && profile.case_types.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Case Types</p>
                      <p className="font-medium">
                        {profile.case_types.join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UPDATE PROFILE */}
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-semibold mb-4">
            {profile?.status === "VERIFIED"
              ? "Update Your Profile"
              : "Complete Your Profile"}
          </h3>

          <p className="text-gray-600 mb-4">
            {profile?.status === "VERIFIED"
              ? "Keep your profile information up to date"
              : "Fill in all the details to get verified and start receiving client requests"}
          </p>

          <button
            onClick={() => navigate("/onboarding/profile")}
            className="bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-800"
          >
            {profile?.status === "VERIFIED" ? "Edit Profile" : "Complete Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}