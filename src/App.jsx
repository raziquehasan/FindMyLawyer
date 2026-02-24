import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage         from "./pages/LandingPage";           // 🆕 NEW
import Login               from "./pages/auth/Login";
import Register            from "./pages/auth/Register";
import UserHome            from "./pages/client/UserHome";
import RequestConsultation from "./pages/client/RequestConsultation";
import LawyersList         from "./pages/client/LawyersList";
import LawyerProfile       from "./pages/client/LawyerProfile";
import Payment             from "./pages/client/Payment";
import BookingSuccess      from "./pages/client/BookingSuccess";
import MyCases             from "./pages/client/MyCases";
import CaseDetails         from "./pages/client/Casedetails";    // ✅ lowercase d
import Profile             from "./pages/client/Profile";
import SupportChat         from "./pages/client/Supportchat";

function App() {
  return (
    <Routes>
      {/* 🆕 Landing page is now the root */}
      <Route path="/"         element={<LandingPage />} />

      {/* 🔄 Login moved from "/" to "/login" */}
      <Route path="/login"    element={<Login />} />

      <Route path="/register"                 element={<Register />} />
      <Route path="/client-dashboard"         element={<UserHome />} />
      <Route path="/client-dashboard/request" element={<RequestConsultation />} />
      <Route path="/client-dashboard/lawyers" element={<LawyersList />} />
      <Route path="/lawyer/:id"               element={<LawyerProfile />} />
      <Route path="/payment"                  element={<Payment />} />
      <Route path="/booking-success"          element={<BookingSuccess />} />
      <Route path="/my-cases"                 element={<MyCases />} />
      <Route path="/my-cases/:bookingId"      element={<CaseDetails />} />  {/* ✅ NEW */}
      <Route path="/profile"                  element={<Profile />} />
      <Route path="/support-chat"             element={<SupportChat />} />
      <Route path="*"                         element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;