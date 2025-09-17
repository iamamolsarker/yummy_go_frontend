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
    text: 'The Chicken Biryani from Yummy Food is amazing! The delivery was so fast that the food arrived hot and fresh. Perfect for my busy life!',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=AwladHossin'
  },
  {
    name: 'Rasel Ahamed',
    title: 'CTO',
    text: 'The app is very smooth and it\'s easy to track orders. This is the best food delivery service I have used so far!',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=RaselAhamed'
  },
  {
    name: 'Nasir Uddin',
    title: 'CEO',
    text: 'I now order healthy lunches for the office from here. The salads are always fresh and the grilled chicken is great. Simply amazing!',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=NasirUddin'
  },
  {
    name: 'Tanvir Ahmed',
    title: 'Lead Engineer',
    text: 'Their beef khichuri feels just like homemade. After long coding sessions, this is my first choice. The service is also excellent.',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=TanvirAhmed'
  },
  {
    name: 'Shahidul Islam',
    title: 'Fitness Coach',
    text: 'There are great options here for fitness lovers. The protein-packed meals are very nutritious and delicious. I am very satisfied.',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=ShahidulIslam'
  },
  {
    name: 'Samiul Alam',
    title: 'Data Analyst',
    text: 'Getting a quick delivery during busy office hours makes my day so much easier. I love their wraps and sandwiches.',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=SamiulAlam'
  },
  {
    name: 'Imran Kabir',
    title: 'Digital Marketer',
    text: 'I find the best mutton kacchi in town right here! I have received fresh and aromatic food every single time.',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=ImranKabir'
  },
  {
    name: 'Farhana Akter',
    title: 'UI/UX Designer',
    text: 'As a UI/UX designer, I appreciate a good app. Ordering from Yummy Food is very easy and user-friendly.',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=FarhanaAkter'
  },
  {
    name: 'Mizanur Rahman',
    title: 'Software Engineer',
    text: 'No worries about sudden midnight cravings anymore. Yummy Food\'s burgers and fries are always available and delivered quickly!',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=MizanurRahman'
  },
  {
    name: 'Nusrat Jahan',
    title: 'Teacher',
    text: 'The food tastes just like mom\'s home cooking. My whole family loves their Bengali thali.',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=NusratJahan'
  },
  {
    name: 'Jahid Hasan',
    title: 'Content Creator',
    text: 'While editing videos, Yummy Food\'s snacks and coffee keep me refreshed. The delivery partners are also very polite.',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=JahidHasan'
  },
  {
    name: 'Mahmudul Hasan',
    title: 'Business Consultant',
    text: 'Truly professional service. The packaging is always great and the food arrives on time. Very reliable for client meetings.',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=MahmudulHasan'
  },
  {
    name: 'Afsana Mim',
    title: 'Nurse',
    text: 'After long shifts at the hospital, Yummy Food is my go-to for hot and healthy meals. Their soup is very comforting.',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=AfsanaMim'
  },
  {
    name: 'Tariq Aziz',
    title: 'Entrepreneur',
    text: 'Such a wide variety of food! From pizza and pasta to healthy salads and desserts—everything is available in one app.',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=TariqAziz'
  },
  {
    name: 'Sumaiya Rahman',
    title: 'Medical Student',
    text: 'Yummy Food saves me a lot of cooking time during exam prep. Their affordable meal plans are very good.',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=SumaiyaRahman'
  },
  {
    name: 'Arif Chowdhury',
    title: 'Project Manager',
    text: 'This is now our first choice for office lunch. Ordering food for the whole team is very easy now. Everyone likes their options.',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=ArifChowdhury'
  },
  {
    name: 'Tasnim Ahmed',
    title: 'Graphic Designer',
    text: 'The app looks beautiful and is comfortable to use. The food pictures are so attractive that they make you want to eat right away!',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=TasnimAhmed'
  },
  {
    name: 'Mehedi Hasan',
    title: 'Researcher',
    text: 'I was looking for a reliable and affordable food delivery service, and Yummy Food is just perfect. The food is very tasty.',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=MehediHasan'
  },
  {
    name: 'Sadia Khatun',
    title: 'HR Manager',
    text: 'Arranging team lunches for our department is much easier now. Their bulk order facility is very helpful!',
    avatar: 'https://avatar.iran.liara.run/public/girl?username=SadiaKhatun'
  },
  {
    name: 'Rakibul Islam',
    title: 'Freelancer',
    text: 'Working from home is much more enjoyable when you don\'t have to worry about cooking. Yummy Food always delivers hot food quickly.',
    avatar: 'https://avatar.iran.liara.run/public/boy?username=RakibulIslam'
  }
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
        if (isHovered) return;
        const intervalId = setInterval(goToNext, 5000);
        return () => clearInterval(intervalId);
    }, [isHovered, goToNext]);

    return (
        <div className="bg-gray-50 font-sans py-20 px-4 md:px-8 text-center overflow-hidden">

            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[#EF451C] flex items-center justify-center text-white">
                <Quote size={32} />
            </div>

            <h2 className="text-[40px] font-bold text-[#363636] mb-4">
                What Our Customers Are Saying
            </h2>
            <p className="text-[#7c848a] text-[16px] max-w-2xl mx-auto mb-12">
                Find out why our customers love our food delivery service. Fresh, fast, and always delicious!
            </p>

            <div
                className="relative max-w-4xl mx-auto"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="w-full h-[350px] relative">
                    {testimonials.map((item, idx) => {
                        let position = 'opacity-0 scale-75 transform -translate-x-full';
                        if (idx === currentIndex) {
                            position = 'opacity-100 scale-100 z-10 transform translate-x-0';
                        } else if (idx === (currentIndex - 1 + testimonials.length) % testimonials.length) {
                            position = 'opacity-40 scale-90 z-0 transform -translate-x-1/2';
                        } else if (idx === (currentIndex + 1) % testimonials.length) {
                            position = 'opacity-40 scale-90 z-0 transform translate-x-1/2';
                        }
                        
                        const isVisible = Math.abs(currentIndex - idx) < 2 || (currentIndex === 0 && idx === testimonials.length - 1) || (currentIndex === testimonials.length - 1 && idx === 0);
                        
                        return (
                            <div
                                key={idx}
                                className={`absolute top-0 left-1/2 -ml-[170px] w-[340px] h-[300px] bg-white rounded-[10px] shadow-xl p-6 text-left flex flex-col justify-between transition-all duration-500 ease-in-out ${isVisible ? position : 'opacity-0 scale-75'}`}
                            >
                                <div>
                                    <p className="text-[#EF451C] text-[48px] font-serif leading-none mb-2">“</p>
                                    <p className="text-[#7c848a] mb-4 text-sm leading-relaxed">{item.text}</p>
                                </div>
                                <div className="border-t border-dashed border-[#3636361a] pt-4 flex items-center gap-4">
                                    <img
                                        src={item.avatar}
                                        alt={item.name}
                                        className="w-12 h-12 rounded-full bg-gray-100 shrink-0 object-cover border-2 border-[#EF451C]/20"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://avatar.iran.liara.run/public/boy'; }}
                                    />
                                    <div>
                                        <h4 className="text-[#363636] font-bold leading-tight">{item.name}</h4>
                                        <p className="text-xs text-[#7c848a]">{item.title}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center items-center gap-8 mt-8">
                    <button onClick={goToPrevious} className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF451C]/50">
                        <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <div className="flex items-center justify-center gap-2">
                        {testimonials.map((_, slideIndex) => (
                            <div
                                key={slideIndex}
                                onClick={() => goToSlide(slideIndex)}
                                className={`cursor-pointer h-2.5 rounded-full transition-all duration-300 ${currentIndex === slideIndex ? 'bg-[#EF451C] w-6' : 'bg-gray-300 w-2.5'}`}
                            ></div>
                        ))}
                    </div>
                    <button onClick={goToNext} className="p-2 rounded-full bg-[#EF451C] text-white shadow-md hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#EF451C]/50">
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OurCustomersSaying;

