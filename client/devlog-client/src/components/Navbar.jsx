import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getGreeting = () => {
    if (!user) return "Welcome";
    return `Welcome ${user.name || "User"}`;
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
      <div className="text-xl font-bold">DevLog</div>
      {user && (
        <div className="flex items-center gap-4">
          <span>{getGreeting()}</span>
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
