// Import necessary modules and icons from React and lucide-react
import React, { useState } from 'react';
import { Search, Star, Heart, Clock, ChevronRight } from 'lucide-react';

// Define the TypeScript type for a Restaurant object
type Restaurant = {
    name: string;
    cuisine: string;
    rating: number;
    reviews: string;
    likes: string;
    deliveryTime: string;
    imageUrl: string;
};

// Main component starts here
export default function Restaurants() {
    // State hooks to manage the values of various filters
    const [priceRange, setPriceRange] = useState<number>(1000);
    const [deliveryTime, setDeliveryTime] = useState<number>(60);
    const [deliveryFee, setDeliveryFee] = useState<number>(150);
    const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
    const [selectedSort, setSelectedSort] = useState<string>('Default');

    // A list of all available cuisines for the filter section
    const cuisines = [
        'Biryani', 'Burger', 'Pizza', 'Chicken', 'Fast Food',
        'Birthday Cake', 'Breakfast', 'Pasta', 'Chinese',
        'Sweets & Curd', 'Dessert', 'Bengali', 'Salad', 'Kebab'
    ];

    // Demo data for the "Daily Deals" section
    const dailyDeals = [
        { imageUrl: 'https://images.unsplash.com/photo-1565557623262-b9a35c298957?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YmlyeWFuaXx8fHx8fDE3Mjk2NjExMTA&ixlib=rb-4.0.3&q=80&w=1080', text: '25% OFF TEHARI GHAR' },
        { imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YnVyZ2VyfHx8fHx8MTcyOTY2MTEzNg&ixlib=rb-4.0.3&q=80&w=1080', text: 'SAVOR THE BEST DEAL - 50% OFF' },
        { imageUrl: 'https://images.unsplash.com/photo-1599974579605-5951d3a5a528?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZnJpZWQgY2hpY2tlbnx8fHx8fDE3Mjk2NjExNjQ&ixlib=rb-4.0.3&q=80&w=1080', text: 'UP TO 50% OFF' },
        { imageUrl: 'https://images.unsplash.com/photo-1627907222043-9c1a4d0f6e65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8c291cHx8fHx8fDE3Mjk2NjExODk&ixlib=rb-4.0.3&q=80&w=1080', text: 'SUPER SAVER SOUP' },
    ];

    // Demo data for the "Favourite Cuisines" section
    const favouriteCuisines = [
        { name: 'Biryani', imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f39791e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YmlyeWFuaXx8fHx8fDE3Mjk2NjEyMTM&ixlib=rb-4.0.3&q=80&w=1080' },
        { name: 'Burger', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YnVyZ2VyfHx8fHx8MTcyOTY2MTIyNQ&lib=rb-4.0.3&q=80&w=1080' },
        { name: 'Pizza', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8cGl6emF8fHx8fHwxNzI5NjYxMjM3&ixlib=rb-4.0.3&q=80&w=1080' },
        { name: 'Chicken', imageUrl: 'https://images.unsplash.com/photo-1606554863333-c7b4c6a3d640?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Z3JpbGxlZCBjaGlja2VufHx8fHx8MTcyOTY2MTI1MA&ixlib=rb-4.0.3&q=80&w=1080' },
        { name: 'Fast Food', imageUrl: 'https://images.unsplash.com/photo-1626082910196-162c451f893d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8ZnJpZWRjaGlja2VuLGZyaWVzfHx8fHx8MTcyOTY2MTI2Mg&ixlib=rb-4.0.3&q=80&w=1080' },
        { name: 'Birthday Cake', imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8YmlydGhkYXkgY2FrZXx8fHx8fDE3Mjk2NjEyNzU&ixlib=rb-4.0.3&q=80&w=1080' },
    ];

    // Demo data for the list of restaurants
    const restaurantsData: Restaurant[] = [
        { name: 'Dear Dhaka', cuisine: 'Snacks', rating: 4.6, reviews: '3k', likes: '46.1k', deliveryTime: '10 - 25 min', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Z3JpbGxlZCBmb29kfHx8fHx8MTcyOTY2MTM0MQ&ixlib=rb-4.0.3&q=80&w=1080' },
        { name: 'Thai Bistro', cuisine: 'Thai', rating: 3.8, reviews: '2k', likes: '44.1k', deliveryTime: '10 - 25 min', imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b70a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8dGhhaSBmb29kfHx8fHx8MTcyOTY2MTM3MA&ixlib=rb-4.0.3&q=80&w=1080' },
        { name: 'Indian Kitchen', cuisine: 'Indian', rating: 3.6, reviews: '2k', likes: '44.1k', deliveryTime: '10 - 25 min', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70b50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8aW5kaWFuIGtlYmFibHx8fHx8fDE3Mjk2NjEzODQ&ixlib=rb-4.0.3&q=80&w=1080' },
        { name: 'Pizza Paradise', cuisine: 'Pizza', rating: 4.8, reviews: '5k', likes: '52.3k', deliveryTime: '15 - 30 min', imageUrl: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8cGl6emF8fHx8fHwxNzI5NjYxMzk4&ixlib=rb-4.0.3&q=80&w=1080' },
    ];

    // Function to handle changes in the cuisine checkboxes
    const handleCuisineChange = (cuisine: string) => {
        setSelectedCuisines(prev =>
            prev.includes(cuisine)
                ? prev.filter(c => c !== cuisine) // If already selected, remove it
                : [...prev, cuisine] // If not selected, add it
        );
    };

    // Function to reset all filters to their default values
    const clearFilters = () => {
        setPriceRange(2000);
        setDeliveryTime(100);
        setDeliveryFee(150);
        setSelectedCuisines([]);
        setSelectedSort('Default');
    };

    // JSX to be rendered for the component's UI
    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <div className="container mx-auto px-4 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Left Sidebar for Filters */}
                    <aside className="lg:col-span-1 bg-white p-6 rounded-custom shadow-sm h-fit border border-custom-border">
                        <h2 className="text-24 font-bold mb-6 text-dark-title">Filters</h2>

                        {/* Sort By Filter */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3 text-16 text-dark-title">Sort by</h3>
                            <div className="space-y-2">
                                {['Default', 'Distance', 'Top Reviewed', 'Top Sellings'].map(option => (
                                    <label key={option} className="flex items-center space-x-3 cursor-pointer text-16 text-gray-text">
                                        <input type="radio" name="sort" value={option} checked={selectedSort === option} onChange={(e) => setSelectedSort(e.target.value)} className="form-radio text-primary focus:ring-primary/50" />
                                        <span>{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-16 text-dark-title">Price Range</h3>
                                <span className="text-16 font-medium text-primary">৳{priceRange}</span>
                            </div>
                            <input type="range" min="100" max="2000" step="50" value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>

                        {/* Delivery Time Filter */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-16 text-dark-title">Delivery Time</h3>
                                <span className="text-16 font-medium text-primary">{deliveryTime} min</span>
                            </div>
                            <input type="range" min="10" max="100" step="5" value={deliveryTime} onChange={(e) => setDeliveryTime(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                        </div>

                        {/* Delivery Fee Filter */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold text-16 text-dark-title">Delivery Fee</h3>
                                <span className="text-16 font-medium text-primary">
                                    {deliveryFee === 59 ? 'Free' : `Up to ৳${deliveryFee}`}
                                </span>
                            </div>
                            <input
                                type="range"
                                min="59"
                                max="750"
                                step="10"
                                value={deliveryFee}
                                onChange={(e) => setDeliveryFee(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                <span>Free</span>
                                <span>৳750</span>
                            </div>
                        </div>

                        {/* Cuisines Filter */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3 text-16 text-dark-title">Cuisines</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {cuisines.map(cuisine => (
                                    <label key={cuisine} className="flex items-center space-x-3 cursor-pointer text-16 text-gray-text">
                                        <input type="checkbox" checked={selectedCuisines.includes(cuisine)} onChange={() => handleCuisineChange(cuisine)} className="form-checkbox rounded text-primary focus:ring-primary/50" />
                                        <span>{cuisine}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-4">
                            <button onClick={clearFilters} className="w-full py-3 px-4 bg-gray-200 text-gray-text rounded-custom hover:bg-gray-300 transition-colors font-semibold text-16">Clear All</button>
                            <button className="w-full py-3 px-4 bg-primary text-white rounded-custom hover:bg-opacity-90 transition-colors font-semibold text-16">Apply</button>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="lg:col-span-3">
                        {/* Search Bar */}
                        <div className="relative mb-12">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-text" size={24} />
                            <input type="text" placeholder="Search for restaurants, cuisines, and dishes..." className="w-full pl-14 pr-4 py-4 border-2 border-custom-border bg-white rounded-custom focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition text-16 text-dark-title" />
                        </div>

                        {/* Daily Deals Section */}
                        <section className="mb-12">
                            <h2 className="text-32 font-bold mb-6 text-dark-title">Your Daily Deals</h2>
                            <div className="flex space-x-4 pb-4 overflow-x-auto">
                                {dailyDeals.map((deal, index) => (
                                    <div key={index} className="flex-shrink-0 w-72 h-40 rounded-custom overflow-hidden relative group cursor-pointer">
                                        <img src={deal.imageUrl} alt={deal.text} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                        <p className="absolute bottom-4 left-4 text-white font-bold text-24">{deal.text}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Favourite Cuisines Section */}
                        <section className="mb-12">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-32 font-bold text-dark-title">Favourite Cuisines</h2>
                                <button className="text-primary font-semibold flex items-center text-16">
                                    <span>View All</span>
                                    <ChevronRight size={24} />
                                </button>
                            </div>
                            <div className="flex space-x-6 pb-4 overflow-x-auto">
                                {favouriteCuisines.map((cuisine) => (
                                    <div key={cuisine.name} className="flex flex-col items-center space-y-2 flex-shrink-0 cursor-pointer group">
                                        <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-transparent group-hover:border-primary transition-all">
                                            <img src={cuisine.imageUrl} alt={cuisine.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <p className="font-semibold text-gray-text text-16">{cuisine.name}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Home Flavors / Restaurants List */}
                        <section>
                            <h2 className="text-32 font-bold mb-6 text-dark-title">Home Flavors 😋</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {restaurantsData.map((res) => (
                                    <div key={res.name} className="bg-white rounded-custom overflow-hidden group cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1 border border-custom-border">
                                        <div className="relative">
                                            <img src={res.imageUrl} alt={res.name} className="w-full h-48 object-cover" />
                                            <span className="absolute top-3 left-3 bg-primary text-white text-xs font-bold px-2 py-1 rounded">FOODX</span>
                                            <div className="absolute bottom-0 right-0 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-tl-custom flex items-center space-x-1.5 text-16 font-semibold text-dark-title">
                                                <Clock size={16} className="text-gray-text" />
                                                <span>{res.deliveryTime}</span>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-24 font-bold text-dark-title truncate">{res.name}</h3>
                                            <p className="text-gray-text text-16 mb-4">{res.cuisine}</p>
                                            <div className="flex items-center justify-between text-16 text-gray-text">
                                                <div className="flex items-center space-x-1">
                                                    <Star size={16} className="text-yellow-500 fill-current" />
                                                    <span className="font-bold text-dark-title">{res.rating}</span>
                                                    <span className="text-gray-400">({res.reviews})</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Heart size={16} className="text-primary" />
                                                    <span>{res.likes}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}