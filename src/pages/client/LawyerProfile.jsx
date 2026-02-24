import { ArrowLeft, Star, Briefcase, Clock, Phone, MessageSquare, MapPin, Award, CheckCircle, Calendar } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState } from "react";

export default function LawyerProfile() {
  const navigate = useNavigate();
  const location  = useLocation();
  const caseType  = location.state?.caseType || "";
  const { id } = useParams();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Lawyer not found</p>
          <button onClick={() => navigate('/client-dashboard/lawyers')} className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800">
            Back to Lawyers List
          </button>
        </div>
      </div>
    );
  }

  const lawyer = {
    id: parseInt(id),
    name: "Adv. Rajesh Sharma",
    specialization: "Criminal Law",
    experience: "8 Years Experience",
    rating: 4.8,
    reviews: 127,
    location: "Delhi High Court, New Delhi",
    languages: ["Hindi", "English", "Punjabi"],
    education: [
      "LLB - Delhi University (2015)",
      "LLM - National Law School (2017)"
    ],
    certifications: [
      "Bar Council of India Certified",
      "Criminal Law Specialist"
    ],
    about: "Experienced criminal lawyer with a proven track record of handling complex cases. Specialized in white-collar crimes, cyber crimes, and criminal defense. Known for thorough case preparation and strong courtroom presence.",
    expertise: ["White Collar Crimes", "Cyber Crimes", "Criminal Defense", "Bail Applications", "Appeals & Revisions"],
    fees: { call: "₹1500" },
    availability: [
      { day: "Today",       slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
      { day: "Tomorrow",    slots: ["9:00 AM", "11:00 AM", "3:00 PM", "5:00 PM"] },
      { day: "Wed, Feb 18", slots: ["10:00 AM", "1:00 PM", "4:00 PM"] }
    ],
    phone: "+91 98765 43210",
  };

  const handleProceedToPayment = () => {
    if (!selectedTimeSlot) { alert("Please select a time slot"); return; }
    navigate('/payment', {
      state: { lawyerId: lawyer.id, lawyer: lawyer.name, lawyerPhone: lawyer.phone, lawyerRating: lawyer.rating, lawyerReviews: lawyer.reviews, lawyerSpecialization: lawyer.specialization, type: "call", fee: lawyer.fees.call, slot: selectedTimeSlot, caseType, lawyerExp: lawyer.experience, lawyerForum: "High Court" }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-5 flex items-center gap-4 shadow-lg sticky top-0 z-10">
        <ArrowLeft className="cursor-pointer hover:scale-110 transition-transform" onClick={() => navigate(-1)} size={22} />
        <div>
          <h1 className="text-xl font-bold">Lawyer Profile</h1>
          <p className="text-sm text-gray-300 mt-0.5">Book your consultation</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Profile Header Card — small avatar */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-start gap-4">

            {/* ✅ Small avatar */}
            <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-white">{lawyer.name.split(' ')[1][0]}</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{lawyer.name}</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Briefcase size={14} className="text-gray-500" />
                    <p className="text-sm font-medium text-gray-700">{lawyer.specialization}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock size={13} className="text-gray-400" />
                    <p className="text-xs text-gray-500">{lawyer.experience}</p>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin size={13} className="text-gray-400" />
                    <p className="text-xs text-gray-500">{lawyer.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 self-start">
                  <Star size={16} fill="#f59e0b" stroke="#f59e0b" />
                  <span className="text-sm font-bold text-amber-700">{lawyer.rating}</span>
                  <span className="text-xs text-gray-500">({lawyer.reviews})</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => window.location.href = `tel:${lawyer.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-all shadow-md hover:scale-105 active:scale-95"
                >
                  <Phone size={16} /> Call Now
                </button>
                <button
                  onClick={() => navigate(`/chat/${lawyer.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md hover:scale-105 active:scale-95"
                >
                  <MessageSquare size={16} /> Chat
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            {/* About */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed">{lawyer.about}</p>
            </div>

            {/* Expertise */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {lawyer.expertise.map((area, i) => (
                  <span key={i} className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium">{area}</span>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Education & Certifications</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Award size={18} className="text-blue-600" /> Education
                  </h4>
                  <ul className="space-y-2 ml-7">
                    {lawyer.education.map((edu, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Award size={18} className="text-purple-600" /> Certifications
                  </h4>
                  <ul className="space-y-2 ml-7">
                    {lawyer.certifications.map((cert, i) => (
                      <li key={i} className="text-gray-700 flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Languages:</span> {lawyer.languages.join(", ")}
                </p>
              </div>
            </div>

          </div>

          {/* Right — Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} /> Book Consultation
              </h3>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Consultation Type</label>
                <div className="p-4 rounded-xl border-2 border-gray-900 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-gray-900" />
                    <span className="font-medium text-gray-900">Call Consultation</span>
                  </div>
                  <span className="font-bold text-gray-900">{lawyer.fees.call}</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">Select Date & Time</label>
                <div className="space-y-4">
                  {lawyer.availability.map((daySlots, dayIndex) => (
                    <div key={dayIndex}>
                      <p className="text-sm font-medium text-gray-600 mb-2">{daySlots.day}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {daySlots.slots.map((slot, slotIndex) => (
                          <button
                            key={slotIndex}
                            onClick={() => setSelectedTimeSlot(`${daySlots.day} - ${slot}`)}
                            className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                              selectedTimeSlot === `${daySlots.day} - ${slot}`
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-bold text-gray-900">{lawyer.fees.call}</span>
                </div>
                {selectedTimeSlot && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600"><span className="font-semibold">Selected:</span> {selectedTimeSlot}</p>
                    <p className="text-xs text-gray-600 mt-1"><span className="font-semibold">Type:</span> Call Consultation</p>
                  </div>
                )}
              </div>

              <button
                onClick={handleProceedToPayment}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                ₹ Proceed to Payment
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">Secure payment • Get instant confirmation</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}