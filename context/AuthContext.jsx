// /context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { db } from '@/Firebase';
import { doc, getDoc } from 'firebase/firestore';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [adminAllowedNumbers, setAdminAllowedNumbers] = useState(null);
  const [dashboardAdminAllowedNumbers, setDashboardAdminAllowedNumbers] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isDashboardAdmin, setIsDashboardAdmin] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false); // For normal users

  const [loading, setLoading] = useState(true); // Loading state

  // Load user data from localStorage and fetch allowedNumbers when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }

        await fetchAdminAllowedNumbers();
        await fetchDashboardAdminAllowedNumbers();
      } catch (error) {
        console.error('Error during initial fetch:', error);
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };
    fetchData();
  }, []);

  // Fetch allowedNumbers for admin from Firebase
  const fetchAdminAllowedNumbers = async () => {
    try {
      const docRef = doc(db, 'admin', 'WENS-Force');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const numbers = data.data; // Assuming the structure is { data: [phone numbers] }
        setAdminAllowedNumbers(numbers);
        return numbers;
      } else {
        console.log('No such admin document!');
        setAdminAllowedNumbers([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching admin allowed numbers:', error);
      setAdminAllowedNumbers([]);
      return [];
    }
  };

  // Fetch allowedNumbers for dashboard admin from Firebase
  const fetchDashboardAdminAllowedNumbers = async () => {
    try {
      const docRef = doc(db, 'admin', 'dashboard');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const numbers = data.data; // Assuming the structure is { data: [phone numbers] }
        setDashboardAdminAllowedNumbers(numbers);
        return numbers;
      } else {
        console.log('No such dashboard admin document!');
        setDashboardAdminAllowedNumbers([]);
        return [];
      }
    } catch (error) {
      console.error('Error fetching dashboard admin allowed numbers:', error);
      setDashboardAdminAllowedNumbers([]);
      return [];
    }
  };

  // Normalize phone numbers for consistent comparison
  const normalizePhoneNumber = (number) => {
    // Remove any non-digit characters
    return number.replace(/\D/g, '');
  };

  // Check roles whenever user or allowedNumbers change
  useEffect(() => {
    if (user && adminAllowedNumbers && dashboardAdminAllowedNumbers) {
      const normalizedUserPhoneNumber = normalizePhoneNumber(user.phoneNumber);
  
      // Check if user is admin
      const normalizedAdminNumbers = adminAllowedNumbers.map(normalizePhoneNumber);
      const isUserAdmin = normalizedAdminNumbers.includes(normalizedUserPhoneNumber);
      setIsAdmin(isUserAdmin);
      if (isUserAdmin) {
        localStorage.setItem('admin', JSON.stringify(user));
      } else {
        localStorage.removeItem('admin');
      }
  
      // Check if user is dashboard admin
      const normalizedDashboardNumbers = dashboardAdminAllowedNumbers.map(normalizePhoneNumber);
      const isUserDashboardAdmin = normalizedDashboardNumbers.includes(normalizedUserPhoneNumber);
      setIsDashboardAdmin(isUserDashboardAdmin);
      if (isUserDashboardAdmin) {
        localStorage.setItem('dashboardadmin', JSON.stringify(user));
      } else {
        localStorage.removeItem('dashboardadmin');
      }
  
      // Set `isAllowed` based on admin or dashboard admin status only
      setIsAllowed(isUserAdmin || isUserDashboardAdmin);
    } else {
      setIsAdmin(false);
      setIsDashboardAdmin(false);
      setIsAllowed(false);
    }
  }, [user, adminAllowedNumbers, dashboardAdminAllowedNumbers]);
  

  // Save user data to localStorage and context
  const login = async (phoneNumber) => {
    setLoading(true); // Start loading when login begins
    try {
      const userData = { phoneNumber };
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));

      // Fetch allowedNumbers if not already fetched
      let adminNumbers = adminAllowedNumbers;
      if (adminAllowedNumbers === null) {
        adminNumbers = await fetchAdminAllowedNumbers();
      }

      let dashboardNumbers = dashboardAdminAllowedNumbers;
      if (dashboardAdminAllowedNumbers === null) {
        dashboardNumbers = await fetchDashboardAdminAllowedNumbers();
      }

      // Roles will be set in the useEffect above based on fetched numbers
    } catch (error) {
      console.error('Error during login:', error);
    } finally {
      setLoading(false); // Stop loading after login process
    }
  };

  // Clear user data from context and localStorage on logout
  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setIsDashboardAdmin(false);
    setIsAllowed(false);
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    localStorage.removeItem('dashboardadmin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAllowed,
        isAdmin,
        isDashboardAdmin,
        login,
        logout,
        loading, // Provide loading state
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
