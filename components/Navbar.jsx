import React, { useState, useContext } from "react";
import { FaBars, FaTimes } from "react-icons/fa"; 
import Modal from "./Modal";
import Login from "./Login";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import { LoadScript } from "@react-google-maps/api";
import ServiceProvider from "@/context/ServiceContext";
import Banner from "./Banner";
import OurMenuPage from "./OurServices";
import Filter from "./Filters";
import SearchComponent from "./SubNavbar";

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false); // State for Login Modal
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false); // State for Logout confirmation modal
  const { user, login, logout } = useContext(AuthContext); // Access login and logout from AuthContext

  // Function to open the login modal
  const openLoginModal = () => {
    setIsLoginOpen(true);
  };

  // Function to close the login modal
  const closeLoginModal = () => {
    setIsLoginOpen(false);
  };

  // Function to toggle the drawer
  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Function to handle logout with confirmation
  const handleLogoutConfirmation = () => {
    setIsLogoutConfirmOpen(true);
  };

  // Function to confirm logout
  const confirmLogout = () => {
    logout(); // Call the logout function from context
    setIsLogoutConfirmOpen(false);
  };

  return (
    <>
      {/* Navbar */}
      <nav className=" bg-black text-white p-4 shadow-lg z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-1 sm:px-6 lg:px-8">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-white hover:text-gray-300 focus:outline-none"
              onClick={toggleDrawer}
            >
              {isDrawerOpen ? <FaTimes size={21} /> : <FaBars size={21} />}
            </button>
          </div>
          <div className="flex items-center gap-2 ml-4 md:justify-start flex-1">
            <Link href="/" className="flex items-center">
              <img
                className="h-10 w-8 md:h-12 md:w-12 lg:h-14 lg:w-14 object-contain"
                src="/Wens-force-logo.png" // Replace with your logo path
                alt="WENS Force Logo"
              />
              <h3 className="ml-2 text-sm md:text-xl text-white lg:text-lg font-custom cursor-pointer sm:inline-block">
                WENS Force
              </h3>
            </Link>
          </div>

          {/* Login/Logout Button (Visible on Mobile) and Nav Links (Visible on Desktop) */}
          <div className="flex items-center space-x-4">
            {/* Login/Logout Button for Mobile */}
            <div className="md:hidden">
              {!user ? (
                <button
                  onClick={openLoginModal}
                  className="relative px-3 py-2 text-yellow-500 font-sans font-medium border border-yellow-300 rounded-lg text-[16px] group focus:outline-none"
                >
                  Login
                  <span className="absolute w-full h-[2px]"></span>
                </button>
              ) : (
                <button
                  onClick={handleLogoutConfirmation}
                  className="relative px-3 py-2 text-yellow-500 font-sans font-medium border border-yellow-300 rounded-lg text-[16px] group focus:outline-none"
                >
                  Logout
                  <span className="absolute w-full h-[2px]"></span>
                </button>
              )}
            </div>

            {/* Navigation Links for Desktop */}
            <div className="hidden md:flex space-x-4">
              <Link href="/corporate" className="relative px-3 py-2 text-[16px] font-medium group">
                Corporate
              </Link>
              <Link href="/provider" className="relative px-3 py-2 text-[16px] font-medium group">
                Provider
              </Link>
              <Link href="/widgets" className="relative px-3 py-2 text-[16px] font-medium group">
                Widgets
              </Link>
              <Link href="/support" className="relative px-3 py-2 text-[16px] font-medium group">
                Support
              </Link>
              {/* Conditionally render Login or Logout button */}
              {!user ? (
                <button
                  onClick={openLoginModal}
                  className="relative px-3 py-2 text-black bg-[#FFC700] font-sans font-medium border border-yellow-300 rounded-lg text-[16px] group focus:outline-none"
                >
                  Login/Signup
                  <span className="absolute w-full h-[2px]"></span>
                </button>
              ) : (
                <button
                  onClick={handleLogoutConfirmation}
                  className="relative px-3 py-2 text-black bg-[#FFC700] font-sans font-medium border border-yellow-300 rounded-lg text-[16px] group focus:outline-none"
                >
                  Logout
                  <span className="absolute w-full h-[2px]"></span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-black text-white transform ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out z-50`}
        >
          <div className="flex flex-col p-4 space-y-4">
            <button className="self-end text-white hover:text-gray-300 focus:outline-none" onClick={toggleDrawer}>
              <FaTimes size={24} />
            </button>
            <Link href="/corporate" className="text-lg font-medium" onClick={toggleDrawer}>
              Corporate
            </Link>
            <Link href="/provider" className="text-lg font-medium" onClick={toggleDrawer}>
              Provider
            </Link>
            <Link href="/widgets" className="text-lg font-medium" onClick={toggleDrawer}>
              Widgets
            </Link>
            <Link href="/support" className="text-lg font-medium" onClick={toggleDrawer}>
              Support
            </Link>
            {/* Conditionally render Login or Logout button */}
            {!user ? (
              <button onClick={openLoginModal} className="text-lg font-medium">
                Login / Account
              </button>
            ) : (
              <button onClick={handleLogoutConfirmation} className="text-lg font-medium">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      <Modal isOpen={isLoginOpen} onClose={closeLoginModal}>
        <Login onClose={closeLoginModal} />
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isLogoutConfirmOpen} onClose={() => setIsLogoutConfirmOpen(false)}>
        <div className="p-4 text-black">
          <h3 className="text-xl font-medium">Are you sure you want to log out?</h3>
          <div className="flex justify-end mt-4 space-x-2">
            <button onClick={() => setIsLogoutConfirmOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg">
              Cancel
            </button>
            <button onClick={confirmLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </Modal>


       {/* Main Content */}
       <LoadScript
        googleMapsApiKey='AIzaSyAm_rgt4RYjdG_RHpgcerB2uaDgQzfRcJc' // Accessed via import.meta.env
        libraries={["places"]}
      >
        <ServiceProvider>
          <div className="min-h-screen bg-gray-100">
            <SearchComponent />
            <Banner />
            <OurMenuPage />
            <Filter />
          </div>
        </ServiceProvider>
      </LoadScript>
    </>
  );
};

export default Navbar;
