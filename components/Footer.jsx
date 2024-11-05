import React from 'react';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaWhatsapp, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  return (
    <motion.footer 
      className="bg-gray-100 py-8 px-4 md:px-28 text-black"
      initial={{ opacity: 0, y: 50 }} // Initial animation state
      animate={{ opacity: 1, y: 0 }} // Animate to this state
      transition={{ duration: 0.8 }} // Duration of the animation
    >
      <footer className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Category Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h3 className="font-bold text-lg mb-4">Category</h3>
          <ul className="space-y-2">
            <li className="text-sm md:text-base">Professional Bouncer</li>
            <li className="text-sm md:text-base">Personal Body Guard</li>
            <li className="text-sm md:text-base">Club Event Guard</li>
          </ul>
        </motion.div>

        {/* Help & Support Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h3 className="font-bold text-lg mb-4">Help & Support</h3>
          <ul className="space-y-2">
            <li className="text-sm md:text-base">Trust & Safety</li>
            <li className="text-sm md:text-base">Help Desk</li>
            <li className="text-sm md:text-base">Privacy Policy</li>
          </ul>
        </motion.div>

        {/* About Us Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <h3 className="font-bold text-lg mb-4">About Us</h3>
          <ul className="space-y-2">
            <li className="text-sm md:text-base">Contact Us</li>
            <li className="text-sm md:text-base">Mission & Vision</li>
            <li className="text-sm md:text-base">Terms of Service</li>
          </ul>
        </motion.div>

        {/* Wens Force Section */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="font-bold text-lg mb-4">WENS Force</h3>
          <p className="text-sm md:text-base mb-4">
            A Security Service Providing vertical of Wensbridge International Services Pvt. Ltd. providing bouncer, celebrity bouncer, private guards, bodyguards and general key holding services to individuals and businesses since 2008.
          </p>
          <div className="flex justify-center md:justify-start space-x-4">
            <motion.a
              href="#"
              className="text-gray-600"
              whileHover={{ scale: 1.2, rotate: 10 }} // Increased scale for hover effect
              whileTap={{ scale: 0.9 }}
            >
              <FaFacebook className="text-2xl" />
            </motion.a>
            <motion.a
              href="#"
              className="text-gray-600"
              whileHover={{ scale: 1.2, rotate: 10 }} // Increased scale for hover effect
              whileTap={{ scale: 0.9 }}
            >
              <FaInstagram className="text-2xl" />
            </motion.a>
            <motion.a
              href="#"
              className="text-gray-600"
              whileHover={{ scale: 1.2, rotate: 10 }} // Increased scale for hover effect
              whileTap={{ scale: 0.9 }}
            >
              <FaWhatsapp className="text-2xl" />
            </motion.a>
            <motion.a
              href="#"
              className="text-gray-600"
              whileHover={{ scale: 1.2, rotate: 10 }} // Increased scale for hover effect
              whileTap={{ scale: 0.9 }}
            >
              <FaEnvelope className="text-2xl" />
            </motion.a>
          </div>
        </motion.div>
      </footer>

      {/* Footer Bottom */}
      <motion.div 
        className="text-center py-4 mt-8 border-t border-gray-200"
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 1, duration: 0.8 }}
      >
        <p className="text-sm">&copy; All rights reserved and copyright @ WENS Force 2024</p>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
