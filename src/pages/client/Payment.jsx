import { ArrowLeft, Shield, CreditCard, Wallet, Building2, CheckCircle, Lock, Calendar, User, Briefcase } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingDetails = location.state;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Handle missing booking details
  if (!bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No booking details found</p>
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

  const paymentMethods = [
    {
      id: "upi",
      name: "UPI",
      icon: Wallet,
      description: "Google Pay, PhonePe, Paytm",
      popular: true
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: CreditCard,
      description: "Visa, Mastercard, RuPay"
    },
    {
      id: "netbanking",
      name: "Net Banking",
      icon: Building2,
      description: "All major banks"
    }
  ];

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      
      // Redirect to success page after 2 seconds
      setTimeout(() => {
        navigate('/booking-success', {
          state: {
            ...bookingDetails,
            bookingId: `BK${Date.now()}`,
            paymentMethod: selectedPaymentMethod
          }
        });
      }, 2000);
    }, 2000);
  };

  const getConsultationType = (type) => {
    if (type === "call") return "Call Consultation";
    if (type === "inPerson") return "In-Person Meeting";
    if (type === "video") return "Video Call";
    return "Call Consultation";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 py-5 flex items-center gap-4 shadow-lg sticky top-0 z-10">
        <ArrowLeft
          className="cursor-pointer hover:scale-110 transition-transform"
          onClick={() => navigate(-1)}
          size={22}
        />
        <div>
          <h1 className="text-xl font-bold">Payment</h1>
          <p className="text-sm text-gray-300 mt-0.5">Complete your booking</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Security Badge */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="bg-green-600 p-2 rounded-full">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-green-900">Secure Payment</p>
            <p className="text-sm text-green-700">Your payment information is encrypted and secure</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column - Payment Methods */}
          <div className="lg:col-span-2 space-y-6">

            {/* Booking Summary */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User size={20} className="text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Lawyer</p>
                    <p className="font-semibold text-gray-900">{bookingDetails.lawyer}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Briefcase size={20} className="text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Consultation Type</p>
                    <p className="font-semibold text-gray-900">
                      {getConsultationType(bookingDetails.type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={20} className="text-gray-500 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Scheduled Time</p>
                    <p className="font-semibold text-gray-900">{bookingDetails.slot}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Select Payment Method</h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                        selectedPaymentMethod === method.id
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          selectedPaymentMethod === method.id ? "bg-gray-900" : "bg-gray-100"
                        }`}>
                          <Icon size={24} className={
                            selectedPaymentMethod === method.id ? "text-white" : "text-gray-600"
                          } />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{method.name}</p>
                            {method.popular && (
                              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === method.id
                          ? "border-gray-900 bg-gray-900"
                          : "border-gray-300"
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Payment Details Form */}
              {selectedPaymentMethod === "upi" && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter UPI ID
                  </label>
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              )}

              {selectedPaymentMethod === "card" && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          maxLength={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === "netbanking" && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Your Bank
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent">
                    <option value="">Choose your bank</option>
                    <option value="sbi">State Bank of India</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                    <option value="pnb">Punjab National Bank</option>
                  </select>
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Consultation Fee</span>
                  <span className="font-semibold text-gray-900">{bookingDetails.fee}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Platform Fee</span>
                  <span className="font-semibold text-gray-900">₹50</span>
                </div>
                <div className="flex items-center justify-between text-green-600">
                  <span>Discount</span>
                  <span className="font-semibold">- ₹0</span>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{parseInt(bookingDetails.fee.replace('₹', '')) + 50}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || paymentSuccess}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                  paymentSuccess
                    ? "bg-green-600 text-white"
                    : isProcessing
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 hover:shadow-xl hover:scale-105 active:scale-95"
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : paymentSuccess ? (
                  <>
                    <CheckCircle size={20} />
                    <span>Payment Successful!</span>
                  </>
                ) : (
                  <>
                    <Lock size={20} />
                    <span>Pay ₹{parseInt(bookingDetails.fee.replace('₹', '')) + 50}</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By proceeding, you agree to our Terms & Conditions
              </p>

              {/* Security Features */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-700 mb-3">Secured by:</p>
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <Shield size={24} className="text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">SSL Encrypted</p>
                  </div>
                  <div className="text-center">
                    <Lock size={24} className="text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">PCI Compliant</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}