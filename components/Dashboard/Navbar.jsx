import React, { useState, useRef, useEffect, useContext } from 'react';
import { FaSearch, FaUser } from 'react-icons/fa';
import { MdOutlineLogout } from 'react-icons/md';
import { HiMenuAlt2 } from "react-icons/hi";
import { useRouter} from 'next/router';
import { AuthContext } from '@/context/AuthContext';

const Navbar = ({ toggleSidebar }) => {
  const { logout} = useContext(AuthContext); // Access login function from AuthContext

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const dropdownRef = useRef(null);
const route = useRouter();
  const allSuggestions = [
    'Profile Settings',
    'Dashboard',
    'Notifications',
    'User Management',
    'Help Center',
    'Logout',
    'Edit Profile',
    'System Settings',
  ];

  // Handle search input change
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value) {
      const filteredSuggestions = allSuggestions.filter((suggestion) =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  // Handle logout action
  const handleLogoutClick = () => {
    
  };

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white p-4 shadow-md text-black flex justify-between items-center relative w-full">
      {/* Menu Icon for Mobile */}
      <div className="md:hidden">
        <HiMenuAlt2 className="w-6 h-6 cursor-pointer" onClick={toggleSidebar} />
      </div>

      {/* Logo (centered on mobile) */}
      <h1 className="text-xl font-custom ml-4 flex-1 text-center md:text-left">Wens Force</h1>

      {/* Search Box (hidden on small screens) */}
      <div className="relative hidden md:flex w-1/3">

        {/* Display suggestions only when there are results */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-lg mt-1 z-50 max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => setSearchTerm(suggestion)}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Icon and Logout */}
      <div className="flex items-center">
        {/* Show user icon in medium and larger screens */}
        <FaUser className="w-8 h-6 mr-4 text-gray-700 hidden md:block" />
        <MdOutlineLogout
          className="w-8 h-7 text-gray-700 cursor-pointer"
          onClick={logout}
        />
      </div>
    </div>
  );
};

export default Navbar;
