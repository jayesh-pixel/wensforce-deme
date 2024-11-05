// FilterDropdown.jsx
import React, { useContext, useState } from "react";
import { ServiceContext } from "../context/ServiceContext";
import { FilterContext } from "@/context/FilterContext";

const FilterDropdown = () => {
  const { selectedFilters, handleFilterChange } = useContext(ServiceContext);
  const {
    experience,
    protection,
    biceps,
    height,
  } = useContext(FilterContext); // Access filters from FilterContext

  // Define options for each filter with "Any" as the first option
  const bicepsOptions = ["Any", ...biceps];
  const heightOptions = ["Any", ...height];
  const experienceOptions = ["Any", ...experience];
  const protectionTypeOptions = ["Any", ...protection];

  // If attire options are not in FilterContext, define them here
  const attireOptions = ["Any", "Formals", "Safari suit", "Shoes", "Protective"];

  // Initialize state with selected filters or default to "Any"
  const [bicepsValue, setBicepsValue] = useState(
    selectedFilters.Biceps || "Any"
  );
  const [heightValue, setHeightValue] = useState(
    selectedFilters.Height || "Any"
  );
  const [attireValue, setAttireValue] = useState(
    selectedFilters.Attire || "Any"
  );
  const [experienceValue, setExperienceValue] = useState(
    selectedFilters.Experience || "Any"
  );
  const [protectionTypeValue, setProtectionTypeValue] = useState(
    selectedFilters.ProtectionType || "Any"
  );

  // Handlers for each filter
  const handleBicepsChange = (e) => {
    const value = e.target.value;
    setBicepsValue(value);
    handleFilterChange("Biceps", value, true);
  };

  const handleHeightChange = (e) => {
    const value = e.target.value;
    setHeightValue(value);
    handleFilterChange("Height", value, true);
  };

  const handleAttireChange = (e) => {
    const value = e.target.value;
    setAttireValue(value);
    handleFilterChange("Attire", value, true);
  };

  const handleExperienceChange = (e) => {
    const value = e.target.value;
    setExperienceValue(value);
    handleFilterChange("Experience", value, true);
  };

  const handleProtectionTypeChange = (e) => {
    const value = e.target.value;
    setProtectionTypeValue(value);
    handleFilterChange("ProtectionType", value, true);
  };

  return (
    <div className="flex gap-4 flex-row flex-wrap w-full bg-white space-x-4 pb-6">
    {/* Biceps Dropdown */}
    <div className="flex flex-row items-center gap-2 text-black text-left">
      <label className="text-[16px] font-semibold text-gray-700">Biceps:</label>
      <div>
        <select
          value={bicepsValue}
          onChange={handleBicepsChange}
          className="w-14 cursor-pointer py-2 text-base bg-white focus:outline-none sm:text-sm"
        >
          {bicepsOptions.map((option, index) => (
            <option key={index} value={option}>
              {option === "Any" ? "Any" : `${option}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  
    {/* Height Dropdown */}
    <div className="flex flex-row items-center gap-2 text-black text-left">
      <label className="text-[16px] font-semibold text-gray-700">Height:</label>
      <div>
        <select
          value={heightValue}
          onChange={handleHeightChange}
          className="w-14 cursor-pointer py-2 text-base bg-white focus:outline-none sm:text-sm"
        >
          {heightOptions.map((option, index) => (
            <option key={index} value={option}>
              {option === "Any" ? "Any" : `${option}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  
    {/* Attire Dropdown */}
    <div className="flex flex-row items-center gap-2 text-black text-left">
      <label className="text-[16px] font-semibold text-gray-700">Attire:</label>
      <div>
        <select
          value={attireValue}
          onChange={handleAttireChange}
          className=" cursor-pointer w-14 py-2 text-base bg-white focus:outline-none sm:text-sm"
        >
          {attireOptions.map((option, index) => (
            <option key={index} value={option}>
              {option === "Any" ? "Any" : option}
            </option>
          ))}
        </select>
      </div>
    </div>
  
    {/* Experience Dropdown */}
    <div className="flex flex-row items-center gap-2 text-black text-left">
      <label className="text-[16px] font-semibold text-gray-700">Experience:</label>
      <div>
        <select
          value={experienceValue}
          onChange={handleExperienceChange}
          className="w-14 cursor-pointer py-2 text-base bg-white focus:outline-none sm:text-sm"
        >
          {experienceOptions.map((option, index) => (
            <option key={index} value={option}>
              {`${option} ${option === "Any" ? "" : "years"}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
  
  );
};

export default FilterDropdown;
