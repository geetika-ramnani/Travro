import { useEffect, useState } from 'react';
import axios from 'axios';

function Profile({ backendUrl, onLogout }) {
  const [profile, setProfile] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [newDestination, setNewDestination] = useState('');
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get(`${backendUrl}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(res.data);
      setNewDestination(res.data.destination);
    };

    fetchProfile();
  }, [backendUrl, token]);

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const formData = new FormData();
      if (newImage) formData.append("image", newImage);
      if (newDestination) formData.append("destination", newDestination);

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

  if (!profile) return <div className="text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-800 to-cyan-950 text-white flex flex-col items-center justify-center p-6 space-y-6">
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

      <div className="flex flex-col items-center">
        <label htmlFor="destination">Next Destination</label>
        <input
          type="text"
          id="destination"
          value={newDestination}
          onChange={(e) => setNewDestination(e.target.value)}
          className="px-4 py-2 rounded mt-1 text-black"
        />
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
