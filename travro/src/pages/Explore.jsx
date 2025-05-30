import { useEffect, useState } from 'react';
import axios from 'axios';

const Explore = ({ backendUrl }) => {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    const fetchPeople = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${backendUrl}/api/explore`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPeople(res.data);
    };
    fetchPeople();
  }, [backendUrl]);

  return (
    <div className="min-h-screen bg-neutral-100 text-amber-950 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Explore Nearby Travelers</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {people.map((p, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-lg">
            <h2 className="text-xl font-bold">{p.username}</h2>
            <p className="text-sm">Age: {p.age}</p>
            <p className="text-sm text-amber-800">Destination: {p.destination}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;