import React, { useState } from 'react';
import { ShipperDashboard } from './components/shipper/ShipperDashboard';
import { AdvancedDashboard } from './components/shipper/AdvancedDashboard';
import { PostLoadPage } from './components/shipper/PostLoadPage';
import { BiddingPage } from './components/shipper/BiddingPage';
import { DriverApp } from './components/driver/DriverApp';
import { UserTypeSelector } from './components/UserTypeSelector';

export type UserType = 'shipper' | 'driver' | null;
export type ShipperPage = 'dashboard' | 'advanced-dashboard' | 'post-load' | 'bidding';

const App: React.FC = () => {
  const [userType, setUserType] = useState<UserType>(null);
  const [currentPage, setCurrentPage] = useState<ShipperPage>('advanced-dashboard');
  const [selectedLoadId, setSelectedLoadId] = useState<string | null>(null);
  const [useAdvancedFeatures, setUseAdvancedFeatures] = useState(true);

  if (!userType) {
    return <UserTypeSelector onSelectUserType={setUserType} />;
  }

  if (userType === 'driver') {
    return <DriverApp />;
  }

  // Shipper application
  const renderShipperPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <ShipperDashboard 
            onPostNewLoad={() => setCurrentPage('post-load')}
            onViewLoad={(loadId) => {
              setSelectedLoadId(loadId);
              setCurrentPage('bidding');
            }}
          />
        );
      case 'advanced-dashboard':
        return (
          <AdvancedDashboard 
            onPostNewLoad={() => setCurrentPage('post-load')}
            onViewLoad={(loadId) => {
              setSelectedLoadId(loadId);
              setCurrentPage('bidding');
            }}
          />
        );
      case 'post-load':
        return (
          <PostLoadPage 
            onBack={() => setCurrentPage(useAdvancedFeatures ? 'advanced-dashboard' : 'dashboard')}
            onLoadPosted={() => setCurrentPage(useAdvancedFeatures ? 'advanced-dashboard' : 'dashboard')}
          />
        );
      case 'bidding':
        return (
          <BiddingPage 
            loadId={selectedLoadId!}
            onBack={() => setCurrentPage(useAdvancedFeatures ? 'advanced-dashboard' : 'dashboard')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Feature Toggle - Hidden in production */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-3 border border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">Mode:</span>
            <button
              onClick={() => {
                setUseAdvancedFeatures(!useAdvancedFeatures);
                setCurrentPage(useAdvancedFeatures ? 'dashboard' : 'advanced-dashboard');
              }}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                useAdvancedFeatures 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {useAdvancedFeatures ? 'Advanced' : 'Standard'}
            </button>
          </div>
        </div>
      </div>

      {renderShipperPage()}
    </div>
  );
};

export default App;