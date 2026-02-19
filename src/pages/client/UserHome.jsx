import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Clock, Phone, Shield, LogOut, ArrowRight, Star, Users, CheckCircle } from "lucide-react";

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
      if (!data || typeof data.email !== "string" || !data.email) { navigate("/"); return; }
      setUserName(typeof data.name === "string" && data.name ? data.name : "Guest");

      const key      = `bookings_${data.email}`;
      const rawBooks = localStorage.getItem(key);
      if (rawBooks) {
        try {
          const books = JSON.parse(rawBooks);
          if (Array.isArray(books) && books.length > 0) { navigate("/my-cases"); return; }
        } catch { /* ignore */ }
      }
    } catch (err) {
      console.error("UserHome load error:", err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setFactIndex((prev) => (prev + 1) % rightsFacts.length); setVisible(true); }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/"); };

  // First letter for avatar
  const initials = userName.charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* HEADER */}
      <header className="bg-gray-900 text-white px-4 sm:px-6 py-3.5 flex justify-between items-center sticky top-0 z-10 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-1.5 rounded-lg">
            <Scale size={18} className="text-white" />
          </div>
          <div className="leading-none">
            <span className="text-sm sm:text-base font-bold tracking-tight">FindMyLawyer</span>
            <p className="text-[10px] text-gray-400 mt-0.5">Welcome back, {userName}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs sm:text-sm bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg transition-all font-medium">
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">

        {/* WELCOME HERO */}
        <div className="text-center mb-8">
          {/* Avatar */}
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            Hello, {userName.split(" ")[0]}! 👋
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            You're all set. Book your first legal consultation below.
          </p>
        </div>

        {/* HOW IT WORKS */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">How it works</p>
          <div className="space-y-4">
            {[
              { step: "1", title: "Choose a lawyer", desc: "Browse verified lawyers by specialty and location.", icon: Users },
              { step: "2", title: "Book a slot",     desc: "Pick a time that works for you — call, video, or in-person.", icon: Clock },
              { step: "3", title: "Get legal help",  desc: "Talk to your lawyer and get the guidance you need.", icon: CheckCircle },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WHY FINDMYLAWYER */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: Clock,  label: "15-min",      sub: "Quick consults" },
            { icon: Shield, label: "Verified",    sub: "Trusted lawyers" },
            { icon: Star,   label: "4.8★ rated",  sub: "Top rated" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Icon size={16} className="text-gray-700" />
              </div>
              <p className="text-xs font-bold text-gray-900">{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* TRUST NOTE */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
          <p className="text-xs text-emerald-700 font-medium">
            Your details are shared only after a lawyer accepts your request. 100% private.
          </p>
        </div>

        {/* CTA BUTTON */}
        <button
          onClick={() => navigate("/client-dashboard/request")}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
        >
          Book Your First Consultation
          <ArrowRight size={17} />
        </button>



      </div>

      {/* FOOTER */}
      <footer className="w-full bg-gray-900 text-white py-8 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Scale size={13} className="text-gray-500" />
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Know Your Legal Rights</span>
            <Scale size={13} className="text-gray-500" />
          </div>
          <p className="text-sm sm:text-base text-white font-medium leading-relaxed transition-opacity duration-500 px-2"
            style={{ opacity: visible ? 1 : 0 }}>
            "{rightsFacts[factIndex]}"
          </p>
          <div className="w-full border-t border-gray-800 mt-6 pt-4">
            <p className="text-[11px] text-gray-600">© {new Date().getFullYear()} FindMyLawyer · All rights reserved</p>
          </div>
        </div>
      </footer>

    </div>
  );
}