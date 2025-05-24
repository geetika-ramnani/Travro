import { useEffect, useState } from 'react';
import { Database, User } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import { Client } from 'appwrite';


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // backend URL

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [view, setView] = useState("login");
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
    setView("login");
  };

  const renderDbStatus = () => (
    <div
      className={`fixed bottom-4 right-4 flex items-center space-x-2 px-4 py-2 rounded-full shadow-lg ${
        dbStatus.connected
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      <Database
        className={`w-4 h-4 ${
          dbStatus.connected ? "text-green-600" : "text-red-600"
        }`}
      />
      <span className="text-sm font-medium hidden">{dbStatus.message}</span>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-100 to-rose-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {view === "login" ? (
            <>
              <Login onLogin={handleLogin} backendUrl={BACKEND_URL} />
              <button
                onClick={() => setView("register")}
                className="mt-4 text-rose-600 hover:text-rose-800 font-medium block mx-auto"
              >
                Need an account? Register
              </button>
            </>
          ) : (
            <>
              <Register onRegister={handleLogin} backendUrl={BACKEND_URL}/>
              <button
                onClick={() => setView("login")}
                className="mt-4 text-rose-600 hover:text-rose-800 font-medium block mx-auto"
              >
                Already have an account? Login
              </button>
            </>
          )}
        </div>
        {renderDbStatus()}
      </div>
    );
  }



  return (
    <>
      <button
        onClick={handleLogout}
        className="flex items-center space-x-1 text-rose-600 hover:text-rose-800 transition-colors duration-200"
        >
        <User className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </>
  )
}

export default App
