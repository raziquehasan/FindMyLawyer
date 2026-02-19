import { ArrowLeft, Star, Briefcase, Clock, Phone, MessageSquare, MapPin, Award, CheckCircle, Calendar, DollarSign } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

export default function LawyerProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  // Only call consultation available

  // Handle missing ID
  if (!id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Lawyer not found</p>
          <button
            onClick={() => navigate('/client-dashboard/lawyers')}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800"
          >
            Back to Lawyers List
          </button>
        </div>
      </div>
    );
  }

  // Mock lawyer data
  const lawyer = {
    id: parseInt(id),
    name: "Adv. Rajesh Sharma",
    specialization: "Criminal Law",
    experience: "8 Years Experience",
    rating: 4.8,
    reviews: 127,
    totalCases: 450,
    successRate: 92,
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
    expertise: [
      "White Collar Crimes",
      "Cyber Crimes",
      "Criminal Defense",
      "Bail Applications",
      "Appeals & Revisions"
    ],
    fees: {
      call: "₹1500"
    },
    availability: [
      { day: "Today", slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
      { day: "Tomorrow", slots: ["9:00 AM", "11:00 AM", "3:00 PM", "5:00 PM"] },
      { day: "Wed, Feb 18", slots: ["10:00 AM", "1:00 PM", "4:00 PM"] }
    ],
    phone: "+91 98765 43210",
    recentReviews: [
      {
        id: 1,
        name: "Amit Kumar",
        rating: 5,
        date: "2 days ago",
        comment: "Excellent lawyer! Very professional and helped me win my case. Highly recommended for criminal matters."
      },
      {
        id: 2,
        name: "Priya Singh",
        rating: 5,
        date: "1 week ago",
        comment: "Very knowledgeable and patient. Explained everything clearly and was available whenever I needed guidance."
      },
      {
        id: 3,
        name: "Rahul Verma",
        rating: 4,
        date: "2 weeks ago",
        comment: "Good experience overall. Professional approach and timely updates on case progress."
      }
    ]
  };

  const handleProceedToPayment = () => {
    if (!selectedTimeSlot) {
      alert("Please select a time slot");
      return;
    }
    navigate('/payment', {
      state: {
        lawyer: lawyer.name,
        type: "call",
        fee: lawyer.fees.call,
        slot: selectedTimeSlot
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-5 flex items-center gap-4 shadow-lg sticky top-0 z-10">
        <ArrowLeft
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => navigate(-1)}
          size={22}
        />
        <div>
          <h1 className="text-xl font-bold">Lawyer Profile</h1>
          <p className="text-sm text-gray-300 mt-0.5">Book your consultation</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {lawyer.name.split(' ')[1][0]}
                </span>
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{lawyer.name}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Briefcase size={18} className="text-gray-500" />
                    <p className="text-lg font-medium text-gray-700">{lawyer.specialization}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={16} className="text-gray-500" />
                    <p className="text-sm text-gray-600">{lawyer.experience}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={16} className="text-gray-500" />
                    <p className="text-sm text-gray-600">{lawyer.location}</p>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                    <Star size={20} fill="#f59e0b" stroke="#f59e0b" />
                    <span className="text-lg font-bold text-amber-700">{lawyer.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500 mt-1">{lawyer.reviews} reviews</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">{lawyer.totalCases}</p>
                  <p className="text-xs text-gray-600 mt-1">Cases Handled</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-xl">
                  <p className="text-2xl font-bold text-green-600">{lawyer.successRate}%</p>
                  <p className="text-xs text-gray-600 mt-1">Success Rate</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">{lawyer.reviews}</p>
                  <p className="text-xs text-gray-600 mt-1">Client Reviews</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => window.location.href = `tel:${lawyer.phone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
                >
                  <Phone size={18} />
                  <span>Call Now</span>
                </button>
                <button
                  onClick={() => navigate(`/chat/${lawyer.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
                >
                  <MessageSquare size={18} />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About</h3>
              <p className="text-gray-700 leading-relaxed">{lawyer.about}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Areas of Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {lawyer.expertise.map((area, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Education & Certifications</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Award size={18} className="text-blue-600" />
                    Education
                  </h4>
                  <ul className="space-y-2 ml-7">
                    {lawyer.education.map((edu, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Award size={18} className="text-purple-600" />
                    Certifications
                  </h4>
                  <ul className="space-y-2 ml-7">
                    {lawyer.certifications.map((cert, index) => (
                      <li key={index} className="text-gray-700 flex items-start gap-2">
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

            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Client Reviews</h3>
              
              <div className="space-y-4">
                {lawyer.recentReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{review.name}</p>
                        <p className="text-xs text-gray-500">{review.date}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                        <Star size={14} fill="#f59e0b" stroke="#f59e0b" />
                        <span className="text-sm font-bold text-amber-700">{review.rating}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>

              <button className="mt-4 w-full text-center text-blue-600 font-semibold hover:text-blue-700 transition">
                View All {lawyer.reviews} Reviews
              </button>
            </div>

          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Book Consultation
              </h3>

              {/* Consultation Type - Call Only */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Consultation Type
                </label>
                <div className="p-4 rounded-xl border-2 border-gray-900 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone size={20} className="text-gray-900" />
                    <span className="font-medium text-gray-900">Call Consultation</span>
                  </div>
                  <span className="font-bold text-gray-900">{lawyer.fees.call}</span>
                </div>
              </div>

              {/* Time Slots */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 mb-3 block">
                  Select Date & Time
                </label>
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

              {/* Fee Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-bold text-gray-900">{lawyer.fees.call}</span>
                </div>
                {selectedTimeSlot && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Selected:</span> {selectedTimeSlot}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-semibold">Type:</span> Call Consultation
                    </p>
                  </div>
                )}
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 rounded-xl font-bold hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
               ₹ Proceed to Payment

              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Secure payment • Get instant confirmation
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}