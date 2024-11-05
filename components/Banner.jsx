// /components/Banner.js
import React, { useState, useEffect, useRef, useContext } from "react";
import dynamic from "next/dynamic";
import {
  FaMapMarkerAlt,
  FaSearch,
  FaSpinner,
  FaHistory,
  FaLocationArrow,
  FaTrashAlt,
} from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";

import { ServiceContext } from "@/context/ServiceContext";
import { AuthContext } from "@/context/AuthContext";
import { db } from "@/Firebase";
import { useRouter } from "next/router";
import Modal from "./Modal";
import Login from "./Login";
import { MdMyLocation } from "react-icons/md";

// Import useLoadScript to load Google Maps API
import { useLoadScript } from "@react-google-maps/api";

// Dynamically import Autocomplete to prevent SSR issues
const Autocomplete = dynamic(
  () => import("@react-google-maps/api").then((mod) => mod.Autocomplete),
  { ssr: false }
);

const libraries = ["places"];

const Banner = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchInputRef = useRef();
  const currentLocationRef = useRef();
  const [images, setImages] = useState([]); // To store banner images
  const [categories, setCategories] = useState([]); // To store service categories
  const [currentCategory, setCurrentCategory] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const commonLocalities = ["Andheri", "Bandra", "Juhu", "Borivali", "Powai"];

  const handleSearchClick = () => {
    setIsDropdownOpen(true);
  };



  const handleDeleteRecentSearch = (place) => {
    setRecentSearches((prev) => prev.filter((p) => p !== place));
  };



  // Handler for Support button to open WhatsApp
  const handleSupportClick = () => {
    const whatsappNumber = "7304607954"; // Replace with your WhatsApp number
    const message = encodeURIComponent("Hello, I need support with...");
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(whatsappURL, "_blank");
  };

  const openLoginModal = () => {
    setIsLoginOpen(true);
  };

  // Function to close the login modal
  const closeLoginModal = () => {
    setIsLoginOpen(false);
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Use location and handleFilterChange from ServiceContext
  const { location, setLocation, handleFilterChange, clearFilters } =
    useContext(ServiceContext);

  // Use AuthContext to get user information and isAllowed flag
  const { user, isAllowed, admin } = useContext(AuthContext);

  // Fetch banner images and categories from Firebase Firestore
  useEffect(() => {
    const fetchBannerData = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch banner images from 'Bannerimage' collection
        const imagesSnapshot = await getDocs(collection(db, "Bannerimage"));
        const imageUrls = imagesSnapshot.docs
          .map((doc) => doc.data().imageUrl || doc.data().image)
          .filter((url) => url); // Filter out any undefined or null URLs
        setImages(imageUrls);

        // Fetch categories from 'Bannerbuttons' collection
        const categoriesSnapshot = await getDocs(
          collection(db, "Bannerbuttons")
        );
        const buttonNames = categoriesSnapshot.docs
          .map((doc) => doc.data().buttonName)
          .filter((name) => name); // Filter out any undefined or null names
        setCategories(buttonNames);
      } catch (error) {
        console.error("Error fetching banner data:", error);
        setError("Failed to load banner data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchBannerData();
  }, []);

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

  const getButtonClass = (category) => {
    return `font-medium py-2 px-4 rounded-md transition-colors duration-300 ${
      currentCategory === category
        ? "bg-yellow-500 text-black"
        : "bg-transparent text-white font-medium border border-white hover:bg-yellow-500 hover:text-black"
    }`;
  };

  // Slide Auto-Rotation
  useEffect(() => {
    if (images.length === 0) return; // Do not set interval if no images
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const apiKey = 'AIzaSyAm_rgt4RYjdG_RHpgcerB2uaDgQzfRcJc';

          // Ensure the API key is available
          if (!apiKey) {
            console.error("Google Maps API key is not defined.");
            setLocation("Error fetching location");
            return;
          }

          fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${'AIzaSyAm_rgt4RYjdG_RHpgcerB2uaDgQzfRcJc'}`
          )
            .then((response) => response.json())
            .then((data) => {
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
                console.error("Geocoding error:", data.status);
                setLocation("Error fetching location");
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    clearFilters();
    handleFilterChange("ServiceCategory", category);
  };

  const handlePlaceSelect = (place) => {
    setLocation(place);
    // Optionally, add to recent searches
    setRecentSearches((prev) => {
      const updated = [place, ...prev.filter((p) => p !== place)];
      return updated.slice(0, 5); // Keep only latest 5
    });
    setIsDropdownOpen(false);
  };

  // Load the Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyAm_rgt4RYjdG_RHpgcerB2uaDgQzfRcJc', // Ensure this is set in your .env file
    libraries,
  });

  // Ensure GOOGLE_MAPS_API_KEY is defined
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY === "AIzaSyAm_rgt4RYjdG_RHpgcerB2uaDgQzfRcJc"
    ) {
      console.warn(
        "Google Maps API key is not defined or is using a placeholder. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables."
      );
    }
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800">
        <p className="text-white">
          Failed to load Google Maps. Please try again later.
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800">
        <FaSpinner className="animate-spin text-white text-4xl" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-auto md:h-[60vh] overflow-hidden flex flex-col md:flex-row">
      {/* Left side - Banner image */}
      <div className="w-full md:w-[70%] h-60 md:h-full relative">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <FaSpinner className="animate-spin text-white text-4xl" />
          </div>
        ) : images.length > 0 ? (
          images.map((imageUrl, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{ transition: "opacity 1s ease-in-out" }}
            >
              <img
                src={imageUrl}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover "
                loading="lazy"
              />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800">
            <p className="text-white">No banners available.</p>
          </div>
        )}
      </div>

      {/* Right side - Heading and location inputs */}
      <div className="hidden md:flex w-full md:w-[30%] h-full text-black bg-black shadow-lg flex-col p-6 sm:p-8">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-xl text-white font-medium mb-6">
            Provide Your Location to See Services Near You:
          </h1>

          {/* Category Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 mb-8 sm:mb-14 gap-4">
            {loading ? (
              <div className="flex items-center justify-center col-span-2">
                <FaSpinner className="animate-spin text-white text-2xl" />
              </div>
            ) : categories.length > 0 ? (
              categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(category)}
                  className={getButtonClass(category)}
                >
                  {category}
                </button>
              ))
            ) : (
              <p className="text-white col-span-2 text-center">
                No categories available.
              </p>
            )}
          </div>

          <div className="relative">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Autocomplete
            onLoad={onLoadAutocomplete}
            onPlaceChanged={handlePlacesChanged}
            options={{ types: ["geocode"] }}
          >
            <input
              type="text"
              placeholder="Search Location"
              className="w-full px-3 py-2 bg-black placeholder:text-yellow-500  text-yellow-500 rounded-lg focus:outline-none"
              ref={searchInputRef}
              onClick={handleSearchClick}
            />
          </Autocomplete>

          {isDropdownOpen && (
            <div className="absolute top-full  z-10 left-0 w-full bg-white shadow-lg mt-1 rounded-lg  max-h-48 overflow-y-auto">
              <div className="p-2">
                <p className="text-gray-500 text-sm">Recently Searched</p>
                {recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handlePlaceSelect(search)}
                  >
                    <span>{search}</span>
                    <FaTrashAlt
                      className="text-gray-400 hover:text-red-500 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRecentSearch(search);
                      }}
                    />
                  </div>
                ))}
              </div>
              <hr />
              <div className="p-2">
                <p className="text-yellow-500 text-sm">Common Localities</p>
                {commonLocalities.map((locality, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handlePlaceSelect(locality)}
                  >
                    {locality}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="relative">
              <button
                onClick={handleUseMyLocation}
                className="w-full border text-sm py-2 font-medium px-6 gap-2 bg-yellow-500 hover:bg-yellow-600 text-white border-gray-300 rounded-lg hover:text-black font-medium focus:outline-none flex items-center justify-center  transition-colors duration-200"
                aria-label="Use Current Location"
              >
                <MdMyLocation className="text-white hover:text-black " />
                <span className="text-sm">Current Location</span>
              </button>
            </div>
      </div>
    </div>
        </div>

        {/* Error Message */}
        {!loading && error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
      </div>

    {/* Overlay for unauthorized users */}
      {!isAllowed && (
        <>
          <div className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center p-6 px-20 py-10 bg-white rounded shadow-lg">
              <h2 className="text-black font-bold text-2xl mb-4">
                Access Limited
              </h2>
              <p className="text-lg  text-black mb-6">
                Please login to access this feature.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={openLoginModal}
                  className="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors duration-200"
                >
                   Login
                </button>
                <button
                  onClick={handleSupportClick}
                  className="px-6 py-3 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors duration-200"
                >
                  Support
                </button>
              </div>
            </div>
          </div>

          <Modal isOpen={isLoginOpen} onClose={closeLoginModal}>
            <Login onClose={closeLoginModal} />
          </Modal>
        </>
      )}
    </div>
  );
};

export default Banner;
