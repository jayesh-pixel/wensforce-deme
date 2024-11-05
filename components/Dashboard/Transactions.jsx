import React, { useState } from 'react';
import { FaSearch, FaFilter, FaSort, FaDownload, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

const TransactionPage = () => {
  const [transactions, setTransactions] = useState([
    { id: 1, name: 'Rahul', type: 'Payout', date: '01-04-2024', status: 'Debited', amount: 'INR 1,600' },
    { id: 2, name: 'Aditya', type: 'Settlement', date: '01-04-2024', status: 'Credited', amount: 'INR 1,600' },
    { id: 3, name: 'Prashant', type: 'Token', date: '01-04-2024', status: 'Credited', amount: 'INR 1,600' },
    { id: 4, name: 'Shiv', type: 'Salary', date: '01-04-2024', status: 'Debited', amount: 'INR 1,600' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [newTransaction, setNewTransaction] = useState({ name: '', type: '', date: '', status: '', amount: '' });

  // Handle search input change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle adding and editing transactions
  const handleModalOpen = (transaction = null) => {
    if (transaction) {
      setNewTransaction(transaction);
      setIsEditing(true);
      setCurrentTransaction(transaction);
    } else {
      setNewTransaction({ name: '', type: '', date: '', status: '', amount: '' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setNewTransaction({ name: '', type: '', date: '', status: '', amount: '' });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewTransaction({ ...newTransaction, [name]: value });
  };

  const handleSaveTransaction = () => {
    if (isEditing) {
      setTransactions(transactions.map((tx) => (tx.id === currentTransaction.id ? newTransaction : tx)));
    } else {
      setTransactions([...transactions, { ...newTransaction, id: transactions.length + 1 }]);
    }
    handleModalClose();
  };

  // Handle delete transaction
  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      {/* Search Bar and Buttons */}
      <div className="flex justify-between items-center mb-4">
        {/* Search bar */}
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search transaction"
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 w-full rounded-full border bg-white border-gray-300 pl-10 focus:outline-none"
          />
          <FaSearch className="absolute top-3 left-4 text-gray-500" />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2">
            Import <FaDownload />
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2">
            Export <FaDownload />
          </button>
        </div>
      </div>

      {/* Filter and Sort Icons */}
      <div className="flex justify-end items-center gap-4 mb-4">
        <button className="flex items-center gap-2 text-gray-700">
          <FaFilter /> filter
        </button>
        <button className="flex items-center gap-2 text-gray-700">
          <FaSort /> sort
        </button>
      </div>

      {/* Transactions Table */}
      <table className="w-full bg-white shadow-lg rounded-lg">
        <thead>
          <tr className="bg-black text-white">
            <th className="p-2 text-left"><input type="checkbox" /></th>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Type</th>
            <th className="p-2 text-left">Date</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Amount</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((transaction, index) => (
            <tr key={transaction.id} className={`text-black ${index % 2 === 0 ? 'bg-gray-100' : ''}`}>
              <td className="p-2"><input type="checkbox" /></td>
              <td className="p-2 font-semibold">{transaction.name}</td>
              <td className="p-2">{transaction.type}</td>
              <td className="p-2">{transaction.date}</td>
              <td className="p-2">{transaction.status}</td>
              <td className="p-2">{transaction.amount}</td>
              <td className="p-2 text-right">
                <button onClick={() => handleModalOpen(transaction)} className="mr-2">
                  <FaEdit />
                </button>
                <button onClick={() => handleDeleteTransaction(transaction.id)}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-gray-600">‹ 1 - {filteredTransactions.length} ›</div>
        <button onClick={() => handleModalOpen()} className="p-2 rounded-full bg-black text-white">
          <FaPlus />
        </button>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl text-black font-semibold mb-4">{isEditing ? 'Edit Transaction' : 'Add Transaction'}</h2>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                value={newTransaction.name}
                onChange={handleInputChange}
                placeholder="Name"
                className="p-2 w-full bg-white border border-gray-400 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="type"
                value={newTransaction.type}
                onChange={handleInputChange}
                placeholder="Type"
                className="p-2 w-full  bg-white border border-gray-400 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="date"
                value={newTransaction.date}
                onChange={handleInputChange}
                placeholder="Date"
                className="p-2 w-full  bg-white border border-gray-400 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="status"
                value={newTransaction.status}
                onChange={handleInputChange}
                placeholder="Status"
                className="p-2 w-full  bg-white border border-gray-400 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <input
                type="text"
                name="amount"
                value={newTransaction.amount}
                onChange={handleInputChange}
                placeholder="Amount"
                className="p-2 w-full  bg-white border border-gray-400 rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <button onClick={handleModalClose} className="px-4 py-2 bg-gray-300 rounded-lg mr-2">Cancel</button>
              <button onClick={handleSaveTransaction} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                {isEditing ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionPage;
