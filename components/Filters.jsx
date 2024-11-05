// Filter.jsx
import React, { useState, useContext, useMemo, useEffect } from "react";
import { FaCamera, FaCocktail, FaLightbulb, FaMusic, FaPaperPlane, FaPlus, FaRibbon, FaTag, FaUserShield, FaUtensils, FaWhatsapp } from "react-icons/fa";
import FilterDropdown from "./FilterDropdown";
import { db } from "../Firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { ServiceContext } from "@/context/ServiceContext";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";
import Login from "./Login";
import Modal from "./Modal";
import { toast } from "react-toastify";
import { encryptId } from "@/utils/encryption";
import { FilterContext } from "@/context/FilterContext";
import { RxCross2 } from "react-icons/rx";


import {
 
} from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';

const Filter = () => {
  const { user } = useContext(AuthContext);
  const {
    services,
    filteredServices,
    cart,
    addToCart,
    removeFromCart,
    handleFilterChange,
    clearFilters,
    selectedFilters,
    location,
  } = useContext(ServiceContext);

  const { categories } = useContext(FilterContext);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [category, setCategory] = useState(null);

  const openLoginModal = () => {
    setIsLoginOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginOpen(false);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    handleFilterChange("Categories", value, true);
  };

  useEffect(() => {
    // This effect ensures that services are filtered whenever selectedFilters change
  }, [selectedFilters]);

  const sortedServices = useMemo(() => {
    return [...filteredServices].sort((a, b) => a.price - b.price);
  }, [filteredServices]);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      toast.warn("Your cart is empty!");
      return;
    }

    try {
      const cartCollectionRef = collection(db, "cartSubmissions");
      const itemIds = cart.map((item) => item.id);

      const docRef = await addDoc(cartCollectionRef, {
        itemIds,
        submittedAt: Timestamp.now(),
        userId: user?.uid || null,
      });

      toast.success("Your cart has been submitted successfully!");

      const shareableURL = `${window.location.origin}/${docRef.id}`;
      const message = `Check out my cart: ${shareableURL}`;
      const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        message
      )}`;

      window.open(whatsappLink, "_blank");
    } catch (error) {
      console.error("Error submitting cart: ", error);
      toast.error("There was an error submitting your cart. Please try again.");
    }
  };

  const handleSubmitClick = () => {
    if (user) {
      handleSubmit();
    } else {
      openLoginModal();
    }
  };




  const categoryIcons = {
    'Event Bouncer': <FaUserShield />,
    'Security Guard': <MdSecurity />,
    'DJ': <FaMusic />,
    'Photographer': <FaCamera />,
    'Caterer': <FaUtensils />,
    'Decorator': <FaRibbon />,
    'Lighting': <FaLightbulb />,
    'Bartender': <FaCocktail />,
    // Add more categories and their corresponding icons
  };
  const defaultIcon = <FaTag />;

  return (
    <div className="flex flex-col lg:flex-row bg-white text-black min-h-screen">
      {/* Left Sidebar - Filters */}
      <aside className="w-full lg:w-1/5 bg-gray-50 p-6 border-r border-gray-200 shadow-lg">
  <div className="sticky top-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories</h2>

    {categories && categories.length > 0 ? (
      <ul className="space-y-3">
        {categories.map((categoryItem, index) => (
          <li key={index}>
            <button
              onClick={() => handleCategoryChange(categoryItem)}
              className={`flex items-center w-full text-left text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200 ease-in-out shadow-sm hover:shadow-md ${
                category === categoryItem
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <span className="mr-2 text-lg text-gray-700">
                {categoryIcons[categoryItem] || defaultIcon}
              </span>
              {categoryItem}
            </button>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">No categories available</p>
    )}

    <button
      onClick={() => {
        clearFilters();
        setCategory(null);
      }}
      className="w-full mt-6 bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition duration-200 ease-in-out"
    >
      Clear All Filters
    </button>
  </div>
</aside>


      {/* Main Content - Services */}
      <main className="flex-1 p-6">
        <h2 className="text-3xl text-black font-bold mb-6">
          Selection in{" "}
          {category && (
            <span className="text-[#F8C306] font-semibold mr-1">
              {category}
            </span>
          )}
          {category && location && " in "}
          {location && (
            <span className="text-[#F8C306] font-semibold mr-1">
              {location}
            </span>
          )}
        </h2>
        <FilterDropdown />

        {sortedServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border rounded-lg shadow-lg overflow-hidden flex flex-col"
              >
                {/* Image */}
                <Link
                  href={{
                    pathname: "/profile",
                    query: { id: encryptId(service.id) },
                  }}
                >
                  <div className="w-full h-64 p-3 bg-gray-100 overflow-hidden relative">
                    <img
                      src={service.photo}
                      alt={service.name}
                      className="w-full h-full object-cover  hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="flex flex-col flex-grow p-4">
                  {/* Name */}
                  <Link
                    href={{
                      pathname: "/profile",
                      query: { id: encryptId(service.id) },
                    }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800 cursor-pointer">
                      {service.avatar}
                    </h3>
                  </Link>

                  {/* Attributes */}
                  <div className="grid grid-cols-1 md:grid-cols-2  gap-4 mt-2">
                    <div className="text-gray-700 text-sm truncate w-28">
                      <span className="font-medium">Height:</span>{" "}
                      {service.tall}
                    </div>
                    <div className="text-gray-700  text-sm truncate w-24">
                      <span className="font-medium">Bicep:</span>{" "}
                      {service.biceps}
                    </div>
                    <div className="text-gray-700 truncate w-28 text-sm">
                      <span className="font-medium">Experience:</span>{" "}
                      {service.experience}{" "}
                      {service.experience > 1 ? "Years" : "Year"}
                    </div>
                    <div className="text-gray-700 text-sm">
                      <span className="font-medium">Ref:</span> {service.reffer}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 border-t pt-4 flex items-center justify-between">
                    {/* Price */}
                    <div className="text-lg font-medium">
                      ₹{service.mainSalary}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {/* WhatsApp Button */}
                      <button
                        onClick={() => {
                          const serviceUrl = `${window.location.origin}/profile/${service.id}`;
                          const message = `Check out this service: ${service.name}\nPrice: ₹${service.price}\nLink: ${serviceUrl}`;
                          const encodedMessage = encodeURIComponent(message);
                          const whatsappUrl = `https://wa.me/${service.phoneNumber}?text=${encodedMessage}`;
                          window.open(whatsappUrl, "_blank");
                        }}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 flex items-center justify-center transition-transform duration-300 hover:scale-105"
                      >
                        <FaWhatsapp className="text-xl" />
                      </button>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(service)}
                        className="bg-yellow-500 text-white p-2 rounded-full hover:bg-yellow-600 flex items-center justify-center transition-transform duration-300 hover:scale-105"
                      >
                        <FaPlus className="text-xl" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-700">
            No services match the selected filters.
          </p>
        )}
      </main>

      {/* Right Sidebar - Cart */}
      <aside className="w-full md:w-1/4 lg:w-1/4 bg-white p-6 border-t md:border-t-0 md:border-l border-gray-200 shadow-lg">
        <div className="md:sticky md:top-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Cart</h2>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center mt-10 h-full">
              <img src="/cart.png" alt="Empty Cart" className="w-32 mb-4" />
              <p className="text-gray-700 text-center">
                Oops! Your cart is empty. You haven't added any service yet.
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {cart.map((item, index) => (
                  <li
                    key={index}
                    className="bg-white p-2 rounded-lg shadow-md border border-gray-300 flex items-start space-x-4"
                  >
                    <img
                      src={item.photo}
                      alt={item.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-lg font-semibold truncate w-48 text-gray-800">
                          {item.name}
                        </p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-black"
                        >
                          <RxCross2 />
                        </button>
                      </div>

                      <div className="text-sm flex items-center justify-between text-gray-600 mt-2 space-y-1">
                        <div className="truncate">
                          <p className="truncate w-28">Height: {item.tall}</p>
                          <p className="truncate w-28">Bicep: {item.biceps}</p>
                        </div>

                        <div>
                          <p>Exp: {item.experience} Years</p>
                          <p>Ref: {item.reffer}</p>
                        </div>
                      </div>

                      <p className="text-sm text-gray-500 mt-2">
                        ₹{item.mainSalary}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 sticky bottom-3">
                <button
                  className={`bg-yellow-500 text-white py-3 px-6 rounded-lg w-full hover:bg-yellow-600 transition flex items-center justify-center ${
                    !user && "bg-blue-500 hover:bg-blue-600"
                  }`}
                  onClick={handleSubmitClick}
                >
                  Share List <FaPaperPlane className="ml-2" />
                </button>

                {/* Login Modal */}
                <Modal isOpen={isLoginOpen} onClose={closeLoginModal}>
                  <Login onClose={closeLoginModal} />
                </Modal>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Filter;
