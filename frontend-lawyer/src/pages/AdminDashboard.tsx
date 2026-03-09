import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

interface LawyerApplication {
  id: string;
  enrollment_number: string;
  certificate_url: string | null;
  status: string;
  admin_comment: string | null;
  state: string;
  city: string;
  experience: string;
  practice_areas: string[];
  users: {
    name: string;
    email: string;
    phone: string;
  };
}

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [pendingLawyers, setPendingLawyers] = useState<LawyerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending lawyers
  const fetchPending = async () => {
    try {
      const res = await api.get("/admin/pending-lawyers");
      setPendingLawyers(res.data);
    } catch (error: any) {
      console.error("Error fetching pending lawyers:", error);
      alert(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // Approve lawyer
  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this lawyer?")) return;

    try {
      await api.put("/admin/review-lawyer", {
        lawyerId: id,
        status: "VERIFIED",
      });

      alert("Lawyer approved successfully");
      fetchPending();
    } catch (error: any) {
      console.error("Approval error:", error);
      alert(error.response?.data?.message || "Failed to approve");
    }
  };

  // Reject lawyer
  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await api.put("/admin/review-lawyer", {
        lawyerId: id,
        status: "REJECTED",
        admin_comment: reason,
      });

      alert("Lawyer rejected successfully");
      fetchPending();
    } catch (error: any) {
      console.error("Rejection error:", error);
      alert(error.response?.data?.message || "Failed to reject");
    }
  };

  if (loading) return <h3 className="p-10">Loading...</h3>;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-slate-900 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => {
            logout();
            navigate("/");
          }}
          className="bg-white text-black px-4 py-1 rounded"
        >
          Logout
        </button>
      </nav>

      <div className="p-8">
        <h2 className="text-2xl font-semibold mb-4">
          Pending Lawyer Verifications ({pendingLawyers.length})
        </h2>

        {pendingLawyers.length === 0 ? (
          <div className="bg-white p-6 rounded shadow text-center">
            <p className="text-gray-600">No pending lawyers at this time</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-200">
                <tr className="text-left">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Experience</th>
                  <th className="p-3">Enrollment</th>
                  <th className="p-3">Practice Areas</th>
                  <th className="p-3">Certificate</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingLawyers.map((lawyer) => (
                  <tr key={lawyer.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{lawyer.users?.name || "N/A"}</td>
                    <td className="p-3">{lawyer.users?.email || "N/A"}</td>
                    <td className="p-3">
                      {lawyer.city}, {lawyer.state}
                    </td>
                    <td className="p-3">{lawyer.experience}</td>
                    <td className="p-3 font-mono text-sm">
                      {lawyer.enrollment_number}
                    </td>
                    <td className="p-3 text-sm">
                      {lawyer.practice_areas?.join(", ") || "N/A"}
                    </td>
                    <td className="p-3">
                      {lawyer.certificate_url ? (
                        
                        <a href={lawyer.certificate_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400">Not uploaded</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm"
                          onClick={() => handleApprove(lawyer.id)}
                        >
                          Approve
                        </button>
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                          onClick={() => handleReject(lawyer.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;