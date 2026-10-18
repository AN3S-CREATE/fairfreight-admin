// GPS Tracking and Location Services
export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

export interface RoutePoint {
  lat: number;
  lng: number;
  address?: string;
  estimatedArrival?: string;
}

export interface OptimizedRoute {
  distance: number; // in miles
  duration: number; // in minutes
  points: RoutePoint[];
  instructions: RouteInstruction[];
  trafficConditions: TrafficCondition[];
}

export interface RouteInstruction {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: string;
}

export interface TrafficCondition {
  severity: 'low' | 'moderate' | 'heavy' | 'severe';
  description: string;
  delay: number; // in minutes
  location: string;
}

export interface GeofenceAlert {
  type: 'entered' | 'exited' | 'approaching';
  location: 'pickup' | 'delivery' | 'rest_area' | 'weigh_station';
  timestamp: number;
  distance?: number;
}

class GPSTrackingService {
  private watchId: number | null = null;
  private currentLocation: GPSLocation | null = null;
  private locationCallbacks: ((location: GPSLocation) => void)[] = [];
  private geofenceCallbacks: ((alert: GeofenceAlert) => void)[] = [];
  private trackingInterval: NodeJS.Timeout | null = null;

  // Start GPS tracking
  startTracking(options: {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    updateInterval?: number;
  } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const {
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 60000,
        updateInterval = 5000
      } = options;

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: GPSLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined
          };

          this.currentLocation = location;
          this.notifyLocationCallbacks(location);
          
          if (!this.trackingInterval) {
            resolve();
          }
        },
        (error) => {
          console.error('GPS tracking error:', error);
          reject(error);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge
        }
      );

      // Set up periodic location updates
      this.trackingInterval = setInterval(() => {
        if (this.currentLocation) {
          this.checkGeofences(this.currentLocation);
        }
      }, updateInterval);
    });
  }

  // Stop GPS tracking
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.trackingInterval) {
      clearInterval(this.trackingInterval);
      this.trackingInterval = null;
    }
  }

  // Get current location
  getCurrentLocation(): Promise<GPSLocation> {
    return new Promise((resolve, reject) => {
      if (this.currentLocation) {
        resolve(this.currentLocation);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: GPSLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined
          };
          resolve(location);
        },
        reject,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }

  // Subscribe to location updates
  onLocationUpdate(callback: (location: GPSLocation) => void): () => void {
    this.locationCallbacks.push(callback);
    return () => {
      const index = this.locationCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationCallbacks.splice(index, 1);
      }
    };
  }

  // Subscribe to geofence alerts
  onGeofenceAlert(callback: (alert: GeofenceAlert) => void): () => void {
    this.geofenceCallbacks.push(callback);
    return () => {
      const index = this.geofenceCallbacks.indexOf(callback);
      if (index > -1) {
        this.geofenceCallbacks.splice(index, 1);
      }
    };
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private notifyLocationCallbacks(location: GPSLocation): void {
    this.locationCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location callback:', error);
      }
    });
  }

  private checkGeofences(location: GPSLocation): void {
    // Mock geofence checking - in real app, this would check against defined geofences
    // For demo purposes, we'll simulate some geofence alerts
    if (Math.random() > 0.99) { // Very rare random alerts for demo
      const alert: GeofenceAlert = {
        type: 'approaching',
        location: 'pickup',
        timestamp: Date.now(),
        distance: 0.5
      };
      this.notifyGeofenceCallbacks(alert);
    }
  }

  private notifyGeofenceCallbacks(alert: GeofenceAlert): void {
    this.geofenceCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in geofence callback:', error);
      }
    });
  }
}

// Route Optimization Service
class RouteOptimizationService {
  private apiKey: string = 'demo_key'; // In real app, this would be from environment variables

  // Optimize route between multiple points
  async optimizeRoute(
    origin: RoutePoint,
    destination: RoutePoint,
    waypoints: RoutePoint[] = []
  ): Promise<OptimizedRoute> {
    try {
      // Mock API call - in real app, this would call Google Maps, MapBox, or similar service
      const mockRoute = await this.mockRouteOptimization(origin, destination, waypoints);
      return mockRoute;
    } catch (error) {
      console.error('Route optimization failed:', error);
      throw new Error('Failed to optimize route');
    }
  }

  // Get real-time traffic conditions
  async getTrafficConditions(route: RoutePoint[]): Promise<TrafficCondition[]> {
    try {
      // Mock traffic data - in real app, this would call traffic APIs
      return this.mockTrafficConditions();
    } catch (error) {
      console.error('Failed to get traffic conditions:', error);
      return [];
    }
  }

  // Calculate ETA with traffic
  async calculateETA(
    origin: RoutePoint,
    destination: RoutePoint,
    currentTraffic: boolean = true
  ): Promise<{
    duration: number;
    distance: number;
    arrivalTime: string;
  }> {
    try {
      const route = await this.optimizeRoute(origin, destination);
      const trafficDelay = currentTraffic ? await this.getTrafficDelay(route.points) : 0;
      const totalDuration = route.duration + trafficDelay;
      const arrivalTime = new Date(Date.now() + totalDuration * 60000).toLocaleTimeString();

      return {
        duration: totalDuration,
        distance: route.distance,
        arrivalTime
      };
    } catch (error) {
      console.error('ETA calculation failed:', error);
      throw new Error('Failed to calculate ETA');
    }
  }

  private async mockRouteOptimization(
    origin: RoutePoint,
    destination: RoutePoint,
    waypoints: RoutePoint[]
  ): Promise<OptimizedRoute> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock distance calculation (simplified)
    const distance = this.calculateMockDistance(origin, destination);
    const duration = Math.round(distance * 1.2); // Rough estimate: 1.2 minutes per mile

    return {
      distance,
      duration,
      points: [origin, ...waypoints, destination],
      instructions: [
        {
          instruction: "Head north on Main Street",
          distance: 0.5,
          duration: 2,
          maneuver: "straight"
        },
        {
          instruction: "Turn right onto Highway 101",
          distance: 15.2,
          duration: 18,
          maneuver: "turn-right"
        },
        {
          instruction: "Take exit 42 toward destination",
          distance: 2.1,
          duration: 3,
          maneuver: "exit-right"
        },
        {
          instruction: "Arrive at destination",
          distance: 0.2,
          duration: 1,
          maneuver: "arrive"
        }
      ],
      trafficConditions: await this.mockTrafficConditions()
    };
  }

  private async mockTrafficConditions(): Promise<TrafficCondition[]> {
    return [
      {
        severity: 'moderate',
        description: 'Construction on Highway 101',
        delay: 5,
        location: 'Highway 101, Mile 45'
      },
      {
        severity: 'low',
        description: 'Light traffic in downtown area',
        delay: 2,
        location: 'Downtown Main Street'
      }
    ];
  }

  private async getTrafficDelay(points: RoutePoint[]): Promise<number> {
    const conditions = await this.mockTrafficConditions();
    return conditions.reduce((total, condition) => total + condition.delay, 0);
  }

  private calculateMockDistance(origin: RoutePoint, destination: RoutePoint): number {
    // Simple distance calculation for mock purposes
    const latDiff = Math.abs(destination.lat - origin.lat);
    const lngDiff = Math.abs(destination.lng - origin.lng);
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough miles conversion
  }
}

// External Logistics APIs Integration
class LogisticsAPIService {
  // Fuel price tracking
  async getFuelPrices(location: GPSLocation): Promise<{
    diesel: number;
    gasoline: number;
    nearbyStations: Array<{
      name: string;
      address: string;
      distance: number;
      dieselPrice: number;
      gasolinePrice: number;
    }>;
  }> {
    try {
      // Mock fuel price data - in real app, this would call fuel price APIs
      return {
        diesel: 3.45 + Math.random() * 0.5,
        gasoline: 3.12 + Math.random() * 0.4,
        nearbyStations: [
          {
            name: "Shell Station",
            address: "123 Highway Blvd",
            distance: 0.8,
            dieselPrice: 3.42,
            gasolinePrice: 3.09
          },
          {
            name: "BP Truck Stop",
            address: "456 Interstate Dr",
            distance: 1.2,
            dieselPrice: 3.48,
            gasolinePrice: 3.15
          }
        ]
      };
    } catch (error) {
      console.error('Failed to get fuel prices:', error);
      throw new Error('Failed to fetch fuel prices');
    }
  }

  // Weather conditions
  async getWeatherConditions(location: GPSLocation): Promise<{
    current: {
      temperature: number;
      conditions: string;
      visibility: number;
      windSpeed: number;
      precipitation: number;
    };
    forecast: Array<{
      time: string;
      temperature: number;
      conditions: string;
      precipitationChance: number;
    }>;
    alerts: Array<{
      type: 'severe_weather' | 'road_conditions' | 'visibility';
      severity: 'low' | 'moderate' | 'high';
      description: string;
      validUntil: string;
    }>;
  }> {
    try {
      // Mock weather data - in real app, this would call weather APIs
      return {
        current: {
          temperature: 72 + Math.random() * 20,
          conditions: "Partly Cloudy",
          visibility: 10,
          windSpeed: 8,
          precipitation: 0
        },
        forecast: [
          {
            time: "2:00 PM",
            temperature: 75,
            conditions: "Sunny",
            precipitationChance: 10
          },
          {
            time: "6:00 PM",
            temperature: 68,
            conditions: "Cloudy",
            precipitationChance: 30
          }
        ],
        alerts: []
      };
    } catch (error) {
      console.error('Failed to get weather conditions:', error);
      throw new Error('Failed to fetch weather conditions');
    }
  }

  // DOT regulations and hours of service
  async getHoursOfServiceStatus(driverId: string): Promise<{
    currentStatus: 'available' | 'driving' | 'on_duty' | 'off_duty';
    hoursRemaining: {
      drive: number;
      onDuty: number;
      cycle: number;
    };
    nextBreakRequired: string;
    violations: Array<{
      type: string;
      description: string;
      severity: 'warning' | 'violation';
    }>;
  }> {
    try {
      // Mock HOS data - in real app, this would integrate with ELD systems
      return {
        currentStatus: 'available',
        hoursRemaining: {
          drive: 8.5,
          onDuty: 12,
          cycle: 65
        },
        nextBreakRequired: "4:30 PM",
        violations: []
      };
    } catch (error) {
      console.error('Failed to get HOS status:', error);
      throw new Error('Failed to fetch hours of service status');
    }
  }

  // Load board integration
  async searchAvailableLoads(criteria: {
    origin?: string;
    destination?: string;
    radius?: number;
    trailerType?: string;
    minRate?: number;
    maxWeight?: number;
  }): Promise<Array<{
    id: string;
    origin: string;
    destination: string;
    pickupDate: string;
    rate: number;
    distance: number;
    trailerType: string;
    weight: number;
    broker: string;
    rating: number;
  }>> {
    try {
      // Mock load board data - in real app, this would call load board APIs
      return [
        {
          id: "LB001",
          origin: "Chicago, IL",
          destination: "Denver, CO",
          pickupDate: "2025-08-22",
          rate: 2850,
          distance: 920,
          trailerType: "Dry Van",
          weight: 18500,
          broker: "Freight Solutions Inc",
          rating: 4.7
        },
        {
          id: "LB002",
          origin: "Dallas, TX",
          destination: "Phoenix, AZ",
          pickupDate: "2025-08-23",
          rate: 1950,
          distance: 650,
          trailerType: "Flatbed",
          weight: 22000,
          broker: "Logistics Pro",
          rating: 4.5
        }
      ];
    } catch (error) {
      console.error('Failed to search loads:', error);
      throw new Error('Failed to search available loads');
    }
  }
}

// Export service instances
export const gpsTrackingService = new GPSTrackingService();
export const routeOptimizationService = new RouteOptimizationService();
export const logisticsAPIService = new LogisticsAPIService();