import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Star, Briefcase, Clock, Phone, MessageSquare, Headphones, Scale, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useNavigate } from "react-router-dom";

const rightsFacts = [
  "You have the right to consult a lawyer before questioning.",
  "You have the right to remain silent.",
  "You are entitled to legal aid if you cannot afford a lawyer.",
  "You must be informed of the charges before arrest.",
];

export default function LawyersList() {
  const navigate  = useNavigate();
  const dropRef   = useRef(null);

  const [factIndex,    setFactIndex]    = useState(0);
  const [visible,      setVisible]      = useState(true);
  const [helpOpen,     setHelpOpen]     = useState(false);

  // Footer rotation
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

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setHelpOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const lawyers = [
    { id: 1, name: "Adv. Rajesh Sharma",  specialization: "Criminal Law",  experience: "8 Years Experience",  rating: 4.8, reviews: 127, fee: "₹1500", availability: "Available Today" },
    { id: 2, name: "Adv. Priya Mehta",    specialization: "Family Law",    experience: "6 Years Experience",  rating: 4.6, reviews: 98,  fee: "₹1200", availability: "Available Today" },
    { id: 3, name: "Adv. Amit Verma",     specialization: "Corporate Law", experience: "10 Years Experience", rating: 4.9, reviews: 156, fee: "₹2000", availability: "Next Available: Tomorrow" },
    { id: 4, name: "Adv. Sneha Patel",    specialization: "Property Law",  experience: "7 Years Experience",  rating: 4.7, reviews: 112, fee: "₹1400", availability: "Available Today" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-4">
          <ArrowLeft className="cursor-pointer hover:scale-110 transition-transform" onClick={() => navigate(-1)} size={22} />
          <div>
            <h1 className="text-xl font-bold">Available Lawyers</h1>
            <p className="text-sm text-gray-300 mt-0.5">Find your legal expert</p>
          </div>
        </div>

        {/* Compact Help button with dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setHelpOpen(!helpOpen)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all"
          >
            <Headphones size={16} />
            <span className="hidden sm:inline">Help</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${helpOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown panel */}
          {helpOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">

              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Need Help?</p>
                <p className="text-xs text-gray-400 mt-0.5">Support available 24/7</p>
              </div>

              {/* Chat */}
              <button
                onClick={() => { setHelpOpen(false); navigate("/support-chat"); }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left group"
              >
                <div className="bg-gray-900 text-white p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Chat with Us</p>
                  <p className="text-xs text-gray-400">Instant support</p>
                </div>
              </button>

              {/* Call */}
              <button
                onClick={() => { setHelpOpen(false); window.location.href = "tel:1800-123-4567"; }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left group border-t border-gray-50"
              >
                <div className="bg-gray-900 text-white p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <Phone size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Call Support</p>
                  <p className="text-xs text-gray-400">1800-123-4567</p>
                </div>
              </button>

              {/* Filter */}
              <button
                onClick={() => { setHelpOpen(false); /* scroll to filters or open filter modal */ }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left group border-t border-gray-50"
              >
                <div className="bg-gray-900 text-white p-2 rounded-lg group-hover:scale-105 transition-transform">
                  <SlidersHorizontal size={15} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Filter Lawyers</p>
                  <p className="text-xs text-gray-400">By specialty or fee</p>
                </div>
              </button>

            </div>
          )}
        </div>
      </div>

      {/* LAWYERS GRID */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {lawyers.map((lawyer, index) => (
            <div
              key={lawyer.id}
              className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
              style={{
                animation: "fadeIn 0.5s ease-in-out",
                animationDelay: `${index * 100}ms`,
                animationFillMode: "both",
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="font-bold text-xl text-gray-900">{lawyer.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Briefcase size={16} className="text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">{lawyer.specialization}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Clock size={16} className="text-gray-500" />
                    <p className="text-sm text-gray-600">{lawyer.experience}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                    <Star size={16} fill="#f59e0b" stroke="#f59e0b" />
                    <span className="text-sm font-bold text-amber-700">{lawyer.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{lawyer.reviews} reviews</span>
                </div>
              </div>

              <div className="border-t border-gray-100 my-4" />

              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Consultation Fee</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{lawyer.fee}</p>
                </div>
                <p className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full">
                  {lawyer.availability}
                </p>
              </div>

              <button
                onClick={() => navigate(`/lawyer/${lawyer.id}`)}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                Book Consultation
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Scale size={13} className="text-gray-500" />
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Know Your Legal Rights</span>
            <Scale size={13} className="text-gray-500" />
          </div>
          <p className="text-sm sm:text-base text-white font-medium leading-relaxed transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
            "{rightsFacts[factIndex]}"
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {rightsFacts.map((_, i) => (
              <span key={i} className={`inline-block h-1 rounded-full transition-all duration-500 ${i === factIndex ? "w-5 bg-white" : "w-1.5 bg-gray-600"}`} />
            ))}
          </div>
          <div className="border-t border-gray-800 mt-6 pt-4">
            <p className="text-[11px] text-gray-600">© {new Date().getFullYear()} FindMyLawyer · All rights reserved</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>

    </div>
  );
}