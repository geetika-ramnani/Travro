import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  return (
    <nav className="w-full bg-amber-950 backdrop-blur-md shadow-md px-4 py-3 sticky top-0 z-50">
      <div className="flex justify-between items-center">
        {/* Left side: App name or link */}
        <div className="text-lg font-semibold text-neutral-300">
          <Link to="/explore" className="hover:text-neutral-400">Explore</Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-base text-neutral-300">
          <Link to="/profile" className="hover:text-neutral-400">Profile</Link>
          <Link to="/chats" className="hover:text-neutral-400">Chats</Link>
          <Link to="/requests" className="hover:text-neutral-400">Requests</Link>
        </div>

        {/* Hamburger Icon (Mobile only) */}
        <button
          className="md:hidden text-neutral-300 focus:outline-none"
          onClick={toggleMenu}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden mt-2 flex flex-col bg-amber-950 rounded-md p-2 text-neutral-300 space-y-2 shadow-md">
          <Link to="/profile" className="hover:text-neutral-100" onClick={() => setMenuOpen(false)}>Profile</Link>
          <Link to="/chats" className="hover:text-neutral-100" onClick={() => setMenuOpen(false)}>Chats</Link>
          <Link to="/requests" className="hover:text-neutral-100" onClick={() => setMenuOpen(false)}>Requests</Link>
        </div>
      )}
    </nav>
  );
}

export default Navbar;