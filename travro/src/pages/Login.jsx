import React, { useState } from 'react';
import { User, Lock } from 'lucide-react';

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
    <div className="bg-gradient-to-r from-neutral-300 to-neutral-400 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center bg-amber-900 text-transparent bg-clip-text">Login</h2>
      {error && (
        <div className="text-amber-900 px-4 py-3 mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-amber-900 text-sm font-semibold mb-2" htmlFor="username">
            Username
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-amber-900" />
            </div>
            <input
              type="text"
              id="username"
              className="pl-10 block w-full rounded-xl bg-white/90"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-amber-900 text-sm font-semibold mb-2" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-amber-900" />
            </div>
            <input
              type="password"
              id="password"
              className="pl-10 block w-full rounded-xl bg-white/90"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-900 to-amber-950 text-white py-2 px-4 rounded-xl hover:opacity-90"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
