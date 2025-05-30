import { useEffect, useState } from 'react';
import axios from 'axios';
import i1 from '../assets/i1.jpg';
import i2 from '../assets/i2.jpg';
import i3 from '../assets/i3.jpg';
import i4 from '../assets/i4.jpg';
import Navbar from '../components/Navbar';

function Profile({ backendUrl, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [cityQuery, setCityQuery] = useState('');
  const [destination, setDestination] = useState('');
  const [suggestions, setSuggestions] = useState([]);


  const token = localStorage.getItem("token");

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(res.data);
      setDestination(res.data.destination);
    } catch (error) {
      console.error("Failed to fetch profile:", error);

      // Optional: log out user if token is invalid/expired
      if (error.response && error.response.status === 401) {
        alert("Session expired. Please log in again.");
        onLogout();
      }
    }
  };

  if (token) {
    fetchProfile();
  } else {
    alert("No token found. Please log in.");
    onLogout();
  }
}, [backendUrl, token, onLogout]);

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

  const carouselImages = [i1, i2, i3, i4];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
    }, 3000); // change every 3 seconds

    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-r from-neutral-300 to-neutral-400 text-amber-900 flex flex-col md:flex-row">

      {/* Profile Section */}
      <div className="w-full md:w-2/3 flex flex-col items-center space-y-6">
        <Navbar />
        <h1 className="text-3xl font-bold ml-4 mt-4">
          {profile.username}, {new Date().getFullYear() - new Date(profile.dob).getFullYear()}
        </h1>
        <img src={profile.imageUrl} alt="Profile" className="w-38 h-38 rounded-4xl border-2 border-amber-950" />
        <div className="mb-4 relative w-full max-w-xs">
          <label className="block text-sm font-semibold mb-2">Change Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewImage(e.target.files[0])}
            className="text-sm rounded-xl text-black bg-neutral-300 w-full py-2"
          />
        </div>

        <div className="mb-4 relative w-full max-w-xs">
          <label className="block text-sm font-semibold mb-2">Next Destination</label>
          <input
            type="text"
            value={destination}
            onChange={handleCityChange}
            placeholder="Type a city name"
            className="pl-3 w-full rounded-xl bg-neutral-300 shadow-sm py-2 text-black"
          />

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
          className="bg-amber-950 hover:bg-amber-900 text-neutral-300 px-6 py-2 rounded shadow"
        >
          {updating ? "Updating..." : "Update Profile"}
        </button>

        <button
          onClick={onLogout}
          className="mt-4 text-amber-900 hover:text-amber-950 underline"
        >
          Logout
        </button>
      </div>

      {/* Carousel Section */}
      <div className="w-full md:w-1/3 flex justify-end items-center">
        <div className="w-full md:w-full h-[100vh] md:h-[100vh] relative">
          {carouselImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`i ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 flex items-end justify-center z-10 p-10">
            <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl shadow-lg text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-amber-950">Travro</h1>
              <p className="text-sm md:text-base text-white mt-2">"Explore world with your friends"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
