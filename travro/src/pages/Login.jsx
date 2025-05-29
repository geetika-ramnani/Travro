import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';
import { Link } from 'react-router-dom'

function Login({ onLogin, backendUrl }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendUrl}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row bg-cover bg-center"
      style={{ backgroundImage: "url('./src/assets/bg1.jpg')" }}
    >
      {/* Left: Welcome Text */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <h1 className="text-white text-3xl md:text-5xl font-bold text-center max-w-md">
          Welcome to <span className="text-yellow-300">Travro</span>,<br />
          Your Only Travelling Partner
        </h1>
      </div>

      {/* Right: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl p-8 w-full max-w-sm shadow-lg">
          <h2 className="text-3xl font-bold text-white text-center mb-6">Login</h2>

          {error && (
            <div className="text-red-300 text-center mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-semibold mb-1" htmlFor="username">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-white" />
                </div>
                <input
                  type="text"
                  id="username"
                  className="pl-10 block w-full rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none py-2"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-semibold mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <input
                  type="password"
                  id="password"
                  className="pl-10 block w-full rounded-full bg-white/20 text-white placeholder-white/70 focus:outline-none py-2"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#542a00] to-[#733800] text-white py-2 rounded-full font-semibold shadow-md hover:opacity-90 transition"
            >
              Login
            </button>
          </form>

          <Link
            to="/register"
            className="mt-4 text-stone-100 hover:text-stone-400 font-medium block text-center"
          >
            Need an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
