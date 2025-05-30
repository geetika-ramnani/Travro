import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { Client } from 'appwrite';
import Explore from './pages/Explore';


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // backend URL

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    message: "Checking database connection...",
  });

  const client = new Client();
  client
      .setEndpoint('https://fra.cloud.appwrite.io/v1')
      .setProject('683177ee000049a7f5fc');

  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/health`);
        const data = await response.json();
        setDbStatus({
          connected: true,
          message: "Connected to MongoDB Atlas",
        });
      } catch (err) {
        setDbStatus({
          connected: false,
          message: "Database connection failed",
        });
      }
    };

    checkDbConnection();
    const interval = setInterval(checkDbConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return token ? children : <Navigate to="/login" replace />;
  };

  const PublicRoute = ({ children }) => {
    const token = localStorage.getItem("token");
    return !token ? children : <Navigate to="/profile" replace />;
  };

  return (
    <>
      <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login backendUrl={BACKEND_URL} onLogin={handleLogin} />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register backendUrl={BACKEND_URL} onRegister={handleLogin} />
            </PublicRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile backendUrl={BACKEND_URL} token={token} onLogout={handleLogout} />
            </PrivateRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <PrivateRoute>
              <Explore backendUrl={BACKEND_URL} />
            </PrivateRoute>
          }
        />
        
        {/* Redirect any unknown route to login */}
        <Route path="*" element={<Navigate to={token ? "/profile" : "/login"} replace />} />
      </Routes>
    </Router>
    </>
  )
}

export default App