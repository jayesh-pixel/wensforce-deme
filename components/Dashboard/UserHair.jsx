import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { AiOutlinePlus } from 'react-icons/ai';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../Firebase'; // Firebase configuration

const BeardTable = () => {
  const [beards, setBeards] = useState([]);
  const protectionRef = doc(db, 'features', 'hair'); // Firestore path for beards
  const [newBeard, setNewBeard] = useState('');
  const [newBeardImage, setNewBeardImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [currentBeard, setCurrentBeard] = useState('');
  const [currentBeardImage, setCurrentBeardImage] = useState(null);

  // Fetch beards from Firestore on component load
  useEffect(() => {
    const unsubscribe = onSnapshot(protectionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().data || [];
        setBeards(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Upload image to Firebase Storage and get the download URL
  const uploadImage = async (imageFile) => {
    const storageRef = ref(storage, `beards/${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  // Add a new beard
  const addBeard = async () => {
    if (newBeard.trim()) {
      let imageUrl = null;
      if (newBeardImage) {
        imageUrl = await uploadImage(newBeardImage);
      }

      const newBeardData = {
        id: Date.now(),
        name: newBeard,
        image: imageUrl,
      };

      const updatedBeards = [...beards, newBeardData];

      await updateDoc(protectionRef, { data: updatedBeards });

      setNewBeard('');
      setNewBeardImage(null);
    }
  };

  // Edit an existing beard
  const editBeard = (id) => {
    setEditingId(id);
    const beardToEdit = beards.find((beard) => beard.id === id);
    setCurrentBeard(beardToEdit.name);
    setCurrentBeardImage(beardToEdit.image);
  };

  // Save edited beard
  const saveBeard = async (id) => {
    if (currentBeard.trim()) {
      let updatedImageUrl = currentBeardImage;

      if (currentBeardImage && currentBeardImage instanceof File) {
        updatedImageUrl = await uploadImage(currentBeardImage);
      }

      const updatedBeards = beards.map((beard) =>
        beard.id === id ? { ...beard, name: currentBeard, image: updatedImageUrl } : beard
      );

      await updateDoc(protectionRef, { data: updatedBeards });

      setEditingId(null);
      setCurrentBeard('');
      setCurrentBeardImage(null);
    }
  };

  // Delete a beard
  const deleteBeard = async (id) => {
    const updatedBeards = beards.filter((beard) => beard.id !== id);
    await updateDoc(protectionRef, { data: updatedBeards });
  };

  // Handle image upload
  const handleImageUpload = (event, isEdit = false) => {
    const file = event.target.files[0];
    if (file) {
      if (isEdit) {
        setCurrentBeardImage(file);
      } else {
        setNewBeardImage(file);
      }
    }
  };

  // Filter beards based on search term
  const filteredBeards = beards.filter((beard) =>
    beard.name && beard.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 text-black mx-auto">
      <h2 className="text-2xl font-bold mb-4">Beard Styles</h2>

      {/* Search bar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search beard type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border bg-white p-2 rounded w-1/3"
        />
      </div>

      {/* Add new beard form */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={newBeard}
          onChange={(e) => setNewBeard(e.target.value)}
          placeholder="Add new beard type"
          className="border bg-white p-2 rounded w-1/3 mr-2"
        />
        <input
          type="file"
          onChange={(e) => handleImageUpload(e)}
          className="border p-2 rounded mr-2"
        />
        <button
          onClick={addBeard}
          className="bg-gray-500 text-white p-2 px-4 rounded hover:bg-gray-600 flex items-center"
        >
          Add <AiOutlinePlus className="ml-2" />
        </button>
      </div>

      {/* Beards table */}
      <table className="w-full bg-white shadow-md rounded">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2 text-left">Beard Type</th>
            <th className="p-2 text-left">Image</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBeards.map((beard) => (
            <tr key={beard.id} className="border-b hover:bg-gray-100">
              <td className="p-2">
                {editingId === beard.id ? (
                  <input
                    type="text"
                    value={currentBeard}
                    onChange={(e) => setCurrentBeard(e.target.value)}
                    className="border bg-white p-2 rounded w-full"
                  />
                ) : (
                  beard.name
                )}
              </td>
              <td className="p-2">
                {editingId === beard.id ? (
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="border p-2 rounded"
                  />
                ) : beard.image ? (
                  <img src={beard.image} alt={beard.name} className="h-16" />
                ) : (
                  'No image'
                )}
              </td>
              <td className="p-2 text-center">
                {editingId === beard.id ? (
                  <>
                    <button
                      onClick={() => saveBeard(beard.id)}
                      className="text-blue-500 mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-red-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => editBeard(beard.id)}
                      className="text-blue-500 mr-2"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => deleteBeard(beard.id)}
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
    </div>
  );
};

export default BeardTable;
