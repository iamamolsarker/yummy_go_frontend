import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#fdfaf9] text-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Top section with description */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-orange-500 mb-4">Yummy Go</h2>
          <p className="max-w-3xl mx-auto text-lg font-medium">
            Order food from the best restaurants and shops with Yummy Go
          </p>
          <p className="max-w-4xl mx-auto mt-4 text-gray-600">
            Bangladesh's leading food delivery app with over 5000+ restaurants along with amazing deals and services. 
            Discover a world of culinary delights and flavorful experiences with Yummy Go, your ultimate food destination.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-10">
          {/* Links grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/*Company column */}
            <div>
              <h3 className="font-semibold mb-4 text-lg text-gray-900">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-orange-500 transition-colors">About us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Contact us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">How Yummy Go works</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Helps & Support</a></li>
              </ul>
            </div>

            {/* service column */}
            <div>
              <h3 className="font-semibold mb-4 text-lg text-gray-900">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Food delivery</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Pick-up</a></li>
                {/* <li><a href="#" className="hover:text-orange-500 transition-colors">Dine-in</a></li> */}
                {/* <li><a href="#" className="hover:text-orange-500 transition-colors">Flowers delivery</a></li> */}
                <li><a href="#" className="hover:text-orange-500 transition-colors">Super Yummy subscription</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Yummy deals</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Reward programs</a></li>
              </ul>
            </div>

            
            <div>
              <h3 className="font-semibold mb-4 text-lg text-gray-900">Partnership & Policies</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-orange-500 transition-colors">Partner with us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Ride with us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Terms & conditions</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Refund & cancellation</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Privacy policy</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Rider Privacy policy</a></li>
                <li><a href="#" className="hover:text-orange-500 transition-colors">Partner Privacy policy</a></li>
              </ul>
            </div>

            {/* Contact information */}
            <div>
              <h3 className="font-semibold mb-4 text-lg text-gray-900">Contact Information</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <FaMapMarkerAlt className="text-orange-500 mt-1 mr-3" />
                  <span>Yummy Go Limited, Dhaka, Bangladesh</span>
                </li>
                <li className="flex items-center">
                  <FaPhone className="text-orange-500 mr-3" />
                  <span>+880 1919191919</span>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="text-orange-500 mr-3" />
                  <span>team.codewarriors25@gmail.com</span>
                </li>
              </ul>
              
              <h3 className="font-semibold mb-4 mt-6 text-lg text-gray-900">Follow us</h3>
              <div className="flex space-x-4">
                <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
                  <FaFacebookF />
                </a>
                <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
                  <FaTwitter />
                </a>
                <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
                  <FaInstagram />
                </a>
                <a href="#" className="bg-gray-100 p-3 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright section */}
          <div className="border-t border-gray-200 pt-6 text-center text-gray-600">
            <p>© Copyright 2025 Yummy Go Limited. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;