import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../Firebase'; // Ensure Firebase is configured with Firestore and Storage

const WeaponTable = () => {
  const protectionRef = doc(db, 'app', 'protection'); // Firestore path
  const [weapons, setWeapons] = useState([]);
  const [newWeapon, setNewWeapon] = useState('');
  const [newWeaponImage, setNewWeaponImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [currentWeapon, setCurrentWeapon] = useState('');
  const [currentWeaponImage, setCurrentWeaponImage] = useState(null);

  // Fetch weapons from Firestore on component load
  useEffect(() => {
    const unsubscribeWeapons = onSnapshot(protectionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().data || [];
        setWeapons(data);
      }
    });

    return () => {
      unsubscribeWeapons();
    };
  }, []);

  // Upload image to Firebase Storage and get the download URL
  const uploadImage = async (imageFile) => {
    const storageRef = ref(storage, `weapons/${imageFile.name}`);
    await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  // Add a new weapon
  const addWeapon = async () => {
    if (newWeapon.trim()) {
      let imageUrl = null;
      if (newWeaponImage) {
        imageUrl = await uploadImage(newWeaponImage);
      }

      const newWeaponData = {
        id: Date.now(), // Unique ID based on timestamp
        title: newWeapon,
        image: imageUrl,
      };

      const updatedWeapons = [...weapons, newWeaponData];

      await updateDoc(protectionRef, { data: updatedWeapons });

      setNewWeapon('');
      setNewWeaponImage(null);
    }
  };

  // Edit an existing weapon
  const editWeapon = (id) => {
    setEditingId(id);
    const weaponToEdit = weapons.find((weapon) => weapon.id === id);
    setCurrentWeapon(weaponToEdit.title);
    setCurrentWeaponImage(weaponToEdit.image);
  };

  // Save edited weapon
  const saveWeapon = async (id) => {
    if (currentWeapon.trim()) {
      let updatedImageUrl = currentWeaponImage;

      // If a new image is uploaded, update the image URL
      if (currentWeaponImage && currentWeaponImage instanceof File) {
        updatedImageUrl = await uploadImage(currentWeaponImage);
      }

      const updatedWeapons = weapons.map((weapon) =>
        weapon.id === id
          ? { ...weapon, title: currentWeapon, image: updatedImageUrl }
          : weapon
      );

      await updateDoc(protectionRef, { data: updatedWeapons });

      setEditingId(null);
      setCurrentWeapon('');
      setCurrentWeaponImage(null);
    }
  };

  // Delete a weapon
  const deleteWeapon = async (id) => {
    const updatedWeapons = weapons.filter((weapon) => weapon.id !== id);
    await updateDoc(protectionRef, { data: updatedWeapons });
  };

  // Filter weapons based on search term
  const filteredWeapons = weapons.filter((weapon) =>
    weapon.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle image upload
  const handleImageUpload = (event, isEdit = false) => {
    const file = event.target.files[0];
    if (file) {
      if (isEdit) {
        setCurrentWeaponImage(file);
      } else {
        setNewWeaponImage(file);
      }
    }
  };

  return (
    <div className="p-4 text-black mx-auto">
      {/* Add new weapon input */}
      <div className="flex items-center mb-4">
        <input
          type="text"
          value={newWeapon}
          onChange={(e) => setNewWeapon(e.target.value)}
          placeholder="Add new weapon"
          className="border  bg-white p-2 border-gray-400  rounded w-1/3 mr-2"
        />
        <input
          type="file"
          onChange={(e) => handleImageUpload(e)}
          className="border  bg-white  border-gray-400  p-2 rounded mr-2"
        />
        <button
          onClick={addWeapon}
          className="bg-gray-500  text-white p-2 rounded hover:bg-gray-600"
        >
          Add Weapon
        </button>
      </div>

      {/* Search bar */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search weapon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border bg-white p-2 border-gray-400 rounded w-1/3"
        />
      </div>

      {/* Weapons table */}
      <table className="w-full bg-white shadow-md rounded">
        <thead className="bg-black text-white">
          <tr>
            <th className="p-2 text-left">Weapon Name</th>
            <th className="p-2 text-left">Image</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredWeapons.map((weapon) => (
            <tr key={weapon.id} className="border-b hover:bg-gray-100">
              <td className="p-2">
                {editingId === weapon.id ? (
                  <input
                    type="text"
                    value={currentWeapon}
                    onChange={(e) => setCurrentWeapon(e.target.value)}
                    className="border  bg-white border-gray-400  p-2 rounded w-full"
                  />
                ) : (
                  weapon.title
                )}
              </td>
              <td className="p-2">
                {editingId === weapon.id ? (
                  <input
                    type="file"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="border p-2 rounded"
                  />
                ) : weapon.image ? (
                  <img src={weapon.image} alt={weapon.title} className="h-16" />
                ) : (
                  'No image'
                )}
              </td>
              <td className="p-2 text-center">
                {editingId === weapon.id ? (
                  <>
                    <button
                      onClick={() => saveWeapon(weapon.id)}
                      className="text-green-500 mr-2"
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
                      onClick={() => editWeapon(weapon.id)}
                      className="text-blue-500 mr-2"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => deleteWeapon(weapon.id)}
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

export default WeaponTable;
