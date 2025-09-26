import React from 'react';
// Correct import for modern React Router
import { Link } from 'react-router';
// Import framer-motion for animations
import { motion } from 'framer-motion';

const EarnCarBike: React.FC = () => {
    return (
        // A slightly off-white background for a modern look
        <section className="bg-slate-50 py-16 md:py-24 overflow-hidden">
            <div className="container mx-auto px-4 text-center">
                
                {/* --- Animated Text Content --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4 leading-tight">
                        Earn with your <span className="text-red-500">Drone</span>, <span className="text-red-500">car</span>, <span className="text-red-500">bike</span> or <span className="text-red-500">bicycle</span>
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                        Become a captain, rider or foodman on the highest earning platform!
                    </p>
                </motion.div>

                {/* --- Animated Call to Action Button --- */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                >
                    <Link to="/foodman-form">
                        <button className="bg-red-500 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all duration-300 inline-flex items-center gap-2">
                            Start Earning
                            {/* --- Arrow Icon --- */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z" />
                            </svg>
                        </button>
                    </Link>
                </motion.div>

                {/* --- Animated Illustration Image --- */}
                <motion.div 
                    className="mt-16"
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                >
                    <img
                        src="/y-go.png"
                        alt="Delivery partners with car, bike, and bicycle"
                        className="mx-auto max-w-full h-auto drop-shadow-xl"
                    />
                </motion.div>
            </div>
        </section>
    );
};

export default EarnCarBike;