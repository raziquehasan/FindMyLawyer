import { useState, useEffect } from "react";
import {
  User,
  Briefcase,
  Mail,
  Lock,
  ArrowRight,
  Scale,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [role, setRole] = useState("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [factIndex, setFactIndex] = useState(0);
  const navigate = useNavigate();

  const rightsFacts = [
    "You have the right to consult a lawyer before questioning.",
    "You have the right to remain silent.",
    "You are entitled to legal aid if you cannot afford a lawyer.",
    "You must be informed of the charges before arrest.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % rightsFacts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const extractedName = email.split("@")[0];
    const formattedName = extractedName
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const userData = { name: formattedName, email, role };
    localStorage.setItem("user", JSON.stringify(userData));

    if (role === "client") {
      const userBookingsKey = `bookings_${email}`;
      const existingBookings = localStorage.getItem(userBookingsKey);
      const hasBookings = existingBookings && JSON.parse(existingBookings).length > 0;
      navigate(hasBookings ? "/my-cases" : "/client-dashboard");
    } else {
      alert("Lawyer dashboard coming soon.");
    }
  };

  return (
    <div className="min-h-screen flex font-sans">

      {/* LEFT PANEL */}
      <div className="hidden md:flex w-1/2 bg-black text-white flex-col justify-between p-16 relative">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

        {/* Branding */}
        <div className="relative z-10">
          <Scale size={60} />
          <h1 className="text-4xl font-serif font-semibold mt-6">FindMyLawyer</h1>
          <p className="text-gray-400 mt-4 text-lg">Justice Made Accessible</p>
        </div>

        {/* Features */}
        <div className="relative z-10">
          <h3 className="text-xl mb-6 font-semibold">For Clients</h3>
          <ul className="space-y-4 text-gray-300">
            <li>✓ Connect with verified lawyers</li>
            <li>✓ Secure case management</li>
            <li>✓ Real-time consultation</li>
          </ul>
        </div>

        {/* Did You Know */}
        <div className="relative z-10 text-gray-400 text-sm">
          <p className="font-semibold mb-2">Did You Know?</p>
          <p className="text-gray-500 transition-all duration-500">
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
              onClick={() => setRole("client")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition ${
                role === "client" ? "bg-black text-white" : "text-gray-600"
              }`}
            >
              <User size={18} /> Client
            </button>
            <button
              onClick={() => setRole("lawyer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition ${
                role === "lawyer" ? "bg-black text-white" : "text-gray-600"
              }`}
            >
              <Briefcase size={18} /> Lawyer
            </button>
          </div>

          <h2 className="text-3xl font-semibold mb-2">Welcome</h2>
          <p className="text-gray-500 mb-8">Sign in to your {role} account</p>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="flex items-center border rounded-lg px-4 py-3 bg-white">
              <Mail size={18} className="text-gray-400 mr-2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-sm font-medium mb-2">Password</label>
            <div className="flex items-center border rounded-lg px-4 py-3 bg-white">
              <Lock size={18} className="text-gray-400 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="flex justify-between items-center mb-6 text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" /> Remember me
            </label>
            <button className="text-black font-medium hover:underline">Forgot password?</button>
          </div>

          {/* Sign In */}
          <button
            onClick={handleLogin}
            className="w-full bg-black text-white py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            Sign In <ArrowRight size={18} />
          </button>

          {/* Divider */}
          <div className="flex items-center my-8">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-3 text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Register */}
          <div className="border rounded-xl p-6 text-center bg-white">
            <p className="text-gray-600 mb-2">Don&apos;t have an account yet?</p>
            <button
              onClick={() => navigate("/register")}
              className="font-semibold text-black hover:underline"
            >
              Register as {role === "client" ? "Client" : "Lawyer"} →
            </button>
          </div>

          {/* Encryption note */}
          <div className="text-center text-gray-400 text-sm mt-4">
            Secured with 256-bit encryption
          </div>

          {/* ── India's trusted law platform tagline ── */}
          <div className="flex items-center justify-center gap-1.5 mt-6 text-gray-400 text-xs">
            <span>India's most trusted legal platform</span>
            <span className="text-red-500 text-sm">♥</span>
            <span>made for every citizen</span>
          </div>

        </div>
      </div>
    </div>
  );
}