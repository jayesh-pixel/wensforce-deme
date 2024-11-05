import React, { useState, useEffect } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "../../Firebase"; // Import Firestore and Storage instance

const TwoTables = () => {
  // State for shifts data (top table)
  const [shifts, setShifts] = useState([]);
  // State for bottom table data
  const [bottomTableData, setBottomTableData] = useState([]);
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  // State for form inputs
  const [newShift, setNewShift] = useState({ image: "" });
  const [newButton, setNewButton] = useState({ buttonName: "" });
  // States for image upload and progress
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  // States for edit mode
  const [editingShift, setEditingShift] = useState(null);
  const [editingButton, setEditingButton] = useState(null);
  // States for error messages
  const [errorMessage, setErrorMessage] = useState("");

  // Firestore collections
  const shiftsCollectionRef = collection(db, "Bannerimage");
  const buttonsCollectionRef = collection(db, "Bannerbuttons");

  // Fetch shifts and buttons data from Firestore
  const fetchData = async () => {
    try {
      const shiftsData = await getDocs(shiftsCollectionRef);
      const buttonsData = await getDocs(buttonsCollectionRef);
      setShifts(
        shiftsData.docs.map((doc, index) => ({
          ...doc.data(),
          id: index + 1,
          docId: doc.id,
        }))
      );
      setBottomTableData(
        buttonsData.docs.map((doc, index) => ({
          ...doc.data(),
          id: index + 1,
          docId: doc.id,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setErrorMessage("Failed to fetch data. Please try again later.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle image upload to Firebase Storage
  const handleImageUpload = (file) => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setUploadProgress(progress);
        },
        (error) => {
          console.error("Upload error:", error);
          setErrorMessage("Image upload failed. Please try again.");
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (error) {
            console.error("Get download URL error:", error);
            setErrorMessage("Failed to retrieve image URL.");
            reject(error);
          }
        }
      );
    });
  };

  // Add or Edit shift data
  const handleAddOrEditShift = async () => {
    setErrorMessage(""); // Reset error message
    // Validation: Check if image is provided
    if (!imageFile && !editingShift?.image) {
      setErrorMessage("Please select an image to upload.");
      return;
    }

    try {
      let imageUrl = editingShift ? editingShift.image : "";

      if (imageFile) {
        // If editing and there is an existing image, delete it from storage
        if (editingShift?.image) {
          const existingImageRef = ref(storage, editingShift.image);
          await deleteObject(existingImageRef).catch((err) =>
            console.error("Error deleting existing image:", err)
          );
        }
        // Upload the new image
        imageUrl = await handleImageUpload(imageFile);
      }

      if (editingShift) {
        // Edit existing shift
        const shiftDoc = doc(db, "Bannerimage", editingShift.docId); // Use Firestore doc ID for update
        await updateDoc(shiftDoc, { image: imageUrl });
      } else {
        // Add new shift
        await addDoc(shiftsCollectionRef, { image: imageUrl });
      }

      // Reset form and states
      setNewShift({ image: "" });
      setImageFile(null);
      setEditingShift(null);
      setUploadProgress(0);
      fetchData(); // Re-fetch data after adding or editing
    } catch (error) {
      console.error("Error adding/editing shift:", error);
      setErrorMessage("Failed to add/edit banner. Please try again.");
    }
  };

  // Add or Edit button data
  const handleAddOrEditButton = async () => {
    setErrorMessage(""); // Reset error message
    // Validation: Check if button name is provided
    if (!newButton.buttonName.trim()) {
      setErrorMessage("Button name cannot be empty.");
      return;
    }

    try {
      if (editingButton) {
        // Edit existing button
        const buttonDoc = doc(db, "Bannerbuttons", editingButton.docId); // Use Firestore doc ID for update
        await updateDoc(buttonDoc, { buttonName: newButton.buttonName });
      } else {
        // Add new button
        await addDoc(buttonsCollectionRef, { buttonName: newButton.buttonName });
      }
      // Reset form and states
      setNewButton({ buttonName: "" });
      setEditingButton(null);
      fetchData(); // Re-fetch data after adding or editing
    } catch (error) {
      console.error("Error adding/editing button:", error);
      setErrorMessage("Failed to add/edit button. Please try again.");
    }
  };

  // Delete shift data
  const handleDeleteShift = async (id, docId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      // Delete image from Firebase Storage
      if (imageUrl) {
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef).catch((err) =>
          console.error("Error deleting image from storage:", err)
        );
      }
      // Delete document from Firestore
      const shiftDoc = doc(db, "Bannerimage", docId); // Use Firestore doc ID for delete
      await deleteDoc(shiftDoc);
      // Update local state
      setShifts(shifts.filter((shift) => shift.docId !== docId));
    } catch (error) {
      console.error("Error deleting shift:", error);
      setErrorMessage("Failed to delete banner. Please try again.");
    }
  };

  // Delete button data
  const handleDeleteBottomData = async (id, docId) => {
    if (!window.confirm("Are you sure you want to delete this button?")) return;
    try {
      const buttonDoc = doc(db, "Bannerbuttons", docId); // Use Firestore doc ID for delete
      await deleteDoc(buttonDoc);
      setBottomTableData(bottomTableData.filter((data) => data.docId !== docId));
    } catch (error) {
      console.error("Error deleting button:", error);
      setErrorMessage("Failed to delete button. Please try again.");
    }
  };

  // Load shift data for editing
  const handleEditShift = (shift) => {
    setNewShift({ image: shift.image });
    setEditingShift(shift);
  };

  // Load button data for editing
  const handleEditButton = (button) => {
    setNewButton({ buttonName: button.buttonName });
    setEditingButton(button);
  };

  // Search functionality for bottom table
  const filteredBottomData = bottomTableData.filter((data) =>
    data.buttonName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container h-full text-black bg-white mx-auto p-4">
      {/* Display Error Message */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {/* Top Table - Banner Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Manage Banners</h2>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          {/* Search Input */}
          <input
            type="text"
            className="border bg-white p-2 w-full md:w-1/2 rounded-md mb-2 md:mb-0"
            placeholder="Search banners"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Image Upload and Add/Edit Button */}
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept="image/*"
              className="border bg-white p-2 rounded-md"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              onClick={handleAddOrEditShift}
            >
              {editingShift ? "Edit Banner" : "Add Banner"}
            </button>
          </div>
        </div>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-4">Uploading: {uploadProgress}%</div>
        )}
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-300 px-4 py-2">No.</th>
              <th className="border border-gray-300 px-4 py-2">Banner Image</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {shifts
              .filter((shift) =>
                shift.image.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((shift, index) => (
                <tr key={shift.docId}>
                  <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <img
                      src={shift.image}
                      alt={`Banner ${shift.id}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={() => handleEditShift(shift)}
                        aria-label="Edit Banner"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteShift(shift.id, shift.docId, shift.image)}
                        aria-label="Delete Banner"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {shifts.length === 0 && (
              <tr>
                <td colSpan="3" className="py-4">
                  No banners found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Table - Button Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Manage Buttons</h2>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          {/* Search Input */}
          <input
            type="text"
            className="border bg-white p-2 w-full md:w-1/2 rounded-md mb-2 md:mb-0"
            placeholder="Search buttons"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          {/* Button Name Input */}
          <input
            type="text"
            className="border bg-white p-2 w-full md:w-1/2 rounded-md mb-2 md:mb-0"
            placeholder="Enter button name"
            value={newButton.buttonName}
            onChange={(e) =>
              setNewButton({ ...newButton, buttonName: e.target.value })
            }
          />
          {/* Add/Edit Button */}
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition mt-2 md:mt-0"
            onClick={handleAddOrEditButton}
          >
            {editingButton ? "Edit Button" : "Add Button"}
          </button>
        </div>
        <table className="w-full text-center table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-300 py-2">No.</th>
              <th className="border border-gray-300 py-2">Banner Button</th>
              <th className="border border-gray-300 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBottomData.map((data, index) => (
              <tr key={data.docId}>
                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2">
                  <button className="text-black px-4 py-2 rounded-md">
                    {data.buttonName}
                  </button>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div className="flex justify-center space-x-2">
                    <button
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handleEditButton(data)}
                      aria-label="Edit Button"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteBottomData(data.id, data.docId)}
                      aria-label="Delete Button"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBottomData.length === 0 && (
              <tr>
                <td colSpan="3" className="py-4">
                  No buttons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TwoTables;
