import React from 'react';
import { FaDollarSign, FaGift, FaChartLine, FaUsers, FaRupeeSign } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardContent = () => {
  // Dummy data for charts
  const Users = {
    labels: ['Today', 'Yesterday', 'Tomorrow', 'Last Month'],
    datasets: [
      {
        data: [80, 25, 10, 10],
        backgroundColor: ['#8b5cf6', '#f97316', '#10b981', '#3b82f6'],
        hoverOffset: 4,
      },
    ],
  };

  const booking = {
    labels: ['Today', 'Yesterday', 'Tomorrow', 'Last Month'],
    datasets: [
      {
        data: [35, 20, 10, 10],
        backgroundColor: ['#8b5cf6', '#f97316', '#10b981', '#3b82f6'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="p-4 space-y-4">
      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500 p-4 text-white rounded shadow-md flex items-center">
          <FaRupeeSign className="text-3xl mr-4" />
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold">350K</h2>
            <p>Total Revenue from Home Service</p>
          </div>
        </div>
        <div className="bg-indigo-500 p-4 text-white rounded shadow-md flex items-center">
          <FaGift className="text-3xl mr-4" />
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold">1.5K</h2>
            <p>Reward Points Redeemed</p>
          </div>
        </div>
        <div className="bg-yellow-500 p-4 text-white rounded shadow-md flex items-center">
          <FaChartLine className="text-3xl mr-4" />
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold">1.2K</h2>
            <p>Top Products/Services</p>
          </div>
        </div>
        <div className="bg-orange-500 p-4 text-white rounded shadow-md flex items-center">
          <FaUsers className="text-3xl mr-4" />
          <div>
            <h2 className="text-xl lg:text-2xl font-semibold">50K</h2>
            <p>New Users</p>
          </div>
        </div>
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-black">
        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4">Total Active Users</h2>
          <div className="flex justify-center items-center h-64">
            <Pie data={Users} />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <p>Today's active users</p>
              <p>80</p>
            </div>
            <div className="flex justify-between">
              <p>Yesterday's active users</p>
              <p>10</p>
            </div>
            <div className="flex justify-between">
              <p>Tomorrow's active users</p>
              <p>10</p>
            </div>
            <div className="flex justify-between">
              <p>Last Month's active users</p>
              <p>10</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow-md">
          <h2 className="text-lg font-semibold mb-4">Total Active Bookings</h2>
          <div className="flex justify-center items-center h-64">
            <Pie data={booking} />
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between">
              <p>Today's active bookings</p>
              <p>60</p>
            </div>
            <div className="flex justify-between">
              <p>Yesterday's active bookings</p>
              <p>25</p>
            </div>
            <div className="flex justify-between">
              <p>Tomorrow's active bookings</p>
              <p>10</p>
            </div>
            <div className="flex justify-between">
              <p>Last Month's active bookings</p>
              <p>10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
