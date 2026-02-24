import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale, FileText, PlusCircle, Shield, User,
  MessageSquare, Briefcase, Star, Phone, Paperclip,
  Calendar, Receipt, MapPin, Clock, CheckCircle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   🔧 PROTOTYPE LAWYER DATA
   ─────────────────────────────────────────────────────────────
   TODO (Backend): Replace this entire block with an API call:
     const res = await fetch(`/api/lawyers/${lawyerId}`);
     const lawyer = await res.json();
   Each lawyer registered on the platform will have these fields
   in the database. This static map is for prototype/demo only.
═══════════════════════════════════════════════════════════════ */
const PROTOTYPE_LAWYERS = {
  1: {
    name:           "Adv. Rajesh Sharma",
    specialization: "Criminal Law",
    expertise:      ["Criminal Defense", "Bail Applications", "Cyber Crimes", "White Collar Fraud", "Appeals & Revisions"],
    experience:     "8 Yrs",
    rating:         4.8,
    reviews:        127,
    phone:          "+919876543210",
    forum:          "Delhi High Court",
    verified:       true,
  },
  2: {
    name:           "Adv. Priya Mehta",
    specialization: "Family Law",
    expertise:      ["Divorce & Separation", "Child Custody", "Alimony", "Domestic Violence", "Adoption Law"],
    experience:     "6 Yrs",
    rating:         4.6,
    reviews:        98,
    phone:          "+919876543211",
    forum:          "Bombay High Court",
    verified:       true,
  },
  3: {
    name:           "Adv. Amit Verma",
    specialization: "Corporate Law",
    expertise:      ["Company Formation", "Mergers & Acquisitions", "Contract Drafting", "SEBI Compliance", "IPR"],
    experience:     "10 Yrs",
    rating:         4.9,
    reviews:        156,
    phone:          "+919876543212",
    forum:          "Supreme Court",
    verified:       true,
  },
  4: {
    name:           "Adv. Sneha Patel",
    specialization: "Property Law",
    expertise:      ["Title Disputes", "RERA Compliance", "Land Acquisition", "Rental Agreements", "Property Registration"],
    experience:     "7 Yrs",
    rating:         4.7,
    reviews:        112,
    phone:          "+919876543213",
    forum:          "Gujarat High Court",
    verified:       true,
  },
};

/* ─────────────────────────────────────────────────────────────
   🔧 PROTOTYPE: getLawyerData
   ─────────────────────────────────────────────────────────────
   TODO (Backend): Replace with:
     const getLawyerData = async (lawyerId, bookingSnapshot) => {
       try {
         const res = await fetch(`/api/lawyers/${lawyerId}`);
         if (!res.ok) throw new Error();
         return await res.json();
       } catch {
         return bookingSnapshot; // fallback to saved booking data
       }
     };
   For now: looks up from static map, falls back to booking data.
───────────────────────────────────────────────────────────── */
const getLawyerData = (lawyerId, bookingSnapshot) => {
  // Try ID lookup first, then name match as fallback
  const fromDB =
    PROTOTYPE_LAWYERS[lawyerId] ||
    Object.values(PROTOTYPE_LAWYERS).find(l => l.name === bookingSnapshot?.lawyer) ||
    null;

  // Merge: DB is source of truth, booking snapshot fills any gaps
  return {
    name:           fromDB?.name           || bookingSnapshot?.lawyer              || "Unknown Lawyer",
    specialization: fromDB?.specialization || bookingSnapshot?.lawyerSpecialization || "Legal Specialist",
    expertise:      fromDB?.expertise      || [],
    experience:     fromDB?.experience     || bookingSnapshot?.lawyerExp           || "—",
    rating:         fromDB?.rating         ?? bookingSnapshot?.lawyerRating        ?? null,
    reviews:        fromDB?.reviews        ?? bookingSnapshot?.lawyerReviews       ?? null,
    phone:          fromDB?.phone          || bookingSnapshot?.lawyerPhone         || "+919800000000",
    forum:          fromDB?.forum          || bookingSnapshot?.lawyerForum         || "High Court",
    verified:       fromDB?.verified       ?? false,
  };
};

/* ─────────────────────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────────────────────── */
const STATUS = {
  upcoming:   { label: "Upcoming",    pill: "bg-blue-50 text-blue-700 border-blue-200",         bar: "bg-blue-500",    dot: "bg-blue-500"    },
  inprogress: { label: "In Progress", pill: "bg-amber-50 text-amber-700 border-amber-200",       bar: "bg-amber-400",   dot: "bg-amber-500"   },
  completed:  { label: "Completed",   pill: "bg-emerald-50 text-emerald-700 border-emerald-200", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  cancelled:  { label: "Cancelled",   pill: "bg-red-50 text-red-700 border-red-200",             bar: "bg-red-400",     dot: "bg-red-400"     },
};
const getStatus = (s) => STATUS[(s || "upcoming").toLowerCase()] || STATUS.upcoming;

/* ─────────────────────────────────────────────────────────────
   CASE TYPE → EMOJI
───────────────────────────────────────────────────────────── */
const CASE_ICONS = {
  "Criminal Case":    "🔒",
  "Civil Case":       "⚖️",
  "Family Law":       "👨‍👩‍👧",
  "Property Dispute": "🏠",
  "Corporate Law":    "🏢",
};
const getCaseIcon = (t) => CASE_ICONS[t] || "⚖️";

/* ─────────────────────────────────────────────────────────────
   INVOICE DOWNLOAD
───────────────────────────────────────────────────────────── */
const downloadInvoice = (booking, lawyer) => {
  const txt = [
    "FINDMYLAWYER — OFFICIAL INVOICE",
    "=".repeat(38),
    `Booking ID     : ${booking.bookingId}`,
    `Lawyer         : ${lawyer.name}`,
    `Specialization : ${lawyer.specialization}`,
    `Case Type      : ${booking.caseType || "General Legal"}`,
    `Mode           : ${booking.type === "call" ? "Phone Consultation" : booking.type === "inPerson" ? "In-Person Meeting" : "Video Call"}`,
    `Scheduled      : ${booking.slot}`,
    `Amount Paid    : ${booking.fee}`,
    `Payment Via    : ${(booking.paymentMethod || "").toUpperCase()}`,
    `Status         : ${booking.status || "Upcoming"}`,
    `Booked At      : ${booking.bookedAt ? new Date(booking.bookedAt).toLocaleString("en-IN") : "—"}`,
    "=".repeat(38),
    "Thank you for choosing FindMyLawyer.",
  ].join("\n");

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
  a.download = `invoice_${booking.bookingId}.txt`;
  a.click();
};

/* ─────────────────────────────────────────────────────────────
   LEGAL FACTS FOOTER
───────────────────────────────────────────────────────────── */
const RIGHTS_FACTS = [
  "You have the right to consult a lawyer before questioning.",
  "You have the right to remain silent.",
  "You are entitled to legal aid if you cannot afford a lawyer.",
  "You must be informed of the charges before arrest.",
  "You have the right to confront and cross-examine witnesses.",
  "You are presumed innocent until proven guilty.",
  "You have the right to an impartial jury of your peers.",
  "No person can be tried twice for the same crime.",
  "You have the right to be free from unreasonable searches.",
  "You have the right to know the reason for your arrest.",
];

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function MyCases() {
  const navigate = useNavigate();

  const [bookings,  setBookings]  = useState([]);
  const [user,      setUser]      = useState({ name: "User", email: "" });
  const [factIndex, setFactIndex] = useState(0);
  const [visible,   setVisible]   = useState(true);

  /* ── Load user + bookings from localStorage ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) { navigate("/"); return; }

      let u;
      try { u = JSON.parse(raw); }
      catch { localStorage.removeItem("user"); navigate("/"); return; }
      if (!u?.email) { navigate("/"); return; }

      setUser({ name: u.name || "User", email: u.email });

      const stored = localStorage.getItem(`bookings_${u.email}`);
      if (stored) {
        try {
          const arr  = JSON.parse(stored);
          const seen = new Set();
          const unique = (Array.isArray(arr) ? arr : []).filter(b => {
            if (!b.bookingId || seen.has(b.bookingId)) return false;
            seen.add(b.bookingId);
            return true;
          });
          localStorage.setItem(`bookings_${u.email}`, JSON.stringify(unique));
          setBookings(unique);
        } catch { setBookings([]); }
      }
    } catch (e) { console.error(e); navigate("/"); }
  }, [navigate]);

  /* ── Rotate facts ── */
  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFactIndex(p => (p + 1) % RIGHTS_FACTS.length);
        setVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const total = bookings.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ══ NAVBAR ══ */}
      <header className="bg-gray-900 text-white px-4 sm:px-6 py-3.5 flex justify-between items-center sticky top-0 z-20 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="bg-white/10 p-1.5 rounded-lg">
            <Scale size={18} className="text-white" />
          </div>
          <div className="leading-none">
            <span className="text-sm sm:text-base font-bold tracking-tight">FindMyLawyer</span>
            <p className="text-[10px] text-gray-400 mt-0.5">Welcome back, {user.name}</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold">{(user.name || "U")[0].toUpperCase()}</span>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-3 sm:px-4 pt-5 pb-28">

        {/* Greeting */}
        <div className="mb-5">
          <p className="text-xs text-gray-500">Welcome back</p>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{user.name} 👋</h1>
          <p className="text-xs text-gray-400 mt-1">
            {total === 0
              ? "No consultations yet — book your first one below."
              : `${total} consultation${total > 1 ? "s" : ""} on record`}
          </p>
        </div>

        {/* ══ EMPTY STATE ══ */}
        {total === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No Cases Yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
              Book a consultation with a verified lawyer to get started.
            </p>
            <button
              onClick={() => navigate("/client-dashboard/request")}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
            >
              Book Your First Consultation
            </button>
          </div>
        ) : (

          /* ══ CASE CARDS ══ */
          <div className="space-y-4">
            {bookings.map((booking, idx) => {
              const st = getStatus(booking.status);

              /*
               * 🔧 PROTOTYPE: getLawyerData called with (lawyerId, bookingSnapshot)
               * TODO (Backend): Replace with async API fetch inside a useEffect,
               * storing results in a lawyersMap state keyed by lawyerId.
               * Example:
               *   const [lawyersMap, setLawyersMap] = useState({});
               *   useEffect(() => {
               *     bookings.forEach(async b => {
               *       const res = await fetch(`/api/lawyers/${b.lawyerId}`);
               *       const data = await res.json();
               *       setLawyersMap(m => ({ ...m, [b.lawyerId]: data }));
               *     });
               *   }, [bookings]);
               *   const lawyer = lawyersMap[booking.lawyerId] || fallback;
               */
              const lawyer   = getLawyerData(booking.lawyerId, booking);
              const caseType = booking.caseType || "General Legal";
              const initial  = (lawyer.name || "L")[0];

              return (
                <div
                  key={booking.bookingId || idx}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* Status colour bar */}
                  <div className={`h-[3px] w-full ${st.bar}`} />

                  <div className="p-4 sm:p-5">

                    {/* ── LAWYER PROFILE SECTION ── */}
                    <div className="flex items-start gap-3">

                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-[50px] h-[50px] rounded-2xl bg-gradient-to-br from-gray-700 to-gray-950 flex items-center justify-center shadow-sm">
                          <span className="text-white text-lg font-bold">{initial}</span>
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${st.dot}`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">

                        {/* Row: name + PAID badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h3 className="text-sm font-bold text-gray-900 leading-snug">{lawyer.name}</h3>
                              {lawyer.verified && (
                                <span className="inline-flex items-center gap-0.5 bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                  <CheckCircle size={8} /> Verified
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 font-medium mt-0.5">{lawyer.specialization}</p>
                          </div>

                          {/* Tiny PAID receipt button */}
                          <button
                            onClick={() => downloadInvoice(booking, lawyer)}
                            title="Download Invoice"
                            className="flex-shrink-0 flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            <Receipt size={10} />
                            <span className="text-[10px] font-extrabold tracking-wider">PAID</span>
                          </button>
                        </div>

                        {/* Meta pills: rating · exp · forum · status */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {lawyer.rating !== null && (
                            <span className="inline-flex items-center gap-0.5 bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              <Star size={8} fill="currentColor" strokeWidth={0} />
                              {lawyer.rating}{lawyer.reviews ? ` (${lawyer.reviews})` : ""}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                            <Clock size={8} />{lawyer.experience}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-violet-50 border border-violet-100 text-violet-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                            <MapPin size={8} />{lawyer.forum}
                          </span>
                          <span className={`inline-flex items-center border text-[10px] font-semibold px-2 py-0.5 rounded-full ${st.pill}`}>
                            {st.label}
                          </span>
                        </div>

                        {/* Expertise chips */}
                        {lawyer.expertise.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {lawyer.expertise.map((e, i) => (
                              <span key={i} className="bg-gray-50 border border-gray-200 text-gray-600 text-[9px] font-medium px-2 py-0.5 rounded-full">
                                {e}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>

                    {/* ── DIVIDER ── */}
                    <div className="border-t border-gray-100 my-3.5" />

                    {/* ── CASE DETAILS SECTION ── */}
                    {/*
                     * 🔧 PROTOTYPE: caseType comes from booking.caseType saved during RequestConsultation.
                     * TODO (Backend): This will come from the cases collection:
                     *   GET /api/cases?bookingId=xxx → { caseType, mode, slot, ... }
                     */}
                    <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mb-2.5">
                        Client Case Details
                      </p>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">

                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Case Type</p>
                          <p className="text-xs font-bold text-gray-900">
                            {getCaseIcon(caseType)} {caseType}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Consultation Mode</p>
                          <p className="text-xs font-bold text-gray-900">
                            {booking.type === "call" ? "📞 Phone" : booking.type === "inPerson" ? "🤝 In-Person" : "🎥 Video"}
                          </p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">Scheduled</p>
                          <p className="text-xs font-bold text-gray-900 flex items-center gap-1">
                            <Calendar size={10} className="text-gray-400 flex-shrink-0" />
                            {booking.slot || "—"}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* ── ACTION BAR — 3 horizontal buttons ── */}
                    <div className="flex items-stretch gap-2">

                      {/* CALL */}
                      <button
                        onClick={() => window.location.href = `tel:${lawyer.phone}`}
                        className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                      >
                        <Phone size={16} strokeWidth={2} />
                        <span className="text-[10px] font-bold tracking-wide">Call</span>
                      </button>

                      {/* CHAT */}
                      <button
                        onClick={() => navigate(`/my-cases/${booking.bookingId}?tab=chat`)}
                        className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-colors"
                      >
                        <MessageSquare size={16} strokeWidth={2} />
                        <span className="text-[10px] font-bold tracking-wide">Chat</span>
                      </button>

                      {/* DOCUMENTS */}
                      <button
                        onClick={() => navigate(`/my-cases/${booking.bookingId}?tab=documents`)}
                        className="flex-1 flex flex-col items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                      >
                        <Paperclip size={16} strokeWidth={2} />
                        <span className="text-[10px] font-bold tracking-wide">Docs</span>
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Book New */}
        <div className="mt-5">
          <button
            onClick={() => navigate("/client-dashboard/request")}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold py-3.5 rounded-2xl hover:bg-gray-800 transition shadow-md"
          >
            <PlusCircle size={17} />
            Book New Consultation
          </button>
        </div>

      </main>

      {/* ══ FOOTER ══ */}
      <footer className="bg-gray-900 text-white py-7 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Scale size={12} className="text-gray-500" />
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
              Know Your Legal Rights
            </span>
            <Scale size={12} className="text-gray-500" />
          </div>
          <p
            className="text-sm text-white font-medium leading-relaxed transition-opacity duration-500"
            style={{ opacity: visible ? 1 : 0 }}
          >
            "{RIGHTS_FACTS[factIndex]}"
          </p>
          <div className="border-t border-gray-800 mt-5 pt-4">
            <p className="text-[11px] text-gray-600">
              © {new Date().getFullYear()} FindMyLawyer · All rights reserved
            </p>
          </div>
        </div>
      </footer>

      {/* ══ BOTTOM NAV ══ */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-xl z-20"
        style={{ height: 56 }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-around h-full px-4">
          {[
            { icon: Briefcase,     label: "Home",    path: "/client-dashboard" },
            { icon: Shield,        label: "Lawyers", path: "/client-dashboard/lawyers" },
            { icon: MessageSquare, label: "Support", path: "/support-chat" },
            { icon: User,          label: "Profile", path: "/profile" },
          ].map(({ icon: Icon, label, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-gray-900 transition-colors w-14 h-full"
            >
              <Icon size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
}