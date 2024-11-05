// ServiceContext.jsx
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/Firebase';
import { toast } from 'react-toastify';

// Create the context
export const ServiceContext = createContext();

// ServiceProvider component
const ServiceProvider = ({ children }) => {
  // Initialize cart from localStorage or start with an empty array
  const [cart, setCart] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart');
      return storedCart ? JSON.parse(storedCart) : [];
    }
    return [];
  });

  // State for services
  const [services, setServices] = useState([]);
  // State for selected filters
  const [selectedFilters, setSelectedFilters] = useState({
    Categories: [],
    Biceps: [],
    Height: [],
    Attire: [],
    Appearance: [],
    Experience: [],
    Accessories: [],
    Protection: [],
  });

  // Other state
  const [location, setLocation] = useState('All Locations');
  const [query, setQuery] = useState('');

  // Function to handle filter change
  const handleFilterChange = (category, value, isSingle = false) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      if (isSingle) {
        // For single-select filters like Categories
        if (value === 'All') {
          newFilters[category] = [];
        } else {
          newFilters[category] = [value];
        }
      } else {
        // For multi-select filters
        if (newFilters[category].includes(value)) {
          newFilters[category] = newFilters[category].filter((item) => item !== value);
        } else {
          newFilters[category] = [...newFilters[category], value];
        }
      }
      return newFilters;
    });
  };

  // Function to clear filters
  const clearFilters = () => {
    setSelectedFilters({
      Categories: [],
      Biceps: [],
      Height: [],
      Attire: [],
      Appearance: [],
      Experience: [],
      Accessories: [],
      Protection: [],
    });
    setQuery('');
    setLocation('All Locations');
  };

  // Effect to update localStorage whenever the cart changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart]);

  // Fetch services from Firestore
  useEffect(() => {
    const usersCollectionRef = collection(db, 'users');
    const unsubscribe = onSnapshot(
      usersCollectionRef,
      (snapshot) => {
        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setServices(usersData);
      },
      (error) => {
        console.error('Error fetching services:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Function to filter services based on selected filters
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Filter by location
    if (location && location !== 'All Locations') {
      filtered = filtered.filter(
        (service) =>
          service.currentLocation?.city?.toLowerCase().includes(location.toLowerCase()) ||
          service.currentLocation?.area?.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Filter by search query
    if (query.trim() !== '') {
      filtered = filtered.filter((service) =>
        service.name?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Filter by Categories
    if (selectedFilters.Categories.length > 0) {
      filtered = filtered.filter(
        (service) =>
          Array.isArray(service.categories) &&
          service.categories.some((cat) => selectedFilters.Categories.includes(cat))
      );
    }

    // Filter by Biceps
    if (selectedFilters.Biceps.length > 0) {
      filtered = filtered.filter((service) =>
        selectedFilters.Biceps.includes(service.biceps)
      );
    }

    // Filter by Height
    if (selectedFilters.Height.length > 0) {
      filtered = filtered.filter((service) =>
        selectedFilters.Height.includes(service.tall)
      );
    }

    // Filter by Attire
    if (selectedFilters.Attire.length > 0) {
      // Proceed only if "Any" is not selected
      if (!selectedFilters.Attire.includes('Any')) {
        filtered = filtered.filter((service) => {
          const serviceOutfits = service.outfits || {};
          const serviceAttires = Object.keys(serviceOutfits).filter(
            (attire) => serviceOutfits[attire]
          );
          return serviceAttires.some((att) => selectedFilters.Attire.includes(att));
        });
      }
    }

    // Filter by Appearance
    if (selectedFilters.Appearance.length > 0) {
      filtered = filtered.filter(
        (service) =>
          Array.isArray(service.appearance) &&
          service.appearance.some((app) => selectedFilters.Appearance.includes(app))
      );
    }

    // Filter by Experience
    if (selectedFilters.Experience.length > 0) {
      filtered = filtered.filter((service) =>
        selectedFilters.Experience.includes(service.experience)
      );
    }

    // Filter by Accessories
    if (selectedFilters.Accessories.length > 0) {
      filtered = filtered.filter(
        (service) =>
          Array.isArray(service.accessories) &&
          service.accessories.some((acc) => selectedFilters.Accessories.includes(acc))
      );
    }

    // Filter by Protection
    if (selectedFilters.Protection.length > 0) {
      filtered = filtered.filter((service) =>
        selectedFilters.Protection.includes(service.protection)
      );
    }

    return filtered;
  }, [services, selectedFilters, location, query]);

  // Function to add to cart
  const addToCart = (service) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.id === service.id);
      if (exists) {
        toast.info('Service is already in the cart.');
        return prevCart;
      }
      toast.success('Service added to the cart.');
      return [...prevCart, service];
    });
  };

  // Function to remove from cart
  const removeFromCart = (serviceId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== serviceId));
    toast.info('Service removed from the cart.');
  };

  return (
    <ServiceContext.Provider
      value={{
        services,
        filteredServices,
        cart,
        addToCart,
        removeFromCart,
        handleFilterChange,
        clearFilters,
        selectedFilters,
        location,
        setLocation,
        query,
        setQuery,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export default ServiceProvider;
