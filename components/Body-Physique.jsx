import React from 'react';

function BodyPhysique() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-8">Body Physique Information</h2>
      <form className="flex flex-col space-y-4">
        {/* Height Input */}
        <label className="text-lg font-medium text-gray-700">Height (cm)</label>
        <input
          type="number"
          placeholder="Enter your height in centimeters"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
          required
        />

        {/* Weight Input */}
        <label className="text-lg font-medium text-gray-700">Weight (kg)</label>
        <input
          type="number"
          placeholder="Enter your weight in kilograms"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
          required
        />

        {/* Body Type Dropdown */}
        <label className="text-lg font-medium text-gray-700">Body Type</label>
        <select
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
          required
        >
          <option value="" disabled>Select your body type</option>
          <option value="Ectomorph">Ectomorph</option>
          <option value="Mesomorph">Mesomorph</option>
          <option value="Endomorph">Endomorph</option>
        </select>

        {/* Fitness Goals */}
        <label className="text-lg font-medium text-gray-700">Fitness Goals</label>
        <textarea
          placeholder="Describe your fitness goals"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition duration-150"
          rows="4"
          required
        ></textarea>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default BodyPhysique;
