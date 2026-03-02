import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Scale, Send, Phone, Mail,
  ChevronRight, Headphones, CheckCheck,
  Clock, Paperclip, Shield
} from "lucide-react";

const BOT_RESPONSES = {
  booking:    "I can help with your booking! Please share your Booking ID and I'll look into it right away.",
  payment:    "For payment issues, please share your transaction ID or Booking ID. Our billing team will resolve it within 2–4 hours.",
  lawyer:     "You can browse verified lawyers at any time from the Lawyers tab. Want me to guide you through the process?",
  cancel:     "To cancel a consultation, please share your Booking ID. Cancellations made 24 hours before the session are fully refunded.",
  refund:     "Refunds are processed within 5–7 business days to your original payment method. Share your Booking ID to track your refund.",
  reschedule: "We can reschedule your consultation! Share your Booking ID and preferred new time slot.",
  urgent:     "I'm escalating this to a senior support agent immediately. You'll be contacted within 15 minutes.",
  hello:      "Hello! 👋 I'm your FindMyLawyer support assistant. How can I help you today?",
  hi:         "Hi there! 👋 How can I assist you today?",
  thanks:     "You're welcome! Is there anything else I can help you with?",
  thank:      "Happy to help! Don't hesitate to reach out if you need anything else.",
  default:    "Thank you for reaching out. A support agent will review your message shortly. Typical response time is under 30 minutes.",
};

const QUICK_REPLIES = [
  { label: "Booking Issue",   key: "booking"   },
  { label: "Payment Problem", key: "payment"   },
  { label: "Find a Lawyer",   key: "lawyer"    },
  { label: "Cancel Session",  key: "cancel"    },
  { label: "Request Refund",  key: "refund"    },
  { label: "Urgent Help",     key: "urgent"    },
];

function getBotResponse(text) {
  const lower = text.toLowerCase();
  for (const k of Object.keys(BOT_RESPONSES).filter(k => k !== "default")) {
    if (lower.includes(k)) return BOT_RESPONSES[k];
  }
  return BOT_RESPONSES.default;
}

function nowISO() { return new Date().toISOString(); }
function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const INIT_MSGS = [
  { id: "s1", sender: "system", text: "🔒 This is a secure, encrypted conversation with FindMyLawyer Support. We respond within 30 minutes.", timestamp: nowISO() },
  { id: "s2", sender: "bot",    text: "👋 Welcome! I'm your FindMyLawyer support assistant. Select a topic or type your question.", timestamp: nowISO() },
];

export default function SupportChat() {
  const navigate  = useNavigate();
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const nextId    = useRef(10);

  const [userName,  setUserName]  = useState("User");
  const [messages,  setMessages]  = useState(INIT_MSGS);
  const [input,     setInput]     = useState("");
  const [typing,    setTyping]    = useState(false);
  const [showQuick, setShowQuick] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d?.name?.trim()) setUserName(d.name.trim().split(" ")[0]);
    } catch {}
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  function sendMessage(quickText) {
    const trimmed = (quickText || input).trim();
    if (!trimmed) return;
    nextId.current += 1;
    const uid = nextId.current;
    setMessages(prev => [...prev, { id: uid, sender: "user", text: trimmed, timestamp: nowISO(), read: false }]);
    setInput("");
    setShowQuick(false);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      nextId.current += 1;
      setMessages(prev => [
        ...prev.map(m => m.id === uid ? { ...m, read: true } : m),
        { id: nextId.current, sender: "bot", text: getBotResponse(trimmed), timestamp: nowISO(), read: true },
      ]);
    }, 1100);
  }

  return (
    <div className="flex flex-col bg-gray-100" style={{ height: "100dvh" }}>

      {/* ══ NAVBAR
          RULE: flex directly on the nav div — NO max-w wrapper inside
          Logo/back arrow LEFT, phone+shield RIGHT, no centering container
      ══ */}
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-3 shadow-lg flex-shrink-0">

        {/* LEFT: back arrow */}
        <button onClick={() => navigate(-1)} className="p-1.5 hover:bg-white/10 rounded-lg transition flex-shrink-0">
          <ArrowLeft size={20} />
        </button>

        {/* LEFT: support avatar with online dot */}
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 bg-blue-500 border-2 border-white/20 rounded-full flex items-center justify-center">
            <Headphones size={17} className="text-white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full" />
        </div>

        {/* CENTRE: name + status — takes remaining space */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold leading-tight">Support Team</p>
          <p className="text-[11px] text-green-400 font-medium">Online · FindMyLawyer Support</p>
        </div>

        {/* RIGHT: icon buttons — always flush right */}
        <a href="tel:1800-123-4567" className="p-2 hover:bg-white/10 rounded-lg transition flex-shrink-0">
          <Phone size={18} className="text-gray-300" />
        </a>
        <button className="p-2 hover:bg-white/10 rounded-lg transition flex-shrink-0">
          <Shield size={18} className="text-gray-300" />
        </button>
      </div>

      {/* Encrypted notice */}
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-1.5 flex items-center justify-center gap-1.5 flex-shrink-0">
        <Shield size={11} className="text-amber-500" />
        <p className="text-[11px] text-amber-700 font-medium">End-to-end encrypted · Confidential</p>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-3 py-4 space-y-3"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="flex justify-center">
          <span className="bg-white text-gray-400 text-[10px] font-medium px-3 py-1 rounded-full shadow-sm border border-gray-100">Today</span>
        </div>

        {messages.map((msg, idx) => {
          const isUser   = msg.sender === "user";
          const isSystem = msg.sender === "system";
          const isBot    = msg.sender === "bot";
          const showAvatar = isBot && (idx === 0 || messages[idx - 1]?.sender !== "bot");

          if (isSystem) return (
            <div key={msg.id} className="flex justify-center px-2">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-2.5 max-w-sm text-center shadow-sm">
                <p className="text-xs text-blue-700 leading-relaxed">{msg.text}</p>
              </div>
            </div>
          );

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mb-1 ${showAvatar ? "bg-blue-500" : "opacity-0 pointer-events-none"}`}>
                  {showAvatar && <Headphones size={13} className="text-white" />}
                </div>
              )}
              <div className={`flex flex-col gap-0.5 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm leading-relaxed ${isUser ? "bg-gray-900 text-white rounded-br-md" : "bg-white text-gray-900 rounded-bl-md"}`}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 px-1">
                  <span className="text-[10px] text-gray-400">{formatTime(msg.timestamp)}</span>
                  {isUser && (msg.read ? <CheckCheck size={12} className="text-blue-400" /> : <Clock size={11} className="text-gray-400" />)}
                </div>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex justify-start items-end gap-2">
            <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Headphones size={13} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0,150,300].map(d => <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay:`${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}

        {showQuick && (
          <div className="pt-2">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2.5 text-center">Quick Topics</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_REPLIES.map(qr => (
                <button key={qr.key} onClick={() => sendMessage(qr.label)}
                  className="bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3.5 py-2 rounded-full hover:border-gray-900 hover:text-gray-900 transition-all shadow-sm whitespace-nowrap">
                  {qr.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contact options */}
        <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold px-4 pt-3.5 pb-2">Other ways to reach us</p>
          <a href="tel:1800-123-4567" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition border-t border-gray-50 group">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg"><Phone size={14} className="text-emerald-600" /></div>
              <div><p className="text-sm font-semibold text-gray-900">Call Support</p><p className="text-xs text-gray-400">1800-123-4567 · Free</p></div>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition" />
          </a>
          <a href="mailto:support@findmylawyer.in" className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition border-t border-gray-100 group">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg"><Mail size={14} className="text-blue-600" /></div>
              <div><p className="text-sm font-semibold text-gray-900">Email Us</p><p className="text-xs text-gray-400">support@findmylawyer.in</p></div>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition" />
          </a>
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-200 px-3 py-3 flex items-end gap-2 flex-shrink-0">
        <button className="p-2.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition flex-shrink-0">
          <Paperclip size={20} />
        </button>
        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-gray-900 focus-within:bg-white transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Message support, ${userName}…`}
            rows={1}
            className="w-full bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 resize-none leading-relaxed"
            style={{ maxHeight: 120 }}
          />
        </div>
        <button onClick={() => sendMessage()} disabled={!input.trim()}
          className={`p-2.5 rounded-xl flex-shrink-0 transition-all ${input.trim() ? "bg-gray-900 text-white hover:bg-gray-700 shadow-md" : "bg-gray-100 text-gray-300 cursor-not-allowed"}`}>
          <Send size={20} />
        </button>
      </div>

    </div>
  );
}