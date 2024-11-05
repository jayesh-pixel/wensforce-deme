import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { collection, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../Firebase';
import * as XLSX from 'xlsx';
import { encryptId } from '@/utils/encryption';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

const Listing = ({setId}) => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch users data from Firestore
  useEffect(() => {
    const UsersRef = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(
      UsersRef,
      (snapshot) => {
        const UserData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(UserData);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsubscribeUsers();
    };
  }, []);

  // Handle search input
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Filter users based on search input
  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    let categoryMatch = false;

    // Handle categories field
    if (user.categories) {
      if (Array.isArray(user.categories)) {
        // If categories is an array
        categoryMatch = user.categories.some((cat) =>
          cat.toLowerCase().includes(search)
        );
      } else if (typeof user.categories === 'string') {
        // If categories is a string
        categoryMatch = user.categories.toLowerCase().includes(search);
      }
    }

    // Handle city field
    const cityMatch =
      typeof user.city === 'string' &&
      user.city.toLowerCase().includes(search);

    return categoryMatch || cityMatch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleDeleteUser = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this user?'
    );
    if (confirmDelete) {
      try {
        const userDoc = doc(db, 'users', id);
        await deleteDoc(userDoc);
        alert('User deleted successfully.');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user, please try again.');
      }
    }
  };

  const handleEditUser = (user) => {
    // Implement edit functionality here
    // For example, navigate to an edit page or open a modal
    console.log('Edit user:', user.id);
  };

  const handleExport = () => {
    // Map the current page data to an array of objects for Excel
    const exportData = currentUsers.map((user, index) => ({
      ID: index + 1 + indexOfFirstItem,
      Name: user.name,
      Email: user.email,
      Category: Array.isArray(user.categories)
        ? user.categories.join(', ')
        : user.categories,
      City: user.city,
      Phone: user.phone,
      DOB: user.dob,
      Amount: user.amount,
      Height: user.tall,
      Weight: user.kg,
      Language: user.language,
      Location: user.area,
      // Images cannot be exported directly; this is a text placeholder
      Image: user.photo ? user.photo : 'N/A',
    }));

    // Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Generate a filename with the current date and time
    const now = new Date();
    const formattedDate = now
      .toLocaleString()
      .replace(/[/, ]/g, '_')
      .replace(/:/g, '-');
    const filename = `UsersData_Page${currentPage}_${formattedDate}.xlsx`;

    // Export the workbook to an Excel file
    XLSX.writeFile(workbook, filename);
  };

  const handleExportPDF = () => {
    const exportData = currentUsers.map((user, index) => [
      index + 1 + indexOfFirstItem,
      user.name,
      user.email,
      Array.isArray(user.categories)
        ? user.categories.join(', ')
        : user.categories,
      user.city,
      user.phone,
      user.dob,
      user.amount,
      user.tall,
      user.kg,
      user.language,
      user.area,
    ]);

    const docDefinition = {
      content: [
        { text: 'Users Data', style: 'header' },
        {
          table: {
            headerRows: 1,
            widths: [ 'auto', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*' ],
            body: [
              [ 'ID', 'Name', 'Email', 'Category', 'City', 'Phone', 'DOB', 'Amount', 'Height', 'Weight', 'Language', 'Location' ],
              ...exportData,
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          marginBottom: 15,
        },
      },
      pageOrientation: 'landscape',
    };

    pdfMake.createPdf(docDefinition).download(`UsersData_Page${currentPage}.pdf`);
  };

  return (
    <div className="p-8 text-black w-full">
      {/* Search Bar and Export Buttons */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-4">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search by category or city"
            value={searchTerm}
            onChange={handleSearch}
            className="p-2 w-full rounded-full border bg-gray-200 pl-4 focus:outline-none"
          />
        </div>
        <div className="mt-2 md:mt-0">
          <button
            onClick={handleExport}
            className="bg-blue-500 text-white px-4 py-2 rounded-full focus:outline-none mr-2"
          >
            Export Excel Page
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-red-500 text-white px-4 py-2 rounded-full focus:outline-none"
          >
            Export PDF Page
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto w-[75vw]">
        <table className="bg-white w-full">
          <thead>
            <tr>
              {/* Table Headers */}
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                ID
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Image
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Name
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Email
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Category
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                City
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Phone
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                DOB
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Amount
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Height
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Weight
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Language
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Location
              </th>
              <th className="py-2 px-4 bg-black text-white text-left whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={()=>{
                    setId(encryptId(user.id));
                  }}
                >
                  <td className="py-2 px-4 border-b font-semibold whitespace-nowrap">
                    {index + 1 + indexOfFirstItem}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap">

                      {user.photo ? (
                        <img onClick={()=>{
                          setId(encryptId(user.id));
                        }}
                          src={user.photo}
                          alt={user.name}
                          className="w-12 h-12 object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          N/A
                        </div>
                      )}
              
                  </td>
                  <td className="py-2 px-4 border-b font-semibold whitespace-nowrap" onClick={()=>{
                          setId(encryptId(user.id));
                        }}>
                    {user.name}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap" onClick={()=>{
                          setId(encryptId(user.id));
                        }}>
                    {user.email}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap" onClick={()=>{
                          setId(encryptId(user.id));
                        }}>
                    {Array.isArray(user.categories)
                      ? user.categories.join(', ')
                      : user.categories}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap" onClick={()=>{
                          setId(encryptId(user.id));
                        }}>
                    {user.city}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap" onClick={()=>{
                          setId(encryptId(user.id));
                        }}>
                    {user.phone}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap" >
                    {user.dob}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap">
                    {user.amount}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap">
                    {user.tall}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap">
                    {user.kg}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap">
                    {user.language}
                  </td>
                  <td className="py-2 px-4 border-b whitespace-nowrap">
                    {user.area}
                  </td>
                  <td className="py-2 px-4 border-b flex items-center space-x-2 whitespace-nowrap">
                   
                    <button
                      className="text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteUser(user.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="14" className="py-2 px-4 text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={`px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 text-white'}`}
        >
          Next
        </button>
      </div>

      {/* Pagination Info */}
      <div className="flex justify-center mt-2">
        <p className="text-sm">
          Page {currentPage} of {totalPages}
        </p>
      </div>
    </div>
  );
};

export default Listing;
