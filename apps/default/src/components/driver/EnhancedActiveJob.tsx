import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Navigation, 
  MapPin, 
  AlertTriangle, 
  Phone, 
  MessageCircle, 
  Settings,
  Maximize2,
  Minimize2,
  Layers,
  Zap
} from 'lucide-react';
import { Job } from './DriverApp';
import { RealTimeTracking } from './RealTimeTracking';
import { GPSLocation } from '../../services/gpsTracking';

interface EnhancedActiveJobProps {
  job: Job;
  onStatusUpdate: (status: Job['status']) => void;
  onBack: () => void;
}

export const EnhancedActiveJob: React.FC<EnhancedActiveJobProps> = ({ 
  job, 
  onStatusUpdate, 
  onBack 
}) => {
  const [showIssueReport, setShowIssueReport] = useState(false);
  const [showTrackingPanel, setShowTrackingPanel] = useState(true);
  const [isFullScreenMap, setIsFullScreenMap] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [eta, setETA] = useState<string>('Calculating...');
  const [mapView, setMapView] = useState<'standard' | 'satellite' | 'traffic'>('standard');

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

  const handleLocationUpdate = (location: GPSLocation) => {
    setCurrentLocation(location);
    // In real app, this would send location updates to the server
    console.log('Location updated:', location);
  };

  const handleETAUpdate = (newETA: string) => {
    setETA(newETA);
  };

  const getMapViewIcon = () => {
    switch (mapView) {
      case 'satellite': return '🛰️';
      case 'traffic': return '🚦';
      default: return '🗺️';
    }
  };

  const toggleMapView = () => {
    const views: Array<'standard' | 'satellite' | 'traffic'> = ['standard', 'satellite', 'traffic'];
    const currentIndex = views.indexOf(mapView);
    const nextIndex = (currentIndex + 1) % views.length;
    setMapView(views[nextIndex]);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm flex items-center">
        <button onClick={onBack} className="mr-3">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-medium text-gray-900">Job #{job.id.slice(-6)}</h1>
          <p className="text-xs text-gray-600">{job.pickupCity} → {job.deliveryCity}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowTrackingPanel(!showTrackingPanel)}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Toggle tracking panel"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsFullScreenMap(!isFullScreenMap)}
            className="p-2 text-gray-600 hover:text-gray-900"
            title="Toggle fullscreen map"
          >
            {isFullScreenMap ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Enhanced Status Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{getStatusText()}</p>
            <p className="text-xs opacity-90">ETA: {eta}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-90">Current Location:</p>
            <p className="text-sm font-medium truncate max-w-32">
              {getCurrentAddress().split(',')[0]}
            </p>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-2">
          <div className="flex justify-between text-xs opacity-75 mb-1">
            <span>Start</span>
            <span>Pickup</span>
            <span>Delivery</span>
          </div>
          <div className="w-full bg-blue-800 bg-opacity-50 rounded-full h-1">
            <div 
              className="bg-white rounded-full h-1 transition-all duration-500"
              style={{
                width: job.status === 'assigned' ? '10%' :
                       job.status === 'en-route-pickup' ? '25%' :
                       job.status === 'at-pickup' ? '50%' :
                       job.status === 'picked-up' ? '60%' :
                       job.status === 'en-route-delivery' ? '80%' :
                       job.status === 'at-delivery' ? '100%' : '0%'
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Map Area */}
        <div className={`relative bg-gray-200 ${isFullScreenMap ? 'w-full' : showTrackingPanel ? 'flex-1' : 'w-full'}`}>
          {/* Enhanced Map Interface */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600 text-sm mb-2">Enhanced Navigation Active</p>
              <p className="text-gray-800 font-medium">Real-time GPS Tracking</p>
              {currentLocation && (
                <div className="mt-2 text-xs text-gray-600">
                  <p>Speed: {currentLocation.speed ? Math.round(currentLocation.speed * 2.237) : 0} mph</p>
                  <p>Accuracy: ±{Math.round(currentLocation.accuracy)}m</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="bg-white rounded-lg p-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">Next Turn</p>
                    <p className="text-sm font-medium">Turn right on Main Street</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">0.5 mi</p>
                  <p className="text-xs text-gray-600">2 min</p>
                </div>
              </div>
            </div>
          </div>

          {/* Map View Toggle */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={toggleMapView}
              className="bg-white rounded-lg p-2 shadow-lg text-sm font-medium"
              title={`Switch to ${mapView === 'standard' ? 'satellite' : mapView === 'satellite' ? 'traffic' : 'standard'} view`}
            >
              {getMapViewIcon()}
            </button>
          </div>

          {/* Current Location Indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg">
              <div className="w-8 h-8 bg-blue-600 bg-opacity-20 rounded-full absolute -top-2 -left-2 animate-pulse"></div>
            </div>
          </div>

          {/* Smart Alerts */}
          <div className="absolute bottom-20 left-4 right-4 z-10">
            <div className="space-y-2">
              {/* Traffic Alert Example */}
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800">Traffic Alert</p>
                  <p className="text-xs text-yellow-700">Construction ahead - 5 min delay</p>
                </div>
                <button className="text-xs text-yellow-600 hover:text-yellow-800">
                  Route Around
                </button>
              </div>
            </div>
          </div>

          {/* Issue Report Button */}
          <button
            onClick={() => setShowIssueReport(true)}
            className="absolute bottom-4 right-4 bg-red-500 text-white p-3 rounded-full shadow-lg z-10"
          >
            <AlertTriangle className="w-5 h-5" />
          </button>
        </div>

        {/* Real-Time Tracking Panel */}
        {showTrackingPanel && !isFullScreenMap && (
          <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Live Tracking</h2>
                <button
                  onClick={() => setShowTrackingPanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
              
              <RealTimeTracking
                job={job}
                onLocationUpdate={handleLocationUpdate}
                onETAUpdate={handleETAUpdate}
              />
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Action Button */}
      <div className="bg-white p-4 shadow-lg border-t border-gray-200">
        <div className="flex space-x-3">
          <button
            onClick={handleActionButton}
            className="flex-1 bg-green-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <Zap className="w-5 h-5 mr-2" />
            {getActionButtonText()}
          </button>
          
          {/* Quick Actions */}
          <div className="flex space-x-2">
            <button className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
              <Phone className="w-5 h-5" />
            </button>
            <button className="bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-700 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Issue Report Modal */}
      {showIssueReport && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-lg p-4 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report an Issue</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg flex items-center hover:bg-gray-100 transition-colors">
                <AlertTriangle className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <span className="font-medium">Traffic Delay</span>
                  <p className="text-sm text-gray-600">Report unexpected traffic conditions</p>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg flex items-center hover:bg-gray-100 transition-colors">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <span className="font-medium">Vehicle Breakdown</span>
                  <p className="text-sm text-gray-600">Mechanical issues or emergency</p>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg flex items-center hover:bg-gray-100 transition-colors">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3" />
                <div>
                  <span className="font-medium">Weather Conditions</span>
                  <p className="text-sm text-gray-600">Severe weather affecting route</p>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg flex items-center hover:bg-gray-100 transition-colors">
                <Phone className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <span className="font-medium">Contact Dispatcher</span>
                  <p className="text-sm text-gray-600">Speak with operations team</p>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg flex items-center hover:bg-gray-100 transition-colors">
                <MessageCircle className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <span className="font-medium">Message Customer</span>
                  <p className="text-sm text-gray-600">Send update to shipper</p>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 rounded-lg flex items-center hover:bg-gray-100 transition-colors">
                <Settings className="w-5 h-5 text-gray-500 mr-3" />
                <div>
                  <span className="font-medium">Other Issue</span>
                  <p className="text-sm text-gray-600">Custom issue description</p>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowIssueReport(false)}
              className="w-full mt-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};