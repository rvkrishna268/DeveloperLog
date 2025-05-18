/*
This will be the `App.jsx` file that sets up routes for DevLog.
Make sure to create the required components (DeveloperDashboard, ManagerDashboard, etc.) as specified.
*/

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import DeveloperDashboard from './components/DeveloperDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, useAuth } from './context/AuthContext';

function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/developer"
            element={
              <PrivateRoute role="developer">
                <DeveloperDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/manager"
            element={
              <PrivateRoute role="manager">
                <ManagerDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
