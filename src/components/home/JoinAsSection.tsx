import React from 'react';
import { ArrowRight } from 'lucide-react';

const JoinAsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto  w-[90%]">
        <div className="flex flex-col md:flex-row justify-between ">
          {/* Restaurant Partner Section */}
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Got a Restaurant? Become a Partner
            </h2>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Get your food featured</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Enjoy an exposure to a huge customer base</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Increase your sales through collaborative campaigns</span>
              </li>
            </ul>
            
            <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors duration-300">
              Join as a Partner
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Delivery Partner Section */}
          <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Got a Bike or a Cycle? Earn with us
            </h2>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">The freedom to give the service whenever you want</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Earn extra with daily quests and special offers</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Always get your payment right on time!</span>
              </li>
            </ul>
            
            <button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors duration-300">
              Become a Foodman
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
        <div className='border-t-1 border-gray-200 mt-10'></div>
      </div>
    </section>
  );
};

export default JoinAsSection;