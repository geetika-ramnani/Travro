import React, { useState } from 'react';
import { User, Lock, Calendar, MapPin, Image } from 'lucide-react';

function Register({ onRegister, backendUrl }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [image, setImage] = useState(null);
  const [destination, setDestination] = useState('');
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [error, setError] = useState('');

  const fetchCitySuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`http://api.geonames.org/searchJSON?q=${encodeURIComponent(query)}&maxRows=5&username=geetika`);
      const data = await response.json();
      setSuggestions(data.geonames.map(city => city.name) || []);
    } catch (error) {
      console.error('Failed to fetch cities:', error);
      setSuggestions([]);
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setCity(value);
    fetchCitySuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
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
      formData.append('destination', city);
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
    <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-rose-600 to-pink-600 text-transparent bg-clip-text">
        Register
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Username */}
        <div>
          <label className="block text-rose-700 text-sm font-semibold mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-2 text-rose-400" />
            <input
              type="text"
              className="pl-10 w-full rounded-xl border-rose-200 bg-white/90 shadow-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-rose-700 text-sm font-semibold mb-2">Password</label>
          <div className="relative">
            <Lock className="absolute left-2 text-rose-400" />
            <input
              type="password"
              className="pl-10 w-full rounded-xl border-rose-200 bg-white/90 shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {/* DOB */}
        <div>
          <label className="block text-rose-700 text-sm font-semibold mb-2">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-2 text-rose-400" />
            <input
              type="date"
              className="pl-10 w-full rounded-xl border-rose-200 bg-white/90 shadow-sm"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-rose-700 text-sm font-semibold mb-2">Upload Image</label>
          <div className="relative">
            <Image className="absolute left-2 top-2 text-rose-400" />
            <input
              type="file"
              accept="image/*"
              className="pl-10 w-full rounded-xl border-rose-200 bg-white/90 shadow-sm py-2"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </div>
        </div>

        {/* Destination */}
        <div className="mb-4">
          <label className="block text-rose-700 text-sm font-semibold mb-2" htmlFor="nextDestination">
            Next Destination
          </label>
          <div className="relative">
            <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-rose-400" />
            <input
              type="text"
              value={city}
              onChange={handleCityChange}
              placeholder="Next Destination"
              className="pl-10 w-full rounded-xl border-rose-200 bg-white/90 shadow-sm"
            />
          </div>
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map((sug, index) => (
                <li key={index} onClick={() => handleSuggestionClick(sug)} className="suggestion-item">
                  {sug}
                </li>
              ))}
            </ul>
          )}
        </div>


        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-lg"
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Register;




// import React, { useState } from 'react';
// import { User, Lock } from 'lucide-react';

// function Register({ onRegister, backendUrl }) {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       console.log("Sending request to register:", { username, password });
//       const response = await fetch(`${backendUrl}/api/register`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username, password }),
//       });
//       console.log("1");

//       const data = await response.json();
//       console.log("1");

//       if (!response.ok) {
//         throw new Error(data.error || 'Registration failed');
//       }
//       console.log("1");

//       onRegister(data.token);
//       console.log("1");
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-8 rounded-2xl shadow-xl">
//       <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-rose-600 to-pink-600 text-transparent bg-clip-text">Register</h2>
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
//           {error}
//         </div>
//       )}
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label className="block text-rose-700 text-sm font-semibold mb-2" htmlFor="username">
//             Username
//           </label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <User className="h-5 w-5 text-rose-400" />
//             </div>
//             <input
//               type="text"
//               id="username"
//               className="pl-10 block w-full rounded-xl border-rose-200 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 bg-white/90"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>
//         </div>
//         <div>
//           <label className="block text-rose-700 text-sm font-semibold mb-2" htmlFor="password">
//             Password
//           </label>
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//               <Lock className="h-5 w-5 text-rose-400" />
//             </div>
//             <input
//               type="password"
//               id="password"
//               className="pl-10 block w-full rounded-xl border-rose-200 shadow-sm focus:border-rose-300 focus:ring focus:ring-rose-200 focus:ring-opacity-50 bg-white/90"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>
//         </div>
//         <button
//           type="submit"
//           className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-rose-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-opacity-50 transform hover:scale-[1.02] transition-all duration-300 font-semibold shadow-lg"
//         >
//           Register
//         </button>
//       </form>
//     </div>
//   );
// }

// export default Register;