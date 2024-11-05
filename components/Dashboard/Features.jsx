import React, { useState } from 'react';
import { FaSort, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import AddFeatureForm from './AddFeature';

const Feature = () => {
  const [features, setFeatures] = useState([
    { id: 1, name: 'Biceps' },
    { id: 2, name: 'Triceps' },
    { id: 3, name: 'Weight' },
    { id: 4, name: 'Chest' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editFeatureId, setEditFeatureId] = useState(null);
  const [featureToEdit, setFeatureToEdit] = useState(null);

  // Handle search input
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle add button click
  const handleAddFeatureClick = () => {
    setShowAddForm(true);
    setIsEditing(false);
    setFeatureToEdit(null);
  };

  // Handle adding a new feature or updating an existing feature
  const handleAddFeature = (newFeatureName) => {
    if (newFeatureName.trim()) {
      if (isEditing && editFeatureId !== null) {
        // Update existing feature
        setFeatures(
          features.map((feature) =>
            feature.id === editFeatureId ? { ...feature, name: newFeatureName } : feature
          )
        );
        setIsEditing(false);
        setEditFeatureId(null);
        setFeatureToEdit(null);
      } else {
        // Add new feature
        setFeatures([
          ...features,
          { id: features.length + 1, name: newFeatureName },
        ]);
      }
      setShowAddForm(false);
    }
  };

  // Handle deleting a feature
  const handleDelete = (id) => {
    setFeatures(features.filter((feature) => feature.id !== id));
  };

  // Handle editing a feature
  const handleEdit = (feature) => {
    setShowAddForm(true);
    setIsEditing(true);
    setEditFeatureId(feature.id);
    setFeatureToEdit(feature);
  };

  // Filtered features based on search input
  const filteredFeatures = features.filter((feature) =>
    feature.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 text-black">
      {showAddForm ? (
        <AddFeatureForm
          onAddFeature={handleAddFeature}
          onCancel={() => {
            setShowAddForm(false);
            setIsEditing(false);
            setEditFeatureId(null);
            setFeatureToEdit(null);
          }}
          isEditing={isEditing}
          featureToEdit={featureToEdit}
        />
      ) : (
        <>
          {/* Search Bar, Sort, and Add Button */}
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-1/3">
              <input
                type="text"
                placeholder="Search body feature"
                value={searchTerm}
                onChange={handleSearch}
                className="p-2 w-full rounded-full border bg-white border-gray-400 pl-4 focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 text-gray-700">
              <FaSort /> Sort
            </button>
            <button
              onClick={handleAddFeatureClick}
              className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2"
            >
              Add <FaPlus />
            </button>
          </div>

          {/* Feature Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 bg-black text-white text-left">Feature Name</th>
                  <th className="py-2 px-4 bg-black text-white text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeatures.length > 0 ? (
                  filteredFeatures.map((feature) => (
                    <tr key={feature.id} className="hover:bg-gray-100">
                      <td className="py-2 px-4 border-b">{feature.name}</td>
                      <td className="py-2 px-4 border-b">
                        <button
                          onClick={() => handleEdit(feature)}
                          className="text-blue-500 mr-2"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(feature.id)}
                          className="text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="py-2 px-4 text-center">
                      No features found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (Placeholder) */}
          <div className="flex justify-center mt-4">
            <p className="text-sm">
              1 - {filteredFeatures.length} of {features.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default Feature;
