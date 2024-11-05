import React, { useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { motion } from "framer-motion";
import {
  FaTachometerAlt,
  FaUsers,
  FaHandshake,
  FaShieldAlt,
  FaExchangeAlt,
  FaTags,
  FaHeadset,
  FaCogs,
  FaSlidersH,
  FaArrowLeft,
} from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { MdFeaturedPlayList } from "react-icons/md";
import {
  AiFillAppstore,
  AiOutlineClockCircle,
  AiOutlineTool,
} from "react-icons/ai";
import { GiSwordClash } from "react-icons/gi";
import { FiChevronDown, FiChevronUp, FiEdit, FiUser } from "react-icons/fi";

const sidebarItems = [
  { label: "Dashboard", icon: <FaTachometerAlt /> },
  { label: "User Management", icon: <FaUsers /> },
  { label: "Customer Relations", icon: <FaHandshake />, hasDropdown: true },
  { label: "Website", icon: <AiFillAppstore />, hasDropdown: true },
  { label: "Agent Management", icon: <FaShieldAlt />, hasDropdown: true },
  { label: "Transactions", icon: <FaExchangeAlt /> },
  { label: "Bids & Deals", icon: <FaTags /> },
  { label: "Help Desk", icon: <FaHeadset /> },
  { label: "Content Management", icon: <FaCogs /> },
  { label: "Settings", icon: <FaSlidersH /> },
];

const Sidebar = ({ activeItem, onItemClick }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false); // Added missing state
  const [isUserStyleOpen, setIsUserStyleOpen] = useState(false);
  const [websiteDropdownOpen, setWebsiteDropdownOpen] = useState(false);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = (label) => {
    onItemClick(label);
    if (label === "Agent Management") {
      setDropdownOpen(!dropdownOpen);
      setCustomerDropdownOpen(false);
      setWebsiteDropdownOpen(false);
    } else if (label === "Customer Relations") {
      setCustomerDropdownOpen(!customerDropdownOpen);
      setDropdownOpen(false);
      setWebsiteDropdownOpen(false);
    } else if (label === "Website") {
      setWebsiteDropdownOpen(!websiteDropdownOpen);
      setDropdownOpen(false);
      setCustomerDropdownOpen(false);
    } else {
      setDropdownOpen(false);
      setCustomerDropdownOpen(false);
      setWebsiteDropdownOpen(false);
    }
  };

  return (
    <div
      className={`bg-yellow-500 ${
        isCollapsed ? "w-20" : "w-64"
      } p-4 text-black transition-all duration-300 h-screen overflow-y-auto`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between mb-8">
        {isCollapsed ? (
          <button onClick={handleToggle} className="w-12 h-11 mx-auto mb-4">
            <img
              src="/Wens-force-logo.png"
              alt="Logo"
              className="w-12 h-11 rounded-full"
            />
          </button>
        ) : (
          <>
            <img
              src="/Wens-force-logo.png"
              alt="Logo"
              className="w-40 h-36 rounded-full"
            />
            <button
              onClick={handleToggle}
              className="text-white hover:text-black bg-transparent p-2 rounded-full transition-colors duration-300"
            >
              <FaArrowLeft className="transition-transform duration-300" />
            </button>
          </>
        )}
      </div>

      {/* Sidebar Items */}
      <ul className="space-y-2">
        {sidebarItems.map((item, index) => (
          <React.Fragment key={index}>
            <li
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-300 ${
                activeItem === item.label
                  ? "bg-yellow-600 text-white"
                  : "text-black hover:bg-yellow-700 hover:text-white"
              }`}
              onClick={() => handleItemClick(item.label)}
              data-tooltip-id={`tooltip-${index}`}
              data-tooltip-content={isCollapsed ? item.label : ""}
            >
              <span className="text-xl mr-4">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
              <ReactTooltip
                id={`tooltip-${index}`}
                place="right"
                type="dark"
                effect="solid"
              />
            </li>

            {/* Dropdown for "Agent Management" */}
            {item.label === "Agent Management" &&
              dropdownOpen &&
              !isCollapsed && (
                <motion.ul
                  className="ml-8 mt-2 space-y-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <li
                    className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                    onClick={() => onItemClick("Categories")}
                  >
                    <BiCategory className="text-lg mr-3" />
                    Categories
                  </li>
                  <li
                    className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                    onClick={() => onItemClick("Features")}
                  >
                    <MdFeaturedPlayList className="text-lg mr-3" />
                    Features
                  </li>
                  <li
                    className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                    onClick={() => onItemClick("Listings")}
                  >
                    <AiFillAppstore className="text-lg mr-3" />
                    Listings
                  </li>
                  <li
                    className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                    onClick={() => onItemClick("Skills")}
                  >
                    <AiOutlineTool className="text-lg mr-3" />
                    Skills
                  </li>
                  <li
                    className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                    onClick={() => onItemClick("Weapon")}
                  >
                    <GiSwordClash className="text-lg mr-3" />
                    Weapon
                  </li>
                  <li
                    className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                    onClick={() => onItemClick("Shifts")}
                  >
                    <AiOutlineClockCircle className="text-lg mr-3" />
                    Shifts
                  </li>
                  {/* User Style Dropdown */}
                  <li className="relative">
                    <div
                      className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                      onClick={() => setIsUserStyleOpen(!isUserStyleOpen)}
                    >
                      <FiUser className="text-lg mr-3" />
                      User Style
                      <span className="ml-auto">
                        {isUserStyleOpen ? (
                          <FiChevronUp className="text-lg" />
                        ) : (
                          <FiChevronDown className="text-lg" />
                        )}
                      </span>
                    </div>
                    {/* Nested dropdown for User Style */}
                    {isUserStyleOpen && (
                      <motion.ul
                        className="ml-8 mt-2 space-y-1"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <li
                          className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                          onClick={() => onItemClick("UserFace")}
                        >
                          <FiEdit className="text-lg mr-3" />
                          User Face
                        </li>
                        <li
                          className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                          onClick={() => onItemClick("UserBeard")}
                        >
                          <FiEdit className="text-lg mr-3" />
                          User Beard
                        </li>
                        <li
                          className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                          onClick={() => onItemClick("UserHair")}
                        >
                          <FiEdit className="text-lg mr-3" />
                          User Hair
                        </li>
                      </motion.ul>
                    )}
                  </li>
                </motion.ul>
              )}

            {/* Dropdown for "Website" */}
            {item.label === "Website" &&
              websiteDropdownOpen &&
              !isCollapsed && (
                <motion.ul
                  className="ml-8 mt-2 space-y-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <li
                    className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                    onClick={() => onItemClick("Banner")}
                  >
                    <FiEdit className="text-lg mr-3" />
                    Banner
                  </li>
                </motion.ul>
              )}

            {/* Dropdown for "Customer Relations" */}
            {item.label === "Customer Relations" &&
              customerDropdownOpen &&
              !isCollapsed && (
                <motion.ul
                  className="ml-8 mt-2 space-y-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Add your customer relations submenu items here */}
                  <li
                    className="flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-300 text-black hover:bg-yellow-700 hover:text-white"
                    onClick={() => onItemClick("Customer Item 1")}
                  >
                    <FiEdit className="text-lg mr-3" />
                    Customer Item 1
                  </li>
                  {/* Add more items as needed */}
                </motion.ul>
              )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
