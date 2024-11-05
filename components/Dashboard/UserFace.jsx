import React, { useEffect, useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { AiOutlinePlus } from 'react-icons/ai';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../Firebase';

const FaceTable = () => {
  const [faces, setFaces] = useState([]);
  const protectionRef = doc(db, 'features', 'face'); // Firestore path
  const [newFace, setNewFace] = useState('');
  const [newFaceImage, setNewFaceImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [currentFace, setCurrentFace] = useState('');
  const [currentFaceImage, setCurrentFaceImage] = useState(null);

  // Fetch face types from Firestore on component load
  useEffect(() => {
    const unsubscribe = onSnapshot(protectionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().data || [];
        setFaces(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Upload image to Firebase Storage and get the download URL
  const uploadImage = async (imageFile) => {
    const storageRef = ref(storage, `faces/${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  // Add a new face
  const addFace = async () => {
    if (newFace.trim()) {
      let imageUrl = null;
      if (newFaceImage) {
        imageUrl = await uploadImage(newFaceImage);
      }

      const newFaceData = {
        id: Date.now(),
        name: newFace,
        image: imageUrl,
      };

      const updatedFaces = [...faces, newFaceData];

      await updateDoc(protectionRef, { data: updatedFaces });

      setNewFace('');
      setNewFaceImage(null);
    }
  };

  // Edit an existing face
  const editFace = (id) => {
    setEditingId(id);
    const faceToEdit = faces.find((face) => face.id === id);
    setCurrentFace(faceToEdit.name);
    setCurrentFaceImage(faceToEdit.image);
  };

  // Save edited face
  const saveFace = async (id) => {
    if (currentFace.trim()) {
      let updatedImageUrl = currentFaceImage;

      if (currentFaceImage && currentFaceImage instanceof File) {
        updatedImageUrl = await uploadImage(currentFaceImage);
      }

      const updatedFaces = faces.map((face) =>
        face.id === id ? { ...face, name: currentFace, image: updatedImageUrl } : face
      );

      await updateDoc(protectionRef, { data: updatedFaces });

      setEditingId(null);
      setCurrentFace('');
      setCurrentFaceImage(null);
    }
  };

  // Delete a face
  const deleteFace = async (id) => {
    const updatedFaces = faces.filter((face) => face.id !== id);
    await updateDoc(protectionRef, { data: updatedFaces });
  };

  // Handle image upload
  const handleImageUpload = (event, isEdit = false) => {
    const file = event.target.files[0];
    if (file) {
      if (isEdit) {
        setCurrentFaceImage(file);
      } else {
        setNewFaceImage(file);
      }
    }
  };

  // Filter faces based on search term
  const filteredFaces = faces.filter(
    (face) => face.name && face.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 text-black mx-auto">
      <h2 className="text-2xl font-bold mb-4">User Face Types</h2>
      
      {/* Search and add new face type */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search face type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border bg-white p-2 rounded w-1/3"
        />
      </div>

      <div className="flex items-center mb-4">
        <input
          type="text"
          value={newFace}
          onChange={(e) => setNewFace(e.target.value)}
          placeholder="Add new face type"
          className="border p-2 bg-white rounded w-1/3 mr-2"
        />
        <input
          type="file"
          onChange={(e) => handleImageUpload(e)}
          className="border bg-white p-2 rounded mr-2"
        />
        <button
          onClick={addFace}
          className="bg-gray-500 text-white p-2 px-4 rounded hover:bg-gray-600 flex items-center"
        >
          Add <AiOutlinePlus className="ml-2" />
        </button>
      </div>

      {/* Faces table */}
      <table className="w-full bg-white shadow-md rounded">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2 text-left">Face Type</th>
            <th className="p-2 text-left">Image</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredFaces.map((face) => (
            <tr key={face.id} className="border-b hover:bg-gray-100">
              <td className="p-2">
                {editingId === face.id ? (
                  <input
                    type="text"
                    value={currentFace}
                    onChange={(e) => setCurrentFace(e.target.value)}
                    className="border p-2 bg-white rounded w-full"
                  />
                ) : (
                  face.name
                )}
              </td>
              <td className="p-2">
                {editingId === face.id ? (
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="border p-2 rounded"
                  />
                ) : face.image ? (
                  <img src={face.image} alt={face.name} className="h-16" />
                ) : (
                  'No image'
                )}
              </td>
              <td className="p-2 text-center">
                {editingId === face.id ? (
                  <>
                    <button
                      onClick={() => saveFace(face.id)}
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
                      onClick={() => editFace(face.id)}
                      className="text-blue-500 mr-2"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => deleteFace(face.id)}
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

export default FaceTable;
