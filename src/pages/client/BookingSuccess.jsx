import { CheckCircle, Calendar, User, Briefcase, Download, Home, MessageSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingDetails = location.state;

  useEffect(() => {
    // ✅ FIX: Save booking scoped to the current logged-in user's email
    if (bookingDetails) {
      const userData = localStorage.getItem("user");
      let user = null;
      try { user = userData ? JSON.parse(userData) : null; } catch { user = null; }

      // Use user-scoped key if user is logged in, otherwise fallback
      const userBookingsKey = user?.email
        ? `bookings_${user.email}`
        : "bookings_guest";

      const existingBookings = localStorage.getItem(userBookingsKey);
      let bookings = [];
      try { bookings = existingBookings ? JSON.parse(existingBookings) : []; } catch { bookings = []; }
      if (!Array.isArray(bookings)) bookings = [];

      const newBooking = {
        ...bookingDetails,
        status: "upcoming",
        bookedAt: new Date().toISOString(),
        lawyerId: 1,
      };

      bookings.push(newBooking);
      localStorage.setItem(userBookingsKey, JSON.stringify(bookings));
    }
  }, [bookingDetails]);

  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No booking details found</p>
          <button
            onClick={() => navigate('/client-dashboard')}
            className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">

      <div className="max-w-2xl w-full">

        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-4 animate-bounce">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">Your consultation has been successfully booked</p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 mb-6">

          {/* Booking ID */}
          <div className="text-center mb-6 pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-500 mb-1">Booking ID</p>
            <p className="text-2xl font-bold text-gray-900">{bookingDetails.bookingId}</p>
          </div>

          {/* Details Grid */}
          <div className="space-y-5">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <User size={24} className="text-gray-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Lawyer</p>
                <p className="font-semibold text-gray-900 text-lg">{bookingDetails.lawyer}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <Briefcase size={24} className="text-gray-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Consultation Type</p>
                <p className="font-semibold text-gray-900">
                  {bookingDetails.type === 'call' ? 'Call Consultation' :
                   bookingDetails.type === 'inPerson' ? 'In-Person Meeting' :
                   bookingDetails.type === 'video' ? 'Video Call' : 'Call Consultation'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <Calendar size={24} className="text-gray-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Scheduled Time</p>
                <p className="font-semibold text-gray-900">{bookingDetails.slot}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle size={24} className="text-green-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-green-700">Payment Status</p>
                <p className="font-semibold text-green-900">Paid - {bookingDetails.fee}</p>
                <p className="text-xs text-green-600 mt-1 capitalize">via {bookingDetails.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Note:</span> You will receive a confirmation email and SMS with meeting details shortly.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/client-dashboard')}
            className="flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-md border border-gray-200"
          >
            <Home size={20} />
            <span>Go Home</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-md border border-gray-200"
          >
            <Download size={20} />
            <span>Download</span>
          </button>

          <button
            onClick={() => navigate('/my-cases')}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 rounded-xl font-semibold hover:from-gray-800 hover:to-gray-700 transition-all shadow-lg hover:scale-105"
          >
            <MessageSquare size={20} />
            <span>My Cases</span>
          </button>
        </div>

      </div>
    </div>
  );
}