import React from 'react';
import { ChevronRight, Home, History, MapPin, Clock, Package, RefreshCw } from 'lucide-react';
import { Job } from './DriverApp';

interface DriverHomeProps {
  jobs: Job[];
  isOnline: boolean;
  loading: boolean;
  onToggleOnline: () => void;
  onStartJob: (job: Job) => void;
  onRefresh: () => void;
}

export const DriverHome: React.FC<DriverHomeProps> = ({ 
  jobs, 
  isOnline, 
  loading,
  onToggleOnline, 
  onStartJob,
  onRefresh
}) => {
  const currentJob = jobs.find(job => ['assigned', 'en-route-pickup', 'at-pickup', 'picked-up', 'en-route-delivery', 'at-delivery'].includes(job.status));
  const upcomingJobs = jobs.filter(job => job !== currentJob && job.status === 'assigned');

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Hi, David</h1>
            <p className="text-sm text-gray-600">Ready to drive?</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Refresh jobs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center">
              <span className={`text-sm font-medium mr-2 ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
              <button
                onClick={onToggleOnline}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isOnline ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isOnline ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Loading your jobs...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Current Job */}
            {currentJob && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Current Job
                  </h2>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-lg text-gray-900">
                        {currentJob.pickupCity} → {currentJob.deliveryCity}
                      </span>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                      #{currentJob.id.slice(-6)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Pickup: {currentJob.pickupDate} {currentJob.pickupTime}</span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-start">
                      <Package className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <div>
                        <p>{currentJob.cargoDescription}</p>
                        <p className="text-xs text-gray-500">{currentJob.weight}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="mb-4">
                    <div className="flex items-center text-xs text-gray-600 mb-1">
                      Status: <span className="ml-1 font-medium text-blue-600">
                        {currentJob.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartJob(currentJob)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center hover:bg-blue-700 transition-colors"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Jobs */}
            {upcomingJobs.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Upcoming ({upcomingJobs.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {upcomingJobs.map((job) => (
                    <div key={job.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {job.pickupCity} → {job.deliveryCity}
                          </span>
                        </div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          #{job.id.slice(-6)}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>Pickup: {job.pickupDate}, {job.pickupTime}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.cargoDescription} • {job.weight}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!currentJob && upcomingJobs.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs assigned</h3>
                <p className="text-gray-600 text-sm mb-4">
                  {isOnline 
                    ? "You're online and ready to receive new jobs." 
                    : "Go online to start receiving job assignments."
                  }
                </p>
                <button
                  onClick={onRefresh}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Check for new jobs
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center py-2 px-4">
            <Home className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-xs text-blue-600 font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center py-2 px-4">
            <History className="w-5 h-5 text-gray-400 mb-1" />
            <span className="text-xs text-gray-400">History</span>
          </button>
        </div>
      </div>
    </div>
  );
};