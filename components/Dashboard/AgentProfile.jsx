import React, { useState } from 'react';
import { FaStar, FaPhoneAlt, FaRupeeSign, FaUser, FaEdit, FaTrash, FaSort, FaFilter, FaEllipsisH } from 'react-icons/fa';

const ProfilePage = ({ agent }) => {
  const [query, setQuery] = useState(''); // State to handle user queries
  const [transactions, setTransactions] = useState([
    { name: 'Rahul', status: 'Collected', date: '01 - 04 - 2024', amount: 'INR 1,600' },
    { name: 'Aditya', status: 'Pending', date: '05 - 04 - 2024', amount: 'INR 1,200' },
    { name: 'Prashant', status: 'Completed', date: '10 - 04 - 2024', amount: 'INR 2,000' },
    { name: 'Shiv', status: 'Failed', date: '12 - 04 - 2024', amount: 'INR 500' },
  ]);
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  // Generate random transactions
  const generateRandomTransactions = () => {
    const names = ['Rahul', 'Aditya', 'Prashant', 'Shiv'];
    const statuses = ['Collected', 'Pending', 'Completed', 'Failed'];
    const randomTransactions = Array.from({ length: 5 }, (_, index) => ({
      name: names[Math.floor(Math.random() * names.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: `0${Math.floor(Math.random() * 9) + 1} - 0${Math.floor(Math.random() * 9) + 1} - 2024`,
      amount: `INR ${Math.floor(Math.random() * 2000) + 500}`,
    }));
    setTransactions(randomTransactions);
    setFilteredTransactions(randomTransactions);
  };

  // Handle input query for searching transactions
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    const filtered = transactions.filter((transaction) =>
      transaction.name.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredTransactions(filtered);
  };

  return (
    <div className="p-8 text-black">
      {/* Profile Header */}
      <div className="flex space-x-8 mb-8">
        {/* Profile Image */}
        <div className="w-40 h-40 rounded-full bg-gray-300 flex items-center justify-center">
          <FaUser className="text-6xl text-gray-500" />
        </div>

        {/* Profile Info */}
        <div>
          <h1 className="text-2xl font-bold">{agent.name}</h1>
          <p>Email: example@domain.com</p>
          <p>Phone: +91-9820168452</p>
          <p>Location: {agent.info.split('\n').pop()}</p>
          <p>Category: {agent.category}</p>
          <div className="flex items-center mt-2">
            <FaRupeeSign className="mr-1" />
            <span>1,500</span>
            <FaStar className="ml-4 text-yellow-500" />
            <FaStar className="text-yellow-500" />
            <FaStar className="text-yellow-500" />
            <FaStar className="text-yellow-500" />
            <FaStar className="text-gray-300" />
            <span className="ml-4">308 reviews</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <button className="px-4 py-2 bg-gray-200 rounded">Update</button>
          <button className="px-4 py-2 bg-gray-200 rounded">Initiate Payment</button>
          <button className="px-4 py-2 bg-gray-200 rounded">Deposit</button>
          <button className="px-4 py-2 bg-gray-200 rounded">Verify KYC</button>
        </div>
      </div>

      {/* Albums Section */}
      <div className="mb-8">
        <h2 className="font-semibold">Albums:</h2>
        <div className="flex space-x-4 mt-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="w-24 h-24 bg-gray-300 rounded"></div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 mb-8">
        <button className="px-4 py-2 bg-gray-200 rounded">Profile</button>
        <button className="px-4 py-2 bg-gray-200 rounded">Bookings</button>
        <button className="px-4 py-2 bg-yellow-300 rounded">Transactions</button>
        <button className="px-4 py-2 bg-gray-200 rounded">Internal Notes</button>
      </div>

      {/* Query Section */}
      <div className="mb-2">
        <h2 className="font-semibold">Search Transactions:</h2>
      
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search transaction"
              value={query}
              onChange={handleQueryChange}
              className="p-2 w-full rounded-full border bg-white border-gray-400 pl-4 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center gap-2 text-gray-700">
              <FaEllipsisH /> Bulk Action
            </button>
            <button className="flex items-center gap-2 text-gray-700">
              <FaFilter /> Filter
            </button>
            <button className="flex items-center gap-2 text-gray-700">
              <FaSort /> Sort
            </button>
          </div>
        </div>
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 bg-black text-white text-left">
                <input type="checkbox" />
              </th>
              <th className="py-2 px-4 bg-black text-white text-left">Name</th>
              <th className="py-2 px-4 bg-black text-white text-left">Status</th>
              <th className="py-2 px-4 bg-black text-white text-left">Date</th>
              <th className="py-2 px-4 bg-black text-white text-left">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">
                  <input type="checkbox" />
                </td>
                <td className="py-2 px-4 border-b font-semibold">{transaction.name}</td>
                <td className="py-2 px-4 border-b">{transaction.status}</td>
                <td className="py-2 px-4 border-b">{transaction.date}</td>
                <td className="py-2 px-4 border-b">{transaction.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProfilePage;
