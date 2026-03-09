import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LawyerRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== "lawyer") {
    return <Navigate to="/" />;
  }

  return children;
};

export default LawyerRoute;

