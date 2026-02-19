import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Scale, Send, Phone, Mail,
  ChevronRight, Headphones, CheckCheck,
  Clock, Paperclip, Smile
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
  { label: "Booking Issue",   key: "booking"    },
  { label: "Payment Problem", key: "payment"    },
  { label: "Find a Lawyer",   key: "lawyer"     },
  { label: "Cancel Session",  key: "cancel"     },
  { label: "Request Refund",  key: "refund"     },
  { label: "Urgent Help",     key: "urgent"     },
];

function getBotResponse(text) {
  const lower = text.toLowerCase();
  const keys = Object.keys(BOT_RESPONSES).filter(k => k !== "default");
  for (let i = 0; i < keys.length; i++) {
    if (lower.includes(keys[i])) return BOT_RESPONSES[keys[i]];
  }
  return BOT_RESPONSES.default;
}

function getTime() {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

const INITIAL_MESSAGES = [
  {
    id: 1,
    from: "bot",
    text: "👋 Welcome to FindMyLawyer Support! I'm here to help you with bookings, payments, lawyer queries, and more.",
    time: getTime(),
    read: true,
  },
  {
    id: 2,
    from: "bot",
    text: "Please select a topic below or type your question — we typically respond within 30 minutes.",
    time: getTime(),
    read: true,
  },
];

export default function SupportChat() {
  const navigate   = useNavigate();
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const nextId     = useRef(10);

  const [userName,  setUserName]  = useState("User");
  const [messages,  setMessages]  = useState(INITIAL_MESSAGES);
  const [input,     setInput]     = useState("");
  const [typing,    setTyping]    = useState(false);
  const [showQuick, setShowQuick] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data && data.name && data.name.trim().length > 0) {
        const firstName = data.name.trim().split(" ")[0];
        setUserName(firstName);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing]);

  function sendMessage(quickText) {
    const trimmed = (quickText || input).trim();
    if (!trimmed) return;

    nextId.current += 1;
    const userId = nextId.current;

    const userMsg = {
      id:   userId,
      from: "user",
      text: trimmed,
      time: getTime(),
      read: false,
    };

    setMessages(function(prev) { return [...prev, userMsg]; });
    setInput("");
    setShowQuick(false);
    setTyping(true);

    setTimeout(function() {
      setTyping(false);

      nextId.current += 1;
      const botMsg = {
        id:   nextId.current,
        from: "bot",
        text: getBotResponse(trimmed),
        time: getTime(),
        read: true,
      };

      setMessages(function(prev) { return [...prev, botMsg]; });

      setMessages(function(prev) {
        return prev.map(function(m) {
          if (m.id === userId) return { ...m, read: true };
          return m;
        });
      });
    }, 1100);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">

      {/* HEADER */}
      <header className="bg-gray-900 text-white shadow-xl sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 max-w-2xl mx-auto">

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition"
            >
              <ArrowLeft size={16} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
                  <Headphones size={17} className="text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-gray-900 rounded-full" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">Support Team</p>
                <p className="text-[10px] text-emerald-400 font-medium">
                  ● Online · Replies within 30 min
                </p>
              </div>
            </div>
          </div>

          <a
            href="tel:1800-123-4567"
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-md"
          >
            <Phone size={14} />
            <span className="hidden sm:inline">Call Us</span>
          </a>
        </div>

        <div className="flex items-center justify-center gap-1.5 py-1.5 border-t border-white/10 bg-black/20">
          <Scale size={11} className="text-gray-400" />
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            FindMyLawyer · 24/7 Support
          </span>
        </div>
      </header>

      {/* MESSAGES */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 max-w-2xl mx-auto w-full">

        <div className="flex justify-center mb-5">
          <span className="bg-gray-200 text-gray-500 text-[10px] font-semibold px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        <div className="space-y-3">
          {messages.map(function(msg) {
            return (
              <div
                key={msg.id}
                className={"flex " + (msg.from === "user" ? "justify-end" : "justify-start")}
              >
                {msg.from === "bot" && (
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mr-2 mt-auto mb-1">
                    <Headphones size={13} className="text-white" />
                  </div>
                )}

                <div className={"max-w-xs sm:max-w-sm flex flex-col gap-1 " + (msg.from === "user" ? "items-end" : "items-start")}>
                  <div
                    className={
                      "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm " +
                      (msg.from === "user"
                        ? "bg-gray-900 text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm")
                    }
                  >
                    {msg.text}
                  </div>

                  <div className={"flex items-center gap-1 " + (msg.from === "user" ? "justify-end" : "justify-start")}>
                    <span className="text-[10px] text-gray-400">{msg.time}</span>
                    {msg.from === "user" && (
                      msg.read
                        ? <CheckCheck size={12} className="text-blue-500" />
                        : <Clock size={11} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typing && (
            <div className="flex justify-start items-end gap-2">
              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Headphones size={13} className="text-white" />
              </div>
              <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick replies */}
        {showQuick && (
          <div className="mt-5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2.5 text-center">
              Quick Topics
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_REPLIES.map(function(qr) {
                return (
                  <button
                    key={qr.key}
                    onClick={() => sendMessage(qr.label)}
                    className="bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3.5 py-2 rounded-full hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all shadow-sm"
                  >
                    {qr.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact options */}
        <div className="mt-6 mb-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold px-4 pt-3.5 pb-2">
            Other ways to reach us
          </p>

          <a
            href="tel:1800-123-4567"
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition border-t border-gray-50 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <Phone size={14} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Call Support</p>
                <p className="text-xs text-gray-400">1800-123-4567 · Free</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition" />
          </a>

          <a
            href="mailto:support@findmylawyer.in"
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition border-t border-gray-100 group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Mail size={14} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Email Us</p>
                <p className="text-xs text-gray-400">support@findmylawyer.in</p>
              </div>
            </div>
            <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition" />
          </a>
        </div>

        <div ref={bottomRef} />
      </main>

      {/* INPUT BAR */}
      <div className="bg-white border-t border-gray-200 px-3 sm:px-4 py-3 sticky bottom-0 z-10 shadow-2xl">
        <div className="max-w-2xl mx-auto flex items-end gap-2.5">

          <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition mb-0.5">
            <Paperclip size={19} />
          </button>

          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 flex items-end gap-2 min-h-[44px]">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Message support, " + userName + "…"}
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none resize-none max-h-28 leading-relaxed"
            />
            <button className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition mb-0.5">
              <Smile size={18} />
            </button>
          </div>

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className={
              "flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-md " +
              (input.trim()
                ? "bg-gray-900 hover:bg-gray-700 text-white hover:scale-105 active:scale-95"
                : "bg-gray-200 text-gray-400 cursor-not-allowed")
            }
          >
            <Send size={17} />
          </button>
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-2">
          FindMyLawyer Support · Responses within 30 minutes
        </p>
      </div>

    </div>
  );
}