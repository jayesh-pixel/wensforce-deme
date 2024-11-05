import React, { useContext, useEffect, useState } from 'react';
import Sidebar from '@/components/Dashboard/Sidebar';
import Navbar from '@/components/Dashboard/Navbar';
import DashboardContent from '@/components/Dashboard/Mainpage';
import CategoryTable from '@/components/Dashboard/DashboardCategories';
import TransactionPage from '@/components/Dashboard/Transactions';
import ChatBoard from '@/components/Dashboard/Bids&Deals';
import Feature from '@/components/Dashboard/Features';
import Listing from '@/components/Dashboard/Lisiting';
import SkillTable from '@/components/Dashboard/Skills';
import WeaponTable from '@/components/Dashboard/Weapon';
import ShiftTable from '@/components/Dashboard/Shifts';
import BeardTable from '@/components/Dashboard/UserBeard';
import FaceTable from '@/components/Dashboard/UserFace';
import TwoTables from '@/components/Dashboard/DashboardBanner';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import ProfilePage from '@/components/Dashboard/DashboardUser';

const App = () => {
  const { logout, isDashboardAdmin, loading } = useContext(AuthContext); // Include loading
  const router = useRouter();
  const [id, setId] = useState('');
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isDashboardAdmin) {
        router.push('/login');
      }
    }
  }, [loading, isDashboardAdmin]);

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to render content based on the selected sidebar item
  const renderContent = () => {
    switch (activeItem) {
      case 'Dashboard':
        return <DashboardContent />;
      case 'User Management System':
        return <div className="p-4">User Management System Content</div>;
      case 'Customer Relation Management':
        return <div className="p-4">Customer Relation Management Content</div>;
      case 'Banner':
        return <TwoTables />;
      case 'Categories':
        return <CategoryTable />;
      case 'Features':
        return <Feature />;
      case 'Listings':
        return id ? <ProfilePage id={id} setId={setId} /> : <Listing setId={setId} />;
      case 'Skills':
        return <SkillTable />;
      case 'Weapon':
        return <WeaponTable />;
      case 'Shifts':
        return <ShiftTable />;
      case 'UserBeard':
        return <BeardTable />;
      case 'UserHair':
        return <BeardTable />;
      case 'UserFace':
        return <FaceTable />;
      case 'Transactions':
        return <TransactionPage />;
      case 'Bids & Deals':
        return <ChatBoard />;
      case 'Help Desk':
        return <div className="p-4">Help Desk Content</div>;
      case 'Content Management System':
        return <div className="p-4">Content Management System Content</div>;
      case 'Settings':
        return <div className="p-4">Settings Content</div>;
      default:
        return <div className="p-4">Select a sidebar item to view content</div>;
    }
  };

  // Show a loading indicator while authentication state is loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* You can replace this with a loader component */}
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed z-50 lg:static transition-transform duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <div className="flex-grow overflow-auto bg-white p-4">{renderContent()}</div>
      </div>
    </div>
  );
};

export default App;
