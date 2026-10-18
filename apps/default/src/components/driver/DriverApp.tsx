import React, { useState, useMemo } from 'react';
import { DriverHome } from './DriverHome';
import { ActiveJob } from './ActiveJob';
import { ProofOfDelivery } from './ProofOfDelivery';
import { useApi } from '../../hooks/useApi';
import { driverJobsApi, DriverJob } from '../../services/api';

export type DriverPage = 'home' | 'active-job' | 'proof-of-delivery';

export interface Job {
  id: string;
  pickupCity: string;
  deliveryCity: string;
  pickupDate: string;
  pickupTime: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'assigned' | 'en-route-pickup' | 'at-pickup' | 'picked-up' | 'en-route-delivery' | 'at-delivery' | 'delivered';
  cargoDescription: string;
  weight: string;
}

export const DriverApp: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<DriverPage>('home');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Fetch driver jobs from API
  const { data: driverJobs, loading, error, refetch } = useApi<DriverJob[]>(
    () => driverJobsApi.getByDriverId('driver_001'), // In real app, this would come from auth
    []
  );

  // Transform API data to component format
  const jobs = useMemo(() => {
    if (!driverJobs) return [];
    
    return driverJobs.map(job => {
      const pickupDate = new Date(job.fieldValues['/attributes/@dr07']);
      
      return {
        id: job.id,
        pickupCity: job.fieldValues['/attributes/@dr03'] || 'Unknown',
        deliveryCity: job.fieldValues['/attributes/@dr04'] || 'Unknown',
        pickupDate: pickupDate.toDateString() === new Date().toDateString() ? 'Today' : pickupDate.toLocaleDateString(),
        pickupTime: pickupDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        pickupAddress: job.fieldValues['/attributes/@dr05'] || 'Unknown address',
        deliveryAddress: job.fieldValues['/attributes/@dr06'] || 'Unknown address',
        status: job.fieldValues['/attributes/@dr08'] as Job['status'] || 'assigned',
        cargoDescription: job.fieldValues['/attributes/@dr09'] || 'No description',
        weight: job.fieldValues['/attributes/@dr10'] || '0 lbs'
      };
    }).sort((a, b) => {
      // Sort by status priority (assigned/active jobs first)
      const statusPriority = {
        'assigned': 1,
        'en-route-pickup': 2,
        'at-pickup': 3,
        'picked-up': 4,
        'en-route-delivery': 5,
        'at-delivery': 6,
        'delivered': 7
      };
      return statusPriority[a.status] - statusPriority[b.status];
    });
  }, [driverJobs]);

  const handleStartJob = (job: Job) => {
    setSelectedJob(job);
    setCurrentPage('active-job');
  };

  const handleJobStatusUpdate = async (newStatus: Job['status']) => {
    if (selectedJob) {
      const updatedJob = { ...selectedJob, status: newStatus };
      setSelectedJob(updatedJob);
      
      // Update status in API
      try {
        await driverJobsApi.updateJobStatus(selectedJob.id, newStatus);
        refetch(); // Refresh the jobs list
      } catch (error) {
        console.error('Failed to update job status:', error);
      }
      
      if (newStatus === 'at-delivery') {
        setCurrentPage('proof-of-delivery');
      }
    }
  };

  const handleDeliveryComplete = async () => {
    if (selectedJob) {
      try {
        await driverJobsApi.updateJobStatus(selectedJob.id, 'delivered');
        refetch(); // Refresh the jobs list
      } catch (error) {
        console.error('Failed to complete delivery:', error);
      }
    }
    
    setCurrentPage('home');
    setSelectedJob(null);
  };

  const renderPage = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load jobs</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={refetch}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <DriverHome
            jobs={jobs}
            isOnline={isOnline}
            loading={loading}
            onToggleOnline={() => setIsOnline(!isOnline)}
            onStartJob={handleStartJob}
            onRefresh={refetch}
          />
        );
      case 'active-job':
        return selectedJob ? (
          <ActiveJob
            job={selectedJob}
            onStatusUpdate={handleJobStatusUpdate}
            onBack={() => setCurrentPage('home')}
          />
        ) : null;
      case 'proof-of-delivery':
        return selectedJob ? (
          <ProofOfDelivery
            job={selectedJob}
            onComplete={handleDeliveryComplete}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile viewport simulation */}
      <div className="max-w-sm mx-auto bg-white min-h-screen shadow-xl">
        {renderPage()}
      </div>
    </div>
  );
};