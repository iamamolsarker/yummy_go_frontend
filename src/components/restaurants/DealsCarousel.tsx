import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  image_url: string;
}

const DealsCarousel: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sample deals data (can be fetched from API later)
  const deals: Deal[] = [
    {
      id: '1',
      title: 'Special Biryani Deal',
      description: 'Get 10% off on all biryani orders',
      discount: 10,
      image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=250&fit=crop',
    },
    {
      id: '2',
      title: 'Pizza & Burger Combo',
      description: '15% off on pizza and burger combo',
      discount: 15,
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=250&fit=crop',
    },
    {
      id: '3',
      title: 'Chick Out',
      description: 'Special chicken deals',
      discount: 20,
      image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=250&fit=crop',
    },
    {
      id: '4',
      title: 'Up to 50% OFF',
      description: 'Limited time offer on selected items',
      discount: 50,
      image_url: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=400&h=250&fit=crop',
    },
  ];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-dark-title mb-4">Your Daily Deals</h2>
      
      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
        >
          <ChevronLeft size={20} className="text-dark-title" />
        </button>

        {/* Deals Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="flex-shrink-0 w-80 h-44 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 shadow-md relative"
            >
              <img
                src={deal.image_url}
                alt={deal.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay with deal info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
                <div className="bg-primary text-white px-3 py-1 rounded-md text-sm font-bold inline-block w-fit mb-2">
                  UP TO {deal.discount}% OFF
                </div>
                <h3 className="text-white font-bold text-lg">{deal.title}</h3>
                <p className="text-white/90 text-sm">{deal.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
        >
          <ChevronRight size={20} className="text-dark-title" />
        </button>
      </div>
    </div>
  );
};

export default DealsCarousel;
