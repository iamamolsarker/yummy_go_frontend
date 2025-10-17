import React, { useMemo } from 'react';
import { X, RotateCcw, SlidersHorizontal } from 'lucide-react';
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

  const clearAllFilters = () => {
    onFilterChange({
      sortBy: 'default',
      mealType: [],
      priceRange: [0, 2000],
      deliveryTime: [0, 100],
      cuisines: [],
      searchQuery: '',
    });
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.sortBy !== 'default') count++;
    count += filters.mealType.length;
    count += filters.cuisines.length;
    if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 2000) count++;
    if (filters.deliveryTime[0] !== 0 || filters.deliveryTime[1] !== 100) count++;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-orange-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-primary" />
            <h2 className="text-xl font-bold text-dark-title">Filters</h2>
            {hasActiveFilters && (
              <span className="ml-2 px-2.5 py-0.5 bg-primary text-white text-xs font-semibold rounded-full animate-pulse">
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors group"
            >
              <RotateCcw size={16} className="group-hover:rotate-180 transition-transform duration-300" />
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">

        {/* Sort By */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-dark-title">Sort by</h3>
            {filters.sortBy !== 'default' && (
              <button
                onClick={() => handleSortChange('default')}
                className="text-xs text-primary hover:text-primary/80 font-medium"
              >
                Reset
              </button>
            )}
          </div>
          <div className="space-y-2">
            {[
              { value: 'default', label: 'Default' },
              { value: 'distance', label: 'Distance' },
              { value: 'top_reviewed', label: 'Top Reviewed' },
              { value: 'top_selling', label: 'Top Selling' },
            ].map((sort) => (
              <label
                key={sort.value}
                className={`flex items-center cursor-pointer group px-3 py-2 rounded-lg transition-all ${
                  filters.sortBy === sort.value
                    ? 'bg-primary/5 border border-primary/20'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="sort"
                  value={sort.value}
                  checked={filters.sortBy === sort.value}
                  onChange={() => handleSortChange(sort.value as FilterType['sortBy'])}
                  className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                />
                <span
                  className={`ml-3 text-sm font-medium ${
                    filters.sortBy === sort.value ? 'text-primary' : 'text-gray-700 group-hover:text-primary'
                  }`}
                >
                  {sort.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Meal Type */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-dark-title">Meal Type</h3>
            {filters.mealType.length > 0 && (
              <button
                onClick={() => onFilterChange({ ...filters, mealType: [] })}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {['Breakfast', 'Lunch', 'Evening Snacks', 'Dinner'].map((meal) => {
              const isSelected = filters.mealType.includes(meal);
              return (
                <label
                  key={meal}
                  className={`flex items-center justify-center cursor-pointer px-3 py-2.5 rounded-lg border-2 transition-all text-sm font-medium ${
                    isSelected
                      ? 'bg-primary text-white border-primary shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleMealTypeChange(meal)}
                    className="sr-only"
                  />
                  <span className="truncate">{meal}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Price Range */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-dark-title">Delivery Fee</h3>
            <span className="text-sm font-bold text-primary">
              ৳{filters.priceRange[0]} - ৳{filters.priceRange[1]}
            </span>
          </div>
          <div className="space-y-4 px-1">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={filters.priceRange[1]}
                onChange={(e) => handlePriceRangeChange(Number(e.target.value), 1)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>৳0</span>
                <span>৳2000</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Delivery Time */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-dark-title">Delivery Time</h3>
            <span className="text-sm font-bold text-primary">
              {filters.deliveryTime[0]} - {filters.deliveryTime[1]} min
            </span>
          </div>
          <div className="space-y-4 px-1">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={filters.deliveryTime[1]}
                onChange={(e) => handleDeliveryTimeChange(Number(e.target.value), 1)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0 min</span>
                <span>100 min</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100"></div>

        {/* Cuisines */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-dark-title">Cuisines</h3>
            {filters.cuisines.length > 0 && (
              <button
                onClick={() => onFilterChange({ ...filters, cuisines: [] })}
                className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
              >
                <X size={12} />
                Clear
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {['Biryani', 'Burger', 'Pizza', 'Chicken', 'Fast Food', 'Pasta', 'Chinese', 'Dessert'].map((cuisine) => {
              const isSelected = filters.cuisines.includes(cuisine);
              return (
                <label
                  key={cuisine}
                  className={`cursor-pointer px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isSelected
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCuisineChange(cuisine)}
                    className="sr-only"
                  />
                  <span>{cuisine}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer with Clear All Button */}
      {hasActiveFilters && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <button
            onClick={clearAllFilters}
            className="w-full py-3 px-4 bg-white border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-all font-semibold flex items-center justify-center gap-2 group"
          >
            <RotateCcw size={18} className="group-hover:rotate-180 transition-transform duration-300" />
            Clear All Filters ({activeFilterCount})
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantFilters;
