import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Clock, Phone, Shield, LogOut } from "lucide-react";

const rightsFacts = [
  "You have the right to consult a lawyer before questioning.",
  "You have the right to remain silent.",
  "You are entitled to legal aid if you cannot afford a lawyer.",
  "You must be informed of the charges before arrest.",
];

export default function UserHome() {
  const navigate = useNavigate();

  const [userName,  setUserName]  = useState("Guest");
  const [loading,   setLoading]   = useState(true);
  const [factIndex, setFactIndex] = useState(0);
  const [visible,   setVisible]   = useState(true);

  // ── Auth check ────────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) { navigate("/"); return; }

      let data = null;
      try { data = JSON.parse(raw); } catch {
        localStorage.removeItem("user");
        navigate("/");
        return;
      }

      if (!data || typeof data.email !== "string" || !data.email) {
        navigate("/");
        return;
      }

      setUserName(typeof data.name === "string" && data.name ? data.name : "Guest");

      const key      = `bookings_${data.email}`;
      const rawBooks = localStorage.getItem(key);
      if (rawBooks) {
        try {
          const books = JSON.parse(rawBooks);
          if (Array.isArray(books) && books.length > 0) {
            navigate("/my-cases");
            return;
          }
        } catch { /* corrupt bookings — ignore */ }
      }
    } catch (err) {
      console.error("UserHome load error:", err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // ── Footer rotation ───────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFactIndex((prev) => (prev + 1) % rightsFacts.length);
        setVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">

      {/* HEADER */}
      <div className="bg-black text-white px-4 sm:px-6 md:px-10 py-4 md:py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-3">
          <Scale size={22} />
          <h1 className="text-base sm:text-lg md:text-xl font-semibold">FindMyLawyer</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs sm:text-sm md:text-base font-medium">
            Welcome, {userName}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-xs sm:text-sm hover:opacity-80 transition"
            title="Logout"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-10 py-10 md:py-16">

        {/* HERO */}
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Need Legal Advice?
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Get connected with verified lawyers in minutes.
          </p>
        </div>

        {/* FEATURES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 mb-12 md:mb-16">
          <div className="flex flex-col items-center text-center p-6 md:p-8 border rounded-2xl hover:shadow-lg transition duration-300">
            <div className="bg-black text-white p-3 md:p-4 rounded-full mb-4">
              <Clock size={22} />
            </div>
            <h3 className="font-semibold text-base md:text-lg mb-2">15 Minute Consultation</h3>
            <p className="text-gray-600 text-sm">Quick and efficient legal guidance.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 md:p-8 border rounded-2xl hover:shadow-lg transition duration-300">
            <div className="bg-black text-white p-3 md:p-4 rounded-full mb-4">
              <Phone size={22} />
            </div>
            <h3 className="font-semibold text-base md:text-lg mb-2">Instant Call</h3>
            <p className="text-gray-600 text-sm">Speak directly with legal professionals.</p>
          </div>

          <div className="flex flex-col items-center text-center p-6 md:p-8 border rounded-2xl hover:shadow-lg transition duration-300 sm:col-span-2 md:col-span-1">
            <div className="bg-black text-white p-3 md:p-4 rounded-full mb-4">
              <Shield size={22} />
            </div>
            <h3 className="font-semibold text-base md:text-lg mb-2">Verified Lawyers</h3>
            <p className="text-gray-600 text-sm">Trusted and experienced experts.</p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-14 md:mb-20">
          <button
            onClick={() => navigate("/client-dashboard/request")}
            className="w-full sm:w-auto bg-black text-white px-8 py-3 md:px-12 md:py-4 rounded-xl text-base md:text-lg font-semibold hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            Request Consultation
          </button>
          <p className="text-gray-500 text-xs md:text-sm mt-4 max-w-md mx-auto">
            Your details are shared only after lawyer acceptance.
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate("/client-dashboard/request")}
            className="border p-6 md:p-8 rounded-2xl hover:bg-black hover:text-white transition duration-300 cursor-pointer"
          >
            <h3 className="font-semibold text-base md:text-lg mb-2">New Case</h3>
            <p className="text-sm opacity-70">Start a detailed legal case request.</p>
          </div>

          <div className="border p-6 md:p-8 rounded-2xl hover:bg-black hover:text-white transition duration-300 cursor-pointer">
            <h3 className="font-semibold text-base md:text-lg mb-2">Report Issue</h3>
            <p className="text-sm opacity-70">Submit feedback or complaints.</p>
          </div>

          <div
            onClick={() => navigate("/my-cases")}
            className="border p-6 md:p-8 rounded-2xl hover:bg-black hover:text-white transition duration-300 cursor-pointer sm:col-span-2 md:col-span-1"
          >
            <h3 className="font-semibold text-base md:text-lg mb-2">My Cases</h3>
            <p className="text-sm opacity-70">Track your consultation status.</p>
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-10">
        <div className="max-w-2xl mx-auto text-center">

          <div className="flex items-center justify-center gap-2 mb-3">
            <Scale size={13} className="text-gray-500" />
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Know Your Legal Rights
            </span>
            <Scale size={13} className="text-gray-500" />
          </div>

          <p
            className="text-sm sm:text-base text-white font-medium leading-relaxed transition-opacity duration-500"
            style={{ opacity: visible ? 1 : 0 }}
          >
            "{rightsFacts[factIndex]}"
          </p>

          <div className="flex items-center justify-center gap-1.5 mt-4">
            {rightsFacts.map((_, i) => (
              <span
                key={i}
                className={`inline-block h-1 rounded-full transition-all duration-500 ${
                  i === factIndex ? "w-5 bg-white" : "w-1.5 bg-gray-600"
                }`}
              />
            ))}
          </div>

          <div className="border-t border-gray-800 mt-6 pt-4">
            <p className="text-[11px] text-gray-600">
              © {new Date().getFullYear()} FindMyLawyer · All rights reserved
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}