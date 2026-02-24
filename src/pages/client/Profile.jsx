import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, MapPin, Home, Shield,
  Edit3, Save, X, ArrowLeft, LogOut, Scale,
  CheckCircle, Briefcase, Hash, ChevronRight,
  PlusCircle, MessageSquare, Lock, Bell,
  FileText, Eye, EyeOff, AlertCircle
} from "lucide-react";

const rightsFacts = [
  "You have the right to consult a lawyer before questioning.",
  "You have the right to remain silent.",
  "You are entitled to legal aid if you cannot afford a lawyer.",
  "You must be informed of the charges before arrest.",
  "You have the right to confront and cross-examine witnesses testifying against you.",
  "You are presumed innocent until proven guilty beyond a reasonable doubt.",
  "You have the right to an impartial jury of your peers.",
  "No person can be tried twice for the same crime — this is the right against double jeopardy.",
  "You have the right to be free from unreasonable searches and seizures.",
  "You have the right to know the reason for your arrest.",
];

const EMPTY_PROFILE = {
  name: "", email: "", phone: "",
  city: "", pincode: "", address: "", role: "client"
};

function ProfileRow({ icon, label, value, editing, onChange, placeholder, type = "text", locked }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-0.5">{label}</p>
        {editing ? (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-sm text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
          />
        ) : (
          <p className={`text-sm font-medium truncate ${value ? "text-gray-900" : "text-gray-400 italic"}`}>
            {value || `No ${label.toLowerCase()} saved`}
          </p>
        )}
      </div>
      {locked && (
        <span className="text-[9px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium flex-shrink-0">locked</span>
      )}
    </div>
  );
}

function QuickLink({ icon, bg, label, sub, onClick }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-all group">
      <div className="flex items-center gap-3">
        <div className={`${bg} p-2 rounded-lg`}>{icon}</div>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-400">{sub}</p>
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition" />
    </button>
  );
}

const Toggle = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    className={`relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${value ? "bg-gray-900" : "bg-gray-200"}`}
  >
    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${value ? "left-6" : "left-1"}`} />
  </button>
);

export default function Profile() {
  const navigate = useNavigate();

  const [profile,  setProfile]  = useState(EMPTY_PROFILE);
  const [edited,   setEdited]   = useState(EMPTY_PROFILE);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [stats,    setStats]    = useState({ total: 0, upcoming: 0, completed: 0 });

  const [notifCase,     setNotifCase]     = useState(true);
  const [notifPromo,    setNotifPromo]    = useState(false);
  const [notifReminder, setNotifReminder] = useState(true);

  const [showPwSection, setShowPwSection] = useState(false);
  const [currentPw,     setCurrentPw]     = useState("");
  const [newPw,         setNewPw]         = useState("");
  const [confirmPw,     setConfirmPw]     = useState("");
  const [showCurrent,   setShowCurrent]   = useState(false);
  const [showNew,       setShowNew]       = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [pwErrors,      setPwErrors]      = useState({});
  const [pwSaved,       setPwSaved]       = useState(false);

  const [factIndex, setFactIndex] = useState(0);
  const [visible,   setVisible]   = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFactIndex(prev => (prev + 1) % rightsFacts.length);
        setVisible(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) { navigate("/"); return; }
      let data = null;
      try { data = JSON.parse(raw); } catch { navigate("/"); return; }
      if (!data?.email) { navigate("/"); return; }

      const p = {
        name:    data.name    || "",
        email:   data.email   || "",
        phone:   data.phone   || "",
        city:    data.city    || "",
        pincode: data.pincode || "",
        address: data.address || "",
        role:    data.role    || "client",
      };
      setProfile(p);
      setEdited(p);

      const booksRaw = localStorage.getItem(`bookings_${data.email}`);
      if (booksRaw) {
        try {
          const books = JSON.parse(booksRaw);
          if (Array.isArray(books)) {
            setStats({
              total:     books.length,
              upcoming:  books.filter(b => (b.status || "upcoming") === "upcoming").length,
              completed: books.filter(b => b.status === "completed").length,
            });
          }
        } catch { /* ignore */ }
      }
    } catch { navigate("/"); }
    finally { setLoading(false); }
  }, [navigate]);

  const handleSave = () => {
    localStorage.setItem("user", JSON.stringify(edited));
    setProfile(edited);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleCancel = () => { setEdited(profile); setEditing(false); };
  const handleLogout = () => { localStorage.removeItem("user"); navigate("/"); };
  const change = (field, value) => setEdited(prev => ({ ...prev, [field]: value }));

  const handleChangePassword = () => {
    const e = {};
    if (!currentPw)               e.currentPw = "Enter your current password";
    if (!newPw)                   e.newPw     = "Enter a new password";
    else if (newPw.length < 6)    e.newPw     = "Password must be at least 6 characters";
    if (!confirmPw)               e.confirmPw = "Please confirm your new password";
    else if (newPw !== confirmPw) e.confirmPw = "Passwords do not match";
    if (Object.keys(e).length > 0) { setPwErrors(e); return; }
    setPwErrors({});
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setShowPwSection(false);
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2500);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-sm text-gray-400">Loading…</p>
    </div>
  );

  const initials = (profile.name || "U").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const memberSince = (() => {
    try {
      const booksRaw = localStorage.getItem(`bookings_${profile.email}`);
      if (booksRaw) {
        const books = JSON.parse(booksRaw);
        if (books.length) {
          const dates = books.map(b => new Date(b.bookedAt)).filter(d => !isNaN(d));
          if (dates.length) {
            const earliest = new Date(Math.min(...dates));
            return earliest.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
          }
        }
      }
    } catch { /* ignore */ }
    return "Recently Joined";
  })();

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

      {/* HEADER */}
      <header className="bg-gray-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-xl">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition mr-1">
            <ArrowLeft size={16} />
          </button>
          <div className="bg-white/10 p-1.5 rounded-lg">
            <Scale size={18} className="text-white" />
          </div>
          <div className="leading-none ml-0.5">
            <span className="text-sm sm:text-base font-bold tracking-tight">FindMyLawyer</span>
            <p className="text-[10px] text-gray-400 mt-0.5">My Profile</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold">{initials[0] || "U"}</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-3 sm:px-4 pt-6 pb-8">

        {/* ── PREMIUM HERO CARD ── */}
        <div className="relative rounded-3xl overflow-hidden mb-6 shadow-xl border border-gray-800">

          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

          <div className="relative p-6 sm:p-8">

            <div className="flex items-center justify-between gap-5 mb-6">

              {/* Left: Avatar + info */}
              <div className="flex items-center gap-5 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white flex items-center justify-center shadow-md">
                    <span className="text-xl sm:text-2xl font-black text-black tracking-tight">{initials}</span>
                  </div>
                  <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 border-2 border-black rounded-full" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-white truncate">{profile.name || "—"}</h1>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{profile.email}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-white/10 text-gray-200">
                      <CheckCircle size={11} className="text-green-400" />
                      Verified Account
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-white/10 text-gray-300">
                      <Briefcase size={11} />
                      Member since {memberSince}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit / Save */}
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition shadow-sm"
                >
                  <Edit3 size={13} /> Edit
                </button>
              ) : (
                <div className="flex-shrink-0 flex gap-2">
                  <button onClick={handleSave} className="flex items-center gap-1.5 bg-white text-black text-xs font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition">
                    <Save size={13} /> Save
                  </button>
                  <button onClick={handleCancel} className="border border-white/20 text-white text-xs px-3 py-2 rounded-xl hover:bg-white/10 transition">
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 mb-6" />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-[11px] text-gray-400 mt-1">Total Cases</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats.upcoming}</p>
                <p className="text-[11px] text-gray-400 mt-1">Upcoming</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
                <p className="text-[11px] text-gray-400 mt-1">Completed</p>
              </div>
            </div>

          </div>
        </div>

        {/* TOASTS */}
        {saved && (
          <div className="flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-3 rounded-xl mb-4">
            <CheckCircle size={16} /> Profile updated successfully
          </div>
        )}
        {pwSaved && (
          <div className="flex items-center gap-2 bg-black text-white text-sm font-medium px-4 py-3 rounded-xl mb-4">
            <CheckCircle size={16} /> Password changed successfully
          </div>
        )}

        {/* PERSONAL INFORMATION */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Personal Information</h2>
            {editing && <span className="text-[10px] text-black font-semibold bg-gray-100 px-2 py-0.5 rounded-full">Editing</span>}
          </div>
          <div className="divide-y divide-gray-50">
            <ProfileRow icon={<User size={15} className="text-gray-400" />} label="Full Name" value={edited.name} editing={editing} onChange={v => change("name", v)} placeholder="Enter your full name" />
            <ProfileRow icon={<Mail size={15} className="text-gray-400" />} label="Email Address" value={profile.email} editing={false} locked />
            <ProfileRow icon={<Phone size={15} className="text-gray-400" />} label="Phone Number" value={edited.phone} editing={editing} onChange={v => change("phone", v)} placeholder="+91 98765 43210" type="tel" />
            <ProfileRow icon={<MapPin size={15} className="text-gray-400" />} label="City" value={edited.city} editing={editing} onChange={v => change("city", v)} placeholder="New Delhi" />
            <ProfileRow icon={<Hash size={15} className="text-gray-400" />} label="Pincode" value={edited.pincode} editing={editing} onChange={v => change("pincode", v)} placeholder="110001" type="number" />
          </div>
        </section>

        {/* ADDRESS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Address</h2>
          </div>
          <div className="p-5">
            {editing ? (
              <textarea value={edited.address} onChange={e => change("address", e.target.value)} placeholder="Enter your full address" rows={3} className="w-full text-sm text-gray-900 border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none transition" />
            ) : (
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0 mt-0.5"><Home size={15} className="text-gray-400" /></div>
                <p className="text-sm text-gray-700 leading-relaxed">{profile.address || <span className="text-gray-400 italic">No address saved</span>}</p>
              </div>
            )}
          </div>
        </section>

        {/* CHANGE PASSWORD */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <button onClick={() => setShowPwSection(!showPwSection)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg"><Lock size={15} className="text-gray-500" /></div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Change Password</p>
                <p className="text-xs text-gray-400">Update your account password</p>
              </div>
            </div>
            <ChevronRight size={16} className={`text-gray-400 transition-transform duration-300 ${showPwSection ? "rotate-90" : ""}`} />
          </button>

          {showPwSection && (
            <div className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Current Password</label>
                <div className={`flex items-center border-2 rounded-xl px-3 py-2.5 transition-all ${pwErrors.currentPw ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-black"}`}>
                  <Lock size={15} className="text-gray-400 mr-2 flex-shrink-0" />
                  <input type={showCurrent ? "text" : "password"} value={currentPw} onChange={e => { setCurrentPw(e.target.value); setPwErrors({ ...pwErrors, currentPw: "" }); }} placeholder="Enter current password" className="flex-1 outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400" />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="text-gray-400 hover:text-gray-600 ml-1">{showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
                {pwErrors.currentPw && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11} />{pwErrors.currentPw}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">New Password</label>
                <div className={`flex items-center border-2 rounded-xl px-3 py-2.5 transition-all ${pwErrors.newPw ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-black"}`}>
                  <Lock size={15} className="text-gray-400 mr-2 flex-shrink-0" />
                  <input type={showNew ? "text" : "password"} value={newPw} onChange={e => { setNewPw(e.target.value); setPwErrors({ ...pwErrors, newPw: "" }); }} placeholder="Min 6 characters" className="flex-1 outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600 ml-1">{showNew ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
                {pwErrors.newPw && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11} />{pwErrors.newPw}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm New Password</label>
                <div className={`flex items-center border-2 rounded-xl px-3 py-2.5 transition-all ${pwErrors.confirmPw ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-black"}`}>
                  <Lock size={15} className="text-gray-400 mr-2 flex-shrink-0" />
                  <input type={showConfirm ? "text" : "password"} value={confirmPw} onChange={e => { setConfirmPw(e.target.value); setPwErrors({ ...pwErrors, confirmPw: "" }); }} placeholder="Re-enter new password" className="flex-1 outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 ml-1">{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
                {pwErrors.confirmPw && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11} />{pwErrors.confirmPw}</p>}
              </div>

              <button onClick={handleChangePassword} className="w-full bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition mt-1">
                Update Password
              </button>
            </div>
          )}
        </section>

        {/* NOTIFICATIONS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Bell size={14} className="text-gray-500" />
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Notifications</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Case Updates</p>
                <p className="text-xs text-gray-400">Get notified about your consultation status</p>
              </div>
              <Toggle value={notifCase} onChange={setNotifCase} />
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Appointment Reminders</p>
                <p className="text-xs text-gray-400">Reminders before your scheduled sessions</p>
              </div>
              <Toggle value={notifReminder} onChange={setNotifReminder} />
            </div>
            <div className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">Promotions & Offers</p>
                <p className="text-xs text-gray-400">Special deals and discounts</p>
              </div>
              <Toggle value={notifPromo} onChange={setNotifPromo} />
            </div>
          </div>
        </section>

        {/* QUICK LINKS */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Quick Actions</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <QuickLink icon={<Briefcase size={15} className="text-gray-700" />} bg="bg-gray-100" label="My Cases" sub="View all your consultations" onClick={() => navigate("/my-cases")} />
            <QuickLink icon={<PlusCircle size={15} className="text-gray-700" />} bg="bg-gray-100" label="New Consultation" sub="Book a lawyer now" onClick={() => navigate("/client-dashboard/request")} />
            <QuickLink icon={<MessageSquare size={15} className="text-gray-700" />} bg="bg-gray-100" label="Support Chat" sub="Get help from our team" onClick={() => navigate("/support-chat")} />
          </div>
        </section>

        {/* TERMS & PRIVACY */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <FileText size={14} className="text-gray-500" />
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Legal & Privacy</h2>
          </div>
          <div className="divide-y divide-gray-50">
            <button className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition group">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg"><FileText size={15} className="text-gray-500" /></div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Terms of Service</p>
                  <p className="text-xs text-gray-400">Read our terms and conditions</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition" />
            </button>
            <button className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition group">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg"><Shield size={15} className="text-gray-500" /></div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">Privacy Policy</p>
                  <p className="text-xs text-gray-400">How we handle your data</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition" />
            </button>
          </div>
        </section>

        {/* LOGOUT */}
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-100 py-3.5 rounded-2xl text-sm font-semibold transition mb-2">
          <LogOut size={16} /> Sign Out
        </button>

        <p className="text-center text-[10px] text-gray-400 pb-2">FindMyLawyer · Justice Made Accessible</p>
      </main>

      {/* FOOTER */}
      <footer className="bg-black text-white py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Scale size={13} className="text-gray-600" />
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Know Your Legal Rights</span>
            <Scale size={13} className="text-gray-600" />
          </div>
          <p className="text-sm sm:text-base text-white font-medium leading-relaxed transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
            "{rightsFacts[factIndex]}"
          </p>
          <div className="border-t border-white/10 mt-6 pt-4">
            <p className="text-[11px] text-gray-600">© {new Date().getFullYear()} FindMyLawyer · All rights reserved</p>
          </div>
        </div>
      </footer>

    </div>
  );
}