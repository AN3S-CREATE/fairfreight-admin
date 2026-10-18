import React, { useState, useMemo } from 'react';
import { ArrowLeft, MapPin, Calendar, Package, Star, MessageCircle, User, CheckCircle, Clock, DollarSign, RefreshCw } from 'lucide-react';
import { useApi, useMutation } from '../../hooks/useApi';
import { freightLoadsApi, freightBidsApi, FreightLoad, FreightBid, utils } from '../../services/api';

interface BiddingPageProps {
  loadId: string;
  onBack: () => void;
}

export const BiddingPage: React.FC<BiddingPageProps> = ({ loadId, onBack }) => {
  const [selectedBid, setSelectedBid] = useState<string | null>(null);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [negotiationMessage, setNegotiationMessage] = useState('');

  // Fetch load details
  const { data: loads, loading: loadLoading, error: loadError } = useApi<FreightLoad[]>(
    () => freightLoadsApi.getAll(),
    []
  );

  // Fetch bids for this load
  const { data: bids, loading: bidsLoading, error: bidsError, refetch: refetchBids } = useApi<FreightBid[]>(
    () => freightBidsApi.getByLoadId(loadId),
    [loadId]
  );

  // Find the specific load
  const loadDetails = useMemo(() => {
    if (!loads) return null;
    const load = loads.find(l => l.id === loadId);
    if (!load) return null;

    return {
      id: load.id,
      origin: load.fieldValues['/attributes/@ld01'] || 'Unknown Origin',
      destination: load.fieldValues['/attributes/@ld02'] || 'Unknown Destination',
      pickupDate: load.fieldValues['/attributes/@ld03'],
      deliveryDate: load.fieldValues['/attributes/@ld04'],
      weight: `${load.fieldValues['/attributes/@ld07']?.toLocaleString() || 0} lbs`,
      trailerType: load.fieldValues['/attributes/@ld06']?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown',
      cargoDescription: load.fieldValues['/attributes/@ld05'] || 'No description',
      status: load.fieldValues['/attributes/@ld08'] || 'pending',
      targetPrice: load.fieldValues['/attributes/@ld09'] || 0,
      title: load.fieldValues['/text'] || 'Untitled Load'
    };
  }, [loads, loadId]);

  // Transform bids data
  const transformedBids = useMemo(() => {
    if (!bids) return [];
    
    return bids.map(bid => ({
      id: bid.id,
      carrierName: bid.fieldValues['/attributes/@bd02'] || 'Unknown Carrier',
      carrierRating: bid.fieldValues['/attributes/@bd04'] || 0,
      bidAmount: bid.fieldValues['/attributes/@bd03'] || 0,
      submittedAt: bid.fieldValues['/attributes/@bd09'] || new Date().toISOString(),
      carrierTier: bid.fieldValues['/attributes/@bd05'] || 'bronze',
      totalJobs: bid.fieldValues['/attributes/@bd06'] || 0,
      onTimeRate: Math.round((bid.fieldValues['/attributes/@bd07'] || 0) * 100),
      status: bid.fieldValues['/attributes/@bd08'] || 'pending'
    })).sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [bids]);

  const getTierColor = (tier: string) => {
    return utils.getTierColor(tier);
  };

  const handleAcceptBid = (bidId: string) => {
    // In real app, this would make API call to accept the bid
    console.log('Accepting bid:', bidId);
    alert('Bid accepted! The carrier has been notified.');
  };

  const handleCounterOffer = (bidId: string) => {
    setSelectedBid(bidId);
    setShowNegotiation(true);
  };

  const sendNegotiationMessage = () => {
    // In real app, this would send the message via API
    console.log('Sending negotiation message:', negotiationMessage);
    setNegotiationMessage('');
    setShowNegotiation(false);
    alert('Counter-offer sent to carrier!');
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loadError || bidsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load data</h3>
          <p className="text-gray-600 mb-4">{loadError || bidsError}</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loadLoading || !loadDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading load details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Load #{loadDetails.id.slice(-6)}: {loadDetails.origin.split(',')[0]} → {loadDetails.destination.split(',')[0]}
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Load Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Load Details</h2>
              
              {/* Route Map Placeholder */}
              <div className="bg-gray-100 rounded-lg h-32 mb-4 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Route Map</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${utils.getStatusColor(loadDetails.status)}`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {loadDetails.status === 'pending' ? 'Awaiting Bids' : loadDetails.status.charAt(0).toUpperCase() + loadDetails.status.slice(1)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Target Price:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {loadDetails.targetPrice > 0 ? utils.formatCurrency(loadDetails.targetPrice) : 'Open bidding'}
                  </span>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        Pickup
                      </div>
                      <p className="font-medium text-gray-900">{loadDetails.origin}</p>
                      <p className="text-sm text-gray-600">
                        {utils.formatDate(loadDetails.pickupDate)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        Delivery
                      </div>
                      <p className="font-medium text-gray-900">{loadDetails.destination}</p>
                      <p className="text-sm text-gray-600">
                        {utils.formatDate(loadDetails.deliveryDate)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Package className="w-4 h-4 mr-1" />
                        Cargo Details
                      </div>
                      <p className="font-medium text-gray-900">{loadDetails.cargoDescription}</p>
                      <p className="text-sm text-gray-600">
                        {loadDetails.trailerType} • {loadDetails.weight}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bids Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Incoming Bids ({transformedBids.length})
                  </h2>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={refetchBids}
                      className="flex items-center text-sm text-gray-600 hover:text-gray-900"
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${bidsLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    <div className="flex items-center text-sm text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Live Updates
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {bidsLoading ? (
                  <div className="p-12 text-center">
                    <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading bids...</p>
                  </div>
                ) : transformedBids.length > 0 ? (
                  transformedBids.map((bid) => (
                    <div key={bid.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{bid.carrierName}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                                  <span>{bid.carrierRating.toFixed(1)}</span>
                                </div>
                                <span>•</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTierColor(bid.carrierTier)}`}>
                                  {bid.carrierTier.charAt(0).toUpperCase() + bid.carrierTier.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="block font-medium text-gray-900">{bid.totalJobs.toLocaleString()}</span>
                              <span>Total Jobs</span>
                            </div>
                            <div>
                              <span className="block font-medium text-gray-900">{bid.onTimeRate}%</span>
                              <span>On-Time Rate</span>
                            </div>
                            <div>
                              <span className="block font-medium text-gray-900">{formatTimeAgo(bid.submittedAt)}</span>
                              <span>Submitted</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            {utils.formatCurrency(bid.bidAmount)}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleAcceptBid(bid.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleCounterOffer(bid.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                              Counter-Offer
                            </button>
                            <button className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
                              View Profile
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Waiting for bids...</h3>
                    <p className="text-gray-600">
                      Your load has been posted to the network. Carriers will start bidding soon.
                    </p>
                    <button
                      onClick={refetchBids}
                      className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Check for new bids
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Negotiation Modal */}
      {showNegotiation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Counter-Offer to {transformedBids.find(b => b.id === selectedBid)?.carrierName}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message
              </label>
              <textarea
                value={negotiationMessage}
                onChange={(e) => setNegotiationMessage(e.target.value)}
                placeholder="Hi, I'd like to discuss the pricing for this load..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNegotiation(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={sendNegotiationMessage}
                disabled={!negotiationMessage.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};