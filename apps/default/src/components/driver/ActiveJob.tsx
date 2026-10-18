import React, { useState } from 'react';
import { ArrowLeft, Navigation, MapPin, AlertTriangle, Phone, MessageCircle } from 'lucide-react';
import { Job } from './DriverApp';

interface ActiveJobProps {
  job: Job;
  onStatusUpdate: (status: Job['status']) => void;
  onBack: () => void;
}

export const ActiveJob: React.FC<ActiveJobProps> = ({ job, onStatusUpdate, onBack }) => {
  const [showIssueReport, setShowIssueReport] = useState(false);

  const getStatusText = () => {
    switch (job.status) {
      case 'assigned':
        return 'Drive to Pickup Location';
      case 'en-route-pickup':
        return 'En Route to Pickup';
      case 'at-pickup':
        return 'At Pickup Location';
      case 'picked-up':
        return 'Drive to Delivery Location';
      case 'en-route-delivery':
        return 'En Route to Delivery';
      case 'at-delivery':
        return 'At Delivery Location';
      default:
        return 'Unknown Status';
    }
  };

  const getActionButtonText = () => {
    switch (job.status) {
      case 'assigned':
        return 'START TRIP';
      case 'en-route-pickup':
        return 'ARRIVED AT PICKUP';
      case 'at-pickup':
        return 'CONFIRM PICKUP & START DELIVERY';
      case 'picked-up':
      case 'en-route-delivery':
        return 'ARRIVED AT DELIVERY';
      default:
        return 'CONTINUE';
    }
  };

  const handleActionButton = () => {
    switch (job.status) {
      case 'assigned':
        onStatusUpdate('en-route-pickup');
        break;
      case 'en-route-pickup':
        onStatusUpdate('at-pickup');
        break;
      case 'at-pickup':
        onStatusUpdate('picked-up');
        break;
      case 'picked-up':
      case 'en-route-delivery':
        onStatusUpdate('at-delivery');
        break;
    }
  };

  const getCurrentAddress = () => {
    if (['assigned', 'en-route-pickup', 'at-pickup'].includes(job.status)) {
      return job.pickupAddress;
    }
    return job.deliveryAddress;
  };

  const getETA = () => {
    // Mock ETA calculation
    if (['assigned', 'en-route-pickup'].includes(job.status)) {
      return '3:45 PM';
    }
    return '6:30 PM';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center">
        <button onClick={onBack} className="mr-3">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-medium text-gray-900">Job #{job.id}</h1>
          <p className="text-xs text-gray-600">{job.pickupCity} → {job.deliveryCity}</p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-blue-600 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{getStatusText()}</p>
            <p className="text-xs opacity-90">ETA: {getETA()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">Current Location:</p>
            <p className="text-sm font-medium truncate max-w-32">
              {getCurrentAddress().split(',')[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gray-200">
        {/* Mock Map Interface */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Navigation className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-gray-600 text-sm mb-2">Navigation Active</p>
            <p className="text-gray-800 font-medium">Following GPS Route</p>
          </div>
        </div>

        {/* Route Visualization */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-white rounded-lg p-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Next Turn</p>
                <p className="text-sm font-medium">Turn right on Main Street</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">0.5 mi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Location Indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg">
            <div className="w-8 h-8 bg-blue-600 bg-opacity-20 rounded-full absolute -top-2 -left-2 animate-pulse"></div>
          </div>
        </div>

        {/* Issue Report Button */}
        <button
          onClick={() => setShowIssueReport(true)}
          className="absolute top-20 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg"
        >
          <AlertTriangle className="w-5 h-5" />
        </button>
      </div>

      {/* Action Button */}
      <div className="bg-white p-4 shadow-lg">
        <button
          onClick={handleActionButton}
          className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
        >
          {getActionButtonText()}
        </button>
      </div>

      {/* Issue Report Modal */}
      {showIssueReport && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
          <div className="bg-white w-full rounded-t-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report an Issue</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-3" />
                <span>Traffic Delay</span>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                <span>Vehicle Breakdown</span>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg flex items-center">
                <Phone className="w-5 h-5 text-blue-500 mr-3" />
                <span>Contact Dispatcher</span>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg flex items-center">
                <MessageCircle className="w-5 h-5 text-green-500 mr-3" />
                <span>Message Customer</span>
              </button>
            </div>
            <button
              onClick={() => setShowIssueReport(false)}
              className="w-full mt-4 py-3 text-gray-600 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};