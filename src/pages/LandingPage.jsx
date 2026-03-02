import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale, Search, ArrowRight, Star, ChevronDown, Sparkles,
  Lock, CheckCircle, Menu, X, AlertCircle, Home,
  Building2, Heart, BookOpen, Gavel, Shield,
  Landmark, Phone, User
} from "lucide-react";

/* ─────────────────────────────────────────────
   AI CALL
───────────────────────────────────────────── */
async function askLegalAI(question) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "YOUR_ANTHROPIC_API_KEY_HERE",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      system: `You are a knowledgeable Indian legal assistant on FindMyLawyer.
1. Briefly explain legal rights relevant to the query in simple language
2. Mention which type of lawyer can help (Criminal, Family, Property, Corporate, Civil)
3. End with: "For personalized legal advice, sign up on FindMyLawyer and connect with a verified lawyer."
Keep it to 3-5 short paragraphs. Be empathetic and clear.`,
      messages: [{ role: "user", content: question }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again.";
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CASE_TYPES = [
  { icon: Lock,      label: "Criminal",  color: "text-red-600",     bg: "bg-red-50 border-red-100"         },
  { icon: Heart,     label: "Family",    color: "text-pink-600",    bg: "bg-pink-50 border-pink-100"       },
  { icon: Home,      label: "Property",  color: "text-amber-600",   bg: "bg-amber-50 border-amber-100"     },
  { icon: Building2, label: "Corporate", color: "text-blue-600",    bg: "bg-blue-50 border-blue-100"       },
  { icon: Gavel,     label: "Civil",     color: "text-violet-600",  bg: "bg-violet-50 border-violet-100"   },
  { icon: Landmark,  label: "Consumer",  color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
];

const QUICK_QUESTIONS = [
  "My landlord is not returning my security deposit",
  "I received a legal notice for cheque bounce",
  "My employer has not paid my salary for 2 months",
  "I want to file for divorce",
  "Police arrested me without a warrant",
  "My business partner is cheating me",
];

const HOW_IT_WORKS = [
  { step: "01", title: "Describe Your Issue",    desc: "Use our AI search to explain your legal problem in plain, simple language.",         icon: Search   },
  { step: "02", title: "Understand Your Rights", desc: "Get instant AI guidance on your legal rights and which type of lawyer you need.",    icon: BookOpen },
  { step: "03", title: "Connect with a Lawyer",  desc: "Sign up and book a consultation with a verified, background-checked lawyer.",        icon: Gavel    },
];

const RIGHTS = [
  { icon: "🤫", right: "Right to Remain Silent",         detail: "You cannot be forced to testify against yourself — Article 20(3) of the Constitution." },
  { icon: "⚖️", right: "Right to Legal Aid",             detail: "If you cannot afford a lawyer, the State must provide one under Article 39A." },
  { icon: "🛡️", right: "Right Against Unlawful Arrest",  detail: "Police must inform you of the reason for arrest and produce you before a magistrate within 24 hours." },
  { icon: "🏛️", right: "Right to Fair Trial",            detail: "Every accused has the right to a free and fair trial before an independent court." },
  { icon: "🔒", right: "Right Against Double Jeopardy",  detail: "No person can be tried and punished for the same offence more than once." },
  { icon: "🔑", right: "Right to Bail",                  detail: "For bailable offences, you have the right to be released on bail immediately." },
];

/* ═══════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════ */
export default function LandingPage() {
  const navigate  = useNavigate();
  const searchRef = useRef(null);
  const responseRef = useRef(null);

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [query,      setQuery]      = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiLoading,  setAiLoading]  = useState(false);
  const [aiError,    setAiError]    = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [typedText,  setTypedText]  = useState("");
  const [phraseIdx,  setPhraseIdx]  = useState(0);
  const [scrolled,   setScrolled]   = useState(false);
  const [activeSection, setActiveSection] = useState("hero");

  const phrases = ["Criminal Cases", "Family Disputes", "Property Issues", "Corporate Matters", "Consumer Rights"];

  useEffect(() => {
    let i = 0;
    const phrase = phrases[phraseIdx];
    setTypedText("");
    const iv = setInterval(() => {
      setTypedText(phrase.slice(0, i + 1));
      i++;
      if (i === phrase.length) {
        clearInterval(iv);
        setTimeout(() => setPhraseIdx(p => (p + 1) % phrases.length), 2000);
      }
    }, 65);
    return () => clearInterval(iv);
  }, [phraseIdx]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleNavClick = (sectionId) => {
    setMenuOpen(false);
    setActiveSection(sectionId);
    if (aiResponse || aiLoading || aiError) {
      setAiResponse(""); setAiLoading(false); setAiError(""); setShowSignup(false);
    }
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if ((aiResponse || aiError) && responseRef.current) {
      setTimeout(() => responseRef.current.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }, [aiResponse, aiError]);

  const handleSearch = async (q) => {
    const question = (q || query).trim();
    if (!question) return;
    setQuery(question);
    setAiLoading(true);
    setAiError("");
    setAiResponse("");
    setShowSignup(false);
    setActiveSection("chat");
    try {
      const answer = await askLegalAI(question);
      setAiResponse(answer);
      setTimeout(() => setShowSignup(true), 1000);
    } catch {
      setAiError("Unable to connect. Please check your internet and try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleNewQuestion = () => {
    setQuery(""); setAiResponse(""); setAiError(""); setShowSignup(false);
    setActiveSection("hero");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => searchRef.current?.focus(), 500);
  };

  const handleBackToHome = () => {
    setQuery(""); setAiResponse(""); setAiError(""); setShowSignup(false);
    setActiveSection("hero");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ══ NAVBAR ══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${scrolled ? "shadow-lg border-gray-200" : "shadow-none border-transparent"}`}>
        <div className="flex items-center justify-between px-5 sm:px-8 py-3.5">

          {/* LEFT — Logo */}
          <button onClick={handleBackToHome} className="flex items-center gap-2.5 flex-shrink-0 hover:opacity-80 transition">
            <div className="bg-gray-900 p-1.5 rounded-xl">
              <Scale size={18} className="text-white" />
            </div>
            <div className="leading-none">
              <p className="text-sm font-bold tracking-tight text-gray-900">FindMyLawyer</p>
              <p className="text-[9px] text-gray-400 mt-0.5">Justice Made Accessible</p>
            </div>
          </button>

          {/* CENTRE — Nav links */}
          <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <button onClick={() => handleNavClick("how-it-works")} className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              How It Works
            </button>
            <button onClick={() => handleNavClick("rights")} className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              Know Your Rights
            </button>
          </div>

          {/* RIGHT — Single CTA */}
          <button
            onClick={() => navigate("/login")}
            className="hidden md:flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md flex-shrink-0"
          >
            Get Legal Advice
            <ArrowRight size={14} />
          </button>

          {/* Mobile hamburger */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-700 flex-shrink-0">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-5 py-4 space-y-1">
            <button onClick={() => handleNavClick("how-it-works")} className="block w-full text-left text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">
              How It Works
            </button>
            <button onClick={() => handleNavClick("rights")} className="block w-full text-left text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">
              Know Your Rights
            </button>
            <div className="pt-3">
              <button
                onClick={() => { setMenuOpen(false); navigate("/login"); }}
                className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-bold py-3 rounded-xl"
              >
                Get Legal Advice <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 40%, #f0f4ff 100%)" }} />
        <div className="absolute inset-0 opacity-[0.035]" style={{
          backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px"
        }} />
        <div className="absolute top-24 left-[8%] w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(circle, #818cf8, transparent 70%)" }} />
        <div className="absolute bottom-16 right-[6%] w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #38bdf8, transparent 70%)" }} />

        <div className="relative z-10 w-full max-w-3xl mx-auto text-center">

          {activeSection !== "chat" && (
            <div className="inline-flex items-center gap-2 bg-white border border-gray-200 shadow-sm text-gray-600 text-xs font-semibold px-4 py-2 rounded-full mb-7">
              <Sparkles size={12} className="text-amber-500" />
              AI-Powered · India's Trusted Legal Platform
              <Sparkles size={12} className="text-amber-500" />
            </div>
          )}

          {activeSection !== "chat" && (
            <h1 className="text-4xl sm:text-5xl md:text-[62px] font-black text-gray-900 leading-[1.1] tracking-tight mb-5">
              Get Legal Help for
              <br />
              <span className="relative inline-block min-w-[4px]">
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#1e293b,#4f46e5,#1e293b)" }}>
                  {typedText || "\u00a0"}
                </span>
                <span className="text-gray-900 animate-pulse">|</span>
              </span>
            </h1>
          )}

          {activeSection !== "chat" && (
            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
              Describe your issue — our AI instantly explains your rights and connects you with a verified Indian lawyer.
            </p>
          )}

          {/* AI SEARCH BOX */}
          <div className="relative max-w-2xl mx-auto mb-5">
            <div className="absolute -inset-1 rounded-3xl blur-lg opacity-20 pointer-events-none"
              style={{ background: "linear-gradient(135deg, #6366f1, #0ea5e9)" }} />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-start gap-3 p-4 pb-2">
                <div className="flex-shrink-0 w-9 h-9 bg-gray-900 rounded-xl flex items-center justify-center shadow mt-0.5">
                  <Sparkles size={15} className="text-white" />
                </div>
                <textarea
                  ref={searchRef}
                  value={query}
                  onChange={e => {
                    setQuery(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
                  }}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                  placeholder={`Describe your legal issue... e.g. "My employer hasn't paid my salary for 3 months"`}
                  rows={2}
                  className="flex-1 bg-transparent outline-none text-sm sm:text-[15px] text-gray-900 placeholder-gray-400 resize-none leading-relaxed w-full"
                  style={{ maxHeight: 140 }}
                />
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50">
                <span className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <Lock size={10} className="text-gray-300" />
                  Free · No signup required · Instant answer
                </span>
                <button
                  onClick={() => handleSearch()}
                  disabled={!query.trim() || aiLoading}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    query.trim() && !aiLoading
                      ? "bg-gray-900 text-white hover:bg-gray-800 shadow-md"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {aiLoading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
                    : <><Search size={14} />Ask AI</>
                  }
                </button>
              </div>

              {(aiLoading || aiError || aiResponse) && (
                <div ref={responseRef} className="border-t border-gray-100">
                  {aiLoading && (
                    <div className="px-6 py-6 bg-gradient-to-b from-gray-50 to-white">
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="flex gap-1.5">
                          {[0, 150, 300].map(d => (
                            <span key={d} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                          ))}
                        </div>
                        <span className="text-sm font-medium">Analyzing your legal situation...</span>
                      </div>
                    </div>
                  )}
                  {aiError && (
                    <div className="px-6 py-5 bg-red-50 border-t border-red-100">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle size={18} />
                        <span className="text-sm font-medium">{aiError}</span>
                      </div>
                    </div>
                  )}
                  {aiResponse && (
                    <div className="px-6 py-6 bg-gradient-to-b from-gray-50 to-white">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                          <Scale size={16} className="text-white" />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-gray-900">AI Legal Assistant</span>
                          <p className="text-[10px] text-gray-500">Instant legal guidance</p>
                        </div>
                      </div>
                      <div className="text-gray-700 text-sm leading-relaxed space-y-4">
                        {aiResponse.split("\n\n").filter(Boolean).map((p, i) => (
                          <p key={i} className="text-gray-700">{p}</p>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <AlertCircle size={10} />
                          This is general legal information only. Consult a qualified lawyer for advice on your specific situation.
                        </p>
                      </div>
                      {showSignup && (
                        <div className="mt-5 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Gavel size={16} className="text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-gray-900">Need a verified lawyer?</h3>
                              <p className="text-xs text-gray-500 mt-0.5">Connect with top-rated lawyers starting from ₹299</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => navigate("/register")}
                              className="flex-1 bg-gray-900 text-white text-xs font-semibold py-2.5 rounded-lg hover:bg-gray-800 transition flex items-center justify-center gap-1">
                              Register Free <ArrowRight size={12} />
                            </button>
                            <button onClick={() => navigate("/login")}
                              className="flex-1 border border-gray-200 text-gray-700 text-xs font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition">
                              Sign In
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {activeSection !== "chat" && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => { setQuery(q); handleSearch(q); }}
                  className="text-xs text-gray-600 bg-white border border-gray-200 hover:border-gray-900 hover:text-gray-900 px-3 py-1.5 rounded-full transition-all shadow-sm">
                  {q}
                </button>
              ))}
            </div>
          )}

          {activeSection !== "chat" && (
            <div className="flex flex-wrap justify-center gap-2">
              {CASE_TYPES.map(({ icon: Icon, label, color, bg }) => (
                <span key={label} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border ${bg} ${color}`}>
                  <Icon size={10} />{label}
                </span>
              ))}
            </div>
          )}

          {activeSection === "chat" && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button onClick={handleNewQuestion}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:shadow transition-all">
                <Search size={14} />New Question
              </button>
              <button onClick={handleBackToHome}
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm hover:shadow transition-all">
                <Scale size={14} />Back to Home
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-300 animate-bounce">
          <ChevronDown size={24} />
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--r, 0deg)); }
          50% { transform: translateY(-10px) rotate(var(--r, 0deg)); }
        }
      `}</style>

      {/* HOW IT WORKS */}
      {activeSection !== "chat" && (
        <section id="how-it-works" className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Simple · Fast · Trusted</span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">How FindMyLawyer Works</h2>
              <p className="text-gray-500 mt-3 text-sm max-w-md mx-auto">From describing your problem to expert legal help — in minutes, not days.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 relative">
              <div className="hidden sm:block absolute top-[3.5rem] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
              {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
                <div key={step} className="relative bg-gray-50 border border-gray-100 rounded-3xl p-7 text-center hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                  <div className="relative w-14 h-14 mx-auto mb-5">
                    <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon size={22} className="text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500">{i + 1}</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KNOW YOUR RIGHTS */}
      {activeSection !== "chat" && (
        <section id="rights" className="py-20 px-4" style={{ background: "linear-gradient(135deg,#f8fafc,#f0f4ff)" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Legal Education</span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">Know Your Fundamental Rights</h2>
              <p className="text-gray-500 mt-3 text-sm max-w-md mx-auto">Every Indian citizen has these rights. Understanding them can protect you.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RIGHTS.map(({ icon, right, detail }) => (
                <div key={right} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200">
                  <div className="text-3xl mb-3">{icon}</div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">{right}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{detail}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <button
                onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); searchRef.current?.focus(); }}
                className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-bold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition shadow-lg">
                <Search size={15} />Ask AI About Your Rights
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      {activeSection !== "chat" && (
        <section className="py-20 px-4 text-white text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)" }}>
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px"
          }} />
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
            style={{ background: "radial-gradient(circle,#818cf8,transparent)" }} />
          <div className="relative z-10 max-w-2xl mx-auto">
            <Scale size={40} className="mx-auto text-white/15 mb-5" />
            <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
              Justice is just a<br />conversation away
            </h2>
            <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Join thousands of Indians who found the right legal help through FindMyLawyer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate("/register")}
                className="flex items-center justify-center gap-2 bg-white text-gray-900 font-bold text-sm px-8 py-4 rounded-xl hover:bg-gray-100 transition shadow-xl">
                <ArrowRight size={16} />Register Free
              </button>
              <button onClick={() => navigate("/login")}
                className="flex items-center justify-center gap-2 border border-white/20 text-white font-semibold text-sm px-8 py-4 rounded-xl hover:bg-white/10 transition">
                Sign In
              </button>
            </div>
            <p className="text-gray-600 text-xs mt-6">No credit card required · Free AI legal search · Connect in minutes</p>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-black text-white py-10 px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 max-w-none mb-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/10 p-1.5 rounded-xl">
              <Scale size={16} />
            </div>
            <div>
              <p className="text-sm font-bold">FindMyLawyer</p>
              <p className="text-[10px] text-gray-500">Justice Made Accessible</p>
            </div>
          </div>
          <div className="flex gap-6 text-xs text-gray-500 flex-wrap">
            <button onClick={() => handleNavClick("how-it-works")} className="hover:text-white transition">How It Works</button>
            <button onClick={() => handleNavClick("rights")} className="hover:text-white transition">Know Your Rights</button>
            <button onClick={() => navigate("/login")} className="hover:text-white transition">Sign In</button>
            <button onClick={() => navigate("/register")} className="hover:text-white transition">Register</button>
          </div>
        </div>
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-gray-600">© {new Date().getFullYear()} FindMyLawyer · All rights reserved</p>
          <p className="text-[11px] text-gray-600">AI responses are for general information only, not legal advice</p>
        </div>
      </footer>
    </div>
  );
}