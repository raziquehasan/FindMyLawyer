import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale, Search, ArrowRight, Sparkles,
  Lock, Menu, X, AlertCircle, Gavel,
  Shield
} from "lucide-react";

/* ─────────────────────────────────────────────
   MOCK AI RESPONSE - NO ACTUAL API CALL
───────────────────────────────────────────── */
async function askLegalAI(question) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock responses based on keywords
  const lower = question.toLowerCase();
  
  if (lower.includes("landlord") || lower.includes("security deposit")) {
    return "Under Indian law, a landlord must return your security deposit within a reasonable time after you vacate (typically 30-45 days). If they're withholding it without reason, you can send a legal notice through a property lawyer.\n\nA property dispute lawyer can help you recover your deposit. They'll send a formal legal notice and if needed, file a case in the civil court.\n\nFor personalized legal advice, sign up on FindMyLawyer and connect with a verified property lawyer.";
  }
  
  if (lower.includes("cheque bounce")) {
    return "A cheque bounce is a criminal offense under Section 138 of the Negotiable Instruments Act. You must send a legal notice within 30 days of the cheque bounce, and the other party has 15 days to pay. If they don't, you can file a complaint in court.\n\nA criminal lawyer specializing in cheque bounce cases can guide you through this process and represent you in court.\n\nFor personalized legal advice, sign up on FindMyLawyer and connect with a verified criminal lawyer.";
  }
  
  if (lower.includes("salary") || lower.includes("employer") || lower.includes("paid")) {
    return "Non-payment of salary is a violation of your rights under the Payment of Wages Act. Your employer is legally obligated to pay your salary on time. You can first send a formal legal notice demanding payment.\n\nIf they still don't pay, you can file a case in the labour court or before the Deputy Labour Commissioner. A labour law lawyer can help you recover your dues with interest.\n\nFor personalized legal advice, sign up on FindMyLawyer and connect with a verified labour law lawyer.";
  }
  
  // Default response
  return "Based on your query, you may have legal remedies available under Indian law. It's best to consult with a specialized lawyer who can review your documents and provide personalized advice.\n\nYou might need a lawyer specializing in this area of law. They can guide you on the next steps, whether it's sending a legal notice, filing a case, or negotiating a settlement.\n\nFor personalized legal advice, sign up on FindMyLawyer and connect with a verified lawyer who specializes in your type of case.";
}

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const QUICK_QUESTIONS = [
  "My landlord is not returning my security deposit",
  "I received a legal notice for cheque bounce",
  "My employer has not paid my salary for 2 months",
];

const HOW_IT_WORKS = [
  { step: "01", title: "Describe Your Issue",    desc: "Use our AI search to explain your legal problem in plain, simple language.",         icon: Search   },
  { step: "02", title: "Understand Your Rights", desc: "Get instant AI guidance on your legal rights and which type of lawyer you need.",    icon: Shield },
  { step: "03", title: "Connect with a Lawyer",  desc: "Sign up and book a consultation with a verified, background-checked lawyer.",        icon: Gavel    },
];

const RIGHTS_FACTS = [
  "You have the right to consult a lawyer before questioning.",
  "You have the right to remain silent.",
  "You are entitled to legal aid if you cannot afford a lawyer.",
  "You must be informed of the charges before arrest.",
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
  const [typedText,  setTypedText]  = useState("");
  const [phraseIdx,  setPhraseIdx]  = useState(0);
  const [scrolled,   setScrolled]   = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const [visible, setVisible] = useState(true);

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

  useEffect(() => {
    if ((aiResponse || aiError) && responseRef.current) {
      setTimeout(() => responseRef.current.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }
  }, [aiResponse, aiError]);

  // Footer rotation effect - exactly like Login page
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFactIndex((prev) => {
          const nextIndex = prev + 1;
          return nextIndex >= RIGHTS_FACTS.length ? 0 : nextIndex;
        });
        setVisible(true);
      }, 400);
    }, 4000);

    return () => clearInterval(interval);
  }, [RIGHTS_FACTS.length]);

  const handleSearch = async (q) => {
    const question = (q || query).trim();
    if (!question) return;
    
    setQuery(question);
    setAiLoading(true);
    setAiError("");
    setAiResponse("");
    setShowResults(true);
    
    try {
      const answer = await askLegalAI(question);
      setAiResponse(answer);
    } catch (error) {
      setAiError("Unable to process your request. Please try again.");
      console.error("AI Error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleNewQuestion = () => {
    setQuery(""); 
    setAiResponse(""); 
    setAiError(""); 
    setShowResults(false);
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  const handleBackToHome = () => {
    setQuery(""); 
    setAiResponse(""); 
    setAiError(""); 
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden flex flex-col">

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
            <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })} 
              className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors">
              How It Works
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
            <button onClick={() => { 
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" }); 
              setMenuOpen(false);
            }} className="block w-full text-left text-sm font-medium text-gray-700 py-2.5 border-b border-gray-50">
              How It Works
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

      {/* MAIN CONTENT - takes remaining space */}
      <div className="flex-1 flex flex-col">
        {/* ══ HERO ══ */}
        <section className="relative pt-16 px-4 overflow-hidden">
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

            <h1 className="text-4xl sm:text-5xl md:text-[62px] font-black text-gray-900 leading-[1.1] tracking-tight">
              Get Legal Help for
              <br />
              <span className="relative inline-block min-w-[4px]">
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg,#1e293b,#4f46e5,#1e293b)" }}>
                  {typedText || "\u00a0"}
                </span>
                <span className="text-gray-900 animate-pulse">|</span>
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto mt-2 mb-3 leading-relaxed">
              Describe your issue — our AI instantly explains your rights and connects you with a verified Indian lawyer.
            </p>

            {/* AI SEARCH BOX */}
            <div className="relative max-w-2xl mx-auto">
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1">
                    <Search size={16} className="text-gray-400" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
                      placeholder="Describe your legal issue..."
                      className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 py-2"
                    />
                  </div>
                  <button
                    onClick={() => handleSearch()}
                    disabled={!query.trim() || aiLoading}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1 ${
                      query.trim() && !aiLoading
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {aiLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Search"
                    )}
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
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Quick questions - only show when no results */}
            {!showResults && (
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => { setQuery(q); handleSearch(q); }}
                    className="text-xs text-gray-600 bg-white border border-gray-200 hover:border-gray-900 hover:text-gray-900 px-3 py-1.5 rounded-full transition-all shadow-sm">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Back/New buttons - only show when results are visible */}
            {showResults && (
              <div className="mt-3 flex items-center justify-center gap-4">
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
        </section>

        {/* HOW IT WORKS - Only show when no results */}
        {!showResults && (
          <section id="how-it-works" className="py-10 px-4 bg-white">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Simple · Fast · Trusted</span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2">How FindMyLawyer Works</h2>
                <p className="text-gray-500 mt-2 text-sm max-w-md mx-auto">From describing your problem to expert legal help — in minutes, not days.</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-5 relative">
                <div className="hidden sm:block absolute top-[3.5rem] left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }, i) => (
                  <div key={step} className="relative bg-gray-50 border border-gray-100 rounded-3xl p-6 text-center hover:shadow-lg hover:border-gray-200 transition-all duration-300">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                      <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                        <Icon size={20} className="text-white" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-[9px] font-black text-gray-500">{i + 1}</span>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>

      {/* KNOW YOUR RIGHTS FOOTER - exact same as Login page */}
      {RIGHTS_FACTS.length > 0 && (
        <footer className="w-full bg-gray-900 text-white py-3 px-4 flex-shrink-0">
          <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Scale size={12} className="text-gray-500" />
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                Know Your Legal Rights
              </span>
              <Scale size={12} className="text-gray-500" />
            </div>
            <p
              className="text-xs sm:text-sm text-white font-medium leading-relaxed transition-opacity duration-500 px-2 max-w-lg"
              style={{ opacity: visible ? 1 : 0 }}
            >
              "{RIGHTS_FACTS[factIndex] || RIGHTS_FACTS[0]}"
            </p>
            <div className="w-full border-t border-gray-800 mt-2 pt-2">
              <p className="text-[9px] sm:text-[10px] text-gray-600">
                © {new Date().getFullYear()} FindMyLawyer · All rights reserved
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}