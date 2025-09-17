import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// Define the structure for a single testimonial object for type safety.
interface Testimonial {
    name: string;
    title: string;
    text: string;
    avatar: string;
}

const testimonials: Testimonial[] = [
    {
        name: 'Awlad Hossin',
        title: 'Senior Product Designer',
        text: 'A posture corrector works by providing support and gentle alignment to your shoulders, back, and spine, encouraging you to maintain proper posture throughout the day.',
        avatar: 'https://avatar.iran.liara.run/public/boy?username=AwladHossin'
    },
    {
        name: 'Rasel Ahamed',
        title: 'CTO',
        text: 'A posture corrector helps you maintain your posture during long work hours and reduces back pain effectively.',
        avatar: 'https://avatar.iran.liara.run/public/boy?username=RaselAhamed'
    },
    {
        name: 'Nasir Uddin',
        title: 'CEO',
        text: 'Wearing a corrector regularly improved my posture and relieved my lower back strain.',
        avatar: 'https://avatar.iran.liara.run/public/boy?username=NasirUddin'
    },
    {
        name: 'Tanvir Ahmed',
        title: 'Lead Engineer',
        text: 'Helps align posture while working from home. Great value!',
        avatar: 'https://avatar.iran.liara.run/public/boy?username=TanvirAhmed'
    },
    {
        name: 'Shahidul Islam',
        title: 'Fitness Coach',
        text: 'Perfect for gym-goers who need extra back support.',
        avatar: 'https://avatar.iran.liara.run/public/boy?username=ShahidulIslam'
    },
    {
        name: 'Samiul Alam',
        title: 'Data Analyst',
        text: 'Very helpful in managing my spinal alignment throughout my day.',
        avatar: 'https://avatar.iran.liara.run/public/boy?username=SamiulAlam'
    },
    {
        name: 'Imran Kabir',
        title: 'Digital Marketer',
        text: 'It gave me better posture in just a week!',
        avatar: 'https://avatar.iran.liara.run/public/boy?username=ImranKabir'
    },
];

const OurCustomersSaying: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const goToNext = useCallback(() => {
        setCurrentIndex(prevIndex => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
    }, []);

    const goToPrevious = () => {
        setCurrentIndex(prevIndex => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
    };

    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    }

    // This effect handles the autoplay functionality of the slider.
    useEffect(() => {
        // Pause autoplay when the user hovers over the slider.
        if (isHovered) return;

        const intervalId = setInterval(goToNext, 5000); // Switch slide every 5 seconds.

        // Clean up the interval when the component unmounts or when isHovered changes.
        return () => clearInterval(intervalId);
    }, [isHovered, goToNext]);

    return (
        <div className="bg-orange-50 font-sans py-16 px-4 md:px-8 text-center overflow-hidden">

            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-orange-500 flex items-center justify-center text-white">
                <Quote size={32} />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-orange-900 mb-4">
                What our customers are saying
            </h2>
            <p className="text-gray-700 max-w-2xl mx-auto mb-12">
                Enhance posture, mobility, and well-being effortlessly with Posture Pro. Achieve proper alignment, reduce pain, and strengthen your body with ease!
            </p>

            <div
                className="relative max-w-4xl mx-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="w-full h-[350px] relative">
                    {testimonials.map((item, idx) => {
                        // Determine CSS classes for each slide's position and animation.
                        let position = 'opacity-0 scale-75 transform -translate-x-full'; // Default (hidden on the left)
                        if (idx === currentIndex) {
                            position = 'opacity-100 scale-100 z-10 transform translate-x-0'; // Active (center)
                        } else if (idx === (currentIndex - 1 + testimonials.length) % testimonials.length) {
                            position = 'opacity-40 scale-90 z-0 transform -translate-x-1/2'; // Previous (left adjacent)
                        } else if (idx === (currentIndex + 1) % testimonials.length) {
                            position = 'opacity-40 scale-90 z-0 transform translate-x-1/2'; // Next (right adjacent)
                        }

                        // This logic ensures only the active and its immediate adjacent slides are visible.
                        const isVisible = Math.abs(currentIndex - idx) < 2 || (currentIndex === 0 && idx === testimonials.length - 1) || (currentIndex === testimonials.length - 1 && idx === 0);

                        return (
                            <div
                                key={idx}
                                className={`absolute top-0 left-1/2 -ml-[170px] w-[340px] h-[300px] bg-white rounded-2xl shadow-xl p-6 text-left flex flex-col justify-between transition-all duration-500 ease-in-out ${isVisible ? position : 'opacity-0 scale-75'}`}
                            >
                                <div>
                                    <p className="text-orange-500 text-5xl font-serif leading-none mb-2">“</p>
                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.text}</p>
                                </div>
                                <div className="border-t border-dashed border-gray-200 pt-4 flex items-center gap-4">
                                    <img
                                        src={item.avatar}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-full bg-gray-100 shrink-0 object-cover border-2 border-orange-100"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://avatar.iran.liara.run/public/boy'; }}
                                    />
                                    <div>
                                        <h4 className="text-orange-900 font-bold leading-tight">{item.name}</h4>
                                        <p className="text-xs text-gray-500">{item.title}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center items-center gap-8 mt-8">
                    <button onClick={goToPrevious} className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400">
                        <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <div className="flex items-center justify-center gap-2">
                        {testimonials.map((_, slideIndex) => (
                            <div
                                key={slideIndex}
                                onClick={() => goToSlide(slideIndex)}
                                className={`cursor-pointer h-2.5 rounded-full transition-all duration-300 ${currentIndex === slideIndex ? 'bg-yellow-500 w-6' : 'bg-gray-300 w-2.5'}`}
                            ></div>
                        ))}
                    </div>
                    <button onClick={goToNext} className="p-2 rounded-full bg-orange-500 text-white shadow-md hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400">
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OurCustomersSaying;

