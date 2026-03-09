import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-navy text-white p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold">FindMyLawyer</h1>
                <button onClick={handleLogout} className="text-sm bg-white text-navy px-3 py-1 rounded">Logout</button>
            </nav>
            <div className="p-8">
                <h2 className="text-3xl font-bold text-navy mb-4">Welcome, {user?.name}</h2>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-xl font-semibold mb-4">Find a Lawyer</h3>
                    <p className="text-gray-600">Search functionality coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
