import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Mic, Square, Play, Trash2, AlertCircle, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { bookingsAPI } from "../../api";

const ErrorMsg = ({ error }) =>
  error ? (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
      <AlertCircle size={12} />{error}
    </p>
  ) : null;

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

export default function RequestConsultation() {
  const navigate = useNavigate();

  const [caseType,          setCaseType]         = useState("");
  const [state,             setState]             = useState("");
  const [city,              setCity]              = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [urgency,           setUrgency]           = useState("Flexible");
  const [issue,             setIssue]             = useState("");
  const [consent1,          setConsent1]          = useState(false);
  const [consent2,          setConsent2]          = useState(false);
  const [errors,            setErrors]            = useState({});
  const [submitting,        setSubmitting]        = useState(false);

  const [isRecording,   setIsRecording]   = useState(false);
  const [audioBlob,     setAudioBlob]     = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [factIndex,     setFactIndex]     = useState(0);
  const [visible,       setVisible]       = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef   = useRef([]);
  const timerRef         = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setFactIndex(p => (p + 1) % rightsFacts.length); setVisible(true); }, 500);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const states = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
    "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
    "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
    "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
    "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
    "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu",
    "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
  ];

  const cities = {
    "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Rajahmundry","Tirupati","Kakinada","Anantapur","Kadapa"],
    "Arunachal Pradesh": ["Itanagar","Naharlagun","Pasighat","Tawang","Ziro"],
    "Assam": ["Guwahati","Silchar","Dibrugarh","Jorhat","Nagaon","Tinsukia","Tezpur","Bongaigaon","Dhubri","Karimganj"],
    "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia","Darbhanga","Bihar Sharif","Arrah","Begusarai","Katihar"],
    "Chhattisgarh": ["Raipur","Bhilai","Korba","Bilaspur","Durg","Rajnandgaon","Jagdalpur","Raigarh","Ambikapur","Chirmiri"],
    "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda","Bicholim","Curchorem","Sanquelim"],
    "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Junagadh","Gandhinagar","Anand","Navsari"],
    "Haryana": ["Gurugram","Faridabad","Panipat","Ambala","Yamunanagar","Rohtak","Hisar","Karnal","Sonipat","Panchkula"],
    "Himachal Pradesh": ["Shimla","Manali","Dharamshala","Solan","Mandi","Kangra","Kullu","Bilaspur","Hamirpur","Una"],
    "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Phusro","Hazaribagh","Giridih","Ramgarh","Medininagar"],
    "Karnataka": ["Bangalore","Mysore","Hubli","Mangalore","Belagavi","Kalaburagi","Davanagere","Bellary","Bijapur","Shimoga"],
    "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad","Alappuzha","Malappuram","Kannur","Kottayam"],
    "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar","Dewas","Satna","Ratlam","Rewa"],
    "Maharashtra": ["Mumbai","Pune","Nagpur","Nashik","Aurangabad","Solapur","Amravati","Kolhapur","Nanded","Thane"],
    "Manipur": ["Imphal","Thoubal","Bishnupur","Churachandpur","Senapati"],
    "Meghalaya": ["Shillong","Tura","Jowai","Nongstoin","Williamnagar"],
    "Mizoram": ["Aizawl","Lunglei","Champhai","Serchhip","Kolasib"],
    "Nagaland": ["Kohima","Dimapur","Mokokchung","Tuensang","Wokha"],
    "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Berhampur","Sambalpur","Puri","Balasore","Bhadrak","Baripada","Jharsuguda"],
    "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Hoshiarpur","Batala","Pathankot","Moga"],
    "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur","Bhilwara","Alwar","Bharatpur","Sikar"],
    "Sikkim": ["Gangtok","Namchi","Gyalshing","Mangan","Rangpo"],
    "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Tiruppur","Vellore","Erode","Thoothukudi"],
    "Telangana": ["Hyderabad","Warangal","Nizamabad","Karimnagar","Khammam","Ramagundam","Mahbubnagar","Nalgonda","Adilabad","Suryapet"],
    "Tripura": ["Agartala","Dharmanagar","Udaipur","Kailasahar","Belonia"],
    "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Meerut","Allahabad","Ghaziabad","Noida","Bareilly","Aligarh"],
    "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Rudrapur","Kashipur","Rishikesh","Pithoragarh","Ram Nagar","Manglaur"],
    "West Bengal": ["Kolkata","Howrah","Durgapur","Asansol","Siliguri","Bardhaman","Malda","Baharampur","Habra","Kharagpur"],
    "Andaman and Nicobar Islands": ["Port Blair","Diglipur","Mayabunder","Rangat"],
    "Chandigarh": ["Chandigarh"],
    "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa","Daman","Diu"],
    "Delhi": ["New Delhi","Dwarka","Rohini","Janakpuri","Laxmi Nagar","Saket","Pitampura","Shahdara","Karol Bagh","Connaught Place"],
    "Jammu and Kashmir": ["Srinagar","Jammu","Anantnag","Baramulla","Udhampur","Sopore","Kathua","Punch","Rajouri","Leh"],
    "Ladakh": ["Leh","Kargil"],
    "Lakshadweep": ["Kavaratti","Agatti","Amini"],
    "Puducherry": ["Puducherry","Karaikal","Mahe","Yanam"],
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        setAudioBlob(new Blob(audioChunksRef.current, { type: "audio/webm" }));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);
    } catch { alert("Microphone access denied."); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = s => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,"0")}`;

  const validate = () => {
    const e = {};
    if (!caseType)                e.caseType = "Please select a case type";
    if (!state)                   e.state    = "Please select a state";
    if (!city)                    e.city     = "Please select a city";
    if (issue.trim().length < 10) e.issue    = "Please describe your issue (at least 10 characters)";
    if (!consent1)                e.consent1 = "You must consent to share your contact";
    if (!consent2)                e.consent2 = "You must agree to Terms & Privacy Policy";
    return e;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const el = document.getElementById(`field-${Object.keys(newErrors)[0]}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      // Save consultation request to MongoDB
      await bookingsAPI.create({
        bookingId:   `CONSULT-${Date.now()}`,
        userEmail:   user.email || user.phone || "unknown",
        caseType,
        type:        "consultation-request",
        status:      "pending",
        paymentMethod: "pending",
        slot:        urgency,
        fee:         0,
        lawyer:      "",
        lawyerId:    "",
        bookedAt:    new Date().toISOString(),
        // store extra details in lawyerForum field temporarily
        lawyerForum: JSON.stringify({ state, city, preferredLanguage, urgency, issue }),
      });

      // Navigate to lawyers list with filters
      navigate("/client-dashboard/lawyers", { state: { caseType, urgency, preferredLanguage } });
    } catch (err) {
      console.error("Submit error:", err);
      // Even if save fails, still navigate
      navigate("/client-dashboard/lawyers", { state: { caseType, urgency, preferredLanguage } });
    } finally {
      setSubmitting(false);
    }
  };

  const selectClass = field =>
    `w-full border-2 rounded-xl p-3 text-sm outline-none transition-all bg-white ${
      field && errors[field] ? "border-red-400 bg-red-50 text-gray-900" : "border-gray-200 focus:border-gray-900 text-gray-900"
    }`;

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">

      <div className="bg-gray-900 text-white px-4 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-lg">
        <button onClick={() => navigate(-1)} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-base font-bold">Request Legal Help</h1>
          <p className="text-xs text-gray-400">Tell us about your legal issue</p>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-auto w-full px-4 py-6 space-y-6">

        {/* Case Details */}
        <div className="border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="font-bold text-base text-gray-900">Case Details</h2>

          <div id="field-caseType">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Case Type <span className="text-red-500">*</span></label>
            <select value={caseType} onChange={e => { setCaseType(e.target.value); setErrors({...errors,caseType:""}); }} className={selectClass("caseType")}>
              <option value="">Select case type</option>
              <option>Civil Case</option><option>Criminal Case</option><option>Family Law</option>
              <option>Property Dispute</option><option>Corporate Law</option>
            </select>
            <ErrorMsg error={errors.caseType} />
          </div>

          <div id="field-state">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">State <span className="text-red-500">*</span></label>
            <select value={state} onChange={e => { setState(e.target.value); setCity(""); setErrors({...errors,state:""}); }} className={selectClass("state")}>
              <option value="">Select state</option>
              {states.map(s => <option key={s}>{s}</option>)}
            </select>
            <ErrorMsg error={errors.state} />
          </div>

          <div id="field-city">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">City <span className="text-red-500">*</span></label>
            <select value={city} onChange={e => { setCity(e.target.value); setErrors({...errors,city:""}); }} disabled={!state} className={selectClass("city")}>
              <option value="">Select city</option>
              {state && cities[state]?.map(c => <option key={c}>{c}</option>)}
            </select>
            <ErrorMsg error={errors.city} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Preferred Language</label>
            <select value={preferredLanguage} onChange={e => setPreferredLanguage(e.target.value)} className={selectClass("")}>
              <option value="">Select language</option>
              <option>English</option><option>Hindi</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Urgency</label>
            <select value={urgency} onChange={e => setUrgency(e.target.value)} className={selectClass("")}>
              <option>Flexible</option><option>Urgent</option>
            </select>
          </div>
        </div>

        {/* Issue */}
        <div className="border border-gray-100 rounded-2xl p-5 space-y-3 shadow-sm">
          <h2 className="font-bold text-base text-gray-900">Describe Your Issue</h2>
          <div id="field-issue">
            <div className="relative">
              <textarea value={issue} onChange={e => { setIssue(e.target.value); setErrors({...errors,issue:""}); }}
                placeholder="Describe your legal situation in detail..."
                className={`w-full border-2 rounded-xl p-3 h-32 pr-16 text-sm outline-none resize-none transition-all ${errors.issue ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-gray-900"}`}
              />
              {!isRecording && !audioBlob && (
                <button type="button" onClick={startRecording}
                  className="absolute bottom-3 right-3 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 transition shadow-lg hover:scale-110 active:scale-95">
                  <Mic size={18} />
                </button>
              )}
              {isRecording && (
                <button type="button" onClick={stopRecording}
                  className="absolute bottom-3 right-3 bg-red-600 text-white p-2.5 rounded-full hover:bg-red-700 transition shadow-lg animate-pulse">
                  <Square size={18} />
                </button>
              )}
              {audioBlob && (
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button type="button" onClick={() => new Audio(URL.createObjectURL(audioBlob)).play()}
                    className="bg-green-600 text-white p-2.5 rounded-full hover:bg-green-700 transition shadow-lg"><Play size={18}/></button>
                  <button type="button" onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
                    className="bg-gray-500 text-white p-2.5 rounded-full hover:bg-gray-600 transition shadow-lg"><Trash2 size={18}/></button>
                </div>
              )}
            </div>
            <ErrorMsg error={errors.issue} />
            {isRecording && <p className="text-xs text-red-600 flex items-center gap-2 font-medium mt-1"><span className="w-2 h-2 bg-red-600 rounded-full animate-pulse inline-block"/>Recording… {formatTime(recordingTime)}</p>}
            {audioBlob && !isRecording && <p className="text-xs text-green-600 flex items-center gap-2 font-medium mt-1"><span className="w-2 h-2 bg-green-600 rounded-full inline-block"/>Voice message recorded ({formatTime(recordingTime)})</p>}
            {!isRecording && !audioBlob && <p className="text-xs text-gray-400 flex items-center gap-1 mt-1"><Mic size={11} className="text-blue-500"/>Tap the mic to record a voice message</p>}
          </div>
        </div>

        {/* Consents */}
        <div className="border border-gray-100 rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="font-bold text-base text-gray-900">Consent</h2>
          <div id="field-consent1">
            <label className={`flex items-start gap-3 cursor-pointer rounded-xl p-3 border-2 transition-all ${errors.consent1 ? "border-red-400 bg-red-50" : "border-gray-100 hover:border-gray-300"}`}>
              <input type="checkbox" checked={consent1} onChange={() => { setConsent1(!consent1); setErrors({...errors,consent1:""}); }} className="mt-0.5 accent-gray-900 w-4 h-4 flex-shrink-0"/>
              <span className="text-sm text-gray-700">I consent to share my contact information with matched lawyers. <span className="text-red-500">*</span></span>
            </label>
            <ErrorMsg error={errors.consent1}/>
          </div>
          <div id="field-consent2">
            <label className={`flex items-start gap-3 cursor-pointer rounded-xl p-3 border-2 transition-all ${errors.consent2 ? "border-red-400 bg-red-50" : "border-gray-100 hover:border-gray-300"}`}>
              <input type="checkbox" checked={consent2} onChange={() => { setConsent2(!consent2); setErrors({...errors,consent2:""}); }} className="mt-0.5 accent-gray-900 w-4 h-4 flex-shrink-0"/>
              <span className="text-sm text-gray-700">I agree to the Terms of Service & Privacy Policy. <span className="text-red-500">*</span></span>
            </label>
            <ErrorMsg error={errors.consent2}/>
          </div>
        </div>

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full py-4 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-gray-700 transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2">
          {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Saving...</> : "Find My Lawyer →"}
        </button>
      </div>

      <footer className="bg-gray-900 text-white py-8 px-4 mt-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Scale size={13} className="text-gray-500"/>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Know Your Legal Rights</span>
            <Scale size={13} className="text-gray-500"/>
          </div>
          <p className="text-sm text-white font-medium leading-relaxed transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
            "{rightsFacts[factIndex]}"
          </p>
          <div className="border-t border-gray-800 mt-6 pt-4">
            <p className="text-[11px] text-gray-600">© {new Date().getFullYear()} FindMyLawyer · All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}