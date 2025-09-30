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
    <div className="group relative overflow-hidden rounded-[10px] shadow-md border border-[#3636361a] cursor-pointer">
        <img src={src} alt={alt} className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110" />
        {/* Overlay with a subtle gradient for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <p className="text-white text-[16px] uppercase tracking-widest">{category}</p>
            <h3 className="text-white text-[24px] font-bold mt-1 text-center px-2">{title}</h3>
        </div>
    </div>
);

const Gallery: React.FC = () => {
    // Gallery data with updated image URLs
    const galleryData: GalleryDataItem[] = [
        { id: 1, src: 'https://i.ibb.co/5xnSMnBH/Green-Delight.jpg', alt: 'Fresh Salad', category: 'Healthy', title: 'Green Delight' },
        { id: 2, src: 'https://i.ibb.co/DfRJn88z/Sizzling-Steak.jpg', alt: 'Grilled Steak', category: 'Main Course', title: 'Sizzling Steak' },
        { id: 3, src: 'https://i.ibb.co/60jBwSwC/Sweet-Heaven.jpg', alt: 'Fruit Tart', category: 'Dessert', title: 'Sweet Heaven' },
        { id: 4, src: 'https://i.ibb.co/bRXmZ1z1/Vegetable-Soup.jpg', alt: 'Vegetable Soup', category: 'Starter', title: 'Warm Soup' },
        { id: 5, src: 'https://i.ibb.co/4RSqxwXw/Pasta-Dish.jpg', alt: 'Pasta Dish', category: 'Italian', title: 'Classic Pasta' },
        { id: 6, src: 'https://i.ibb.co/LXSLYD3x/Lemonade.jpg', alt: 'Lemonade', category: 'Drinks', title: 'Citrus Fresh' },
    ];

    return (
        <section className="bg-gray-50 py-20">
            <div className="container mx-auto w-[90%]">
                <div className="text-center">
                    {/* Title with solid dark color */}
                    <h2 className="text-[48px] font-extrabold text-[#363636]">
                        Our Food Gallery
                    </h2>
                    {/* Paragraph with new text color and font size */}
                    <p className="mt-4 text-[16px] text-[#7c848a]">Explore the delicious dishes we have to offer.</p>
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

