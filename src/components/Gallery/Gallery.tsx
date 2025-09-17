import React from 'react';

// Define the structure for the props of GalleryItem component.
interface GalleryItemProps {
    src: string;
    alt: string;
    category: string;
    title: string;
}

// Define the structure for each object in the gallery data array.
interface GalleryDataItem {
    id: number;
    src: string;
    alt: string;
    category: string;
    title: string;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ src, alt, category, title }) => (
    <div className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer">
        <img src={src} alt={alt} className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500 via-orange-500 to-orange-600 bg-opacity-80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <p className="text-white text-sm uppercase tracking-widest">{category}</p>
            <h3 className="text-white text-2xl font-bold mt-1 text-center px-2">{title}</h3>
        </div>
    </div>
);

const Gallery: React.FC = () => {
    const galleryData: GalleryDataItem[] = [
        { id: 1, src: 'https://placehold.co/600x400/E9967A/FFFFFF?text=Fresh+Salad', alt: 'Fresh Salad', category: 'Healthy', title: 'Green Delight' },
        { id: 2, src: 'https://placehold.co/600x400/8B4513/FFFFFF?text=Grilled+Steak', alt: 'Grilled Steak', category: 'Main Course', title: 'Sizzling Steak' },
        { id: 3, src: 'https://placehold.co/600x400/FFA07A/FFFFFF?text=Fruit+Tart', alt: 'Fruit Tart', category: 'Dessert', title: 'Sweet Heaven' },
        { id: 4, src: 'https://placehold.co/600x400/2E8B57/FFFFFF?text=Vegetable+Soup', alt: 'Vegetable Soup', category: 'Starter', title: 'Warm Soup' },
        { id: 5, src: 'https://placehold.co/600x400/D2691E/FFFFFF?text=Pasta+Dish', alt: 'Pasta Dish', category: 'Italian', title: 'Classic Pasta' },
        { id: 6, src: 'https://placehold.co/600x400/FFD700/FFFFFF?text=Lemonade', alt: 'Lemonade', category: 'Drinks', title: 'Citrus Fresh' },
    ];

    return (
        <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center">
                    <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-600 sm:text-5xl">
                        Our Food Gallery
                    </h2>
                    <p className="mt-4 text-lg text-gray-600">Explore the delicious dishes we have to offer.</p>
                </div>
                <div className="mt-16 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {galleryData.map((item) => (
                        <GalleryItem 
                            key={item.id} 
                            src={item.src} 
                            alt={item.alt} 
                            category={item.category}
                            title={item.title}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gallery;
