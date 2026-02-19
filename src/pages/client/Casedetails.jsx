import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, User, Briefcase, DollarSign, CreditCard,
  CheckCircle, Clock, AlertCircle, Star, Phone, MessageSquare,
  Send, Paperclip, FileText, Download, X, Image as ImageIcon,
  MapPin, Shield
} from "lucide-react";

const PROGRESS_STEPS = [
  { key: "booked",     label: "Booked",      icon: CheckCircle },
  { key: "confirmed",  label: "Confirmed",   icon: AlertCircle },
  { key: "inprogress", label: "In Progress", icon: Clock       },
  { key: "completed",  label: "Completed",   icon: Star        },
];

const statusToStep = (status) => {
  switch ((status || "").toLowerCase()) {
    case "upcoming":   return 1;
    case "inprogress": return 2;
    case "completed":  return 3;
    default:           return 0;
  }
};

export default function CaseDetails() {
  const navigate    = useNavigate();
  const { bookingId } = useParams();
  const chatEndRef  = useRef(null);
  const fileInputRef = useRef(null);

  const [booking,      setBooking]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState("details");
  const [messages,     setMessages]     = useState([]);
  const [newMessage,   setNewMessage]   = useState("");
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploading,    setUploading]    = useState(false);

  useEffect(() => {
    // Step 1: get user
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }

    let user = null;
    try {
      user = JSON.parse(userData);
    } catch {
      navigate("/");
      return;
    }

    if (!user || !user.email) {
      navigate("/");
      return;
    }

    // Step 2: get ALL bookings stored under this user
    const key    = `bookings_${user.email}`;
    const stored = localStorage.getItem(key);

    if (!stored) {
      setLoading(false);
      return;
    }

    let bookings = [];
    try {
      bookings = JSON.parse(stored);
    } catch {
      setLoading(false);
      return;
    }

    // Step 3: find the booking matching the URL param
    const found = bookings.find(
      (b) => String(b.bookingId) === String(bookingId)
    );

    if (found) {
      setBooking(found);

      // Load chat
      try {
        const chatData = localStorage.getItem(`chat_${bookingId}`);
        if (chatData) setMessages(JSON.parse(chatData));
      } catch { /* ignore */ }

      // Load docs
      try {
        const docsData = localStorage.getItem(`docs_${bookingId}`);
        if (docsData) setUploadedDocs(JSON.parse(docsData));
      } catch { /* ignore */ }
    }

    setLoading(false);
  }, [bookingId, navigate]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const msg = {
      id:        Date.now(),
      sender:    "client",
      text:      newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, msg];
    setMessages(updated);
    setNewMessage("");
    localStorage.setItem(`chat_${bookingId}`, JSON.stringify(updated));

    setTimeout(() => {
      const autoReply = {
        id:        Date.now() + 1,
        sender:    "lawyer",
        text:      "Thank you for your message. I'll review this and get back to you shortly.",
        timestamp: new Date().toISOString(),
      };
      const withReply = [...updated, autoReply];
      setMessages(withReply);
      localStorage.setItem(`chat_${bookingId}`, JSON.stringify(withReply));
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    setTimeout(() => {
      const newDocs = files.map((file) => ({
        id:         Date.now() + Math.random(),
        name:       file.name,
        size:       `${(file.size / 1024).toFixed(1)} KB`,
        type:       file.type,
        uploadedAt: new Date().toISOString(),
      }));

      const updated = [...uploadedDocs, ...newDocs];
      setUploadedDocs(updated);
      localStorage.setItem(`docs_${bookingId}`, JSON.stringify(updated));
      setUploading(false);

      const uploadMsg = {
        id:          Date.now(),
        sender:      "client",
        text:        `Uploaded ${files.length} document${files.length > 1 ? "s" : ""}: ${files.map((f) => f.name).join(", ")}`,
        timestamp:   new Date().toISOString(),
        isSystemMsg: true,
      };
      const updatedMsgs = [...messages, uploadMsg];
      setMessages(updatedMsgs);
      localStorage.setItem(`chat_${bookingId}`, JSON.stringify(updatedMsgs));
    }, 1000);
  };

  const removeDocument = (docId) => {
    const updated = uploadedDocs.filter((d) => d.id !== docId);
    setUploadedDocs(updated);
    localStorage.setItem(`docs_${bookingId}`, JSON.stringify(updated));
  };

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "completed":  return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "upcoming":   return "text-blue-600 bg-blue-50 border-blue-200";
      case "inprogress": return "text-amber-600 bg-amber-50 border-amber-200";
      default:           return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatTimestamp = (iso) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading case details...</p>
      </div>
    );
  }

  // ── Booking not found — show message instead of redirecting ──
  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Case Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            We couldn't find a case with ID: <span className="font-mono font-bold">{bookingId}</span>
          </p>
          <button
            onClick={() => navigate("/my-cases")}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
          >
            ← Back to My Cases
          </button>
        </div>
      </div>
    );
  }

  const activeStep    = statusToStep(booking.status);
  const isChatEnabled = booking.status === "inprogress" || booking.status === "completed";

  return (
    <div className="min-h-screen bg-gray-50 pb-6">

      {/* Header */}
      <header className="bg-gray-900 text-white sticky top-0 z-20 shadow-xl">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4 max-w-5xl mx-auto">
          <button
            onClick={() => navigate("/my-cases")}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <h1 className="text-base sm:text-lg font-bold">Case Details</h1>
            <p className="text-xs text-gray-400 font-mono">{booking.bookingId}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
            {booking.status === "upcoming"   ? "Upcoming"    :
             booking.status === "inprogress" ? "In Progress" :
             booking.status === "completed"  ? "Completed"   : "Upcoming"}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-3 sm:px-4 pt-6">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "details"
                ? "bg-gray-900 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Case Info
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === "chat"
                ? "bg-gray-900 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <MessageSquare size={16} />
            Chat
            {!isChatEnabled && (
              <span className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full">
                Locked
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "documents"
                ? "bg-gray-900 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Docs ({uploadedDocs.length})
          </button>
        </div>

        {/* DETAILS TAB */}
        {activeTab === "details" && (
          <div className="space-y-6">

            {/* Lawyer Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-bold text-white">
                    {(booking.lawyer || "L")[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{booking.lawyer}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Legal Specialist</p>
                  <div className="flex items-center gap-2 mt-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600">Delhi High Court</span>
                  </div>
                </div>
                <button
                  onClick={() => (window.location.href = "tel:+919876543210")}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition"
                >
                  <Phone size={16} />
                  Call
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Case Progress
              </h3>
              <div className="relative flex items-center justify-between">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
                <div
                  className="absolute top-4 left-0 h-0.5 bg-gray-900 z-0 transition-all duration-700"
                  style={{ width: `${(activeStep / (PROGRESS_STEPS.length - 1)) * 100}%` }}
                />
                {PROGRESS_STEPS.map((step, i) => {
                  const done   = i <= activeStep;
                  const active = i === activeStep;
                  const Icon   = step.icon;
                  return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center gap-2 flex-1">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                          done
                            ? "bg-gray-900 border-gray-900 text-white"
                            : "bg-white border-gray-300 text-gray-400"
                        } ${active ? "ring-4 ring-gray-900/20 scale-110" : ""}`}
                      >
                        <Icon size={16} />
                      </div>
                      <span className={`text-xs font-medium text-center ${done ? "text-gray-900" : "text-gray-400"}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consultation Details */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                Consultation Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <Briefcase size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {booking.type === "call"     ? "Call Consultation" :
                       booking.type === "inPerson" ? "In-Person Meeting" :
                       booking.type === "video"    ? "Video Call"        : booking.type || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <Calendar size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Scheduled</p>
                    <p className="text-sm font-semibold text-gray-900">{booking.slot}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <DollarSign size={18} className="text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-emerald-600 mb-1">Amount Paid</p>
                    <p className="text-sm font-bold text-emerald-700">{booking.fee}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <CreditCard size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{booking.paymentMethod}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
            {!isChatEnabled ? (
              <div className="flex-1 flex items-center justify-center p-10 text-center">
                <div>
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} className="text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Chat Not Available Yet</h3>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto">
                    Chat will be enabled once the lawyer confirms your consultation.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center py-10">
                      <MessageSquare size={40} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "client" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 ${
                          msg.isSystemMsg
                            ? "bg-blue-50 text-blue-700 italic text-xs"
                            : msg.sender === "client"
                            ? "bg-gray-900 text-white rounded-br-sm"
                            : "bg-gray-100 text-gray-900 rounded-bl-sm"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender === "client" ? "text-gray-300" : "text-gray-500"}`}>
                          {formatTimestamp(msg.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="flex items-end gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-gray-600"
                    >
                      <Paperclip size={18} />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className={`p-2.5 rounded-xl transition ${
                        newMessage.trim()
                          ? "bg-gray-900 text-white hover:bg-gray-800"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  {uploading && <p className="text-xs text-blue-600 mt-2">Uploading documents...</p>}
                </div>
              </>
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Uploaded Documents</h3>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
              >
                <Paperclip size={16} />
                Upload
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </div>

            {uploadedDocs.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">No documents uploaded yet</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-blue-600 font-semibold hover:text-blue-700"
                >
                  Upload your first document
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                        {doc.type?.includes("image") ? (
                          <ImageIcon size={20} className="text-blue-600" />
                        ) : (
                          <FileText size={20} className="text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {doc.size} · {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className="p-2 text-gray-600 hover:text-blue-600 transition">
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}