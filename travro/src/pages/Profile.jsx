// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { User, MapPin, Image, Save, LogOut } from 'lucide-react';

function Profile({ user, backendUrl, onLogout, onUpdate }) {
  const [username, setUsername] = useState(user.username);
  const [dob, setDob] = useState(new Date(user.dob).toISOString().split('T')[0]);
  const [destination, setDestination] = useState(user.destination);
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user.imageUrl);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('destination', destination);
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${backendUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }

      setSuccess('Profile updated successfully!');
      onUpdate(data.user); // Update parent component with new user data
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-rose-600 to-pink-600 text-transparent bg-clip-text">
        Your Profile
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-rose-200">
            <img 
              src={previewUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <label className="flex items-center justify-center px-4 py-2 bg-rose-100 text-rose-700 rounded-full cursor-pointer hover:bg-rose-200">
            <Image className="mr-2" size={16} />
            Change Photo
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange}
            />
          </label>
        </div>

        {/* Username (read-only) */}
        <div>
          <label className="block text-rose-700 text-sm font-semibold mb-2">Username</label>
          <div className="relative">
            <User className="absolute left-2 text-rose-400" />
            <input
              type="text"
              className="pl-10 w-full rounded-xl border-rose-200 bg-white/90 shadow-sm"
              value={username}
              readOnly
            />
          </div>
        </div>

        {/* DOB (read-only) */}
        <div>
          <label className="block text-rose-700 text-sm font-semibold mb-2">Date of Birth</label>
          <div className="relative">
            <Calendar className="absolute left-2 text-rose-400" />
            <input
              type="date"
              className="pl-10 w-full rounded-xl border-rose-200 bg-white/90 shadow-sm"
              value={dob}
              readOnly
            />
          </div>
        </div>

        {/* Destination */}
        <div>
          <label className="block text-rose-700 text-sm font-semibold mb-2">Next Destination</label>
          <div className="relative">
            <MapPin className="absolute left-2 text-rose-400" />
            <input
              type="text"
              className="pl-10 w-full rounded-xl border-rose-200 bg-white/90 shadow-sm"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="submit"
            className="flex items-center justify-center bg-gradient-to-r from-rose-500 to-pink-500 text-white py-2 px-6 rounded-xl hover:opacity-90"
          >
            <Save className="mr-2" size={18} />
            Save Changes
          </button>
          
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center justify-center bg-rose-100 text-rose-600 py-2 px-6 rounded-xl hover:bg-rose-200"
          >
            <LogOut className="mr-2" size={18} />
            Logout
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;