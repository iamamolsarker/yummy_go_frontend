// NOTE: This component is completed by Abrar Shazid. 
// Reach out to me if any problem occurs. 
// (For development use only, remove before production)

import React from 'react';

import deliveryImg from "../../assets/home/delivery.be81f682.svg"
import trackingImg from "../../assets/home/location.bf59f976.svg"
import favImg from "../../assets/home/mobile.73da0fee.svg"

const Feature:React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose Us</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the best food delivery service with features designed for your convenience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <img 
                  src={deliveryImg}
                  alt="Fast Delivery" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">Super Fast Delivery</h3>
            <p className="text-gray-600 text-center">
              Faster than your cravings can blink. Experience the super-fast delivery and get fresh food.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <img 
                  src={trackingImg}
                  alt="Order Tracking" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">Live Order Tracking</h3>
            <p className="text-gray-600 text-center">
              Track your order while it is delivered to your doorstep from the restaurant.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <img 
                  src={favImg}
                  alt="Restaurants" 
                  className="w-12 h-12 object-contain"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 text-center mb-4">Your Favorite Restaurants</h3>
            <p className="text-gray-600 text-center">
              Find the best and nearest top your favorite restaurants from your selected location.
            </p>
          </div>
        </div>

        {/* Activation Notice */}

      </div>
    </section>
  );
};

export default Feature;