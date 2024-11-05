import React, { useState } from 'react';
import Listing from './Listing';
import ProfilePage from './ProfilePage';

const App = () => {
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agents, setAgents] = useState([
    {
      id: 1,
      name: 'Rahul',
      category: 'Personal body guard, T1 - Professional Bouncer, Body Guard',
      info: 'Rating: 5\nEnquiries: 20\nLocation: Mumbai',
    },
    {
      id: 2,
      name: 'Aditya',
      category: 'T1 - Professional Bouncer',
      info: 'Rating: 5\nEnquiries: 20\nLocation: Mumbai',
    },
    {
      id: 3,
      name: 'Prashant',
      category: 'Body Guard',
      info: 'Rating: 5\nEnquiries: 20\nLocation: Mumbai',
    },
    {
      id: 4,
      name: 'Shiv',
      category: 'Club Bouncer',
      info: 'Rating: 5\nEnquiries: 20\nLocation: Mumbai',
    },
  ]);

  // Handle selecting an agent
  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
  };

  // Handle adding a new agent
  const handleAddAgent = (newAgent) => {
    setAgents([...agents, { id: agents.length + 1, ...newAgent }]);
  };

  // Go back to listing page
  const handleBackToListing = () => {
    setSelectedAgent(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {selectedAgent ? (
        <ProfilePage agent={selectedAgent} onBack={handleBackToListing} />
      ) : (
        <Listing agents={agents} onSelectAgent={handleSelectAgent} onAddAgent={handleAddAgent} />
      )}
    </div>
  );
};

export default App;
