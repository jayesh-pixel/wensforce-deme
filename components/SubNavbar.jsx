// SearchAndFilterComponent.jsx
import React, { useState, useEffect, useRef, useContext } from "react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaHistory,
  FaChevronDown,
  FaTimes,
} from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { ServiceContext } from "../context/ServiceContext"; // Adjust the path as needed
import { FaLocationDot } from "react-icons/fa6";
import { FilterContext } from "@/context/FilterContext";

const libraries = ["places"];

const SearchComponent = () => {
  const {
    location,
    setLocation,
    query,
    setQuery,
    selectedFilters,
    handleFilterChange,
  } = useContext(ServiceContext);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [autocomplete, setAutocomplete] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const commonLocalities = [
    "Andheri",
    "Bandra",
    "Juhu",
    "Borivali",
    "Powai",
    "Colaba",
    "Dadar",
  ];

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleSearchClick = () => {
    setModalOpen(true);
  };

  // Load the Google Maps JavaScript API
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // Use environment variable
    libraries,
  });

  useEffect(() => {
    const storedRecentSearches = localStorage.getItem("recentSearches");
    if (storedRecentSearches) {
      setRecentSearches(JSON.parse(storedRecentSearches));
    }

    const handleClickOutside = (event) => {
      // if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      //   setIsDropdownOpen(false);
      // }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAm_rgt4RYjdG_RHpgcerB2uaDgQzfRcJc`
          )
            .then((response) => response.json())
            .then((data) => {
              console.log("Geocoding API response:", data);
              if (data.status === "OK") {
                const results = data.results;
                if (results.length > 0) {
                  const addressComponents = results[0].address_components;
                  let city = "";
                  let country = "";
                  addressComponents.forEach((component) => {
                    if (component.types.includes("locality")) {
                      city = component.long_name;
                    }
                    if (
                      component.types.includes("administrative_area_level_1") &&
                      !city
                    ) {
                      city = component.long_name;
                    }
                    if (component.types.includes("country")) {
                      country = component.long_name;
                    }
                  });
                  if (city || country) {
                    setLocation(city || "Unknown City");
                  } else {
                    setLocation("Location not found");
                  }
                } else {
                  setLocation("No results found");
                }
              } else {
                console.error(
                  "Geocoding error:",
                  data.status,
                  data.error_message
                );
                setLocation(`Geocoding error: ${data.status}`);
              }
            })
            .catch((error) => {
              console.error("Error fetching location:", error);
              setLocation("Error fetching location");
            });
        },
        (error) => {
          console.error("Geolocation error:", error);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              setLocation("User denied the request for Geolocation.");
              break;
            case error.POSITION_UNAVAILABLE:
              setLocation("Location information is unavailable.");
              break;
            case error.TIMEOUT:
              setLocation("The request to get user location timed out.");
              break;
            default:
              setLocation("An unknown error occurred.");
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setLocation("Geolocation is not supported by this browser.");
    }
  };

  const onLoadAutocomplete = (autoC) => {
    setAutocomplete(autoC);
  };

  const handlePlacesChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place && place.address_components) {
        const addressComponents = place.address_components;
        let area = "";

        addressComponents.forEach((component) => {
          if (
            component.types.includes("sublocality") ||
            component.types.includes("sublocality_level_1") ||
            component.types.includes("neighborhood")
          ) {
            area = component.long_name;
          }
        });

        setLocation(area || "Unknown Area");
        handlePlaceSelect(area || "Unknown Area");
      } else {
        console.error("No address components found");
      }
    } else {
      console.error("Autocomplete is not loaded yet!");
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handlePlaceSelect = (place) => {
    setLocation(place);
    const updatedSearches = [
      place,
      ...recentSearches.filter((p) => p !== place),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    setIsDropdownOpen(false);
  };

  const handleSearch = () => {
    console.log("Searching for:", query, "in", location);
    // Implement additional search functionality as needed
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-white shadow-lg text-black z-50">
      {/* Desktop and Tablet Search Interface */}
      <div className="hidden md:flex items-center justify-center w-full">
        <div className="border border-gray-300 rounded-sm max-2xl-">
          {/* Top Section: Location Selector and Search Bar */}
          <div className="flex flex-col md:flex-row">
            {/* Location Selector */}
            <div
              className="relative flex  w-auto justify-center items-center px-5 flex-col md:border-r border-gray-300  cursor-pointer"
              onClick={toggleDropdown}
              ref={dropdownRef}
            >
              <button className="flex items-center  w-full">
                <FaLocationDot className="text-yellow-500 mr-1" />
                <span className="font-semibold text-sm text-gray-700 truncate">
                  {location}
                </span>
              </button>
              {/* Subtext: Fort | Mumbai */}
              <span className="text-sm mt-1 text-center truncate text-gray-500">
                {location} | <span className="text-yellow-500">Change?</span>
              </span>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white text-black border border-gray-300 shadow-lg z-10 w-[25vw]">
                  <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                    <li
                      className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center space-x-2"
                      onClick={handleUseMyLocation}
                    >
                      <FaMapMarkerAlt className="text-yellow-500" />
                      <span>Use My Location</span>
                    </li>

                    <li className="px-4 py-2">
                      <Autocomplete
                        onLoad={onLoadAutocomplete}
                        onPlaceChanged={handlePlacesChanged}
                        options={{ types: ["geocode"] }}
                        fields={["address_components", "geometry"]}
                      >
                        <input
                          type="text"
                          placeholder="Search places..."
                          className="w-full px-3 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none"
                          ref={inputRef}
                        />
                      </Autocomplete>
                    </li>

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <>
                        <li className="px-4 py-1 text-sm font-semibold text-gray-600">
                          Recent Searches
                        </li>
                        {recentSearches.map((search, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center space-x-2"
                            onClick={() => handlePlaceSelect(search)}
                          >
                            <FaHistory className="text-gray-500" />
                            <span>{search}</span>
                          </li>
                        ))}
                      </>
                    )}

                    {/* Common Localities */}
                    <li className="px-4 py-1 text-sm font-semibold text-gray-600">
                      Common Localities
                    </li>
                    {commonLocalities.map((locality, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center space-x-2"
                        onClick={() => handlePlaceSelect(locality)}
                      >
                        <FaSearch className="text-gray-500" />
                        <span>{locality}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Search Bar and Search Button */}
            <div className="md:flex-row items-stretch px-4 py-1 w-full">
              {/* Search Input */}
              <div className="flex items-center w-full flex-grow border-b border-gray-500 ">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search... e.g., Armed bodyguard, bodyguard"
                  className="w-full outline-none bg-transparent py-2"
                />
              </div>
              <FilterDropdown />
            </div>
            <button
              className="ml-4 w-24 bg-yellow-500 border-r rounded-sm text-black hover:bg-yellow-600 flex items-center justify-center"
              onClick={handleSearch}
              aria-label="Search"
            >
              <FaSearch />
            </button>
          </div>

          {/* Additional Info Section */}
        </div>
        <div className="flex flex-col items-left mt-4 p-4">
          <h3 className="text-[13px] text-gray-500">Fed up of endless wait?</h3>
          <h3 className="flex gap-1 items-center text-[14px] text-black">
            Look for Bouncer with{" "}
            <span className="text-blue-700 font-bold">Prime</span>
            <MdVerified className="text-yellow-400 text-lg" />
          </h3>
        </div>
      </div>

      <div className="relative w-full md:hidden">
        {/* Location Selector */}
        <div
          className="relative flex justify-center flex-col md:border-r border-gray-300  cursor-pointer"
          onClick={toggleDropdown}
          ref={dropdownRef}
        >
          <button className="flex items-center w-full">
            <FaMapMarkerAlt className="text-yellow-500 mr-1" />
            <span className="font-semibold text-gray-700 truncate mr-1">
              {location}
            </span>
            <FaChevronDown className="text-gray-500 flex items-center" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full w-full left-0 mt-2 bg-white text-black border border-gray-300 shadow-lg z-10 ">
              <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                <li
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center space-x-2"
                  onClick={handleUseMyLocation}
                >
                  <FaMapMarkerAlt className="text-yellow-500" />
                  <span>Use My Location</span>
                </li>

                <li className="px-4 py-2">
                  <Autocomplete
                    onLoad={onLoadAutocomplete}
                    onPlaceChanged={handlePlacesChanged}
                    options={{ types: ["geocode"] }}
                    fields={["address_components", "geometry"]}
                  >
                    <input
                      type="text"
                      placeholder="Search places..."
                      className="w-full px-3 py-2 border bg-white border-gray-300 rounded-lg focus:outline-none"
                      ref={inputRef}
                    />
                  </Autocomplete>
                </li>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <>
                    <li className="px-4 py-1 text-sm font-semibold text-gray-600">
                      Recent Searches
                    </li>
                    {recentSearches.map((search, index) => (
                      <li
                        key={index}
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center space-x-2"
                        onClick={() => handlePlaceSelect(search)}
                      >
                        <FaHistory className="text-gray-500" />
                        <span>{search}</span>
                      </li>
                    ))}
                  </>
                )}

                {/* Common Localities */}
                <li className="px-4 py-1 text-sm font-semibold text-gray-600">
                  Common Localities
                </li>
                {commonLocalities.map((locality, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer flex items-center space-x-2"
                    onClick={() => handlePlaceSelect(locality)}
                  >
                    <FaSearch className="text-gray-500" />
                    <span>{locality}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div
          className="flex items-center border border-gray-600 rounded-sm p-2 bg-white cursor-pointer"
          onClick={handleSearchClick}
        >
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search... e.g., Armed bodyguard, bodyguard truncate"
            className=" outline-none bg-transparent cursor-pointer"
            readOnly
          />
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 duration-300 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-full h-full p-6 rounded-lg shadow-lg relative">
              {/* Close Button */}
              <button
                className="absolute top-3 right-3 text-gray-500"
                onClick={handleCloseModal}
              >
                <FaTimes />
              </button>

              {/* Modal Content */}
              <div className="mb-4">
                <h2 className="text-center text-xl font-bold">Search</h2>

                <div className="flex items-center mt-4 p-2 border rounded-md">
                  <FaMapMarkerAlt className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border-none outline-none"
                    placeholder="Enter a location"
                  />
                  <FaTimes
                    className="text-gray-500 ml-2 cursor-pointer"
                    onClick={() => setLocation("")}
                  />
                </div>

                <div className="flex items-center mt-4 p-2 border rounded-md">
                  <FaSearch className="text-gray-500 mr-2" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full border-none bg-white outline-none"
                    placeholder="Search... e.g., Armed bodyguard, bodyguard truncate"
                  />
                </div>
              </div>

              {/* Location Results */}
              <ul className="divide-y divide-gray-200">
                <li className="px-4 py-2 flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-gray-500" />
                  <span>Andheri West, Mumbai</span>
                </li>
                <li className="px-4 py-2 flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-gray-500" />
                  <span>Borivali West, Mumbai</span>
                </li>
                {/* Add more location items here */}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-Component: FilterDropdown
const FilterDropdown = () => {
  const { selectedFilters, handleFilterChange } = useContext(ServiceContext);
  const {
    experience,
    protection,
    biceps,
    height,
  } = useContext(FilterContext); // Access filters from FilterContext

  // Define options for each filter with "Any" as the first option
  const bicepsOptions = ["Any", ...biceps];
  const heightOptions = ["Any", ...height];
  const experienceOptions = ["Any", ...experience];
  const protectionTypeOptions = ["Any", ...protection];

  // If attire options are not in FilterContext, define them here
  const attireOptions = ["Any", "Formals", "Safari suit", "Shoes", "Protective"];

  // Initialize state with selected filters or default to "Any"
  const [bicepsValue, setBicepsValue] = useState(
    selectedFilters.Biceps || "Any"
  );
  const [heightValue, setHeightValue] = useState(
    selectedFilters.Height || "Any"
  );
  const [attireValue, setAttireValue] = useState(
    selectedFilters.Attire || "Any"
  );
  const [experienceValue, setExperienceValue] = useState(
    selectedFilters.Experience || "Any"
  );
  const [protectionTypeValue, setProtectionTypeValue] = useState(
    selectedFilters.ProtectionType || "Any"
  );

  // Handlers for each filter
  const handleBicepsChange = (e) => {
    const value = e.target.value;
    setBicepsValue(value);
    handleFilterChange("Biceps", value, true);
  };

  const handleHeightChange = (e) => {
    const value = e.target.value;
    setHeightValue(value);
    handleFilterChange("Height", value, true);
  };

  const handleAttireChange = (e) => {
    const value = e.target.value;
    setAttireValue(value);
    handleFilterChange("Attire", value, true);
  };

  const handleExperienceChange = (e) => {
    const value = e.target.value;
    setExperienceValue(value);
    handleFilterChange("Experience", value, true);
  };

  const handleProtectionTypeChange = (e) => {
    const value = e.target.value;
    setProtectionTypeValue(value);
    handleFilterChange("ProtectionType", value, true);
  };

  return (
    <div className="flex gap-4 flex-row flex-wrap w-full bg-white space-x-4 pb-6">
    {/* Biceps Dropdown */}
    <div className="flex flex-row items-center gap-2 text-black text-left">
      <label className="text-[16px] font-semibold text-gray-700">Biceps:</label>
      <div>
        <select
          value={bicepsValue}
          onChange={handleBicepsChange}
          className="w-14 cursor-pointer py-2 text-base bg-white focus:outline-none sm:text-sm"
        >
          {bicepsOptions.map((option, index) => (
            <option key={index} value={option}>
              {option === "Any" ? "Any" : `${option}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  
    {/* Height Dropdown */}
    <div className="flex flex-row items-center gap-2 text-black text-left">
      <label className="text-[16px] font-semibold text-gray-700">Height:</label>
      <div>
        <select
          value={heightValue}
          onChange={handleHeightChange}
          className="w-14 cursor-pointer py-2 text-base bg-white focus:outline-none sm:text-sm"
        >
          {heightOptions.map((option, index) => (
            <option key={index} value={option}>
              {option === "Any" ? "Any" : `${option}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  
    {/* Attire Dropdown */}
    <div className="flex flex-row items-center gap-2 text-black text-left">
      <label className="text-[16px] font-semibold text-gray-700">Attire:</label>
      <div>
        <select
          value={attireValue}
          onChange={handleAttireChange}
          className=" cursor-pointer w-14 py-2 text-base bg-white focus:outline-none sm:text-sm"
        >
          {attireOptions.map((option, index) => (
            <option key={index} value={option}>
              {option === "Any" ? "Any" : option}
            </option>
          ))}
        </select>
      </div>
    </div>
  
    {/* Experience Dropdown */}
    <div className="flex flex-row items-center gap-2 text-black text-left">
      <label className="text-[16px] font-semibold text-gray-700">Experience:</label>
      <div>
        <select
          value={experienceValue}
          onChange={handleExperienceChange}
          className="w-14 cursor-pointer py-2 text-base bg-white focus:outline-none sm:text-sm"
        >
          {experienceOptions.map((option, index) => (
            <option key={index} value={option}>
              {`${option} ${option === "Any" ? "" : "years"}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
  );
};

export default SearchComponent;
