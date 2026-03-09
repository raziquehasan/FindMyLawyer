import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Star, Briefcase, Clock, Phone, MessageSquare,
  Headphones, Scale, ChevronDown, SlidersHorizontal, X,
  MapPin, CheckCircle
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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

const ALL_LAWYERS = [
  { id: 1, name: "Adv. Rajesh Sharma",  specialization: "Criminal Law",  expYears: 8,  rating: 4.8, reviews: 127, feeNum: 1500, fee: "₹1500", availability: "Today",    city: "New Delhi",  verified: true,  languages: ["Hindi","English"] },
  { id: 2, name: "Adv. Priya Mehta",    specialization: "Family Law",    expYears: 6,  rating: 4.6, reviews: 98,  feeNum: 1200, fee: "₹1200", availability: "Today",    city: "Mumbai",     verified: true,  languages: ["Hindi","English","Marathi"] },
  { id: 3, name: "Adv. Amit Verma",     specialization: "Corporate Law", expYears: 12, rating: 4.9, reviews: 156, feeNum: 2000, fee: "₹2000", availability: "Tomorrow", city: "New Delhi",  verified: true,  languages: ["Hindi","English"] },
  { id: 4, name: "Adv. Sneha Patel",    specialization: "Property Law",  expYears: 9,  rating: 4.7, reviews: 112, feeNum: 1400, fee: "₹1400", availability: "Today",    city: "Ahmedabad",  verified: true,  languages: ["Hindi","English","Gujarati"] },
  { id: 5, name: "Adv. Vikram Singh",   specialization: "Civil Law",     expYears: 4,  rating: 4.3, reviews: 47,  feeNum: 800,  fee: "₹800",  availability: "Tomorrow", city: "Jaipur",     verified: false, languages: ["Hindi","English"] },
  { id: 6, name: "Adv. Meera Krishnan", specialization: "Labour Law",    expYears: 7,  rating: 4.5, reviews: 91,  feeNum: 1100, fee: "₹1100", availability: "Today",    city: "Chennai",    verified: true,  languages: ["English","Tamil"] },
  { id: 7, name: "Adv. Arjun Nair",     specialization: "Tax Law",       expYears: 15, rating: 4.9, reviews: 312, feeNum: 2500, fee: "₹2500", availability: "Tomorrow", city: "Kochi",      verified: true,  languages: ["English","Malayalam"] },
  { id: 8, name: "Adv. Pooja Sharma",   specialization: "Cyber Law",     expYears: 3,  rating: 4.2, reviews: 34,  feeNum: 900,  fee: "₹900",  availability: "Today",    city: "New Delhi",  verified: false, languages: ["Hindi","English"] },
];

const SPECIALIZATIONS = ["All","Criminal Law","Family Law","Corporate Law","Property Law","Civil Law","Labour Law","Tax Law","Cyber Law"];

export default function LawyersList() {
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef  = useRef(null);

  const { caseType } = location.state || {};

  const [factIndex,  setFactIndex]  = useState(0);
  const [visible,    setVisible]    = useState(true);
  const [helpOpen,   setHelpOpen]   = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);


  // Filters
  const [activeSpec,   setActiveSpec]   = useState("All");
  const [minExp,       setMinExp]       = useState(0);
  const [maxFee,       setMaxFee]       = useState(3000);
  const [minRating,    setMinRating]    = useState(0);
  const [avail,        setAvail]        = useState("All");
  const [sortBy,       setSortBy]       = useState("rating");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    if (caseType) {
      const map = { "Criminal Case": "Criminal Law", "Family Law": "Family Law", "Property Dispute": "Property Law", "Corporate Law": "Corporate Law", "Civil Case": "Civil Law" };
      if (map[caseType]) setActiveSpec(map[caseType]);
    }
  }, [caseType]);

  useEffect(() => {
    const iv = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setFactIndex(p => (p + 1) % rightsFacts.length); setVisible(true); }, 500);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const h = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setHelpOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const activeFilterCount = [activeSpec !== "All", minExp > 0, maxFee < 3000, minRating > 0, avail !== "All", verifiedOnly].filter(Boolean).length;

  const resetFilters = () => { setActiveSpec("All"); setMinExp(0); setMaxFee(3000); setMinRating(0); setAvail("All"); setSortBy("rating"); setVerifiedOnly(false); };

  const filtered = ALL_LAWYERS
    .filter(l => {
      if (activeSpec !== "All" && l.specialization !== activeSpec) return false;

      if (l.expYears < minExp)    return false;
      if (l.feeNum   > maxFee)    return false;
      if (l.rating   < minRating) return false;
      if (avail !== "All" && l.availability !== avail) return false;
      if (verifiedOnly && !l.verified) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating")     return b.rating   - a.rating;
      if (sortBy === "experience") return b.expYears - a.expYears;
      if (sortBy === "fee_low")    return a.feeNum   - b.feeNum;
      if (sortBy === "fee_high")   return b.feeNum   - a.feeNum;
      if (sortBy === "reviews")    return b.reviews  - a.reviews;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-4 shadow-lg sticky top-0 z-30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <ArrowLeft className="cursor-pointer hover:scale-110 transition-transform" onClick={() => navigate(-1)} size={22}/>
            <div>
              <h1 className="text-xl font-bold">Available Lawyers</h1>
              <p className="text-sm text-gray-300 mt-0.5">{filtered.length} lawyers{caseType ? ` · ${caseType}` : ""}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter toggle */}
            <button onClick={() => { setFilterOpen(!filterOpen); setHelpOpen(false); }}
              className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border transition-all ${filterOpen ? "bg-white text-gray-900 border-white" : "bg-white/10 hover:bg-white/20 border-white/20 text-white"}`}>
              <SlidersHorizontal size={15}/>
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeFilterCount}</span>}
            </button>

            {/* Help */}
            <div className="relative" ref={dropRef}>
              <button onClick={() => { setHelpOpen(!helpOpen); setFilterOpen(false); }}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-xl transition-all">
                <Headphones size={16}/>
                <span className="hidden sm:inline">Help</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${helpOpen ? "rotate-180" : ""}`}/>
              </button>
              {helpOpen && (
                <div className="absolute right-0 top-12 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Need Help?</p>
                    <p className="text-xs text-gray-400 mt-0.5">Support available 24/7</p>
                  </div>
                  <button onClick={() => { setHelpOpen(false); navigate("/support-chat"); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left group">
                    <div className="bg-gray-900 text-white p-2 rounded-lg group-hover:scale-105 transition-transform"><MessageSquare size={15}/></div>
                    <div><p className="text-sm font-semibold text-gray-900">Chat with Us</p><p className="text-xs text-gray-400">Instant support</p></div>
                  </button>
                  <button onClick={() => { setHelpOpen(false); window.location.href = "tel:1800-123-4567"; }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left group border-t border-gray-50">
                    <div className="bg-gray-900 text-white p-2 rounded-lg group-hover:scale-105 transition-transform"><Phone size={15}/></div>
                    <div><p className="text-sm font-semibold text-gray-900">Call Support</p><p className="text-xs text-gray-400">1800-123-4567</p></div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>

      {/* FILTER PANEL */}
      {filterOpen && (
        <div className="bg-white border-b border-gray-200 shadow-md z-20">
          <div className="max-w-4xl mx-auto px-4 py-5 space-y-5">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><SlidersHorizontal size={15}/> Filter & Sort</h3>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="text-xs text-red-500 font-semibold flex items-center gap-1 hover:text-red-700"><X size={12}/> Reset all</button>
                )}
                <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-700"><X size={16}/></button>
              </div>
            </div>

            {/* Specialization pills */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Specialization</p>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map(s => (
                  <button key={s} onClick={() => setActiveSpec(s)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${activeSpec === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-500"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Min Experience slider */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Min. Experience — <span className="text-gray-900 font-bold">{minExp === 0 ? "Any" : `${minExp}+ yrs`}</span>
                </p>
                <input type="range" min={0} max={15} step={1} value={minExp} onChange={e => setMinExp(+e.target.value)} className="w-full accent-gray-900"/>
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>Any</span><span>5 yrs</span><span>10 yrs</span><span>15 yrs</span></div>
              </div>

              {/* Max Fee slider */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Max. Fee — <span className="text-gray-900 font-bold">₹{maxFee.toLocaleString()}</span>
                </p>
                <input type="range" min={500} max={3000} step={100} value={maxFee} onChange={e => setMaxFee(+e.target.value)} className="w-full accent-gray-900"/>
                <div className="flex justify-between text-[10px] text-gray-400 mt-0.5"><span>₹500</span><span>₹1,500</span><span>₹2,500</span><span>₹3,000</span></div>
              </div>

              {/* Min Rating */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Min. Rating — <span className="text-gray-900 font-bold">{minRating === 0 ? "Any" : `${minRating}★`}</span>
                </p>
                <div className="flex gap-2">
                  {[0, 4.0, 4.3, 4.5, 4.7].map(r => (
                    <button key={r} onClick={() => setMinRating(r)}
                      className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-all ${minRating === r ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                      {r === 0 ? "Any" : `${r}★`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Availability</p>
                <div className="flex gap-2">
                  {["All", "Today", "Tomorrow"].map(a => (
                    <button key={a} onClick={() => setAvail(a)}
                      className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-all ${avail === a ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sort + Verified */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sort:</p>
              {[
                { val: "rating",     label: "Top Rated"    },
                { val: "experience", label: "Most Exp."    },
                { val: "fee_low",    label: "Fee ↑"        },
                { val: "fee_high",   label: "Fee ↓"        },
                { val: "reviews",    label: "Most Reviews" },
              ].map(opt => (
                <button key={opt.val} onClick={() => setSortBy(opt.val)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${sortBy === opt.val ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-500"}`}>
                  {opt.label}
                </button>
              ))}
              <button onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${verifiedOnly ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
                <CheckCircle size={12}/> Verified Only
              </button>
            </div>

            <p className="text-xs text-gray-400">Showing <span className="font-bold text-gray-900">{filtered.length}</span> lawyers</p>
          </div>
        </div>
      )}

      {/* LAWYERS GRID */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <SlidersHorizontal size={40} className="text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-500 font-medium">No lawyers match your filters</p>
            <button onClick={resetFilters} className="mt-3 text-sm text-gray-900 underline font-semibold">Reset filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((lawyer, index) => (
              <div key={lawyer.id}
                className="bg-white rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
                style={{ animation: "fadeIn 0.4s ease-in-out", animationDelay: `${index * 80}ms`, animationFillMode: "both" }}>

                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-bold text-lg text-gray-900">{lawyer.name}</h2>
                      {lawyer.verified && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-100">
                          <CheckCircle size={10}/> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Briefcase size={14} className="text-gray-400"/>
                      <p className="text-sm font-medium text-gray-700">{lawyer.specialization}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={11} className="text-gray-400"/>{lawyer.expYears} yrs exp</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500"><MapPin size={11} className="text-gray-400"/>{lawyer.city}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 ml-2">
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-full border border-amber-200">
                      <Star size={13} fill="#f59e0b" stroke="#f59e0b"/>
                      <span className="text-sm font-bold text-amber-700">{lawyer.rating}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">{lawyer.reviews} reviews</span>
                  </div>
                </div>

                <div className="border-t border-gray-100 my-3"/>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Consultation Fee</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{lawyer.fee}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${lawyer.availability === "Today" ? "text-green-700 bg-green-50 border border-green-200" : "text-orange-600 bg-orange-50 border border-orange-200"}`}>
                    {lawyer.availability === "Today" ? "Available Today" : "Available Tomorrow"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {lawyer.languages.map(lang => (
                    <span key={lang} className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{lang}</span>
                  ))}
                </div>

                <button onClick={() => navigate(`/lawyer/${lawyer.id}`)}
                  className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95">
                  Book Consultation
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
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

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fade-in { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}