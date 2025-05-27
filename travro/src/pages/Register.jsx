import React, { useState } from 'react';
import { User, Lock, Calendar, MapPin, Image } from 'lucide-react';

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
    setDestination(suggestion); // Update the actual destination
    setSuggestions([]); // Clear suggestions
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
    <div className="bg-gradient-to-r from-neutral-300 to-neutral-400 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center bg-amber-900 text-transparent bg-clip-text">
        Register
      </h2>

      {error && (
        <div className="text-amber-900 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <div>
          <label className="block text-amber-900 text-sm font-semibold mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-2 text-amber-900" />
            <input
              type="text"
              className="pl-10 w-full rounded-xl bg-white/90 shadow-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-amber-900 text-sm font-semibold mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-2 text-amber-900" />
            <input
              type="password"
              className="pl-10 w-full rounded-xl bg-white/90 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* DOB */}
        <div>
          <label className="block text-amber-900 text-sm font-semibold mb-2">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-2 text-amber-900" />
            <input
              type="date"
              className="pl-10 w-full rounded-xl bg-white/90 shadow-sm"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Image */}
        <div>
          <label className="block text-amber-900 text-sm font-semibold mb-2">Upload Image</label>
          <div className="relative">
            <Image className="absolute left-2 top-2 text-amber-900" />
            <input
              type="file"
              accept="image/*"
              className="pl-10 w-full rounded-xl bg-white/90 shadow-sm py-2"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </div>
        </div>

        {/* Destination */}
        <div className="mb-4 relative">
          <label className="block text-amber-900 text-sm font-semibold mb-2">
            Next Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-amber-900" />
            <input
              type="text"
              value={cityQuery}
              className="pl-10 w-full rounded-xl bg-white/90 shadow-sm py-2"
              onChange={handleCityChange}
              placeholder="Type a city name"
            />
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-neutral-400 rounded-b-lg shadow-lg mt-1 max-h-60 overflow-auto">
              {suggestions.map((city, index) => (
                <li 
                  key={index} 
                  className="p-2 hover:bg-neutral-400 cursor-pointer text-sm text-amber-900"
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
          className="w-full bg-gradient-to-r from-amber-900 to-amber-950 text-white py-2 px-4 rounded-xl hover:opacity-90"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;