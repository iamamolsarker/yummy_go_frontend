import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import RestaurantFilters from '../../components/restaurants/RestaurantFilters';
import RestaurantCard from '../../components/restaurants/RestaurantCard';
import DealsCarousel from '../../components/restaurants/DealsCarousel';
import CuisineSelector from '../../components/restaurants/CuisineSelector';
import useRestaurants from '../../hooks/useRestaurants';
import type { RestaurantFilters as FilterType } from '../../types/restaurant';

export default function Restaurants() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState<string>('');
    const [filters, setFilters] = useState<FilterType>({
        sortBy: 'default',
        mealType: [],
        priceRange: [0, 2000],
        deliveryTime: [0, 100],
        cuisines: [],
        searchQuery: '',
    });

    // Fetch restaurants with TanStack Query
    const { data: restaurants = [], isLoading, error } = useRestaurants({
        search: searchQuery,
        // status: 'active', // Status filter remove kore shob restaurant dekhabo
    });

    // Filter and sort restaurants based on filters
    const filteredRestaurants = useMemo(() => {
        let filtered = [...restaurants];

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(
                (r) =>
                    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    r.cuisine_types.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Apply cuisine filter
        if (filters.cuisines.length > 0 || selectedCuisine) {
            const cuisinesToFilter = selectedCuisine
                ? [selectedCuisine, ...filters.cuisines]
                : filters.cuisines;
            filtered = filtered.filter((r) =>
                r.cuisine_types.some((c) => cuisinesToFilter.includes(c))
            );
        }

        // Apply price range filter (based on delivery fee)
        filtered = filtered.filter(
            (r) =>
                r.delivery_fee >= filters.priceRange[0] &&
                r.delivery_fee <= filters.priceRange[1]
        );

        // Apply delivery time filter
        filtered = filtered.filter(
            (r) =>
                r.delivery_time.max >= filters.deliveryTime[0] &&
                r.delivery_time.min <= filters.deliveryTime[1]
        );

        // Apply sorting
        switch (filters.sortBy) {
            case 'top_reviewed':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'top_selling':
                filtered.sort((a, b) => b.total_ratings - a.total_ratings);
                break;
            case 'distance':
                // Would need geolocation to implement properly
                break;
            default:
                break;
        }

        return filtered;
    }, [restaurants, searchQuery, filters, selectedCuisine]);

    const handleFilterChange = (newFilters: FilterType) => {
        setFilters(newFilters);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleCuisineSelect = (cuisine: string) => {
        setSelectedCuisine(cuisine === selectedCuisine ? '' : cuisine);
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Error loading restaurants</h2>
                    <p className="text-gray-600">Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Sidebar - Filters */}
                    <aside className="lg:col-span-1 h-fit sticky top-4">
                        <RestaurantFilters filters={filters} onFilterChange={handleFilterChange} />
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        {/* Search Bar */}
                        <div className="relative mb-8">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-text" size={20} />
                            <input
                                type="text"
                                placeholder="Search for restaurants, cuisines, and dishes..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-12 pr-4 py-3 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition"
                            />
                        </div>

                        {/* Daily Deals Carousel */}
                        <DealsCarousel />

                        {/* Cuisine Selector */}
                        <CuisineSelector
                            selectedCuisine={selectedCuisine}
                            onSelectCuisine={handleCuisineSelect}
                        />

                        {/* Restaurants Section */}
                        <section>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-dark-title">All Restaurants</h2>
                                <p className="text-gray-text">
                                    {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
                                </p>
                            </div>

                            {/* Loading State */}
                            {isLoading && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {[1, 2, 3, 4, 5, 6].map((n) => (
                                        <div key={n} className="bg-white rounded-xl overflow-hidden shadow-sm">
                                            <div className="h-48 bg-gray-200 animate-pulse"></div>
                                            <div className="p-4 space-y-3">
                                                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                                                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Restaurants Grid */}
                            {!isLoading && filteredRestaurants.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredRestaurants.map((restaurant) => (
                                        <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                                    ))}
                                </div>
                            )}

                            {/* Empty State */}
                            {!isLoading && filteredRestaurants.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🍽️</div>
                                    <h3 className="text-2xl font-bold text-dark-title mb-2">No restaurants found</h3>
                                    <p className="text-gray-text mb-4">
                                        {restaurants.length === 0 
                                            ? 'No restaurants available in the database yet. Please add some restaurants from the admin panel.'
                                            : 'Try adjusting your filters or search query'}
                                    </p>
                                    {restaurants.length === 0 && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                                            <p className="text-sm text-blue-800">
                                                💡 <strong>Tip:</strong> Check browser console (F12) for API response details
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}