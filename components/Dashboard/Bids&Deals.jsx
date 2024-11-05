import React, { useState } from 'react';
import { FaSearch, FaFilter, FaSort, FaDownload, FaPlus } from 'react-icons/fa';

const ChatBoard = () => {
  const [enquiries, setEnquiries] = useState([
    { id: 1, name: 'Rahul Pawar', date: 'Mon 2 April, 10:15 am', status: 'active' },
    { id: 2, name: 'Harshil', date: 'Mon 2 April, 10:18 am', status: 'active' },
    { id: 3, name: 'Aditya', date: 'Mon 2 April, 10:18 am', status: 'inactive' },
    { id: 4, name: 'Parth', date: 'Sat 1 April, 12:10 pm', status: 'inactive' },
    { id: 5, name: 'Jay Patel', date: 'Sat 1 April, 12:20 pm', status: 'inactive' },
  ]);
  
  const [selectedEnquiry, setSelectedEnquiry] = useState(enquiries[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: 'Rahul Pawar', content: 'Offer bid INR 1600', time: '10:00 am', type: 'offer' },
    { id: 2, sender: 'You', content: 'Counter bid INR 1800', time: '10:10 am', type: 'counter' },
    { id: 3, sender: 'Rahul Pawar', content: 'Accepted Offer INR 1780', time: '10:15 am', type: 'accepted' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Handle selecting an enquiry
  const handleSelectEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry);
    // Fetch or load the conversation for this specific enquiry
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'You',
        content: inputMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'message',
      };
      setMessages([...messages, newMessage]);
      setInputMessage('');
    }
  };

  return (
    <div className="p-8 text-black">
      {/* Search Bar and Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-1/3">
          <input
            type="text"
            placeholder="Search bid or deal"
            className="p-2 w-full rounded-full border bg-white border-gray-300 pl-10 focus:outline-none"
          />
          <FaSearch className="absolute top-3 left-4 text-gray-500" />
        </div>

        {/* Filter, Sort, and Export Buttons */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-gray-700">
            <FaFilter /> filter
          </button>
          <button className="flex items-center gap-2 text-gray-700">
            <FaSort /> sort
          </button>
          <button className="px-4 py-2 bg-black text-white rounded-lg flex items-center gap-2">
            Export <FaDownload />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex border rounded-lg overflow-hidden">
        {/* Left Sidebar (Enquirers) */}
        <div className="w-1/3 border-r p-4 bg-gray-100">
          <h3 className="font-semibold mb-4">Enquirers</h3>
          <ul>
            {enquiries.map((enquiry) => (
              <li
                key={enquiry.id}
                className={`p-2 cursor-pointer rounded-lg mb-2 ${
                  selectedEnquiry.id === enquiry.id ? 'bg-white' : ''
                }`}
                onClick={() => handleSelectEnquiry(enquiry)}
              >
                <div className="flex justify-between items-center">
                  <span>{enquiry.name}</span>
                  <small>{enquiry.date}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Section (Chat Board) */}
        <div className="w-2/3 p-4 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">{selectedEnquiry.name}</h3>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-full">Create Deal</button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                <div
                  className={`p-2 rounded-lg ${
                    message.sender === 'You' ? 'bg-yellow-200 text-right' : 'bg-gray-200 text-left'
                  }`}
                >
                  <div>{message.content}</div>
                </div>
                <small className="text-gray-500">{message.time}</small>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="flex items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message"
              className="p-2 w-full bg-white border border-gray-400 rounded-full"
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 p-2 bg-yellow-500 text-white rounded-full"
            >
              <FaPlus />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBoard;
