import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing

function Education({ education, setEducation, institution, setInstitution }) {
  const inputVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle the "Next" button click
  const handleNext = (e) => {
    e.preventDefault(); // Prevent default form submission
    // Perform any validation or state updates if needed
    navigate('/body-physique'); // Navigate to Body Physique page
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Education Information</h2>
      <form className="flex flex-col space-y-4">
        {/* Highest Qualification Dropdown */}
        <motion.div variants={inputVariants} initial="hidden" animate="visible">
          <label className="text-lg font-medium text-gray-700">Highest Qualification</label>
          <select
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
            required
          >
            <option value="" disabled>Select your highest qualification</option>
            <option value="High School">High School</option>
            <option value="Diploma">Diploma</option>
            <option value="Bachelor's Degree">Bachelor's Degree</option>
            <option value="Master's Degree">Master's Degree</option>
            <option value="PhD">PhD</option>
          </select>
        </motion.div>

        {/* Institution Input */}
        <motion.div variants={inputVariants} initial="hidden" animate="visible">
          <label className="text-lg font-medium text-gray-700">Institution</label>
          <input
            type="text"
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Enter your institution's name"
            className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
            required
          />
        </motion.div>

        {/* Language Proficiency Section */}
        <h3 className="text-lg font-medium text-gray-700 mt-6">Language Proficiency</h3>
        <div className="flex flex-col text-black space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            English
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Hindi
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Marathi
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            Gujarati
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="button" // Change button type to button
            onClick={handleNext} // Attach click handler
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
}

export default Education;
