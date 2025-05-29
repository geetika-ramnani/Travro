import React, { useState } from 'react';
import { User, Lock, Calendar, MapPin, Image } from 'lucide-react';
import { Link } from 'react-router-dom';

function Register({ onRegister, backendUrl }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [image, setImage] = useState(null);
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState('');
  const [cityQuery, setCityQuery] = useState('');

  const fetchCitySuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/api/city-suggestions?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCityQuery(value);
    setDestination(value);
    fetchCitySuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setCityQuery(suggestion);
    setDestination(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return setError('Please upload at least one image.');

    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('dob', dob);
      formData.append('destination', destination);
      formData.append('image', image);

      const response = await fetch(`${backendUrl}/api/register`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onRegister(data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('./src/assets/bg1.jpg')" }}
    >
      <div className="backdrop-blur-md bg-white/10 border border-white/30 rounded-xl p-8 w-[350px] shadow-lg">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Register</h2>

        {error && (
          <div className="text-red-300 text-center mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username */}
          <div>
            <label className="block text-white text-sm font-semibold mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
              <input
                type="text"
                className="pl-10 w-full rounded-full bg-white/20 text-white placeholder-white/70 py-2 focus:outline-none"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white text-sm font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
              <input
                type="password"
                className="pl-10 w-full rounded-full bg-white/20 text-white placeholder-white/70 py-2 focus:outline-none"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* DOB */}
          <div>
            <label className="block text-white text-sm font-semibold mb-1">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
              <input
                type="date"
                className="pl-10 w-full rounded-full bg-white/20 text-white placeholder-white/70 py-2 focus:outline-none"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-white text-sm font-semibold mb-1">Upload Image</label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
              <input
                type="file"
                accept="image/*"
                className="pl-10 w-full rounded-full bg-white/20 text-white placeholder-white/70 py-2 focus:outline-none"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />
            </div>
          </div>

          {/* Destination */}
          <div className="relative">
            <label className="block text-white text-sm font-semibold mb-1">Next Destination</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white" />
              <input
                type="text"
                value={cityQuery}
                onChange={handleCityChange}
                className="pl-10 w-full rounded-full bg-white/20 text-white placeholder-white/70 py-2 focus:outline-none"
                placeholder="Type a city name"
              />
            </div>
            {suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white/80 text-black border rounded-b-lg shadow-lg mt-1 max-h-60 overflow-auto">
                {suggestions.map((city, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-neutral-400 cursor-pointer text-sm"
                    onClick={() => handleSuggestionClick(city)}
                  >
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#542a00] to-[#733800] text-white py-2 rounded-full font-semibold shadow-md hover:opacity-90 transition"
          >
            Register
          </button>
        </form>

        <Link
          to="/login"
          className="mt-4 text-stone-100 hover:text-stone-400 font-medium block text-center"
        >
          Already have an account? Login
        </Link>
      </div>
    </div>
  );
}

export default Register;
