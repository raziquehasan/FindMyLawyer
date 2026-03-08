import { useState, useEffect } from "react";
import {
  User, Briefcase, Mail, Lock, ArrowRight, Scale, AlertCircle, Eye, EyeOff,
  Shield, Zap, BadgeCheck, Phone, CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { authAPI, otpAPI } from "../../api";

const FACTS = [
  "You have the right to consult a lawyer before questioning.",
  "You have the right to remain silent.",
  "You are entitled to legal aid if you cannot afford a lawyer.",
  "You must be informed of the charges before arrest.",
];

export default function Login() {
  const [role,      setRole]      = useState("client");
  const [tab,       setTab]       = useState("email");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [phone,     setPhone]     = useState("");
  const [otp,       setOtp]       = useState("");
  const [otpSent,   setOtpSent]   = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [gLoading,  setGLoading]  = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpTimer,  setOtpTimer]  = useState(0);
  const [otpError,  setOtpError]  = useState("");
  const [factIndex, setFactIndex] = useState(0);
  const [visible,   setVisible]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setFactIndex(p => (p + 1) % FACTS.length); setVisible(true); }, 400);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const saveSession = (user) => {
    localStorage.setItem("user", JSON.stringify({
      name:  user.displayName || user.email?.split("@")[0] || "User",
      email: user.email,
      phone: user.phoneNumber,
      uid:   user.uid,
      photo: user.photoURL || null,
    }));
  };

  const redirect = (userEmail) => {
    const raw = localStorage.getItem(`bookings_${userEmail?.toLowerCase()}`);
    navigate(raw && JSON.parse(raw).length > 0 ? "/my-cases" : "/client-dashboard");
  };

  // ── GOOGLE ──────────────────────────────────────────
  const handleGoogle = async () => {
    if (role === "lawyer") { alert("Lawyer login coming soon."); return; }
    setGLoading(true); setErrors({});
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await authAPI.google(result.user.uid, result.user.displayName, result.user.email, result.user.photoURL);
      saveSession(result.user);
      redirect(result.user.email);
    } catch {
      setErrors({ general: "Google sign-in failed. Please try again." });
    } finally { setGLoading(false); }
  };

  // ── EMAIL LOGIN ──────────────────────────────────────
  const handleEmailLogin = async () => {
    const errs = {};
    if (!email.trim()) errs.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Enter a valid email";
    if (!password.trim()) errs.password = "Please enter your password";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (role === "lawyer") { alert("Lawyer login coming soon."); return; }
    setLoading(true); setErrors({});
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await authAPI.google(result.user.uid, result.user.displayName, result.user.email, result.user.photoURL);
      saveSession(result.user);
      redirect(result.user.email);
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential")
        setErrors({ email: "No account found. Please register first." });
      else if (err.code === "auth/wrong-password")
        setErrors({ password: "Incorrect password." });
      else
        setErrors({ general: err.message });
    } finally { setLoading(false); }
  };

  // ── PHONE OTP (no reCAPTCHA!) ────────────────────────
  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\s/g, "");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setErrors({ phone: "Enter a valid 10-digit Indian mobile number" }); return;
    }
    setSendingOtp(true); setOtpError(""); setErrors({});
    try {
      await otpAPI.send(cleaned);
      setOtpSent(true);
      let s = 30; setOtpTimer(s);
      const iv = setInterval(() => { s--; setOtpTimer(s); if (s <= 0) clearInterval(iv); }, 1000);
    } catch (err) {
      setOtpError(err.message || "Failed to send OTP. Try again.");
    } finally { setSendingOtp(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) { setOtpError("Enter the 6-digit OTP"); return; }
    setVerifyingOtp(true); setOtpError("");
    try {
      await otpAPI.verify(phone, otp);
      setOtpVerified(true);
      // Save phone session and redirect
      localStorage.setItem("user", JSON.stringify({ phone: `+91${phone}`, name: `User ${phone.slice(-4)}` }));
      redirect(`+91${phone}`);
    } catch (err) {
      setOtpError(err.message || "Incorrect OTP. Please try again.");
    } finally { setVerifyingOtp(false); }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden font-sans">
      <div className="flex flex-1 min-h-0">

        {/* LEFT */}
        <div className="hidden md:flex md:w-1/2 bg-black text-white flex-col justify-between p-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
          <div className="relative z-10">
            <Scale size={60} />
            <h1 className="text-4xl font-serif font-semibold mt-6">FindMyLawyer</h1>
            <p className="text-gray-400 mt-4 text-lg">Talk to a Verified Lawyer Today</p>
          </div>
          <div className="relative z-10">
            <h3 className="text-xl mb-6 font-semibold">For Clients</h3>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3"><BadgeCheck size={20} className="text-blue-400 flex-shrink-0"/><span>Connect with verified lawyers</span></li>
              <li className="flex items-center gap-3"><Shield size={20} className="text-emerald-400 flex-shrink-0"/><span>Secure case management</span></li>
              <li className="flex items-center gap-3"><Zap size={20} className="text-amber-400 flex-shrink-0"/><span>Real-time consultation</span></li>
            </ul>
          </div>
          <div className="relative z-10 text-sm text-gray-400">
            <p className="font-semibold mb-2">Did You Know?</p>
            <p className="text-gray-500 transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>{FACTS[factIndex]}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex w-full md:w-1/2 bg-gray-100 items-start justify-center px-6 py-6 overflow-y-auto">
          <div className="w-full max-w-md my-auto">

            {/* Role toggle */}
            <div className="flex bg-gray-200 rounded-full p-1 mb-6">
              {[["client","Client",User],["lawyer","Lawyer",Briefcase]].map(([r,label,Icon]) => (
                <button key={r} onClick={() => { setRole(r); setErrors({}); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition text-sm font-medium ${role === r ? "bg-black text-white" : "text-gray-600"}`}>
                  <Icon size={16}/>{label}
                </button>
              ))}
            </div>

            <h2 className="text-3xl font-semibold mb-1">Welcome</h2>
            <p className="text-gray-500 mb-5 text-sm">Sign in to your {role} account</p>

            {/* Google */}
            <button onClick={handleGoogle} disabled={gLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-gray-400 text-gray-700 font-semibold text-sm py-3 rounded-xl transition-all shadow-sm hover:shadow-md mb-4 disabled:opacity-60">
              {gLoading
                ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin"/>
                : <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
              }
              {gLoading ? "Signing in..." : "Continue with Google"}
            </button>

            {/* Tabs */}
            <div className="flex bg-gray-200 rounded-xl p-1 mb-4">
              <button onClick={() => { setTab("email"); setErrors({}); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition text-xs font-semibold ${tab === "email" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                <Mail size={14}/> Email
              </button>
              <button onClick={() => { setTab("phone"); setErrors({}); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition text-xs font-semibold ${tab === "phone" ? "bg-white shadow text-gray-900" : "text-gray-500"}`}>
                <Phone size={14}/> Phone OTP
              </button>
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl mb-3">
                <AlertCircle size={13}/>{errors.general}
              </div>
            )}

            {/* EMAIL TAB */}
            {tab === "email" && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1.5">Email Address</label>
                  <div className={`flex items-center border-2 rounded-lg px-4 py-2.5 bg-white transition-all ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-gray-900"}`}>
                    <Mail size={16} className="text-gray-400 mr-2 flex-shrink-0"/>
                    <input type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(p=>({...p,email:""})); }}
                      onKeyDown={e => e.key==="Enter" && handleEmailLogin()}
                      placeholder="you@example.com"
                      className="w-full outline-none bg-transparent text-sm"/>
                  </div>
                  {errors.email && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11}/>{errors.email}</p>}
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <div className={`flex items-center border-2 rounded-lg px-4 py-2.5 bg-white transition-all ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-gray-900"}`}>
                    <Lock size={16} className="text-gray-400 mr-2 flex-shrink-0"/>
                    <input type={showPw?"text":"password"} value={password}
                      onChange={e => { setPassword(e.target.value); setErrors(p=>({...p,password:""})); }}
                      onKeyDown={e => e.key==="Enter" && handleEmailLogin()}
                      placeholder="Enter your password"
                      className="w-full outline-none bg-transparent text-sm"/>
                    <button type="button" onClick={()=>setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600 ml-1">
                      {showPw?<EyeOff size={15}/>:<Eye size={15}/>}
                    </button>
                  </div>
                  {errors.password && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11}/>{errors.password}</p>}
                </div>

                <div className="flex justify-between items-center mb-4 text-sm">
                  <label className="flex items-center gap-2 text-gray-600 cursor-pointer text-xs">
                    <input type="checkbox" className="rounded"/> Remember me
                  </label>
                  <button className="text-black font-medium hover:underline text-xs">Forgot password?</button>
                </div>

                <button onClick={handleEmailLogin} disabled={loading}
                  className="w-full bg-black text-white py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition font-semibold text-sm disabled:opacity-60">
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in...</>
                    : <>Sign In <ArrowRight size={16}/></>}
                </button>
              </>
            )}

            {/* PHONE TAB */}
            {tab === "phone" && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1.5">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className={`flex-1 flex items-center border-2 rounded-lg bg-white transition-all ${errors.phone ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-gray-900"}`}>
                      <span className="px-3 py-2.5 text-sm text-gray-500 border-r border-gray-200 font-medium">+91</span>
                      <input type="tel" value={phone} maxLength={10} disabled={otpVerified}
                        onChange={e => { setPhone(e.target.value.replace(/\D/g,"")); setErrors(p=>({...p,phone:""})); setOtpSent(false); setOtpVerified(false); setOtp(""); setOtpError(""); }}
                        placeholder="9876543210"
                        className="w-full outline-none bg-transparent text-sm px-3 py-2.5 disabled:opacity-60"/>
                      {otpVerified && <CheckCircle size={16} className="text-emerald-500 mr-2 flex-shrink-0"/>}
                    </div>
                    {!otpVerified && (
                      <button onClick={handleSendOtp} disabled={sendingOtp || otpTimer > 0}
                        className="flex-shrink-0 bg-black text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap">
                        {sendingOtp ? "Sending…" : otpTimer > 0 ? `Resend ${otpTimer}s` : otpSent ? "Resend" : "Send OTP"}
                      </button>
                    )}
                  </div>
                  {errors.phone && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11}/>{errors.phone}</p>}
                </div>

                {otpSent && !otpVerified && (
                  <>
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-3">
                      <CheckCircle size={14} className="text-blue-500 flex-shrink-0"/>
                      <p className="text-xs text-blue-700 font-medium">OTP sent to +91 {phone}! Check your messages.</p>
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1.5">Enter OTP</label>
                      <div className="flex gap-2">
                        <div className={`flex-1 flex items-center border-2 rounded-lg px-4 py-2.5 bg-white transition-all ${otpError ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-gray-900"}`}>
                          <input type="text" value={otp} maxLength={6}
                            onChange={e => { setOtp(e.target.value.replace(/\D/g,"")); setOtpError(""); }}
                            placeholder="Enter 6-digit OTP"
                            className="w-full outline-none bg-transparent text-sm tracking-widest font-mono"/>
                        </div>
                        <button onClick={handleVerifyOtp} disabled={verifyingOtp}
                          className="flex-shrink-0 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition disabled:opacity-60">
                          {verifyingOtp ? "Verifying…" : "Verify & Login"}
                        </button>
                      </div>
                      {otpError && <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={11}/>{otpError}</p>}
                      <p className="text-xs text-gray-400 mt-1">{otpTimer > 0 ? `Resend in ${otpTimer}s` : "You can resend OTP now"}</p>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="flex items-center my-4">
              <div className="flex-1 h-px bg-gray-300"/>
              <span className="px-3 text-gray-400 text-xs">or</span>
              <div className="flex-1 h-px bg-gray-300"/>
            </div>

            <div className="border rounded-xl p-4 text-center bg-white">
              <p className="text-gray-600 mb-1 text-sm">Don't have an account yet?</p>
              <button onClick={() => navigate("/register")} className="font-semibold text-black hover:underline text-sm">
                Register as {role === "client" ? "Client" : "Lawyer"} →
              </button>
            </div>

            <div className="flex items-center justify-center mt-4 text-gray-400 text-xs">
              <span>Reimagining legal access for India</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="w-full bg-gray-900 text-white py-3 px-4 flex-shrink-0">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <Scale size={12} className="text-gray-500"/>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-semibold">Know Your Legal Rights</span>
            <Scale size={12} className="text-gray-500"/>
          </div>
          <p className="text-xs text-white font-medium transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
            "{FACTS[factIndex]}"
          </p>
          <div className="w-full border-t border-gray-800 mt-2 pt-2">
            <p className="text-[9px] text-gray-600">© {new Date().getFullYear()} FindMyLawyer · All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}