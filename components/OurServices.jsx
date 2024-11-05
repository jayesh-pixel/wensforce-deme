// OurMenuPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { FaSearch, FaFire, FaRocket, FaChartLine } from 'react-icons/fa';
import { ServiceContext } from '../context/ServiceContext';

const OurMenuPage = () => {
  const {
    setQuery,
    handleFilterChange,
    selectedFilters,
  } = useContext(ServiceContext);

  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    setQuery(searchInput);
  }, [searchInput, setQuery]);

  const handleCategoryChange = (category) => {
    handleFilterChange('Categories', category, true);
  };

  const currentCategory = selectedFilters.Categories[0] || 'All';

  const handleSearch = (e) => {
    e.preventDefault();
    // The search is handled via context; no additional code needed here
  };

  return (
    <div className="text-black ">
      <div className="w-full mx-auto">
        {/* Heading and Buttons */}
        <div className="flex flex-col md:flex-row items-center p-4 md:p-8 bg-[#fef8f4] justify-around">
          {/* Left Section */}
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4 md:mb-6">
              Our Services
            </h1>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('All')}
                className={`flex items-center py-2 px-4 md:py-3 md:px-6 rounded-full shadow-md transition duration-300 ${
                  currentCategory === 'All'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-black hover:bg-yellow-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleCategoryChange('Popular')}
                className={`flex items-center py-2 px-4 md:py-3 md:px-6 rounded-full shadow-md transition duration-300 ${
                  currentCategory === 'Popular'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-black hover:bg-yellow-100'
                }`}
              >
                <FaFire className="text-yellow-500 mr-2" />
                Popular
              </button>
              <button
                onClick={() => handleCategoryChange('Deals')}
                className={`flex items-center py-2 px-4 md:py-3 md:px-6 rounded-full shadow-md transition duration-300 ${
                  currentCategory === 'Deals'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-black hover:bg-yellow-100'
                }`}
              >
                <FaChartLine className="text-yellow-500 mr-2" />
                Deals
              </button>
              <button
                onClick={() => handleCategoryChange('New Launch')}
                className={`flex items-center py-2 px-4 md:py-3 md:px-6 rounded-full shadow-md transition duration-300 ${
                  currentCategory === 'New Launch'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white text-black hover:bg-yellow-100'
                }`}
              >
                <FaRocket className="text-yellow-500 mr-2" />
                New Launch
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full md:w-auto flex items-center">
            <input
              type="text"
              placeholder="Search here"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="py-2 md:py-3 px-4 w-full md:w-96 rounded-full bg-white text-black shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500 border border-gray-200"
            />
            <button
              type="submit"
              className="ml-2 bg-yellow-500 p-2 md:p-3 rounded-full text-white shadow-md hover:bg-yellow-600 transition duration-300"
            >
              <FaSearch />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OurMenuPage;
