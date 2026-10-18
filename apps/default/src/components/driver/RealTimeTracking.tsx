import React, { useState, useEffect, useCallback } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Fuel, 
  Cloud, 
  Route,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';
import { 
  gpsTrackingService, 
  routeOptimizationService, 
  logisticsAPIService,
  GPSLocation, 
  OptimizedRoute, 
  GeofenceAlert 
} from '../../services/gpsTracking';
import { Job } from './DriverApp';

interface RealTimeTrackingProps {
  job: Job;
  onLocationUpdate?: (location: GPSLocation) => void;
  onETAUpdate?: (eta: string) => void;
}

export const RealTimeTracking: React.FC<RealTimeTrackingProps> = ({ 
  job, 
  onLocationUpdate, 
  onETAUpdate 
}) => {
  const [currentLocation, setCurrentLocation] = useState<GPSLocation | null>(null);
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [eta, setETA] = useState<string>('Calculating...');
  const [fuelPrices, setFuelPrices] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);
  const [hosStatus, setHosStatus] = useState<any>(null);
  const [geofenceAlerts, setGeofenceAlerts] = useState<GeofenceAlert[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  // Start GPS tracking
  const startTracking = useCallback(async () => {
    try {
      setTrackingError(null);
      await gpsTrackingService.startTracking({
        enableHighAccuracy: true,
        updateInterval: 10000 // Update every 10 seconds
      });
      setIsTracking(true);
    } catch (error) {
      setTrackingError(error instanceof Error ? error.message : 'Failed to start tracking');
      console.error('Failed to start GPS tracking:', error);
    }
  }, []);

  // Stop GPS tracking
  const stopTracking = useCallback(() => {
    gpsTrackingService.stopTracking();
    setIsTracking(false);
  }, []);

  // Handle location updates
  useEffect(() => {
    const unsubscribeLocation = gpsTrackingService.onLocationUpdate((location) => {
      setCurrentLocation(location);
      onLocationUpdate?.(location);
      updateETA(location);
      updateContextualData(location);
    });

    const unsubscribeGeofence = gpsTrackingService.onGeofenceAlert((alert) => {
      setGeofenceAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts
    });

    return () => {
      unsubscribeLocation();
      unsubscribeGeofence();
    };
  }, [onLocationUpdate]);

  // Update ETA based on current location
  const updateETA = useCallback(async (location: GPSLocation) => {
    try {
      const destination = {
        lat: 34.0522, // Mock destination coordinates
        lng: -118.2437
      };

      const etaData = await routeOptimizationService.calculateETA(
        { lat: location.latitude, lng: location.longitude },
        destination,
        true // Include traffic
      );

      setETA(etaData.arrivalTime);
      onETAUpdate?.(etaData.arrivalTime);
    } catch (error) {
      console.error('Failed to update ETA:', error);
    }
  }, [onETAUpdate]);

  // Update contextual data (fuel, weather, HOS)
  const updateContextualData = useCallback(async (location: GPSLocation) => {
    try {
      // Fetch fuel prices
      const fuel = await logisticsAPIService.getFuelPrices(location);
      setFuelPrices(fuel);

      // Fetch weather conditions
      const weather = await logisticsAPIService.getWeatherConditions(location);
      setWeatherData(weather);

      // Fetch HOS status
      const hos = await logisticsAPIService.getHoursOfServiceStatus('driver_001');
      setHosStatus(hos);
    } catch (error) {
      console.error('Failed to update contextual data:', error);
    }
  }, []);

  // Optimize route
  const optimizeRoute = useCallback(async () => {
    if (!currentLocation) return;

    try {
      const origin = { lat: currentLocation.latitude, lng: currentLocation.longitude };
      const destination = { lat: 34.0522, lng: -118.2437 }; // Mock destination

      const route = await routeOptimizationService.optimizeRoute(origin, destination);
      setOptimizedRoute(route);
    } catch (error) {
      console.error('Failed to optimize route:', error);
    }
  }, [currentLocation]);

  // Start tracking on component mount
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, [startTracking, stopTracking]);

  const formatSpeed = (speed?: number) => {
    if (!speed) return '0 mph';
    return `${Math.round(speed * 2.237)} mph`; // Convert m/s to mph
  };

  const formatAccuracy = (accuracy: number) => {
    return `±${Math.round(accuracy)}m`;
  };

  const getHOSStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-50';
      case 'driving': return 'text-blue-600 bg-blue-50';
      case 'on_duty': return 'text-yellow-600 bg-yellow-50';
      case 'off_duty': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      {/* Tracking Status */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            <Navigation className="w-4 h-4 mr-2" />
            Real-Time Tracking
          </h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-medium ${isTracking ? 'text-green-600' : 'text-red-600'}`}>
              {isTracking ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {trackingError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{trackingError}</span>
            </div>
            <button
              onClick={startTracking}
              className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {currentLocation && (
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-600">Speed:</span>
              <p className="font-medium">{formatSpeed(currentLocation.speed)}</p>
            </div>
            <div>
              <span className="text-gray-600">Accuracy:</span>
              <p className="font-medium">{formatAccuracy(currentLocation.accuracy)}</p>
            </div>
            <div>
              <span className="text-gray-600">ETA:</span>
              <p className="font-medium text-blue-600">{eta}</p>
            </div>
            <div>
              <span className="text-gray-600">Last Update:</span>
              <p className="font-medium">{new Date(currentLocation.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Route Optimization */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center">
            <Route className="w-4 h-4 mr-2" />
            Route Optimization
          </h3>
          <button
            onClick={optimizeRoute}
            disabled={!currentLocation}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
          >
            <RefreshCw className="w-3 h-3 inline mr-1" />
            Optimize
          </button>
        </div>

        {optimizedRoute && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Distance:</span>
              <span className="font-medium">{optimizedRoute.distance.toFixed(1)} miles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium">{Math.round(optimizedRoute.duration)} min</span>
            </div>
            {optimizedRoute.trafficConditions.length > 0 && (
              <div className="mt-2">
                <span className="text-gray-600">Traffic Alerts:</span>
                {optimizedRoute.trafficConditions.map((condition, index) => (
                  <div key={index} className="mt-1 p-2 bg-yellow-50 rounded text-xs">
                    <div className="flex items-center">
                      <AlertTriangle className="w-3 h-3 text-yellow-600 mr-1" />
                      <span className="font-medium">{condition.description}</span>
                    </div>
                    <span className="text-gray-600">+{condition.delay} min delay</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hours of Service Status */}
      {hosStatus && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <Shield className="w-4 h-4 mr-2" />
            Hours of Service
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Status:</span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getHOSStatusColor(hosStatus.currentStatus)}`}>
                {hosStatus.currentStatus.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Drive:</span>
                <p className="font-medium">{hosStatus.hoursRemaining.drive}h</p>
              </div>
              <div>
                <span className="text-gray-600">On Duty:</span>
                <p className="font-medium">{hosStatus.hoursRemaining.onDuty}h</p>
              </div>
              <div>
                <span className="text-gray-600">Cycle:</span>
                <p className="font-medium">{hosStatus.hoursRemaining.cycle}h</p>
              </div>
            </div>

            {hosStatus.nextBreakRequired && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                <span className="text-blue-800">Next break required: {hosStatus.nextBreakRequired}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fuel Prices */}
      {fuelPrices && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <Fuel className="w-4 h-4 mr-2" />
            Nearby Fuel Prices
          </h3>
          
          <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
            <div>
              <span className="text-gray-600">Diesel:</span>
              <p className="font-medium text-green-600">${fuelPrices.diesel.toFixed(2)}/gal</p>
            </div>
            <div>
              <span className="text-gray-600">Gasoline:</span>
              <p className="font-medium">${fuelPrices.gasoline.toFixed(2)}/gal</p>
            </div>
          </div>

          <div className="space-y-2">
            {fuelPrices.nearbyStations.slice(0, 2).map((station: any, index: number) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{station.name}</p>
                    <p className="text-gray-600">{station.distance} mi</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">${station.dieselPrice.toFixed(2)}</p>
                    <p className="text-gray-600">diesel</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weather Conditions */}
      {weatherData && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <Cloud className="w-4 h-4 mr-2" />
            Weather Conditions
          </h3>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-600">Temperature:</span>
              <p className="font-medium">{Math.round(weatherData.current.temperature)}°F</p>
            </div>
            <div>
              <span className="text-gray-600">Conditions:</span>
              <p className="font-medium">{weatherData.current.conditions}</p>
            </div>
            <div>
              <span className="text-gray-600">Visibility:</span>
              <p className="font-medium">{weatherData.current.visibility} mi</p>
            </div>
            <div>
              <span className="text-gray-600">Wind:</span>
              <p className="font-medium">{weatherData.current.windSpeed} mph</p>
            </div>
          </div>

          {weatherData.alerts.length > 0 && (
            <div className="mt-3">
              {weatherData.alerts.map((alert: any, index: number) => (
                <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                  <div className="flex items-center">
                    <AlertTriangle className="w-3 h-3 text-red-600 mr-1" />
                    <span className="font-medium text-red-800">{alert.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Geofence Alerts */}
      {geofenceAlerts.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <Zap className="w-4 h-4 mr-2" />
            Recent Alerts
          </h3>
          
          <div className="space-y-2">
            {geofenceAlerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="p-2 bg-blue-50 rounded text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {alert.type} {alert.location.replace('_', ' ')}
                  </span>
                  <span className="text-gray-600">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {alert.distance && (
                  <span className="text-gray-600">{alert.distance} mi away</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};