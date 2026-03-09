import { ArrowLeft, Briefcase, Clock, MapPin, Award, CheckCircle, Calendar, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useRef } from "react";

export default function LawyerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const caseType = location.state?.caseType || "";
  const { id }   = useParams();

  const [selectedTimeSlot,  setSelectedTimeSlot]  = useState(null);
  const [expandedExpertise, setExpandedExpertise] = useState(null); // index or null
  const availabilityRef = useRef(null);

  if (!id) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-xl text-gray-600 mb-4">Lawyer not found</p>
        <button onClick={() => navigate('/client-dashboard/lawyers')} className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800">
          Back to Lawyers List
        </button>
      </div>
    </div>
  );

  const lawyer = {
    id: parseInt(id),
    name: "Adv. Rajesh Sharma",
    specialization: "Criminal Law",
    experience: "8 Years Experience",
    location: "Delhi High Court, New Delhi",
    languages: ["Hindi", "English", "Punjabi"],
    education: [
      "LLB - Delhi University (2015)",
      "LLM - National Law School (2017)",
    ],
    certifications: [
      "Bar Council of India Certified",
      "Criminal Law Specialist",
    ],
    about: "Experienced criminal lawyer with a proven track record of handling complex cases. Specialized in white-collar crimes, cyber crimes, and criminal defense. Known for thorough case preparation and strong courtroom presence.",
    expertise: [
      {
        label: "White Collar Crimes",
        desc:  "Fraud, embezzlement, bribery, money laundering, and financial crime defense before Sessions and High Courts.",
      },
      {
        label: "Cyber Crimes",
        desc:  "IT Act violations, online fraud, hacking, identity theft, and digital evidence matters.",
      },
      {
        label: "Criminal Defense",
        desc:  "Full-spectrum criminal defense from FIR stage through trial, appeals, and revisions.",
      },
      {
        label: "Bail Applications",
        desc:  "Regular bail, anticipatory bail, and bail modifications across all courts including Supreme Court.",
      },
      {
        label: "Appeals & Revisions",
        desc:  "Criminal appeals before Sessions Court, High Court, and the Supreme Court of India.",
      },
    ],
    fee: "₹1500",
    availability: [
      { day: "Today",       slots: ["10:00 AM", "2:00 PM", "4:00 PM"]             },
      { day: "Tomorrow",    slots: ["9:00 AM", "11:00 AM", "3:00 PM", "5:00 PM"] },
      { day: "Wed, Feb 18", slots: ["10:00 AM", "1:00 PM", "4:00 PM"]             },
    ],
    phone: "+91 98765 43210",
  };

  /* Scroll to availability section */
  const handleBookNow = () => {
    availabilityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  /* Proceed to payment */
  const handleProceed = () => {
    if (!selectedTimeSlot) {
      availabilityRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    navigate('/payment', {
      state: {
        lawyerId:             lawyer.id,
        lawyer:               lawyer.name,
        lawyerPhone:          lawyer.phone,
        lawyerSpecialization: lawyer.specialization,
        type:                 "consultation",
        fee:                  lawyer.fee,
        slot:                 selectedTimeSlot,
        caseType,
        lawyerExp:            lawyer.experience,
        lawyerForum:          "High Court",
      },
    });
  };

  /* Toggle expand-all / collapse-all */
  const allExpanded = expandedExpertise === "all";
  const toggleAll   = () => setExpandedExpertise(allExpanded ? null : "all");
  const isOpen      = (i) => expandedExpertise === i || allExpanded;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">

      {/* ── HEADER ── */}
      <div className="bg-gray-900 text-white px-5 py-4 flex items-center gap-4 shadow-lg sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="flex-shrink-0 hover:opacity-70 transition">
          <ArrowLeft size={22} />
        </button>
        <div>
          <h1 className="text-base font-bold leading-tight">Lawyer Profile</h1>
          <p className="text-xs text-gray-400 mt-0.5">Book your consultation</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">

            {/* Avatar */}
            <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-xl font-bold text-white">{lawyer.name.split(' ')[1][0]}</span>
            </div>

            <div className="flex-1 min-w-0">
              {/* Name row */}
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-900 leading-snug">{lawyer.name}</h2>
                <span className="flex-shrink-0 bg-gray-900 text-white text-sm font-bold px-3 py-1.5 rounded-xl shadow-sm">
                  {lawyer.fee}
                </span>
              </div>

              {/* Specialization + meta */}
              <div className="flex items-center gap-1.5 mt-1">
                <Briefcase size={13} className="text-gray-400 flex-shrink-0" />
                <p className="text-sm text-gray-600 font-medium">{lawyer.specialization}</p>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={11} className="text-gray-400" />{lawyer.experience}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={11} className="text-gray-400" />{lawyer.location}
                </span>
              </div>

              {/* Book Consultation CTA */}
              <button
                onClick={handleBookNow}
                className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-md"
              >
                <Calendar size={15} />
                Book Consultation
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-2.5">About</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{lawyer.about}</p>
        </div>

        {/* ── AREAS OF EXPERTISE — accordion ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Section header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Areas of Expertise</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Tap any area to learn more</p>
            </div>
            <button
              onClick={toggleAll}
              className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-2.5 py-1 rounded-lg transition-all"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          </div>

          {/* Items */}
          <div className="divide-y divide-gray-50 border-t border-gray-100">
            {lawyer.expertise.map((item, i) => {
              const open = isOpen(i);
              return (
                <button
                  key={i}
                  onClick={() => setExpandedExpertise(open && expandedExpertise === i ? null : i)}
                  className="w-full text-left px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${open ? "bg-gray-900" : "bg-gray-300"}`} />
                      <span className={`text-sm font-semibold transition-colors ${open ? "text-gray-900" : "text-gray-600"}`}>
                        {item.label}
                      </span>
                    </div>
                    {open
                      ? <ChevronUp  size={15} className="text-gray-500 flex-shrink-0" />
                      : <ChevronDown size={15} className="text-gray-300 flex-shrink-0" />
                    }
                  </div>

                  {open && (
                    <p className="text-xs text-gray-500 leading-relaxed mt-2 ml-[18px] pl-3 border-l-2 border-gray-200">
                      {item.desc}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── EDUCATION & CERTIFICATIONS ── */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Education & Certifications</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Award size={13} className="text-blue-500" />Education
              </h4>
              <ul className="space-y-2 ml-4">
                {lawyer.education.map((edu, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    {edu}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Award size={13} className="text-violet-500" />Certifications
              </h4>
              <ul className="space-y-2 ml-4">
                {lawyer.certifications.map((cert, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={13} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    {cert}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-700">Languages: </span>
              {lawyer.languages.join(" · ")}
            </p>
          </div>
        </div>

        {/* ── AVAILABILITY & BOOKING ── */}
        <div ref={availabilityRef} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 scroll-mt-20">

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-gray-700" />
              Select Date & Time
            </h3>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
              Fee: {lawyer.fee}
            </span>
          </div>

          {/* Slot grid per day */}
          <div className="space-y-5">
            {lawyer.availability.map((daySlots, di) => (
              <div key={di}>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{daySlots.day}</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {daySlots.slots.map((slot, si) => {
                    const key      = `${daySlots.day} - ${slot}`;
                    const selected = selectedTimeSlot === key;
                    return (
                      <button
                        key={si}
                        onClick={() => setSelectedTimeSlot(key)}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                          selected
                            ? "bg-gray-900 border-gray-900 text-white shadow-md"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Selected summary */}
          {selectedTimeSlot && (
            <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-2.5 rounded-xl">
              <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Selected: </span>{selectedTimeSlot}
              </p>
            </div>
          )}

          {/* Fee row */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Consultation Fee</span>
            <span className="text-sm font-bold text-gray-900">{lawyer.fee}</span>
          </div>

          {/* Proceed button */}
          <button
            onClick={handleProceed}
            className={`mt-3 w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              selectedTimeSlot
                ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl active:scale-95"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {selectedTimeSlot
              ? <><span>₹</span> Proceed to Payment <ArrowRight size={15} /></>
              : <>↑ Select a time slot above</>
            }
          </button>

          <p className="text-[10px] text-gray-400 text-center mt-2.5">
            Secure payment · Instant confirmation
          </p>
        </div>

      </div>
    </div>
  );
}