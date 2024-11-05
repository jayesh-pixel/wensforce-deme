import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import DashboardContent from './Mainpage';
import DashboardCategories from './DashboardCategories';
import Transactions from './Transactions';
import BidSystem from './Bids&Deals';
import Feature from './Features';
import Listing from './Lisiting';
import Skills from './Skills';
import Weapon from './Weapon';
import Shifts from './Shifts';
import FaceTable from './UserFace';
import BeardTable from './UserBeard';
import HairTable from './UserHair';
import DashboardBanner from './DashboardBanner';

const App = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
        return <DashboardBanner/>
      case 'Categories':
        return <DashboardCategories />;
      case 'Features':
        return <Feature />;
      case 'Listings':
        return <Listing />;
      case 'Skills':
        return <Skills />;
      case 'Weapon':
        return <Weapon />;
      case 'Shifts':
        return <Shifts />;
      case 'UserBeard':
        return <BeardTable />;
      case 'UserHair':
        return <HairTable />;
      case 'UserFace':
        return <FaceTable />;
      case 'Transactions':
        return <Transactions />;
      case 'Bids & Deals':
        return <BidSystem />;
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

  return (
    <div className="flex h-screen o">
      {/* Sidebar */}
      <div className={`fixed z-50 lg:static transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Sidebar activeItem={activeItem} onItemClick={setActiveItem} />
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && <div className="fixed  inset-0 bg-black opacity-50 z-40 lg:hidden" onClick={toggleSidebar}></div>}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <div className="flex-grow overflow-auto bg-white p-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default App;
