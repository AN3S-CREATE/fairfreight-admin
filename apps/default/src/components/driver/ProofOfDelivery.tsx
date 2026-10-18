import React, { useState, useRef } from 'react';
import { Camera, CheckCircle, User, FileText } from 'lucide-react';
import { Job } from './DriverApp';

interface ProofOfDeliveryProps {
  job: Job;
  onComplete: () => void;
}

export const ProofOfDelivery: React.FC<ProofOfDeliveryProps> = ({ job, onComplete }) => {
  const [receiverName, setReceiverName] = useState('');
  const [signature, setSignature] = useState('');
  const [photoTaken, setPhotoTaken] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleCameraClick = () => {
    // In a real app, this would open the camera
    setPhotoTaken(true);
    alert('Camera opened! Photo captured.');
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Mark that signature has been drawn
    setSignature('signature_drawn');
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    setSignature('');
  };

  const handleSubmit = () => {
    if (!receiverName.trim() || !signature || !photoTaken) {
      alert('Please complete all required fields before submitting.');
      return;
    }

    // In real app, this would upload the data to the server
    console.log('Submitting delivery proof:', {
      jobId: job.id,
      receiverName,
      signature: 'signature_data',
      photo: 'photo_data',
      timestamp: new Date().toISOString()
    });

    alert('Delivery completed successfully!');
    onComplete();
  };

  const isFormValid = receiverName.trim() && signature && photoTaken;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900">Complete Delivery</h1>
          <p className="text-sm text-gray-600">Job #{job.id}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Please have the receiver sign and take a photo of the delivered goods to complete this delivery.
          </p>
        </div>

        {/* Photo Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            <Camera className="w-4 h-4 mr-2" />
            Photo Documentation
          </h3>
          
          {!photoTaken ? (
            <button
              onClick={handleCameraClick}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            >
              <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">Launch Camera</p>
              <p className="text-xs text-gray-500 mt-1">Take photo of delivered goods</p>
            </button>
          ) : (
            <div className="relative">
              <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Photo captured</p>
                </div>
              </div>
              <button
                onClick={() => setPhotoTaken(false)}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm text-xs text-gray-600"
              >
                Retake
              </button>
            </div>
          )}
        </div>

        {/* Receiver Name */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <User className="w-4 h-4 inline mr-2" />
            Receiver's Name
          </label>
          <input
            type="text"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
            placeholder="Enter receiver's printed name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Signature Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Receiver's Signature
            </h3>
            {signature && (
              <button
                onClick={clearSignature}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="border-2 border-gray-300 rounded-lg">
            <canvas
              ref={canvasRef}
              width={300}
              height={120}
              className="w-full h-30 touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{ touchAction: 'none' }}
            />
            {!signature && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-gray-400 text-sm">Sign here</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use your finger or stylus to capture the receiver's signature
          </p>
        </div>

        {/* Delivery Details Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Delivery Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Address:</span>
              <span className="text-gray-900 text-right flex-1 ml-2">
                {job.deliveryAddress.split(',')[0]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cargo:</span>
              <span className="text-gray-900">{job.cargoDescription}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weight:</span>
              <span className="text-gray-900">{job.weight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Time:</span>
              <span className="text-gray-900">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="bg-white p-4 shadow-lg">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-colors ${
            isFormValid
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <CheckCircle className="w-5 h-5 inline mr-2" />
          SUBMIT & COMPLETE
        </button>
      </div>
    </div>
  );
};