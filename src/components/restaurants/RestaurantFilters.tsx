import React from 'react';
import type { RestaurantFilters as FilterType } from '../../types/restaurant';

interface RestaurantFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: FilterType) => void;
}

const RestaurantFilters: React.FC<RestaurantFiltersProps> = ({ filters, onFilterChange }) => {
  const handleSortChange = (sortBy: FilterType['sortBy']) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleMealTypeChange = (mealType: string) => {
    const newMealTypes = filters.mealType.includes(mealType)
      ? filters.mealType.filter(m => m !== mealType)
      : [...filters.mealType, mealType];
    onFilterChange({ ...filters, mealType: newMealTypes });
  };

  const handleCuisineChange = (cuisine: string) => {
    const newCuisines = filters.cuisines.includes(cuisine)
      ? filters.cuisines.filter(c => c !== cuisine)
      : [...filters.cuisines, cuisine];
    onFilterChange({ ...filters, cuisines: newCuisines });
  };

  const handlePriceRangeChange = (value: number, index: 0 | 1) => {
    const newRange: [number, number] = [...filters.priceRange];
    newRange[index] = value;
    onFilterChange({ ...filters, priceRange: newRange });
  };

  const handleDeliveryTimeChange = (value: number, index: 0 | 1) => {
    const newRange: [number, number] = [...filters.deliveryTime];
    newRange[index] = value;
    onFilterChange({ ...filters, deliveryTime: newRange });
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold text-dark-title mb-6">Filters</h2>

      {/* Sort By */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-dark-title mb-3">Sort by</h3>
        <div className="space-y-2">
          {['default', 'distance', 'top_reviewed', 'top_selling'].map((sort) => (
            <label key={sort} className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="sort"
                value={sort}
                checked={filters.sortBy === sort}
                onChange={() => handleSortChange(sort as FilterType['sortBy'])}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="ml-3 text-gray-700 group-hover:text-primary capitalize">
                {sort.replace('_', ' ')}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Meal Type */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-dark-title mb-3">Meal Type</h3>
        <div className="space-y-2">
          {['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'].map((meal) => (
            <label key={meal} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.mealType.includes(meal)}
                onChange={() => handleMealTypeChange(meal)}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="ml-3 text-gray-700 group-hover:text-primary">{meal}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-dark-title mb-3">
          Price Range ({filters.priceRange[0]} - {filters.priceRange[1]} ৳)
        </h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={filters.priceRange[0]}
            onChange={(e) => handlePriceRangeChange(Number(e.target.value), 0)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceRangeChange(Number(e.target.value), 1)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Delivery Time */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-dark-title mb-3">
          Delivery Time ({filters.deliveryTime[0]} - {filters.deliveryTime[1]} min)
        </h3>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.deliveryTime[0]}
            onChange={(e) => handleDeliveryTimeChange(Number(e.target.value), 0)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.deliveryTime[1]}
            onChange={(e) => handleDeliveryTimeChange(Number(e.target.value), 1)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Cuisines */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-dark-title mb-3">Cuisines</h3>
        <div className="space-y-2">
          {['Biryani', 'Burger', 'Pizza', 'Chicken', 'Fast Food', 'Pasta', 'Chinese', 'Dessert'].map((cuisine) => (
            <label key={cuisine} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.cuisines.includes(cuisine)}
                onChange={() => handleCuisineChange(cuisine)}
                className="w-4 h-4 text-primary rounded focus:ring-primary"
              />
              <span className="ml-3 text-gray-700 group-hover:text-primary">{cuisine}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantFilters;
