import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const JoinAsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto  w-[90%]">
        <div className="flex flex-col md:flex-row justify-between ">
          {/* Restaurant Partner Section */}
          <div className="p-6">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Got a Restaurant? Become a Partner
            </h2>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#ef451c] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Showcase your food</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#ef451c] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Reach a wide audience of hungry customers</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#ef451c] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Boost your sales with joint promotional campaigns</span>
              </li>
            </ul>

            {/* <button className="bg-[#ef451c] hover:bg-[#d63e18] text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors duration-300">
              Join as a Partner
              <ArrowRight size={20} />
            </button> */}


            <Link to="/partner-form">
              <button className="bg-[#ef451c] hover:bg-[#d63e18] text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors duration-300">
                Join as a Partner
                <ArrowRight size={20} />
              </button>
            </Link>

          </div>

          {/* Delivery Partner Section */}
          <div className="p-6">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Got a Bike or a Cycle? Earn with us
            </h2>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#ef451c] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Work on your own schedule, with complete flexibility</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#ef451c] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Unlock extra income through daily challenges and exclusive rewards</span>
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-[#ef451c] rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <span className="text-gray-600">Enjoy fast and timely payments, every single time</span>
              </li>
            </ul>

            {/* <button className="bg-[#ef451c] hover:bg-[#d63e18] text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors duration-300">
              Become a Foodman
              <ArrowRight size={20} />
            </button> */}

            <Link to="/foodman-form">
              <button className="bg-[#ef451c] hover:bg-[#d63e18] text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors duration-300">
                Become a Foodman
                <ArrowRight size={20} />
              </button>
            </Link>
          </div>
        </div>
        <div className='border-t-1 border-gray-200 mt-10'></div>
      </div>
    </section>
  );
};

export default JoinAsSection;