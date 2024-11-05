// pages/profile/[id].js
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/Footer";
import Navbar2 from "@/components/Navbar2";
import {
  FaShoppingCart,
  FaShareAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { ServiceContext } from "@/context/ServiceContext";
import { AuthContext } from "@/context/AuthContext"; // Import AuthContext
import { decryptId } from "@/utils/encryption";
import { toast } from "react-toastify";
import Link from "next/link"; // For navigation

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  const [service, setService] = useState(null);
  const { services, addToCart, cart } = useContext(ServiceContext);
  const { user } = useContext(AuthContext); // Access user from AuthContext

  const proficiencyLevels = {
    0: "Beginner",
    1: "Good",
    2: "Fluent",
  };

  // Image Slider States
  const additionalImages = service?.additionalImages || [];
  const initialImage = service?.photo || "/default-profile.png";
  const [currentImage, setCurrentImage] = useState(initialImage);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  // Define images per page based on screen size using Tailwind's responsive breakpoints
  const imagesPerPageConfig = {
    base: 2, // Mobile devices
    sm: 3, // Small screens
    md: 4, // Medium screens
    lg: 4, // Large screens
    xl: 5, // Extra large screens
  };

  // State to manage dynamic images per page
  const [dynamicImagesPerPage, setDynamicImagesPerPage] = useState(
    imagesPerPageConfig.md
  );

  // Update imagesPerPage based on window width
  useEffect(() => {
    const updateImagesPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // base: <640px
        setDynamicImagesPerPage(imagesPerPageConfig.base);
      } else if (width >= 640 && width < 768) {
        // sm: 640px - 767px
        setDynamicImagesPerPage(imagesPerPageConfig.sm);
      } else if (width >= 768 && width < 1024) {
        // md: 768px - 1023px
        setDynamicImagesPerPage(imagesPerPageConfig.md);
      } else if (width >= 1024 && width < 1280) {
        // lg: 1024px - 1279px
        setDynamicImagesPerPage(imagesPerPageConfig.lg);
      } else {
        // xl: 1280px and above
        setDynamicImagesPerPage(imagesPerPageConfig.xl);
      }
    };

    updateImagesPerPage();
    window.addEventListener("resize", updateImagesPerPage);
    return () => window.removeEventListener("resize", updateImagesPerPage);
  }, []);

  const totalPages = Math.ceil(additionalImages.length / dynamicImagesPerPage);

  // Automatic Image Slider
  useEffect(() => {
    if (additionalImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % additionalImages.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [additionalImages.length]);

  // Update currentImage and currentPage when currentIndex or dynamicImagesPerPage changes
  useEffect(() => {
    if (additionalImages.length > 0) {
      setCurrentImage(additionalImages[currentIndex]);
      const newPage = Math.floor(currentIndex / dynamicImagesPerPage);
      setCurrentPage(newPage);
    }
  }, [currentIndex, additionalImages, dynamicImagesPerPage]);

  // Handle Previous Button Click
  const handlePrevious = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
    setCurrentIndex((prevIndex) => {
      const newIndex = prevIndex - dynamicImagesPerPage;
      return newIndex < 0 ? additionalImages.length + newIndex : newIndex;
    });
  };

  // Handle Next Button Click
  const handleNext = () => {
    if (totalPages <= 1) return;
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex + dynamicImagesPerPage) % additionalImages.length
    );
  };

  // Handle Image Click
  const handleImageClick = (image, index) => {
    setCurrentImage(image);
    setCurrentIndex(index);
    const newPage = Math.floor(index / dynamicImagesPerPage);
    setCurrentPage(newPage);
  };

  // Determine the current set of images to display in the slider
  const start = currentPage * dynamicImagesPerPage;
  const end = start + dynamicImagesPerPage;
  const currentImages = additionalImages.slice(start, end);

  // Fetch service data based on decrypted ID
  useEffect(() => {
    if (id && services) {
      // Find the user with the matching id
      const foundUser = services.find((user) => user.id === decryptId(id));
      setService(foundUser);
      console.log(foundUser);
    }
  }, [id, services]);

  if (!service) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar2 />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-xl">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Function to handle adding to cart
  const handleAddToCart = () => {
    addToCart(service);
    toast.success("Added to cart!");
  };

  return (
    <div className="flex text-black flex-col min-h-screen bg-gray-50 relative">
      <Navbar2 />

      {/* Main Content with Conditional Blur */}
      <main
        className={`flex-grow transition filter ${
          !user ? "blur-sm pointer-events-none" : "blur-0"
        }`}
      >
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 ">
          <div className="container mx-auto">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col lg:flex-row">
              {/* Left Section: Images */}
              <div className="p-6 lg:p-10 w-full lg:w-1/2 flex flex-col">
                {/* Main Profile Image */}
                <div className="relative flex items-center justify-center">
                  <img
                    src={initialImage || "/default-profile.png"}
                    alt="Profile Picture"
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg w-[32vw] h-64 sm:h-80 md:h-10 lg:h-[45vh]"
                    priority
                  />
                </div>

                {/* Image Suggestions Slider */}
                <div className="mt-8">
                  {/* <h3 className="text-lg text-black font-semibold mb-4">
                    Image Suggestions
                  </h3> */}

                  {/* Slider Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={handlePrevious}
                        aria-label="Previous Images"
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300"
                      >
                        <FaChevronLeft />
                      </button>
                      <button
                        onClick={handleNext}
                        aria-label="Next Images"
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300"
                      >
                        <FaChevronRight />
                      </button>
                    </div>
                  )}

                  {/* Images */}
                  {additionalImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {currentImages.map((image, index) => {
                        const imageIndex = start + index;
                        return (
                          <div
                            key={imageIndex}
                            className={`relative w-full h-24 cursor-pointer rounded-lg overflow-hidden border-2 ${
                              currentImage === image
                                ? "border-blue-500"
                                : "border-transparent"
                            } hover:border-blue-500 transition duration-300`}
                            onClick={() => handleImageClick(image, imageIndex)}
                          >
                            <img
                              src={image}
                              alt={`Additional Image ${imageIndex + 1}`}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-lg"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination Indicator */}
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4 space-x-2">
                      {Array.from({ length: totalPages }).map(
                        (_, pageIndex) => (
                          <span
                            key={pageIndex}
                            className={`w-3 h-3 rounded-full ${
                              pageIndex === currentPage
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            }`}
                          ></span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section: Profile Details */}
              <div className="w-full lg:w-1/2 p-6 lg:p-12">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  {service.name || "N/A"}
                </h2>
                <p className="text-gray-700 mb-2">
                  <strong>Job Category:</strong> {service.categories || "N/A"}
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Location:</strong>{" "}
                  {service.currentLocation.city || "N/A"},{" "}
                  {service.currentLocation.state || "NA"}
                </p>

                <p className="text-gray-700 mb-2 flex gap-1">
                  <strong>Date of Birth:</strong>
                  <span className="block text-gray-600">
                    {service.dob
                      ? Math.floor(
                          (new Date() - new Date(service.dob)) /
                            (1000 * 60 * 60 * 24 * 365.25)
                        )
                      : "N/A"} year
                  </span>
                </p>

                <p className="text-gray-700 mb-4">
                  <strong>Job Experience:</strong>{" "}
                  {service.experience ? `${service.experience} years` : "N/A"}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 shadow-lg transition duration-300"
                  >
                    <FaShoppingCart className="mr-2" />
                    Add to Cart
                  </button>
                  <button className="flex items-center justify-center bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 shadow-lg transition duration-300">
                    <FaShareAlt className="mr-2" />
                    Share Profile
                  </button>
                </div>

                {/* Body Details */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Body Details
                  </h4>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>
                      <strong>Height:</strong> {service?.tall || "N/A"}
                    </li>
                    <li>
                      <strong>Weight:</strong> {service?.kg || "N/A"}
                    </li>
                    <li>
                      <strong>Chest Size:</strong> {service?.chest || "N/A"}
                    </li>
                    <li>
                      <strong>Biceps Size:</strong> {service?.biceps || "N/A"}
                    </li>
                    <li>
                      <strong>Triceps Size:</strong> {service?.triceps || "N/A"}
                    </li>
                    {/* Add more body details as needed */}
                  </ul>
                </div>
              </div>
            </div>

            {/* Additional Sections */}
            <div className="mt-12 pb-12">
              <div className="container mx-auto px-4 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 

                  {/* Skills Card */}
                  <div className="bg-white shadow-md rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <svg
                        className="w-6 h-6 text-red-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m2 0a2 2 0 100-4 2 2 0 000 4zM5 12h.01M19 12h.01M12 12v.01"
                        />
                      </svg>
                      <h2 className="text-2xl font-semibold text-gray-800">
                        Skills
                      </h2>
                    </div>
                    {service.skills && service.skills.length > 0 ? (
                      <ul className="list-disc list-inside text-gray-600 space-y-2">
                        {service.skills.map((skill, index) => (
                          <li key={index}>{skill}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Overlay for Unauthenticated Users */}
      {!user && (
        <div className="absolute inset-0 flex justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 h-[32vh] rounded-lg justify-center sticky top-32 shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="mb-6">
              You need to be logged in to view this profile. Please log in to
              continue.
            </p>
            <Link
              href="/"
              className="inline-block bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition duration-300"
            >
              Go to Home
            </Link>
          </div>
        </div>
      )}

      <Footer />

      {/* Optional: Display Cart Data on ProfilePage */}
      {/* You can choose to display the cart here or navigate to a separate Cart page */}
      <CartSection cart={cart} />
    </div>
  );
}

// Optional: Create a CartSection component to display cart items
const CartSection = ({ cart }) => {
  if (cart.length === 0) return null;

  return (
    <div
      className="
        fixed bottom-0 left-0 w-auto right-0 m-0 bg-white shadow-lg rounded-t-lg p-4 max-h-96 overflow-y-auto
        sm:rounded-lg sm:m-4 sm:w-80  sm:max-h-96
        sm:left-0 sm:right-auto sm:bottom-0
      "
    >
      <h3 className="text-lg font-semibold mb-2">Your Cart</h3>
      <ul className="space-y-4">
        {cart.map((item) => (
          <li key={item.id} className="flex items-center">
            <img
              src={item.photo}
              alt={item.name}
              className="w-12 h-12 object-cover mr-4"
            />
            <div>
              <p className="font-semibold">{item.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
