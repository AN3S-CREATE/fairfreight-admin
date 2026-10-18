import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, MapPin, Calendar, Package, FileText, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation } from '../../hooks/useApi';
import { freightLoadsApi } from '../../services/api';

interface PostLoadPageProps {
  onBack: () => void;
  onLoadPosted: () => void;
}

interface LoadData {
  pickupAddress: string;
  deliveryAddress: string;
  pickupDate: string;
  deliveryDate: string;
  cargoDescription: string;
  trailerType: string;
  weight: string;
  targetPrice: string;
}

export const PostLoadPage: React.FC<PostLoadPageProps> = ({ onBack, onLoadPosted }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loadData, setLoadData] = useState<LoadData>({
    pickupAddress: '',
    deliveryAddress: '',
    pickupDate: '',
    deliveryDate: '',
    cargoDescription: '',
    trailerType: '',
    weight: '',
    targetPrice: ''
  });

  // API mutations
  const createLoadMutation = useMutation(freightLoadsApi.create);
  const postNotificationMutation = useMutation(freightLoadsApi.postLoadNotification);

  const updateLoadData = (field: keyof LoadData, value: string) => {
    setLoadData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Create the load in the database
      const loadTitle = `${getLocationName(loadData.pickupAddress)} to ${getLocationName(loadData.deliveryAddress)} Shipment`;
      
      const createResult = await createLoadMutation.mutate({
        title: loadTitle,
        originAddress: loadData.pickupAddress,
        destinationAddress: loadData.deliveryAddress,
        pickupDate: new Date(loadData.pickupDate).toISOString(),
        deliveryDate: new Date(loadData.deliveryDate).toISOString(),
        cargoDescription: loadData.cargoDescription,
        trailerType: loadData.trailerType,
        weight: parseInt(loadData.weight),
        status: 'pending',
        targetPrice: parseFloat(loadData.targetPrice) || 0,
        shipperId: 'shipper_001' // In real app, this would come from auth
      });

      if (createResult) {
        // Trigger the notification workflow
        await postNotificationMutation.mutate({
          loadId: createResult.nodeId || 'new-load',
          origin: getLocationName(loadData.pickupAddress),
          destination: getLocationName(loadData.deliveryAddress),
          cargoDescription: loadData.cargoDescription,
          targetPrice: parseFloat(loadData.targetPrice) || 0
        });

        onLoadPosted();
      }
    } catch (error) {
      console.error('Failed to post load:', error);
    }
  };

  const getLocationName = (address: string): string => {
    return address.split(',')[0] || address;
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return loadData.pickupAddress && loadData.deliveryAddress && loadData.pickupDate && loadData.deliveryDate;
      case 2:
        return loadData.cargoDescription && loadData.trailerType && loadData.weight;
      case 3:
        return true; // Review step is always valid
      default:
        return false;
    }
  };

  const isSubmitting = createLoadMutation.loading || postNotificationMutation.loading;

  const renderProgressBar = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step <= currentStep 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'border-gray-300 text-gray-400'
            }`}>
              {step < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <span className="text-sm font-medium">{step}</span>
              )}
            </div>
            {step < 3 && (
              <div className={`w-16 h-0.5 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  const renderStepLabels = () => (
    <div className="flex justify-center mb-8">
      <div className="flex space-x-16 text-sm">
        <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
          Details
        </span>
        <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
          Cargo
        </span>
        <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-400'}>
          Review
        </span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Where is the shipment going?</h2>
        <p className="text-gray-600">Enter pickup and delivery locations with dates</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Pickup Location
          </label>
          <input
            type="text"
            value={loadData.pickupAddress}
            onChange={(e) => updateLoadData('pickupAddress', e.target.value)}
            placeholder="Enter pickup address..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Delivery Location
          </label>
          <input
            type="text"
            value={loadData.deliveryAddress}
            onChange={(e) => updateLoadData('deliveryAddress', e.target.value)}
            placeholder="Enter delivery address..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Pickup Date
          </label>
          <input
            type="date"
            value={loadData.pickupDate}
            onChange={(e) => updateLoadData('pickupDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Delivery Date
          </label>
          <input
            type="date"
            value={loadData.deliveryDate}
            onChange={(e) => updateLoadData('deliveryDate', e.target.value)}
            min={loadData.pickupDate || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your cargo</h2>
        <p className="text-gray-600">Provide details about what you're shipping</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="w-4 h-4 inline mr-1" />
            Cargo Description
          </label>
          <textarea
            value={loadData.cargoDescription}
            onChange={(e) => updateLoadData('cargoDescription', e.target.value)}
            placeholder="Describe what you're shipping..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trailer Type
            </label>
            <select
              value={loadData.trailerType}
              onChange={(e) => updateLoadData('trailerType', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select trailer type...</option>
              <option value="dry-van">Dry Van</option>
              <option value="reefer">Reefer (Refrigerated)</option>
              <option value="flatbed">Flatbed</option>
              <option value="step-deck">Step Deck</option>
              <option value="lowboy">Lowboy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Weight (lbs)
            </label>
            <input
              type="number"
              value={loadData.weight}
              onChange={(e) => updateLoadData('weight', e.target.value)}
              placeholder="Enter weight..."
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Attach Documents (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 mt-1">PDF, DOC, or images up to 10MB</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Set Pricing</h2>
        <p className="text-gray-600">Confirm your details and set your target price</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 mb-4">Load Summary</h3>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Pickup:</span>
            <p className="font-medium">{loadData.pickupAddress}</p>
            <p className="text-gray-600">{new Date(loadData.pickupDate).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-600">Delivery:</span>
            <p className="font-medium">{loadData.deliveryAddress}</p>
            <p className="text-gray-600">{new Date(loadData.deliveryDate).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="text-gray-600">Cargo:</span>
            <p className="font-medium">{loadData.cargoDescription}</p>
          </div>
          <div>
            <span className="text-gray-600">Details:</span>
            <p className="font-medium">
              {loadData.trailerType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} • {parseInt(loadData.weight).toLocaleString()} lbs
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Pricing Information</h3>
          <div className="text-right">
            <p className="text-sm text-gray-600">Suggested Market Rate</p>
            <p className="text-2xl font-bold text-blue-600">$3,250</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Your Target Price (Optional)
          </label>
          <input
            type="number"
            value={loadData.targetPrice}
            onChange={(e) => updateLoadData('targetPrice', e.target.value)}
            placeholder="Enter your target price..."
            min="0"
            step="0.01"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-600 mt-1">
            Leave blank to let carriers bid freely. Setting a target helps guide bidding.
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {(createLoadMutation.error || postNotificationMutation.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {createLoadMutation.error || postNotificationMutation.error}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              disabled={isSubmitting}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Create a New Load Shipment</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderProgressBar()}
        {renderStepLabels()}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1 || isSubmitting}
              className={`flex items-center px-6 py-2 rounded-lg font-medium ${
                currentStep === 1 || isSubmitting
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Previous
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid() || isSubmitting}
                className={`flex items-center px-6 py-2 rounded-lg font-medium ${
                  isStepValid() && !isSubmitting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Next: {currentStep === 1 ? 'Cargo' : 'Review'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-8 py-2 rounded-lg font-medium flex items-center ${
                  isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting Load...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Post for Bidding
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};