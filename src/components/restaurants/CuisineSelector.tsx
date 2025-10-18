import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Cuisine {
  id: string;
  name: string;
  image_url: string;
}

interface CuisineSelectorProps {
  selectedCuisine?: string;
  onSelectCuisine: (cuisine: string) => void;
}

const CuisineSelector: React.FC<CuisineSelectorProps> = ({ selectedCuisine, onSelectCuisine }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const cuisines: Cuisine[] = [
    {
      id: 'biryani',
      name: 'Biryani',
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=150&h=150&fit=crop',
    },
    {
      id: 'burger',
      name: 'Burger',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150&h=150&fit=crop',
    },
    {
      id: 'pizza',
      name: 'Pizza',
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=150&h=150&fit=crop',
    },
    {
      id: 'chicken',
      name: 'Chicken',
      image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=150&h=150&fit=crop',
    },
    {
      id: 'fast_food',
      name: 'Fast Food',
      image_url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=150&h=150&fit=crop',
    },
    {
      id: 'pasta',
      name: 'Pasta',
      image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=150&h=150&fit=crop',
    },
    {
      id: 'chinese',
      name: 'Chinese',
      image_url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=150&h=150&fit=crop',
    },
    {
      id: 'dessert',
      name: 'Dessert',
      image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=150&h=150&fit=crop',
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-dark-title mb-4">Favourite Cuisines</h2>
      
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-dark-title" />
        </button>

        {/* Cuisines Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {cuisines.map((cuisine) => (
            <div
              key={cuisine.id}
              onClick={() => onSelectCuisine(cuisine.name)}
              className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${
                selectedCuisine === cuisine.name ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <div
                className={`w-28 h-28 rounded-full overflow-hidden mb-2 ring-4 transition-all ${
                  selectedCuisine === cuisine.name
                    ? 'ring-primary shadow-lg'
                    : 'ring-transparent shadow-md'
                }`}
              >
                <img
                  src={cuisine.image_url}
                  alt={cuisine.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p
                className={`text-center font-semibold transition-colors ${
                  selectedCuisine === cuisine.name ? 'text-primary' : 'text-dark-title'
                }`}
              >
                {cuisine.name}
              </p>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
        >
          <ChevronRight size={20} className="text-dark-title" />
        </button>
      </div>
    </div>
  );
};

export default CuisineSelector;
