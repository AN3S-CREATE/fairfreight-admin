import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Truck, 
  Clock, 
  CheckCircle, 
  User, 
  Bell, 
  Settings, 
  RefreshCw,
  TrendingUp,
  MapPin,
  DollarSign,
  BarChart3,
  Zap,
  AlertTriangle,
  Route,
  Fuel,
  Cloud
} from 'lucide-react';
import { useApi } from '../../hooks/useApi';
import { freightLoadsApi, FreightLoad, utils } from '../../services/api';
import { logisticsAPIService, routeOptimizationService } from '../../services/gpsTracking';

interface AdvancedDashboardProps {
  onPostNewLoad: () => void;
  onViewLoad: (loadId: string) => void;
}

interface MarketInsight {
  route: string;
  averageRate: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  volume: number;
}

interface PerformanceMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export const AdvancedDashboard: React.FC<AdvancedDashboardProps> = ({ 
  onPostNewLoad, 
  onViewLoad 
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([]);
  const [availableLoads, setAvailableLoads] = useState<any[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<any[]>([]);

  // Fetch loads from API
  const { data: loads, loading, error, refetch } = useApi<FreightLoad[]>(
    () => freightLoadsApi.getAll(),
    []
  );

  // Transform API data to component format
  const transformedLoads = useMemo(() => {
    if (!loads) return [];
    
    return loads.map(load => ({
      id: load.id,
      origin: load.fieldValues['/attributes/@ld01']?.split(',')[0] || 'Unknown',
      destination: load.fieldValues['/attributes/@ld02']?.split(',')[0] || 'Unknown',
      status: load.fieldValues['/attributes/@ld08'] as 'active' | 'pending' | 'completed',
      pickupDate: load.fieldValues['/attributes/@ld03'],
      weight: `${load.fieldValues['/attributes/@ld07']?.toLocaleString() || 0} lbs`,
      title: load.fieldValues['/text'],
      cargoDescription: load.fieldValues['/attributes/@ld05'],
      targetPrice: load.fieldValues['/attributes/@ld09'],
      fullOrigin: load.fieldValues['/attributes/@ld01'],
      fullDestination: load.fieldValues['/attributes/@ld02']
    }));
  }, [loads]);

  // Filter loads based on active tab and search query
  const filteredLoads = useMemo(() => {
    return transformedLoads.filter(load => {
      const matchesTab = load.status === activeTab;
      const matchesSearch = searchQuery === '' || 
        load.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        load.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesTab && matchesSearch;
    });
  }, [transformedLoads, activeTab, searchQuery]);

  // Calculate advanced KPIs
  const advancedKPIs = useMemo(() => {
    const activeCount = transformedLoads.filter(load => load.status === 'active').length;
    const pendingCount = transformedLoads.filter(load => load.status === 'pending').length;
    const completedCount = transformedLoads.filter(load => load.status === 'completed').length;
    
    const totalRevenue = transformedLoads
      .filter(load => load.status === 'completed')
      .reduce((sum, load) => sum + (load.targetPrice || 0), 0);
    
    const avgRate = completedCount > 0 ? totalRevenue / completedCount : 0;
    
    const onTimeDeliveries = Math.round(completedCount * 0.94); // Mock 94% on-time rate
    const onTimeRate = completedCount > 0 ? (onTimeDeliveries / completedCount) * 100 : 0;

    return {
      active: activeCount,
      pending: pendingCount,
      completed: completedCount,
      totalRevenue,
      avgRate,
      onTimeRate,
      costPerMile: 1.85 // Mock cost per mile
    };
  }, [transformedLoads]);

  // Performance metrics
  const performanceMetrics: PerformanceMetric[] = [
    {
      label: 'Average Rate',
      value: utils.formatCurrency(advancedKPIs.avgRate),
      change: 5.2,
      trend: 'up',
      icon: <DollarSign className="w-4 h-4" />
    },
    {
      label: 'On-Time Rate',
      value: `${advancedKPIs.onTimeRate.toFixed(1)}%`,
      change: 2.1,
      trend: 'up',
      icon: <Clock className="w-4 h-4" />
    },
    {
      label: 'Cost per Mile',
      value: `$${advancedKPIs.costPerMile.toFixed(2)}`,
      change: -3.5,
      trend: 'down',
      icon: <Route className="w-4 h-4" />
    },
    {
      label: 'Load Utilization',
      value: '87.3%',
      change: 1.8,
      trend: 'up',
      icon: <BarChart3 className="w-4 h-4" />
    }
  ];

  // Fetch market insights and external data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Mock market insights
        setMarketInsights([
          {
            route: 'Chicago → LA',
            averageRate: 3250,
            trend: 'up',
            change: 8.5,
            volume: 145
          },
          {
            route: 'Dallas → Denver',
            averageRate: 2850,
            trend: 'down',
            change: -3.2,
            volume: 89
          },
          {
            route: 'Miami → Atlanta',
            averageRate: 1950,
            trend: 'stable',
            change: 0.8,
            volume: 67
          }
        ]);

        // Fetch available loads from load boards
        const loads = await logisticsAPIService.searchAvailableLoads({
          radius: 500,
          minRate: 2000
        });
        setAvailableLoads(loads.slice(0, 5));

        // Mock weather alerts
        setWeatherAlerts([
          {
            type: 'severe_weather',
            location: 'I-80 through Wyoming',
            description: 'Winter storm warning - expect delays',
            severity: 'high',
            validUntil: '2025-08-22T18:00:00Z'
          }
        ]);
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', change: number) => {
    if (trend === 'stable') return 'text-gray-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">FairFreight</h1>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Advanced
              </span>
              <nav className="ml-10 flex space-x-8">
                <a href="#" className="text-blue-600 font-medium">Dashboard</a>
                <a href="#" className="text-gray-500 hover:text-gray-700">Analytics</a>
                <a href="#" className="text-gray-500 hover:text-gray-700">Market Intel</a>
                <a href="#" className="text-gray-500 hover:text-gray-700">Billing</a>
                <a href="#" className="text-gray-500 hover:text-gray-700">Support</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={refetch}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="w-5 h-5" />
                {weatherAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <button className="flex items-center space-x-2 p-2 text-gray-700 hover:text-gray-900">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">John Smith</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Post New Load Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Advanced Dashboard</h2>
            <p className="text-gray-600 mt-1">Real-time logistics intelligence and optimization</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
            <button
              onClick={onPostNewLoad}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Post a New Load</span>
            </button>
          </div>
        </div>

        {/* Weather Alerts */}
        {weatherAlerts.length > 0 && (
          <div className="mb-6">
            {weatherAlerts.map((alert, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800">{alert.description}</h4>
                  <p className="text-sm text-red-600">{alert.location}</p>
                </div>
                <span className="text-xs text-red-600">
                  Until {new Date(alert.validUntil).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : advancedKPIs.active}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Awaiting Bids</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : advancedKPIs.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered This Month</p>
                <p className="text-2xl font-bold text-gray-900">{loading ? '...' : advancedKPIs.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : utils.formatCurrency(advancedKPIs.totalRevenue)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {metric.icon}
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-600">{metric.label}</p>
                    <p className="text-lg font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-xs font-medium ${getTrendColor(metric.trend, metric.change)}`}>
                    {Math.abs(metric.change)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Market Insights */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Market Insights
            </h3>
            <div className="space-y-4">
              {marketInsights.map((insight, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{insight.route}</p>
                    <p className="text-sm text-gray-600">{insight.volume} loads</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{utils.formatCurrency(insight.averageRate)}</p>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(insight.trend)}
                      <span className={`text-xs font-medium ${getTrendColor(insight.trend, insight.change)}`}>
                        {Math.abs(insight.change)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Loads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Load Board Opportunities
            </h3>
            <div className="space-y-3">
              {availableLoads.map((load, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-gray-900">{load.origin} → {load.destination}</p>
                      <p className="text-sm text-gray-600">{load.trailerType} • {load.weight.toLocaleString()} lbs</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{utils.formatCurrency(load.rate)}</p>
                      <p className="text-xs text-gray-600">{load.distance} mi</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>{load.broker} • {load.rating}★</span>
                    <span>Pickup: {new Date(load.pickupDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <div className="flex items-center">
                  <Route className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">Optimize Routes</p>
                    <p className="text-sm text-blue-700">AI-powered route optimization</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center">
                  <BarChart3 className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-green-900">Performance Report</p>
                    <p className="text-sm text-green-700">Generate monthly analytics</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <div className="flex items-center">
                  <Fuel className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <p className="font-medium text-purple-900">Fuel Optimization</p>
                    <p className="text-sm text-purple-700">Find best fuel prices</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Shipments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">My Shipments</h3>
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search loads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-1">
              {(['active', 'pending', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Table Content */}
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading shipments...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Load Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Schedule
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pricing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLoads.map((load) => (
                    <tr key={load.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">#{load.id.slice(-6)}</div>
                          <div className="text-sm text-gray-500">{load.weight}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          <div>
                            <div className="text-sm text-gray-900">{load.origin} → {load.destination}</div>
                            <div className="text-sm text-gray-500">{load.cargoDescription}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {utils.formatDate(load.pickupDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {load.targetPrice ? utils.formatCurrency(load.targetPrice) : 'Open bidding'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${utils.getStatusColor(load.status)}`}>
                          <span>{load.status.charAt(0).toUpperCase() + load.status.slice(1)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => onViewLoad(load.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredLoads.length === 0 && (
            <div className="text-center py-12">
              <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? `No ${activeTab} shipments found matching "${searchQuery}"` : `No ${activeTab} shipments found`}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};