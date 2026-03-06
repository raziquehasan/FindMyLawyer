import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, MapPin, Lock, Home, CheckCircle, AlertCircle, Eye, EyeOff, Scale, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { auth, googleProvider } from "../../firebase";
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { authAPI } from "../../api";

const FieldWrapper = ({ id, label, required, error, children }) => (
  <div id={`field-${id}`}>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5"><AlertCircle size={12}/>{error}</p>}
  </div>
);

const PINCODE_CITY_MAP = {
  "110001":"New Delhi","110002":"New Delhi","110003":"New Delhi",
  "400001":"Mumbai","400002":"Mumbai","400003":"Mumbai",
  "700001":"Kolkata","700002":"Kolkata","600001":"Chennai",
  "600002":"Chennai","560001":"Bangalore","560002":"Bangalore",
  "500001":"Hyderabad","500002":"Hyderabad","411001":"Pune",
  "380001":"Ahmedabad","302001":"Jaipur","226001":"Lucknow",
  "800001":"Patna","462001":"Bhopal","492001":"Raipur",
  "641001":"Coimbatore","530001":"Visakhapatnam","248001":"Dehradun",
  "682001":"Kochi","695001":"Thiruvananthapuram","743101":"Kolkata",
  "201001":"Ghaziabad","121001":"Faridabad","122001":"Gurugram",
  "160001":"Chandigarh","171001":"Shimla","194101":"Leh",
  "781001":"Guwahati","793001":"Shillong","737101":"Gangtok",
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
    fullName:"", email:"", phone:"", city:"", pincode:"", password:"", confirmPassword:"",
  });

  const [errors,       setErrors]       = useState({});
  const [loading,      setLoading]      = useState(false);
  const [gLoading,     setGLoading]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  // OTP state
  const [otpSent,      setOtpSent]      = useState(false);
  const [otpInput,     setOtpInput]     = useState("");
  const [otpVerified,  setOtpVerified]  = useState(false);
  const [otpError,     setOtpError]     = useState("");
  const [sendingOtp,   setSendingOtp]   = useState(false);
  const [otpTimer,     setOtpTimer]     = useState(0);
  const [confirmResult,setConfirmResult]= useState(null);
  const [showRecaptcha,setShowRecaptcha]= useState(false);

  const [citySearch,   setCitySearch]   = useState("");
  const [showCityDrop, setShowCityDrop] = useState(false);
  const [pincodeMsg,   setPincodeMsg]   = useState("");
  const [factIndex,    setFactIndex]    = useState(0);
  const [visible,      setVisible]      = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setFactIndex(p => (p+1) % rightsFacts.length); setVisible(true); }, 500);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

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

  const handlePincodeChange = (e) => {
    const val = e.target.value.replace(/\D/g,"").slice(0,6);
    setFormData(p => ({ ...p, pincode: val }));
    if (errors.pincode) setErrors(p => ({ ...p, pincode:"" }));
    if (val.length === 6) {
      const city = PINCODE_CITY_MAP[val];
      if (city) {
        setFormData(p => ({ ...p, pincode:val, city }));
        setCitySearch(city);
        setPincodeMsg(`✓ City auto-filled: ${city}`);
        if (errors.city) setErrors(p => ({ ...p, city:"" }));
      } else {
        setPincodeMsg("Pincode not found — please select city manually");
      }
    } else { setPincodeMsg(""); }
  };

  const filteredCities = INDIAN_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()));

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim())  e.fullName = "Full name is required";
    if (!formData.email.trim())     e.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Enter a valid email";
    if (!formData.phone.trim())     e.phone    = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g,""))) e.phone = "Enter a valid 10-digit Indian mobile number";
    if (!formData.city.trim())      e.city     = "City is required";
    if (!formData.pincode.trim())   e.pincode  = "Pincode is required";
    else if (!/^\d{6}$/.test(formData.pincode)) e.pincode = "Enter a valid 6-digit pincode";
    if (!formData.password)         e.password = "Password is required";
    else if (formData.password.length < 6) e.password = "Password must be at least 6 characters";
    if (!formData.confirmPassword)  e.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  // ── GOOGLE REGISTER ──────────────────────────────────
  const handleGoogle = async () => {
    setGLoading(true); setErrors({});
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await authAPI.google(result.user.uid, result.user.displayName, result.user.email, result.user.photoURL);
      localStorage.setItem("user", JSON.stringify({
        name: result.user.displayName, email: result.user.email,
        uid: result.user.uid, photo: result.user.photoURL,
      }));
      navigate("/client-dashboard");
    } catch {
      setErrors({ general: "Google sign-up failed. Please try again." });
    } finally { setGLoading(false); }
  };

  // ── SEND REAL OTP ─────────────────────────────────────
  const handleSendOtp = async () => {
    const cleaned = formData.phone.replace(/\s/g,"");
    if (!/^[6-9]\d{9}$/.test(cleaned)) {
      setErrors({ ...errors, phone: "Enter a valid 10-digit Indian mobile number" }); return;
    }
    setSendingOtp(true); setOtpError("");
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-register", {
        size: "normal",
        callback: async (token) => {
          // reCAPTCHA solved — now send OTP
          const result = await signInWithPhoneNumber(auth, `+91${cleaned}`, window.recaptchaVerifier);
          setConfirmResult(result);
          setOtpSent(true);
          setShowRecaptcha(false);
          let s = 30; setOtpTimer(s);
          const iv = setInterval(() => { s--; setOtpTimer(s); if (s<=0) clearInterval(iv); }, 1000);
          setSendingOtp(false);
        },
        "expired-callback": () => {
          window.recaptchaVerifier = null;
          setShowRecaptcha(false);
          setSendingOtp(false);
          setOtpError("reCAPTCHA expired. Please try again.");
        },
      });
      await window.recaptchaVerifier.render();
      setShowRecaptcha(true);
      setSendingOtp(false);
    } catch (err) {
      console.error("OTP error:", err);
      setOtpError("Failed to send OTP. Please try again.");
      if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; }
      setSendingOtp(false);
    }
  };

  const [verifying, setVerifying] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otpInput || otpInput.length < 6) { setOtpError("Enter the 6-digit OTP"); return; }
    setVerifying(true);
    try {
      await confirmResult.confirm(otpInput);
      setOtpVerified(true); setOtpError("");
      if (errors.otp) setErrors({ ...errors, otp:"" });
    } catch {
      setOtpError("Incorrect OTP. Please try again.");
    } finally { setVerifying(false); }
  };

  // ── REGISTER ──────────────────────────────────────────
  const handleRegister = async () => {
    if (!otpVerified) {
      setErrors(p => ({ ...p, otp:"Please verify your phone number with OTP first." }));
      document.getElementById("field-phone")?.scrollIntoView({ behavior:"smooth", block:"center" });
      return;
    }
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      document.getElementById(`field-${Object.keys(newErrors)[0]}`)?.scrollIntoView({ behavior:"smooth", block:"center" });
      return;
    }
    setLoading(true); setErrors({});
    try {
      // Create Firebase email/password account
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(result.user, { displayName: formData.fullName });
      // Save to MongoDB
      const { user } = await authAPI.register({
        name: formData.fullName, email: formData.email,
        phone: formData.phone, city: formData.city,
        pincode: formData.pincode, password: formData.password,
        uid: result.user.uid, role: "client",
      });
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/client-dashboard");
    } catch (err) {
      if (err.code === "auth/email-already-in-use")
        setErrors({ email: "Email already registered. Please login." });
      else if (err.message?.includes("email"))
        setErrors({ email: err.message });
      else
        setErrors({ general: err.message || "Registration failed." });
    } finally { setLoading(false); }
  };

  const inputClass = (field) =>
    `flex items-center border-2 rounded-xl px-4 py-3 transition-all ${
      errors[field] ? "border-red-400 bg-red-50" : "border-gray-200 bg-white focus-within:border-gray-900"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <div id="recaptcha-register" className={showRecaptcha ? "flex justify-center my-3" : "hidden"}/>
      <div className="flex-1 flex justify-center px-4 py-10">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-6 sm:p-10 h-fit">

          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User size={26} className="text-white"/>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mt-1">Join FindMyLawyer as a client</p>
          </div>

          {/* Google button */}
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
            {gLoading ? "Signing up..." : "Sign up instantly with Google"}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200"/>
            <span className="text-xs text-gray-400">or fill the form below</span>
            <div className="flex-1 h-px bg-gray-200"/>
          </div>

          {errors.general && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              <AlertCircle size={14}/>{errors.general}
            </div>
          )}

          <div className="space-y-5">
            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldWrapper id="fullName" label="Full Name" required error={errors.fullName}>
                <div className={inputClass("fullName")}>
                  <User size={17} className="text-gray-400 mr-2 flex-shrink-0"/>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400"/>
                </div>
              </FieldWrapper>
              <FieldWrapper id="email" label="Email" required error={errors.email}>
                <div className={inputClass("email")}>
                  <Mail size={17} className="text-gray-400 mr-2 flex-shrink-0"/>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400"/>
                </div>
              </FieldWrapper>
            </div>

            {/* Phone + Real OTP */}
            <FieldWrapper id="phone" label="Phone Number" required error={errors.phone}>
              <div className="flex gap-2">
                <div className={`flex-1 ${inputClass("phone")}`}>
                  <span className="text-sm text-gray-500 mr-2 font-medium flex-shrink-0">+91</span>
                  <input type="tel" name="phone" value={formData.phone} maxLength={10} disabled={otpVerified}
                    onChange={e => { handleChange(e); setOtpSent(false); setOtpVerified(false); setOtpInput(""); setOtpError(""); if(errors.otp) setErrors(p=>({...p,otp:""})); }}
                    placeholder="9876543210"
                    className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400 disabled:opacity-60"/>
                  {otpVerified && <CheckCircle size={17} className="text-emerald-500 flex-shrink-0"/>}
                </div>
                {!otpVerified && (
                  <button type="button" onClick={handleSendOtp} disabled={sendingOtp || otpTimer > 0}
                    className="flex-shrink-0 bg-gray-900 text-white text-xs font-semibold px-4 py-3 rounded-xl hover:bg-gray-700 transition disabled:opacity-50 whitespace-nowrap">
                    {sendingOtp ? "Sending…" : otpTimer > 0 ? `Resend in ${otpTimer}s` : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                )}
              </div>
              {errors.otp && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-2">
                  <AlertCircle size={14} className="text-amber-600 flex-shrink-0"/>
                  <p className="text-xs text-amber-700 font-medium">{errors.otp}</p>
                </div>
              )}
              {otpError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-2">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0"/>
                  <p className="text-xs text-red-600 font-medium">{otpError}</p>
                </div>
              )}
            </FieldWrapper>

            {otpSent && !otpVerified && (
              <>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <CheckCircle size={15} className="text-blue-500 flex-shrink-0"/>
                  <p className="text-xs text-blue-700 font-medium">OTP sent to +91 {formData.phone}! Check your messages.</p>
                </div>
                <FieldWrapper id="otp" label="Enter OTP" required error={otpError}>
                  <div className="flex gap-2">
                    <div className={`flex-1 flex items-center border-2 rounded-xl px-4 py-3 transition-all ${otpError ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-gray-900"}`}>
                      <input type="text" value={otpInput} onChange={e => { setOtpInput(e.target.value.replace(/\D/g,"")); setOtpError(""); }}
                        placeholder="Enter 6-digit OTP" maxLength={6}
                        className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400 tracking-widest font-mono"/>
                    </div>
                    <button type="button" onClick={handleVerifyOtp} disabled={verifying}
                      className="flex-shrink-0 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 flex items-center gap-1.5">
                      {verifying
                        ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Verifying...</>
                        : "Verify ✓"}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">+91 {formData.phone} {otpTimer > 0 && `· Resend in ${otpTimer}s`}</p>
                </FieldWrapper>
              </>
            )}

            {otpVerified && (
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <CheckCircle size={16} className="text-emerald-600 flex-shrink-0"/>
                <p className="text-sm text-emerald-700 font-semibold">Phone number verified!</p>
              </div>
            )}

            {/* Pincode + City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldWrapper id="pincode" label="Pincode" required error={errors.pincode}>
                <div className={inputClass("pincode")}>
                  <Home size={17} className="text-gray-400 mr-2 flex-shrink-0"/>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handlePincodeChange} placeholder="110001" maxLength={6}
                    className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400"/>
                </div>
                {pincodeMsg && <p className={`text-xs mt-1 ${pincodeMsg.startsWith("✓") ? "text-emerald-600" : "text-amber-600"}`}>{pincodeMsg}</p>}
              </FieldWrapper>

              <FieldWrapper id="city" label="City" required error={errors.city}>
                <div className="relative" onMouseDown={e => e.stopPropagation()}>
                  <div className={inputClass("city")}>
                    <MapPin size={17} className="text-gray-400 mr-2 flex-shrink-0"/>
                    <input type="text" value={citySearch}
                      onChange={e => { setCitySearch(e.target.value); setFormData(p=>({...p,city:e.target.value})); setShowCityDrop(true); if(errors.city) setErrors(p=>({...p,city:""})); }}
                      onFocus={() => setShowCityDrop(true)}
                      placeholder="Search city…"
                      className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400"/>
                    <Search size={14} className="text-gray-400 flex-shrink-0"/>
                  </div>
                  {showCityDrop && filteredCities.length > 0 && (
                    <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl mt-1 shadow-lg max-h-44 overflow-y-auto">
                      {filteredCities.map(city => (
                        <div key={city}
                          onMouseDown={() => { setFormData(p=>({...p,city})); setCitySearch(city); setShowCityDrop(false); if(errors.city) setErrors(p=>({...p,city:""})); }}
                          className="px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 cursor-pointer">{city}</div>
                      ))}
                    </div>
                  )}
                </div>
              </FieldWrapper>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldWrapper id="password" label="Password" required error={errors.password}>
                <div className={inputClass("password")}>
                  <Lock size={17} className="text-gray-400 mr-2 flex-shrink-0"/>
                  <input type={showPassword?"text":"password"} name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters"
                    className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400"/>
                  <button type="button" onClick={()=>setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1">
                    {showPassword?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </FieldWrapper>
              <FieldWrapper id="confirmPassword" label="Confirm Password" required error={errors.confirmPassword}>
                <div className={inputClass("confirmPassword")}>
                  <Lock size={17} className="text-gray-400 mr-2 flex-shrink-0"/>
                  <input type={showConfirm?"text":"password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password"
                    className="w-full outline-none bg-transparent text-sm text-gray-900 placeholder-gray-400"/>
                  <button type="button" onClick={()=>setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 flex-shrink-0 ml-1">
                    {showConfirm?<EyeOff size={16}/>:<Eye size={16}/>}
                  </button>
                </div>
              </FieldWrapper>
            </div>
          </div>

          <button onClick={handleRegister} disabled={loading}
            className="w-full bg-gray-900 text-white py-3.5 rounded-xl mt-8 font-semibold text-sm hover:bg-gray-700 transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating account...</>
              : "Create Account →"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")} className="text-gray-900 font-semibold cursor-pointer hover:underline">Login</span>
          </p>
        </div>
      </div>

      <footer className="w-full bg-gray-900 text-white py-8 px-4">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Scale size={13} className="text-gray-500"/>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Know Your Legal Rights</span>
            <Scale size={13} className="text-gray-500"/>
          </div>
          <p className="text-sm text-white font-medium leading-relaxed transition-opacity duration-500 px-2" style={{ opacity: visible ? 1 : 0 }}>
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