import React from 'react';
import { Truck, Building2 } from 'lucide-react';
import { UserType } from '../App';

interface UserTypeSelectorProps {
  onSelectUserType: (type: UserType) => void;
}

export const UserTypeSelector: React.FC<UserTypeSelectorProps> = ({ onSelectUserType }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">FairFreight</h1>
          <p className="text-xl text-gray-600">Modern freight management and bidding platform</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <button
            onClick={() => onSelectUserType('shipper')}
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-200 transition-colors">
                <Building2 className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">I'm a Shipper</h2>
              <p className="text-gray-600 leading-relaxed">
                I need to transport goods and want to find reliable carriers at fair prices. 
                I'll post loads and manage bids from my office.
              </p>
              <div className="mt-6 px-6 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                Web Dashboard
              </div>
            </div>
          </button>

          <button
            onClick={() => onSelectUserType('driver')}
            className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-200"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                <Truck className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">I'm a Driver</h2>
              <p className="text-gray-600 leading-relaxed">
                I drive trucks and need to see my assigned jobs, navigate efficiently, 
                and update delivery status on the go.
              </p>
              <div className="mt-6 px-6 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                Mobile App
              </div>
            </div>
          </button>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Choose your role to access the appropriate interface
          </p>
        </div>
      </div>
    </div>
  );
};