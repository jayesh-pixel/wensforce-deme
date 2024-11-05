import React, { useState, useEffect } from 'react';
import { FaSort, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../Firebase'; // Make sure your Firebase is correctly configured

const CategoryTable = () => {
  const protectionRef = doc(db, 'app', 'categories'); // Firestore path for categories
  const [categories, setCategories] = useState([]); // Categories list from Firestore
  const [newCategory, setNewCategory] = useState(''); // For new category input
  const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering
  const [isAscending, setIsAscending] = useState(true); // For sorting
  const [currentPage, setCurrentPage] = useState(1); // Pagination current page
  const [isModalOpen, setIsModalOpen] = useState(false); // For modal state

  // Fetch categories from Firestore when the component mounts
  useEffect(() => {
    const unsubscribe = onSnapshot(protectionRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().data || [];
        setCategories(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const itemsPerPage = 12; // Items per page for pagination

  // Handle search input
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle sorting
  const handleSort = () => {
    const sortedCategories = [...categories].sort((a, b) => {
      if (isAscending) {
        return a.localeCompare(b);
      } else {
        return b.localeCompare(a);
      }
    });
    setCategories(sortedCategories);
    setIsAscending(!isAscending);
  };

  // Handle pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Filter categories based on search term
  const filteredCategories = currentCategories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle adding a new category
  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      const updatedCategories = [...categories, newCategory];
      await updateDoc(protectionRef, { data: updatedCategories }); // Update Firestore
      setNewCategory(''); // Reset input
      setIsModalOpen(false); // Close modal
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (categoryToDelete) => {
    const updatedCategories = categories.filter((category) => category !== categoryToDelete);
    await updateDoc(protectionRef, { data: updatedCategories }); // Update Firestore
  };

  return (
    <div className="p-6 text-black bg-white">
      {/* Search, Sort, and Add */}
      <div className="flex items-center justify-between mb-4">
        <input
          type="text"
          placeholder="Search category"
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border bg-white border-gray-400 text-black rounded-full w-1/3"
        />
        <div className="flex items-center space-x-2">
          <button onClick={handleSort} className="flex items-center space-x-1 mr-4 text-gray-700">
            <FaSort />
            <span>Sort</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-1 text-white bg-blue-500 hover:bg-blue-600 px-4 py-3 rounded-full"
          >
            <FaPlus />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <table className="min-w-full bg-white border">
        <thead>
          <tr className="bg-black text-white">
            <th className="py-2 px-4 text-left">Category Name</th>
            <th className="py-2 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map((category, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
              <td className="py-2 px-4 font-semibold">{category}</td>
              <td className="py-2 px-4">
                <div className="flex items-center space-x-4">
                  <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteCategory(category)}>
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50"
        >
          &lt;
        </button>
        <span>
          {currentPage} - {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border rounded hover:bg-gray-200 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="p-2 border bg-white rounded-md w-full mb-4"
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryTable;
