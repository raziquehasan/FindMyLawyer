import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import RegisterLawyer from "./pages/RegisterLawyer";
import LawyerUpload from "./pages/LawyerUpload";
import LawyerDashboard from "./pages/LawyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";

// Onboarding Pages
import OnboardingProfile from "./pages/OnboardingProfile";
import OnboardingPhoto from "./pages/OnboardingPhoto";
import OnboardingLegal from "./pages/OnboardingLegal";
import OnboardingAvailability from "./pages/OnboardingAvailability";

// Route Guards
import LawyerRoute from "./routes/LawyerRoute";
import AdminRoute from "./routes/AdminRoute";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/lawyer" element={<RegisterLawyer />} />

          {/* Lawyer Routes */}
          <Route path="/lawyer/dashboard" element={<LawyerRoute><LawyerDashboard /></LawyerRoute>} />
          <Route path="/lawyer/upload" element={<LawyerRoute><LawyerUpload /></LawyerRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Client Routes */}
          <Route path="/dashboard" element={<ClientDashboard />} />

          {/* Onboarding Flow - Protected for Lawyers */}
          <Route path="/onboarding/profile" element={<LawyerRoute><OnboardingProfile /></LawyerRoute>} />
          <Route path="/onboarding/photo" element={<LawyerRoute><OnboardingPhoto /></LawyerRoute>} />
          <Route path="/onboarding/legal" element={<LawyerRoute><OnboardingLegal /></LawyerRoute>} />
          <Route path="/onboarding/availability" element={<LawyerRoute><OnboardingAvailability /></LawyerRoute>} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
