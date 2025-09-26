import React from "react";
import deliveryImg from "../../assets/home/features/ic_Food_Feature_1.webp"; 
import chooseImg from "../../assets/home/features/ic_Food_Feature_1.webp"; 
import offerImg from "../../assets/home/features/ic_Food_Feature_1.webp"; 

// 👆 replace with your actual image paths (the ones from your screenshot)

const features = [
  {
    id: 1,
    title: "Fastest Delivery",
    description:
      "Get your food delivered in less than an hour! That’s as fast as it can get.",
    image: deliveryImg,
  },
  {
    id: 2,
    title: "So Much to Choose From",
    description: "A world of flavors at your fingertips!",
    image: chooseImg,
  },
  {
    id: 3,
    title: "Offers You Can't Refuse",
    description:
      "Savor more, and spend less with our amazing offers and discounts!",
    image: offerImg,
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="bg-[#f7f9fa] py-16">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col items-center space-y-4"
            >
              {/* Image */}
              <img
                src={feature.image}
                alt={feature.title}
                className="w-28 h-28 object-contain"
              />

              {/* Title */}
              <h3 className="text-xl font-semibold text-gray-800">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-sm max-w-xs mx-auto">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
