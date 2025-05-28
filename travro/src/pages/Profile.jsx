import { useEffect, useState } from 'react';
import axios from 'axios';

function Profile({ backendUrl, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newDestination, setNewDestination] = useState('');
  const [updating, setUpdating] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState([]);


  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get(`${backendUrl}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(res.data);
      setDestination(res.data.destination);
    };

    fetchProfile();
  }, [backendUrl, token]);

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


  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const formData = new FormData();
      if (newImage) formData.append("image", newImage);
      if (destination) formData.append("destination", destination);

      const res = await axios.put(`${backendUrl}/api/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile(res.data);
      setNewImage(null);
      alert("Profile updated!");
    } catch (err) {
      alert("Update failed.");
    } finally {
      setUpdating(false);
    }
  };

  if (!profile) return <div className="text-amber-900 min-h-screen min-w-screen font-bold pt-5 bg-gradient-to-r from-neutral-300 to-neutral-400 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-neutral-300 to-neutral-400 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <img src={profile.imageUrl} alt="Profile" className="w-32 h-32 rounded-full border-4 border-white" />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setNewImage(e.target.files[0])}
        className="text-sm"
      />

      <div className="text-lg">
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Age:</strong> {new Date().getFullYear() - new Date(profile.dob).getFullYear()}</p>
      </div>

      <div className="mb-4 relative w-full max-w-xs">
  <label className="block text-white text-sm font-semibold mb-2">
    Next Destination
  </label>
  <div className="relative">
    {/* Optional: MapPin icon */}
    {/* <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white" /> */}
    <input
      type="text"
      value={destination}
      onChange={handleCityChange}
      placeholder="Type a city name"
      className="pl-3 w-full rounded-xl bg-white/90 shadow-sm py-2 text-black"
    />
  </div>

  {suggestions.length > 0 && (
    <ul className="absolute z-10 w-full bg-white border border-neutral-400 rounded-b-lg shadow-lg mt-1 max-h-60 overflow-auto text-black">
      {suggestions.map((city, index) => (
        <li
          key={index}
          className="p-2 hover:bg-neutral-300 cursor-pointer text-sm"
          onClick={() => handleSuggestionClick(city)}
        >
          {city}
        </li>
      ))}
    </ul>
  )}
</div>


      <button
        onClick={handleUpdate}
        disabled={updating}
        className="bg-amber-600 hover:bg-amber-700 px-6 py-2 rounded shadow"
      >
        {updating ? "Updating..." : "Update Profile"}
      </button>

      <button
        onClick={onLogout}
        className="mt-4 text-rose-400 hover:text-rose-600 underline"
      >
        Logout
      </button>
    </div>
  );
}

export default Profile;
