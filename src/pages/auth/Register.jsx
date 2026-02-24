import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Lock, Home, CheckCircle, AlertCircle, Eye, EyeOff, Scale, Search } from "lucide-react";
import { useState, useEffect } from "react";

const FieldWrapper = ({ id, label, required, error, children }) => (
  <div id={`field-${id}`}>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

// Pincode → City mapping (India)
const PINCODE_CITY_MAP = {
  "110001": "New Delhi", "110002": "New Delhi", "110003": "New Delhi",
  "400001": "Mumbai",    "400002": "Mumbai",    "400003": "Mumbai",
  "700001": "Kolkata",   "700002": "Kolkata",   "600001": "Chennai",
  "600002": "Chennai",   "560001": "Bangalore", "560002": "Bangalore",
  "500001": "Hyderabad", "500002": "Hyderabad", "411001": "Pune",
  "380001": "Ahmedabad", "302001": "Jaipur",    "226001": "Lucknow",
  "800001": "Patna",     "462001": "Bhopal",    "492001": "Raipur",
  "641001": "Coimbatore","530001": "Visakhapatnam","248001": "Dehradun",
  "682001": "Kochi",     "695001": "Thiruvananthapuram","743101": "Kolkata",
  "201001": "Ghaziabad", "121001": "Faridabad", "122001": "Gurugram",
  "160001": "Chandigarh","171001": "Shimla",    "194101": "Leh",
  "781001": "Guwahati",  "793001": "Shillong",  "737101": "Gangtok",
};

const INDIAN_CITIES = [
  "New Delhi","Mumbai","Kolkata","Chennai","Bangalore","Hyderabad","Pune",
  "Ahmedabad","Jaipur","Lucknow","Patna","Bhopal","Raipur","Coimbatore",
  "Visakhapatnam","Dehradun","Kochi","Thiruvananthapuram","Ghaziabad",
  "Faridabad","Gurugram","Chandigarh","Shimla","Guwahati","Shillong",
  "Surat","Vadodara","Indore","Nagpur","Agra","Varanasi","Kanpur",
  "Meerut","Amritsar","Ludhiana","Jodhpur","Udaipur","Kota","Ajmer",
];

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

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "",
    city: "", pincode: "",
    password: "", confirmPassword: "",
  });

  const [errors,       setErrors]       = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const [otpSent,     setOtpSent]     = useState(false);
  const [otpValue,    setOtpValue]    = useState("");
  const [otpInput,    setOtpInput]    = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError,    setOtpError]    = useState("");
  const [sendingOtp,  setSendingOtp]  = useState(false);
  const [otpTimer,    setOtpTimer]    = useState(0);

  // City dropdown
  const [citySearch,   setCitySearch]   = useState("");
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [pincodeMsg,   setPincodeMsg]   = useState("");

  const [factIndex, setFactIndex] = useState(0);
  const [visible,   setVisible]   = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setFactIndex(prev => (prev + 1) % rightsFacts.length); setVisible(true); }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Close city dropdown on outside click
  useEffect(() => {
    const handler = () => setShowCityDrop(false);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  // Auto-fetch city from pincode
  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData(prev => ({ ...prev, pincode: val }));
    if (errors.pincode) setErrors(prev => ({ ...prev, pincode: "" }));

    if (val.length === 6) {
      const city = PINCODE_CITY_MAP[val];
      if (city) {
        setFormData(prev => ({ ...prev, pincode: val, city }));
        setCitySearch(city);
        setPincodeMsg(`✓ City auto-filled: ${city}`);
        if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
      } else {
        setPincodeMsg("Pincode not found — please select city manually");
      }
    } else {
      setPincodeMsg("");
    }
  };

  const filteredCities = INDIAN_CITIES.filter(c =>
    c.toLowerCase().includes(citySearch.toLowerCase())
  );

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim())   newErrors.fullName = "Full name is required";
    if (!formData.email.trim())      newErrors.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                                     newErrors.email    = "Enter a valid email";
    if (!formData.phone.trim())      newErrors.phone    = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, "")))
                                     newErrors.phone    = "Enter a valid 10-digit Indian mobile number";
    if (!formData.city.trim())       newErrors.city     = "City is required";
    if (!formData.pincode.trim())    newErrors.pincode  = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode))
                                     newErrors.pincode  = "Enter a valid 6-digit pincode";
    if (!formData.password)          newErrors.password = "Password is required";
    else if (formData.password.length < 6)
                                     newErrors.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword)   newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
                                     newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSendOtp = () => {
    if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ""))) {
      setErrors({ ...errors, phone: "Enter a valid 10-digit Indian mobile number" });
      return;
    }
    setSendingOtp(true);
    setOtpError("");
    setTimeout(() => {
      const generated = Math.floor(100000 + Math.random() * 900000).toString();
      setOtpValue(generated);
      setOtpSent(true);
      setSendingOtp(false);
      alert(`[DEMO] Your OTP is: ${generated}`);
      let seconds = 60;
      setOtpTimer(seconds);
      const interval = setInterval(() => {
        seconds -= 1;
        setOtpTimer(seconds);
        if (seconds <= 0) clearInterval(interval);
      }, 1000);
    }, 1200);
  };

  const handleVerifyOtp = () => {
    if (otpInput === otpValue) {
      setOtpVerified(true);
      setOtpError("");
      if (errors.otp) setErrors({ ...errors, otp: "" });
    } else {
      setOtpError("Incorrect OTP. Please try again.");
    }
  };

  const handleRegister = () => {
    // ✅ OTP check first — clear visible warning
    if (!otpVerified) {
      setErrors(prev => ({ ...prev, otp: "Please verify your phone number with OTP first." }));
      const el = document.getElementById("field-phone");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstKey = Object.keys(newErrors)[0];
      const el = document.getElementById(`field-${firstKey}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const existingUsers = JSON.parse(localStorage.getItem("registered_users") || "{}");
    if (existingUsers[formData.email.toLowerCase()]) {
      setErrors({ email: "This email is already registered. Please login." });
      const el = document.getElementById("field-email");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    existingUsers[formData.email.toLowerCase()] = {
      name:     formData.fullName,
      email:    formData.email.toLowerCase(),
      phone:    formData.phone,
      city:     formData.city,
      pincode:  formData.pincode,
      password: formData.password,
      role:     "client",
    };
    localStorage.setItem("registered_users", JSON.stringify(existingUsers));

    const { password: _pw, ...sessionData } = existingUsers[formData.email.toLowerCase()];
    localStorage.setItem("user", JSON.stringify(sessionData));
    navigate("/client-dashboard");
  };

  const inputClass = (field) =>
    `flex items-center border-2 rounded-xl px-4 py-3 transition-all ${
      errors[field]
        ? "border-red-400 bg-red-50"
        : "border-gray-200 bg-white focus-within:border-gray-900"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">

      <div className="flex-1 flex justify-center px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-6 sm:p-10 h-fit">

          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User size={26} className="text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">Join FindMyLawyer as a client</p>
          </div>

          <div className="space-y-5">

            {/* Full Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldWrapper id="fullName" label="Full Name" required error={errors.fullName}>
                <div className={inputClass("fullName")}>
                  <User size={17} className="text-gray-400 mr-2 flex-shrink-0" />
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400" />
                </div>
              </FieldWrapper>
              <FieldWrapper id="email" label="Email" required error={errors.email}>
                <div className={inputClass("email")}>
                  <Mail size={17} className="text-gray-400 mr-2 flex-shrink-0" />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400" />
                </div>
              </FieldWrapper>
            </div>

            {/* Phone + OTP */}
            <FieldWrapper id="phone" label="Phone Number" required error={errors.phone}>
              <div className="flex gap-2">
                <div className={`flex-1 ${inputClass("phone")}`}>
                  <Phone size={17} className="text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="tel" name="phone" value={formData.phone} maxLength={10} disabled={otpVerified}
                    onChange={(e) => { handleChange(e); setOtpSent(false); setOtpVerified(false); setOtpInput(""); setOtpError(""); if(errors.otp) setErrors(p=>({...p,otp:""})); }}
                    placeholder="9876543210"
                    className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400 disabled:opacity-60"
                  />
                  {otpVerified && <CheckCircle size={17} className="text-emerald-500 flex-shrink-0" />}
                </div>
                {!otpVerified && (
                  <button type="button" onClick={handleSendOtp} disabled={sendingOtp || otpTimer > 0}
                    className="flex-shrink-0 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl hover:bg-gray-700 transition disabled:opacity-50 whitespace-nowrap">
                    {sendingOtp ? "Sending…" : otpTimer > 0 ? `Resend (${otpTimer}s)` : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                )}
              </div>
              {/* ✅ OTP not verified warning — always visible */}
              {errors.otp && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
                  <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">{errors.otp}</p>
                </div>
              )}
            </FieldWrapper>

            {otpSent && !otpVerified && (
              <FieldWrapper id="otp" label="Enter OTP" required error={otpError}>
                <div className="flex gap-2">
                  <div className={`flex-1 flex items-center border-2 rounded-xl px-4 py-3 transition-all ${otpError ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-gray-900"}`}>
                    <input type="text" value={otpInput} onChange={(e) => { setOtpInput(e.target.value); setOtpError(""); }} placeholder="Enter 6-digit OTP" maxLength={6} className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400 tracking-widest font-mono" />
                  </div>
                  <button type="button" onClick={handleVerifyOtp} className="flex-shrink-0 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl hover:bg-emerald-700 transition">
                    Verify OTP
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1">OTP sent to +91 {formData.phone}</p>
              </FieldWrapper>
            )}

            {otpVerified && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                <p className="text-sm text-emerald-700 font-semibold">Phone number verified successfully!</p>
              </div>
            )}

            {/* Pincode + City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Pincode — auto fills city */}
              <FieldWrapper id="pincode" label="Pincode" required error={errors.pincode}>
                <div className={inputClass("pincode")}>
                  <Home size={17} className="text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text" name="pincode" value={formData.pincode}
                    onChange={handlePincodeChange}
                    placeholder="110001" maxLength={6}
                    className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400"
                  />
                </div>
                {pincodeMsg && (
                  <p className={`text-xs mt-1 ${pincodeMsg.startsWith("✓") ? "text-emerald-600" : "text-amber-600"}`}>
                    {pincodeMsg}
                  </p>
                )}
              </FieldWrapper>

              {/* City — searchable dropdown */}
              <FieldWrapper id="city" label="City" required error={errors.city}>
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                  <div className={inputClass("city")}>
                    <MapPin size={17} className="text-gray-400 mr-2 flex-shrink-0" />
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setFormData(prev => ({ ...prev, city: e.target.value }));
                        setShowCityDrop(true);
                        if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                      }}
                      onFocus={() => setShowCityDrop(true)}
                      placeholder="Search city…"
                      className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400"
                    />
                    <Search size={14} className="text-gray-400 flex-shrink-0" />
                  </div>
                  {showCityDrop && filteredCities.length > 0 && (
                    <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-44 overflow-y-auto">
                      {filteredCities.map(city => (
                        <div
                          key={city}
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, city }));
                            setCitySearch(city);
                            setShowCityDrop(false);
                            if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                          }}
                          className="px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer"
                        >
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FieldWrapper>
            </div>

            {/* Password + Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldWrapper id="password" label="Password" required error={errors.password}>
                <div className={inputClass("password")}>
                  <Lock size={17} className="text-gray-400 mr-2 flex-shrink-0" />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FieldWrapper>
              <FieldWrapper id="confirmPassword" label="Confirm Password" required error={errors.confirmPassword}>
                <div className={inputClass("confirmPassword")}>
                  <Lock size={17} className="text-gray-400 mr-2 flex-shrink-0" />
                  <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FieldWrapper>
            </div>

          </div>

          <button onClick={handleRegister} className="w-full bg-gray-900 text-white py-3.5 rounded-xl mt-8 font-semibold text-sm hover:bg-gray-700 transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]">
            Create Account →
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="text-gray-900 font-semibold cursor-pointer hover:underline">Login</span>
          </p>

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
          <p className="text-sm sm:text-base text-white font-medium leading-relaxed transition-opacity duration-500 px-2" style={{ opacity: visible ? 1 : 0 }}>
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