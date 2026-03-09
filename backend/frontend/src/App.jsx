import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NewRequestPage from "./pages/NewRequestPage";
import UserRequestsPage from "./pages/UserRequestsPage";
import MyCasesPage from "./pages/MyCasesPage";
import ClientSignupPage from "./pages/ClientSignupPage";



export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/new-request" element={<NewRequestPage />} />
      <Route path="/my-requests" element={<UserRequestsPage />} />
      <Route path="/my-cases" element={<MyCasesPage />} />
      <Route path="/signup" element={<ClientSignupPage />} />
      <Route path="*" element={<div>Page not found</div>} />
    </Routes>
  );
}



