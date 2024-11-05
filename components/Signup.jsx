import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Education from './Education';

const Signup = ({ onClose }) => {
  const [step, setStep] = useState(1); // Track form steps
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [flatNo, setFlatNo] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [education, setEducation] = useState("");
  const [institution, setInstitution] = useState("");

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2); // Move to address form step
    } else if (step === 2) {
      setStep(3); // Move to education form step
    } else if (step === 3) {
      console.log("Form Submitted");
      // Here you can handle the final form submission logic
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeInOut" } },
  };

  const inputVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-y-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div
        className="bg-white shadow-2xl rounded-lg overflow-hidden w-[60vw] md:w-[90vw] lg:w-[50vw] flex flex-col lg:flex-row"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Left Side: Image with gradient overlay */}
        <div className="w-full lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent z-10" />
          <img
            src="signup.jpg"
            alt="Signup"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 bg-white p-10 relative">
          <FaTimes
            className="absolute top-4 right-4 text-gray-600 cursor-pointer hover:text-black transition duration-150"
            onClick={onClose}
            size={24}
          />

          {/* Step 1: Personal Info Form */}
          {step === 1 && (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-8">About Me</h2>

              <form onSubmit={handleNext} className="flex flex-col space-y-6">
                <motion.div variants={inputVariants} initial="hidden" animate="visible">
                  <label className="text-lg font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border text-black  border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
                    required
                  />
                </motion.div>

                <motion.div variants={inputVariants} initial="hidden" animate="visible">
                  <label className="text-lg font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 text-black  bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
                    required
                  />
                </motion.div>

                <motion.div variants={inputVariants} initial="hidden" animate="visible">
                  <label className="text-lg font-medium text-gray-700">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
                    required
                  >
                    <option value="" disabled>Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </motion.div>

                <motion.div variants={inputVariants} initial="hidden" animate="visible">
                <label className="text-lg font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border text-black  border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
                    required
                  />
                </motion.div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                  >
                    Next
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 2: Address Form */}
          {step === 2 && (
            <>
              <h2 className="text-3xl font-bold text-gray-800 mb-8">Address Information</h2>

              <form onSubmit={handleNext} className="flex flex-col space-y-4">
                <motion.div variants={inputVariants} initial="hidden" animate="visible">
                  <label className="text-lg font-medium text-gray-700">Flat/House/Room Number</label>
                  <input
                    type="text"
                    value={flatNo}
                    onChange={(e) => setFlatNo(e.target.value)}
                    placeholder="Enter your flat/house/room number"
                    className="w-full px-4 py-3 border text-black  border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
                    required
                  />
                </motion.div>

                <motion.div variants={inputVariants} initial="hidden" animate="visible">
                  <label className="text-lg font-medium text-gray-700">Building Name/Area/Road</label>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                    placeholder="Enter your building name"
                    className="w-full px-4 py-3 border text-black  border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
                    required
                  />
                </motion.div>

                <motion.div variants={inputVariants} initial="hidden" animate="visible">
                  <label className="text-lg font-medium text-gray-700">Landmark</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Enter nearby landmark"
                    className="w-full px-4 py-3 border text-black  border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
                    required
                  />
                </motion.div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                  >
                    Next
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Education Form */}
          {step === 3 && (
            <>
              <Education 
                education={education} 
                setEducation={setEducation} 
                institution={institution} 
                setInstitution={setInstitution} 
                onSubmit={handleNext} // Pass the next handler
              />
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Signup;
