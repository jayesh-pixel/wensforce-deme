import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { AiOutlinePlus } from 'react-icons/ai';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase';

const ShiftTable = () => {
  const protectionRef = doc(db, 'app', 'preference'); // Firestore path for shifts
  const [shifts, setShifts] = useState([]); // List of shifts as strings
  const [newShift, setNewShift] = useState(''); // Input for new shift
  const [searchTerm, setSearchTerm] = useState(''); // Search term
  const [editingIndex, setEditingIndex] = useState(null); // Index for editing
  const [currentShift, setCurrentShift] = useState(''); // Current shift being edited
  const [error, setError] = useState(''); // Error message

  // Fetch shifts from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(protectionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().data || [];
        setShifts(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Add a new shift
  const addShift = async () => {
    if (!newShift.trim()) {
      setError('Shift name cannot be empty.');
      return;
    }

    if (shifts.some((shift) => shift.toLowerCase() === newShift.toLowerCase())) {
      setError('Shift already exists.');
      return;
    }

    const updatedShifts = [...shifts, newShift];
    await updateDoc(protectionRef, { data: updatedShifts }); // Update Firestore
    setNewShift('');
    setError(''); // Clear the error
  };

  // Edit an existing shift
  const editShift = (index) => {
    setEditingIndex(index);
    setCurrentShift(shifts[index]);
  };

  // Save edited shift
  const saveShift = async () => {
    if (!currentShift.trim()) {
      setError('Shift name cannot be empty.');
      return;
    }

    const updatedShifts = shifts.map((shift, index) =>
      index === editingIndex ? currentShift : shift
    );

    await updateDoc(protectionRef, { data: updatedShifts }); // Update Firestore
    setEditingIndex(null);
    setCurrentShift('');
    setError(''); // Clear the error
  };

  // Delete a shift
  const deleteShift = async (index) => {
    const updatedShifts = shifts.filter((_, i) => i !== index);
    await updateDoc(protectionRef, { data: updatedShifts }); // Update Firestore
  };

  // Filter shifts based on search term
  const filteredShifts = shifts.filter((shift) =>
    shift.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 text-black mx-auto">
      {/* Search bar and Add button */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search shift"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border bg-white p-2 rounded w-1/3"
        />

        {/* Add new shift input */}
        <div className="flex items-center mb-4">
          <input
            type="text"
            value={newShift}
            onChange={(e) => setNewShift(e.target.value)}
            placeholder="Add new shift"
            className="border p-2 bg-white rounded mr-2"
          />
          <button
            onClick={addShift}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 flex items-center"
          >
            Add <AiOutlinePlus className="ml-2" />
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Shifts table */}
      <table className="w-full bg-white shadow-md rounded">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2 text-left">Shift Name</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredShifts.map((shift, index) => (
            <tr key={index} className="border-b hover:bg-gray-100">
              <td className="p-2">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={currentShift}
                    onChange={(e) => setCurrentShift(e.target.value)}
                    className="border p-2 bg-white rounded w-full"
                  />
                ) : (
                  shift
                )}
              </td>
              <td className="p-2 text-center">
                {editingIndex === index ? (
                  <>
                    <button
                      onClick={saveShift}
                      className="text-blue-500 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="text-red-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => editShift(index)}
                      className="text-blue-500 mr-2"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => deleteShift(index)}
                      className="text-red-500"
                    >
                      <FiTrash2 />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination (Placeholder for now) */}
      <div className="flex justify-center mt-4">
        <button className="p-2 bg-gray-200 rounded mr-2">&lt;</button>
        <span className="p-2">1 - {filteredShifts.length}</span>
        <button className="p-2 bg-gray-200 rounded ml-2">&gt;</button>
      </div>
    </div>
  );
};

export default ShiftTable;
