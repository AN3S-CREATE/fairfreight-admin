// API service for FairFreight application
const API_BASE_URL = '/api/taskade';

// Project IDs
export const PROJECT_IDS = {
  FREIGHT_LOADS: '5br1JLTYKPxodJkB',
  FREIGHT_BIDS: 'Xn1VeZmKfMwPS9Rq',
  DRIVER_JOBS: 'Z5iKTZdEi7wncUpw'
};

// Webhook endpoints
export const WEBHOOK_ENDPOINTS = {
  NEW_LOAD_POSTED: '/webhooks/01K36RTW3G333TPA1K9QXSDCRV/run',
  BID_SUBMISSION: '/webhooks/01K36RW458XRZTZ44WEQP83Q2A/run'
};

// Types
export interface FreightLoad {
  id: string;
  fieldValues: {
    '/text': string;
    '/attributes/@ld01': string; // Origin Address
    '/attributes/@ld02': string; // Destination Address
    '/attributes/@ld03': string; // Pickup Date
    '/attributes/@ld04': string; // Delivery Date
    '/attributes/@ld05': string; // Cargo Description
    '/attributes/@ld06': string; // Trailer Type
    '/attributes/@ld07': number; // Weight (lbs)
    '/attributes/@ld08': string; // Status
    '/attributes/@ld09': number; // Target Price
    '/attributes/@ld10': string; // Shipper ID
  };
}

export interface FreightBid {
  id: string;
  fieldValues: {
    '/text': string;
    '/attributes/@bd01': string; // Load ID
    '/attributes/@bd02': string; // Carrier Name
    '/attributes/@bd03': number; // Bid Amount
    '/attributes/@bd04': number; // Carrier Rating
    '/attributes/@bd05': string; // Carrier Tier
    '/attributes/@bd06': number; // Total Jobs
    '/attributes/@bd07': number; // On-Time Rate (%)
    '/attributes/@bd08': string; // Bid Status
    '/attributes/@bd09': string; // Submitted At
    '/attributes/@bd10': string; // Carrier ID
  };
}

export interface DriverJob {
  id: string;
  fieldValues: {
    '/text': string;
    '/attributes/@dr01': string; // Driver Name
    '/attributes/@dr02': string; // Load ID
    '/attributes/@dr03': string; // Pickup City
    '/attributes/@dr04': string; // Delivery City
    '/attributes/@dr05': string; // Pickup Address
    '/attributes/@dr06': string; // Delivery Address
    '/attributes/@dr07': string; // Pickup Date
    '/attributes/@dr08': string; // Job Status
    '/attributes/@dr09': string; // Cargo Description
    '/attributes/@dr10': string; // Weight
    '/attributes/@dr11': string; // Driver ID
  };
}

// API Response types
interface ApiResponse<T> {
  ok: boolean;
  payload: {
    nodes: T[];
  };
}

// Generic API functions
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Freight Loads API
export const freightLoadsApi = {
  async getAll(): Promise<FreightLoad[]> {
    const response = await apiRequest<ApiResponse<FreightLoad>>(`/projects/${PROJECT_IDS.FREIGHT_LOADS}/nodes`);
    return response.payload.nodes;
  },

  async create(loadData: {
    title: string;
    originAddress: string;
    destinationAddress: string;
    pickupDate: string;
    deliveryDate: string;
    cargoDescription: string;
    trailerType: string;
    weight: number;
    status: string;
    targetPrice: number;
    shipperId: string;
  }): Promise<any> {
    const payload = {
      '/text': loadData.title,
      '/attributes/@ld01': loadData.originAddress,
      '/attributes/@ld02': loadData.destinationAddress,
      '/attributes/@ld03': loadData.pickupDate,
      '/attributes/@ld04': loadData.deliveryDate,
      '/attributes/@ld05': loadData.cargoDescription,
      '/attributes/@ld06': loadData.trailerType,
      '/attributes/@ld07': loadData.weight,
      '/attributes/@ld08': loadData.status,
      '/attributes/@ld09': loadData.targetPrice,
      '/attributes/@ld10': loadData.shipperId,
    };

    return apiRequest(`/projects/${PROJECT_IDS.FREIGHT_LOADS}/nodes`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async postLoadNotification(loadData: {
    loadId: string;
    origin: string;
    destination: string;
    cargoDescription: string;
    targetPrice: number;
  }): Promise<any> {
    return apiRequest(WEBHOOK_ENDPOINTS.NEW_LOAD_POSTED, {
      method: 'POST',
      body: JSON.stringify(loadData),
    });
  }
};

// Freight Bids API
export const freightBidsApi = {
  async getAll(): Promise<FreightBid[]> {
    const response = await apiRequest<ApiResponse<FreightBid>>(`/projects/${PROJECT_IDS.FREIGHT_BIDS}/nodes`);
    return response.payload.nodes;
  },

  async getByLoadId(loadId: string): Promise<FreightBid[]> {
    const allBids = await this.getAll();
    return allBids.filter(bid => bid.fieldValues['/attributes/@bd01'] === loadId);
  },

  async submitBid(bidData: {
    loadId: string;
    carrierName: string;
    bidAmount: number;
    carrierRating: number;
    carrierTier: string;
  }): Promise<any> {
    return apiRequest(WEBHOOK_ENDPOINTS.BID_SUBMISSION, {
      method: 'POST',
      body: JSON.stringify(bidData),
    });
  }
};

// Driver Jobs API
export const driverJobsApi = {
  async getAll(): Promise<DriverJob[]> {
    const response = await apiRequest<ApiResponse<DriverJob>>(`/projects/${PROJECT_IDS.DRIVER_JOBS}/nodes`);
    return response.payload.nodes;
  },

  async getByDriverId(driverId: string): Promise<DriverJob[]> {
    const allJobs = await this.getAll();
    return allJobs.filter(job => job.fieldValues['/attributes/@dr11'] === driverId);
  },

  async updateJobStatus(jobId: string, status: string): Promise<any> {
    // Note: This would require a PATCH endpoint or update workflow
    // For now, we'll simulate the update
    console.log(`Updating job ${jobId} status to ${status}`);
    return Promise.resolve({ success: true });
  }
};

// Utility functions
export const utils = {
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  },

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString();
  },

  getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'active':
        return 'text-blue-600 bg-blue-50';
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  },

  getTierColor(tier: string): string {
    switch (tier.toLowerCase()) {
      case 'gold':
        return 'text-yellow-600 bg-yellow-100';
      case 'silver':
        return 'text-gray-600 bg-gray-100';
      case 'bronze':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
};