import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, Briefcase, CheckCircle, DollarSign,
  FileText, PlusCircle, Shield, User, Scale, LogOut,
  MessageSquare, CreditCard, Clock, AlertCircle, Star, TrendingUp
} from "lucide-react";

const PROGRESS_STEPS = [
  { key: "booked",     label: "Booked",      icon: CheckCircle },
  { key: "confirmed",  label: "Confirmed",   icon: AlertCircle },
  { key: "inprogress", label: "In Progress", icon: Clock       },
  { key: "completed",  label: "Completed",   icon: Star        },
];

const statusToStep = (status) => {
  switch ((status || "").toLowerCase()) {
    case "upcoming":    return 1;
    case "inprogress":  return 2;
    case "completed":   return 3;
    default:            return 0;
  }
};

function CaseProgressBar({ status }) {
  const activeStep = statusToStep(status);
  return (
    <div className="mt-5 mb-1">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Case Progress</p>
      <div className="relative flex items-center justify-between">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-gray-900 z-0 transition-all duration-700"
          style={{ width: `${(activeStep / (PROGRESS_STEPS.length - 1)) * 100}%` }}
        />
        {PROGRESS_STEPS.map((step, i) => {
          const done   = i <= activeStep;
          const active = i === activeStep;
          const Icon   = step.icon;
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                done ? "bg-gray-900 border-gray-900 text-white" : "bg-white border-gray-300 text-gray-400"
              } ${active ? "ring-4 ring-gray-900/20 scale-110" : ""}`}>
                <Icon size={14} />
              </div>
              <span className={`text-[10px] sm:text-xs font-medium text-center leading-tight ${done ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyCases() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [user,     setUser]     = useState({ name: "User", email: "" });

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) { navigate("/"); return; }
      let parsedUser = null;
      try { parsedUser = JSON.parse(userData); }
      catch { localStorage.removeItem("user"); navigate("/"); return; }
      if (!parsedUser || !parsedUser.email) { navigate("/"); return; }
      setUser({ name: parsedUser.name || "User", email: parsedUser.email || "", role: parsedUser.role || "client" });

      const key    = `bookings_${parsedUser.email}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const arr = Array.isArray(parsed) ? parsed : [];
          const seen = new Set();
          const unique = arr.filter((b) => {
            if (!b.bookingId || seen.has(b.bookingId)) return false;
            seen.add(b.bookingId);
            return true;
          });
          localStorage.setItem(key, JSON.stringify(unique));
          setBookings(unique);
        } catch { setBookings([]); }
      }
    } catch (err) { console.error(err); navigate("/"); }
  }, [navigate]);

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/"); };

  const getStatusBadge = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":  return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "upcoming":   return "bg-blue-50 text-blue-700 border-blue-200";
      case "inprogress": return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":  return "bg-red-50 text-red-700 border-red-200";
      default:           return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch ((status || "").toLowerCase()) {
      case "upcoming":   return "Upcoming";
      case "inprogress": return "In Progress";
      case "completed":  return "Completed";
      case "cancelled":  return "Cancelled";
      default:           return "Upcoming";
    }
  };

  const getConsultationType = (type) => {
    switch (type) {
      case "call":     return "Call Consultation";
      case "inPerson": return "In-Person Meeting";
      case "video":    return "Video Call";
      default:         return type || "—";
    }
  };

  // Stats
  const total     = bookings.length;
  const upcoming  = bookings.filter(b => (b.status || "upcoming").toLowerCase() === "upcoming").length;
  const completed = bookings.filter(b => (b.status || "").toLowerCase() === "completed").length;
  const inProgress= bookings.filter(b => (b.status || "").toLowerCase() === "inprogress").length;

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans">

      {/* HEADER */}
      <header className="bg-gray-900 text-white sticky top-0 z-20 shadow-xl">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5">
          <div className="flex items-center gap-2">
            <div className="bg-white/10 p-1.5 rounded-lg">
              <Scale size={18} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="text-sm sm:text-base font-bold tracking-tight">FindMyLawyer</span>
              <p className="text-[10px] text-gray-400 mt-0.5">Welcome back, {user.name}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs sm:text-sm bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-1.5 rounded-lg transition-all font-medium">
            <LogOut size={13} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 pt-6 pb-4">

        {/* ── HERO WELCOME ── */}
        <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 mb-5 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
          <div className="absolute right-8 bottom-0 w-16 h-16 bg-white/5 rounded-full translate-y-6" />
          <p className="text-gray-400 text-xs sm:text-sm font-medium mb-1">Good day,</p>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">{user.name} 👋</h1>
          <p className="text-gray-400 text-xs sm:text-sm mb-5">
            {total === 0 ? "You have no consultations yet. Book your first one today!" : `You have ${total} consultation${total > 1 ? "s" : ""} on record.`}
          </p>
          <button
            onClick={() => navigate("/client-dashboard/request")}
            className="flex items-center gap-2 bg-white text-gray-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-all shadow-md hover:scale-[1.02] active:scale-[0.98]"
          >
            <PlusCircle size={17} />
            Book New Consultation
          </button>
        </div>

        {/* ── STATS ── */}
        {total > 0 && (
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-5">
            {[
              { label: "Total",       value: total,      color: "text-gray-900",    bg: "bg-white" },
              { label: "Upcoming",    value: upcoming,   color: "text-blue-700",    bg: "bg-blue-50" },
              { label: "In Progress", value: inProgress, color: "text-amber-700",   bg: "bg-amber-50" },
              { label: "Completed",   value: completed,  color: "text-emerald-700", bg: "bg-emerald-50" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-2xl p-3 sm:p-4 text-center border border-gray-100 shadow-sm`}>
                <p className={`text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium mt-0.5 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── CASES HEADING ── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">My Cases</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track your legal consultations</p>
          </div>
          {total > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <TrendingUp size={13} />
              <span>{total} case{total > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>

        {/* ── CASES LIST ── */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Cases Yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              Book a consultation with a verified lawyer to get started.
            </p>
            <button
              onClick={() => navigate("/client-dashboard/request")}
              className="bg-gray-900 text-white px-7 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-md hover:scale-105"
            >
              Book Your First Consultation
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {bookings.map((booking, index) => (
              <div key={booking.bookingId || index}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className={`h-1 w-full ${
                  (booking.status || "upcoming") === "completed"  ? "bg-emerald-500" :
                  (booking.status || "upcoming") === "inprogress" ? "bg-amber-400"   :
                  (booking.status || "upcoming") === "cancelled"  ? "bg-red-400"     :
                  "bg-blue-500"
                }`} />

                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900">{booking.lawyer}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-mono">{booking.bookingId}</p>
                    </div>
                    <div className="bg-gray-900 text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-xl ml-2 flex-shrink-0">
                      {booking.fee}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2">
                    <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                      <Briefcase size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Type</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">{getConsultationType(booking.type)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                      <Calendar size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Schedule</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight break-words">{booking.slot}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                      <DollarSign size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] text-emerald-500 uppercase tracking-wide font-semibold mb-0.5">Paid</p>
                        <p className="text-xs sm:text-sm font-bold text-emerald-700">{booking.fee}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-gray-50 rounded-xl p-3">
                      <CreditCard size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Via</p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 capitalize">{booking.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  <CaseProgressBar status={booking.status} />

                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => navigate(`/my-cases/${booking.bookingId}`)}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    >
                      View Full Details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>

      {/* BOTTOM NAVIGATION — no center FAB, 4 even items */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-around px-4 py-2.5">
            <button onClick={() => navigate("/client-dashboard")}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-all min-w-[60px]">
              <Briefcase size={22} />
              <span className="text-[10px] font-medium">Home</span>
            </button>

            <button onClick={() => navigate("/client-dashboard/lawyers")}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-all min-w-[60px]">
              <Shield size={22} />
              <span className="text-[10px] font-medium">Lawyers</span>
            </button>

            <button onClick={() => navigate("/support-chat")}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-600 transition-all min-w-[60px]">
              <MessageSquare size={22} />
              <span className="text-[10px] font-medium">Support</span>
            </button>

            <button onClick={() => navigate("/profile")}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-900 transition-all min-w-[60px]">
              <User size={22} />
              <span className="text-[10px] font-medium">Profile</span>
            </button>
          </div>
        </div>
      </nav>

    </div>
  );
}