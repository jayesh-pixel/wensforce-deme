import React, { useState } from 'react';
import { FaPlus, FaTimes, FaGripVertical } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const AddFeatureForm = () => {
  const [featureName, setFeatureName] = useState('');
  const [valueType, setValueType] = useState('Dropdown');
  const [dropdownItems, setDropdownItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [error, setError] = useState('');

  // Handle adding a new dropdown item
  const handleAddItem = () => {
    if (newItem.trim()) {
      setDropdownItems([...dropdownItems, newItem]);
      setNewItem('');
      setError('');
    } else {
      setError('Item cannot be empty');
    }
  };

  // Handle removing a dropdown item
  const handleRemoveItem = (index) => {
    setDropdownItems(dropdownItems.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!featureName.trim()) {
      setError('Feature Name is required');
      return;
    }
    if (dropdownItems.length === 0) {
      setError('At least one dropdown item is required');
      return;
    }

    const featureData = {
      featureName,
      valueType,
      dropdownItems,
    };

    console.log('Feature Submitted:', featureData);
    // Clear form after submission
    resetForm();
  };

  // Handle drag and drop ordering
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(dropdownItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setDropdownItems(items);
  };

  // Reset form fields
  const resetForm = () => {
    setFeatureName('');
    setValueType('Dropdown');
    setDropdownItems([]);
    setNewItem('');
    setError('');
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Features</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Feature Name */}
        <div>
          <label className="block text-sm font-semibold mb-2">Feature Name</label>
          <input
            type="text"
            value={featureName}
            onChange={(e) => {
              setFeatureName(e.target.value);
              setError('');
            }}
            className={`w-full p-2 bg-white border rounded focus:outline-none ${error && 'border-red-500'}`}
            placeholder="Enter feature name"
            required
          />
        </div>

        {/* Value Type */}
        <div>
          <label className="block text-sm font-semibold mb-2">Value Type</label>
          <select
            value={valueType}
            onChange={(e) => setValueType(e.target.value)}
            className="w-full p-2 bg-white border rounded focus:outline-none"
          >
            <option value="Dropdown">Drop down</option>
            {/* Add other value types if needed */}
          </select>
        </div>

        {/* Create Dropdown Items */}
        <div>
          <label className="block text-sm font-semibold mb-2">Create Drop Down Items</label>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => {
                setNewItem(e.target.value);
                setError('');
              }}
              className="flex-1 p-2 border bg-white rounded focus:outline-none"
              placeholder="Enter item"
            />
            <button
              type="button"
              onClick={handleAddItem}
              disabled={!newItem.trim()}
              className={`px-4 py-2 rounded ${newItem.trim() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              Add
            </button>
          </div>

          {/* Display Error Message */}
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Display Dropdown Items with Drag-and-Drop */}
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {dropdownItems.map((item, index) => (
                    <Draggable key={index} draggableId={item} index={index}>
                      {(provided) => (
                        <div
                          className="flex items-center space-x-2 mb-2"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <FaGripVertical className="text-gray-500" />
                          <input
                            type="text"
                            value={item}
                            readOnly
                            className="flex-1 p-2 border rounded focus:outline-none bg-gray-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Submit and Cancel Buttons */}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddFeatureForm;
