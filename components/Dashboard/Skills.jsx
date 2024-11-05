import React, { useState, useEffect } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase'; // Make sure Firebase is configured correctly

const SkillTable = () => {
  const protectionRef = doc(db, 'app', 'skill'); // Firestore path for skills
  const [skills, setSkills] = useState([]); // Skills stored in Firestore
  const [newSkill, setNewSkill] = useState(''); // Input for adding a new skill
  const [editing, setEditing] = useState(null); // Skill being edited
  const [currentSkill, setCurrentSkill] = useState(''); // The current skill being edited
  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering skills

  // Fetch skills from Firestore when component mounts
  useEffect(() => {
    const unsubscribe = onSnapshot(protectionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().data || [];
        setSkills(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Add a new skill to Firestore
  const addSkill = async () => {
    if (newSkill.trim()) {
      const updatedSkills = [...skills, newSkill];
      await updateDoc(protectionRef, { data: updatedSkills }); // Update Firestore
      setNewSkill(''); // Reset input
    }
  };

  // Edit an existing skill
  const editSkill = (index) => {
    setEditing(index);
    setCurrentSkill(skills[index]);
  };

  // Save the edited skill to Firestore
  const saveSkill = async (index) => {
    if (currentSkill.trim()) {
      const updatedSkills = skills.map((skill, idx) =>
        idx === index ? currentSkill : skill
      );
      await updateDoc(protectionRef, { data: updatedSkills }); // Update Firestore
      setEditing(null);
      setCurrentSkill(''); // Clear the input
    }
  };

  // Delete a skill from Firestore
  const deleteSkill = async (index) => {
    const updatedSkills = skills.filter((_, idx) => idx !== index);
    await updateDoc(protectionRef, { data: updatedSkills }); // Update Firestore
  };

  // Filter skills based on the search term
  const filteredSkills = skills.filter((skill) =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 bg-white text-black rounded w-1/3"
        />
      </div>

      {/* Add new skill input */}
      <div className="mt-4">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add new skill"
          className="border p-2 text-black bg-white rounded mr-2"
        />
        <button
          onClick={addSkill}
          className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Add Skill
        </button>
      </div>

      {/* Skills Table */}
      <table className="w-full bg-white shadow-md rounded mt-4">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2 text-left">Skill Name</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredSkills.map((skill, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 text-black">
                {editing === index ? (
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    className="border bg-white text-black p-2 rounded w-full"
                  />
                ) : (
                  skill
                )}
              </td>
              <td className="p-2 flex justify-center space-x-2">
                {editing === index ? (
                  <button
                    onClick={() => saveSkill(index)}
                    className="text-blue-500"
                  >
                    Save
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => editSkill(index)}
                      className="text-blue-500"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteSkill(index)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <FaRegTrashAlt />
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkillTable;
