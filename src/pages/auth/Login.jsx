import { useState, useEffect } from "react";
import {
  User, Briefcase, Mail, Lock, ArrowRight, Scale, AlertCircle, Eye, EyeOff
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role,      setRole]      = useState("client");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [errors,    setErrors]    = useState({});
  const [factIndex, setFactIndex] = useState(0);
  const [visible,   setVisible]   = useState(true);
  const navigate = useNavigate();

  const rightsFacts = [
    "You have the right to consult a lawyer before questioning.",
    "You have the right to remain silent.",
    "You are entitled to legal aid if you cannot afford a lawyer.",
    "You must be informed of the charges before arrest.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFactIndex(prev => (prev + 1) % rightsFacts.length);
        setVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const clearError = (field) => setErrors(prev => ({ ...prev, [field]: "" }));

  const handleLogin = () => {
    const newErrors = {};
    if (!email.trim())    newErrors.email    = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                          newErrors.email    = "Enter a valid email address";
    if (!password.trim()) newErrors.password = "Please enter your password";

    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    if (role === "client") {
      // ✅ Check registered_users in localStorage
      const registeredUsers = JSON.parse(localStorage.getItem("registered_users") || "{}");
      const userRecord = registeredUsers[email.toLowerCase()];

      if (!userRecord) {
        setErrors({ email: "No account found with this email. Please register first." });
        return;
      }

      if (userRecord.password !== password) {
        setErrors({ password: "Incorrect password. Please try again." });
        return;
      }

      // ✅ Valid — set session (without password)
      const { password: _pw, ...sessionData } = userRecord;
      localStorage.setItem("user", JSON.stringify(sessionData));

      const bookingsKey = `bookings_${email.toLowerCase()}`;
      const rawBookings = localStorage.getItem(bookingsKey);
      const hasBookings = rawBookings && JSON.parse(rawBookings).length > 0;
      navigate(hasBookings ? "/my-cases" : "/client-dashboard");

    } else {
      alert("Lawyer dashboard coming soon.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">

      {/* MAIN */}
      <div className="flex flex-1">

        {/* LEFT PANEL */}
        <div className="hidden md:flex w-1/2 bg-black text-white flex-col justify-between p-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

          <div className="relative z-10">
            <Scale size={60} />
            <h1 className="text-4xl font-serif font-semibold mt-6">FindMyLawyer</h1>
            <p className="text-gray-400 mt-4 text-lg">Justice Made Accessible</p>
          </div>

          <div className="relative z-10">
            <h3 className="text-xl mb-6 font-semibold">For Clients</h3>
            <ul className="space-y-4 text-gray-300">
              <li>✓ Connect with verified lawyers</li>
              <li>✓ Secure case management</li>
              <li>✓ Real-time consultation</li>
            </ul>
          </div>

          <div className="relative z-10 text-gray-400 text-sm">
            <p className="font-semibold mb-2">Did You Know?</p>
            <p className="text-gray-500 transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
              {rightsFacts[factIndex]}
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex w-full md:w-1/2 bg-gray-100 items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">

            {/* Role Toggle */}
            <div className="flex bg-gray-200 rounded-full p-1 mb-10">
              <button
                onClick={() => { setRole("client"); setErrors({}); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition text-sm font-medium ${role === "client" ? "bg-black text-white" : "text-gray-600"}`}
              >
                <User size={18} /> Client
              </button>
              <button
                onClick={() => { setRole("lawyer"); setErrors({}); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition text-sm font-medium ${role === "lawyer" ? "bg-black text-white" : "text-gray-600"}`}
              >
                <Briefcase size={18} /> Lawyer
              </button>
            </div>

            <h2 className="text-3xl font-semibold mb-2">Welcome</h2>
            <p className="text-gray-500 mb-8">Sign in to your {role} account</p>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <div className={`flex items-center border-2 rounded-lg px-4 py-3 bg-white transition-all ${errors.email ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-gray-900"}`}>
                <Mail size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                  placeholder="you@example.com"
                  className="w-full outline-none bg-transparent text-sm"
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="mb-5">
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className={`flex items-center border-2 rounded-lg px-4 py-3 bg-white transition-all ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-gray-900"}`}>
                <Lock size={18} className="text-gray-400 mr-2 flex-shrink-0" />
                <input
                  type={showPw ? "text" : "password"} value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError("password"); }}
                  placeholder="Enter your password"
                  className="w-full outline-none bg-transparent text-sm"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            <div className="flex justify-between items-center mb-6 text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" /> Remember me
              </label>
              <button className="text-black font-medium hover:underline">Forgot password?</button>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition font-semibold"
            >
              Sign In <ArrowRight size={18} />
            </button>

            <div className="flex items-center my-8">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="px-3 text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div className="border rounded-xl p-6 text-center bg-white">
              <p className="text-gray-600 mb-2">Don't have an account yet?</p>
              <button onClick={() => navigate("/register")} className="font-semibold text-black hover:underline">
                Register as {role === "client" ? "Client" : "Lawyer"} →
              </button>
            </div>

            <div className="text-center text-gray-400 text-sm mt-4">Secured with 256-bit encryption</div>

            <div className="flex items-center justify-center gap-1.5 mt-6 text-gray-400 text-xs">
              <span>India's most trusted legal platform</span>
              <span className="text-red-500 text-sm">♥</span>
              <span>made for every citizen</span>
            </div>

          </div>
        </div>
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