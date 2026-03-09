import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft, Send, Paperclip, FileText, Download,
  Image as ImageIcon, AlertCircle, Phone, Shield,
  CheckCheck, Clock, Upload, FolderOpen, File, Trash2
} from "lucide-react";

function nowISO() { return new Date().toISOString(); }
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const WELCOME_MSG = {
  id: "welcome",
  sender: "system",
  text: "🔒 This is a secure, encrypted conversation. Your lawyer will respond to your messages here. Feel free to introduce yourself or describe your situation.",
  timestamp: nowISO(),
};

const QUICK_PROMPTS = [
  "What are my legal rights in this case?",
  "How long will this case take?",
  "What documents do I need to prepare?",
  "What are the next steps?",
];

export default function CaseDetails() {
  const navigate      = useNavigate();
  const { bookingId } = useParams();
  const location      = useLocation();
  const bottomRef     = useRef(null);
  const inputRef      = useRef(null);
  const fileInputRef  = useRef(null);

  const tabFromUrl = new URLSearchParams(location.search).get("tab") || "chat";

  const [booking,      setBooking]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [messages,     setMessages]     = useState([]);
  const [newMessage,   setNewMessage]   = useState("");
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploading,    setUploading]    = useState(false);
  const [showPrompts,  setShowPrompts]  = useState(true);
  const [typing,       setTyping]       = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) { navigate("/"); return; }
    let user = null;
    try { user = JSON.parse(userData); } catch { navigate("/"); return; }
    if (!user?.email) { navigate("/"); return; }

    const stored = localStorage.getItem(`bookings_${user.email}`);
    if (!stored) { setLoading(false); return; }
    let bookings = [];
    try { bookings = JSON.parse(stored); } catch { setLoading(false); return; }

    const found = bookings.find(b => String(b.bookingId) === String(bookingId));
    if (found) {
      setBooking(found);
      try {
        const c = localStorage.getItem(`chat_${bookingId}`);
        const parsed = c ? JSON.parse(c) : [];
        const hasWelcome = parsed.some(m => m.id === "welcome");
        setMessages(hasWelcome ? parsed : [WELCOME_MSG, ...parsed]);
        if (parsed.some(m => m.sender === "client")) setShowPrompts(false);
      } catch { setMessages([WELCOME_MSG]); }
      try {
        const d = localStorage.getItem(`docs_${bookingId}`);
        if (d) setUploadedDocs(JSON.parse(d));
      } catch {}
    }
    setLoading(false);
  }, [bookingId, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const saveMessages = (msgs) => localStorage.setItem(`chat_${bookingId}`, JSON.stringify(msgs));

  const sendMessage = (text) => {
    const msgText = (text || newMessage).trim();
    if (!msgText) return;
    const msg = { id: Date.now(), sender: "client", text: msgText, timestamp: nowISO(), read: false };
    const updated = [...messages, msg];
    setMessages(updated);
    setNewMessage("");
    setShowPrompts(false);
    saveMessages(updated);

    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const withRead = updated.map(m => m.id === msg.id ? { ...m, read: true } : m);
      const reply = { id: Date.now() + 1, sender: "lawyer", text: "Thank you for your message. I'll review this and get back to you shortly.", timestamp: nowISO() };
      const final = [...withRead, reply];
      setMessages(final);
      saveMessages(final);
    }, 2000);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setTimeout(() => {
      const newDocs = files.map(f => ({ id: Date.now() + Math.random(), name: f.name, size: f.size, type: f.type, uploadedAt: nowISO() }));
      const updated = [...uploadedDocs, ...newDocs];
      setUploadedDocs(updated);
      localStorage.setItem(`docs_${bookingId}`, JSON.stringify(updated));
      setUploading(false);
      e.target.value = "";
    }, 1200);
  };

  const removeDocument = (docId) => {
    const updated = uploadedDocs.filter(d => d.id !== docId);
    setUploadedDocs(updated);
    localStorage.setItem(`docs_${bookingId}`, JSON.stringify(updated));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const getFileIcon = (type) => {
    if (type?.includes("image")) return { icon: ImageIcon, bg: "bg-purple-100", color: "text-purple-600" };
    if (type?.includes("pdf"))   return { icon: FileText,  bg: "bg-red-100",    color: "text-red-600" };
    if (type?.includes("word") || type?.includes("document")) return { icon: File, bg: "bg-blue-100", color: "text-blue-600" };
    return { icon: File, bg: "bg-gray-100", color: "text-gray-500" };
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Case Not Found</h2>
        <button onClick={() => navigate("/my-cases")} className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold mt-4">
          ← Back to My Cases
        </button>
      </div>
    </div>
  );

  const lawyerInitial = (booking.lawyer || "L")[0];

  /* ════════ CHAT TAB ════════ */
  if (tabFromUrl === "chat") {
    return (
      <div className="flex flex-col bg-gray-100" style={{ height: "100dvh" }}>

        {/* ── HEADER — identical to SupportChat ── */}
        <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-3 shadow-lg flex-shrink-0">

          <button onClick={() => navigate("/my-cases")} className="p-1.5 hover:bg-white/10 rounded-lg transition flex-shrink-0">
            <ArrowLeft size={20} />
          </button>

          {/* Avatar — same size/style as SupportChat blue circle */}
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 bg-gray-600 border-2 border-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{lawyerInitial}</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight truncate">{booking.lawyer}</p>
            <p className="text-[11px] text-green-400 font-medium">Online · {booking.caseType || "Legal Consultant"}</p>
          </div>

          <a href="tel:+919876543210" className="p-2 hover:bg-white/10 rounded-lg transition flex-shrink-0">
            <Phone size={18} className="text-gray-300" />
          </a>
          <button className="p-2 hover:bg-white/10 rounded-lg transition flex-shrink-0">
            <Shield size={18} className="text-gray-300" />
          </button>
        </div>

        {/* ── ENCRYPTED NOTICE — identical to SupportChat ── */}
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-1.5 flex items-center justify-center gap-1.5 flex-shrink-0">
          <Shield size={11} className="text-amber-500" />
          <p className="text-[11px] text-amber-700 font-medium">End-to-end encrypted · Confidential</p>
        </div>

        {/* ── MESSAGES — identical dotted bg to SupportChat ── */}
        <div
          className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Date pill — same style */}
          <div className="flex justify-center">
            <span className="bg-white text-gray-400 text-[10px] font-medium px-3 py-1 rounded-full shadow-sm border border-gray-100">
              Today
            </span>
          </div>

          {messages.map((msg, idx) => {
            const isClient   = msg.sender === "client";
            const isSystem   = msg.sender === "system";
            const isLawyer   = msg.sender === "lawyer";
            const showAvatar = isLawyer && (idx === 0 || messages[idx - 1]?.sender !== "lawyer");

            /* System bubble — same blue pill as SupportChat */
            if (isSystem) return (
              <div key={msg.id} className="flex justify-center px-2">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5 max-w-sm text-center shadow-sm">
                  <p className="text-xs text-blue-700 leading-relaxed">{msg.text}</p>
                </div>
              </div>
            );

            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isClient ? "justify-end" : "justify-start"}`}>
                {/* Lawyer avatar — same 7×7 circle pattern as SupportChat bot avatar */}
                {!isClient && (
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mb-1 ${showAvatar ? "bg-gray-600" : "opacity-0 pointer-events-none"}`}>
                    {showAvatar && <span className="text-white text-[10px] font-bold">{lawyerInitial}</span>}
                  </div>
                )}

                <div className={`flex flex-col gap-0.5 max-w-[75%] ${isClient ? "items-end" : "items-start"}`}>
                  {/* Bubble — same exact classes as SupportChat */}
                  <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                    isClient ? "bg-gray-900 text-white rounded-br-md" : "bg-white text-gray-900 rounded-bl-md"
                  }`}>
                    {msg.text}
                  </div>
                  {/* Timestamp + tick — same */}
                  <div className="flex items-center gap-1 px-1">
                    <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                    {isClient && (msg.read
                      ? <CheckCheck size={12} className="text-blue-400" />
                      : <Clock size={11} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator — same as SupportChat */}
          {typing && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-7 h-7 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">{lawyerInitial}</span>
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick prompts — same chip style as SupportChat */}
          {showPrompts && (
            <div className="pt-2">
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2.5 text-center">
                Suggested Questions
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {QUICK_PROMPTS.map((p, i) => (
                  <button key={i} onClick={() => sendMessage(p)}
                    className="bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3.5 py-2 rounded-full hover:border-gray-900 hover:text-gray-900 transition-all shadow-sm whitespace-nowrap">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* ── INPUT BAR — identical to SupportChat ── */}
        <div className="bg-white border-t border-gray-200 px-3 py-3 flex items-end gap-2 flex-shrink-0">
          <button onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition flex-shrink-0">
            <Paperclip size={20} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload}
            className="hidden" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />

          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-gray-900 focus-within:bg-white transition-all">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={e => {
                setNewMessage(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder={`Message ${booking.lawyer?.split(' ')[1] || 'Adv'}…`}
              rows={1}
              className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 resize-none leading-relaxed"
              style={{ maxHeight: 120 }}
            />
          </div>

          <button onClick={() => sendMessage()} disabled={!newMessage.trim()}
            className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${
              newMessage.trim() ? "bg-gray-900 text-white hover:bg-gray-700 shadow-md" : "bg-gray-100 text-gray-300 cursor-not-allowed"
            }`}>
            <Send size={20} />
          </button>
        </div>
      </div>
    );
  }

  /* ════════ DOCUMENTS TAB ════════ */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-gray-900 text-white sticky top-0 z-20 shadow-xl">
        <div className="flex items-center gap-3 px-4 py-4 max-w-3xl mx-auto">
          <button onClick={() => navigate("/my-cases")} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold">Case Documents</h1>
            <p className="text-xs text-gray-400 truncate">{booking.lawyer} · {booking.caseType || "Legal Consultation"}</p>
          </div>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 bg-white text-gray-900 text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-100 transition flex-shrink-0">
            <Upload size={13} /> Upload
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload}
            className="hidden" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-5">
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Total Files", value: uploadedDocs.length, color: "text-gray-900" },
            { label: "Images", value: uploadedDocs.filter(d => d.type?.includes("image")).length, color: "text-purple-600" },
            { label: "Documents", value: uploadedDocs.filter(d => !d.type?.includes("image")).length, color: "text-blue-600" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-3 text-center border border-gray-100 shadow-sm">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-gray-500 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {uploading && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 mb-4 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-700">Uploading files...</p>
              <p className="text-xs text-blue-400">Please wait</p>
            </div>
          </div>
        )}

        {uploadedDocs.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen size={36} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Documents Yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Upload FIRs, affidavits, contracts, court orders, or any case evidence.</p>
            <button onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition shadow-md">
              <Upload size={16} /> Upload First Document
            </button>
            <div className="flex items-center justify-center gap-3 mt-5">
              {["PDF", "DOC", "JPG", "PNG"].map(ext => (
                <span key={ext} className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg font-mono">.{ext}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {uploadedDocs.map(doc => {
              const { icon: Icon, bg, color } = getFileIcon(doc.type);
              return (
                <div key={doc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                  <div className="flex items-center gap-3 p-4">
                    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <Icon size={22} className={color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400">{formatFileSize(doc.size)}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">
                          {new Date(doc.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="inline-flex items-center gap-0.5 bg-green-50 text-green-600 text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                          <CheckCheck size={9} /> Saved
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Download size={16} />
                      </button>
                      <button onClick={() => removeDocument(doc.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <button onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 text-gray-500 hover:border-gray-900 hover:text-gray-900 py-4 rounded-2xl text-sm font-medium transition-all">
              <Upload size={16} /> Add More Documents
            </button>
          </div>
        )}
      </div>
    </div>
  );
}