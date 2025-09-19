import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQData {
  customer: FAQItem[];
  foodman: FAQItem[];
}

const Faq: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"customer" | "foodman">("customer");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: FAQData = {
    customer: [
      {
        question: "I got the wrong food. What should I do?",
        answer: "Please contact our support team immediately through the app with your order number and a photo of the incorrect items. We'll work to resolve the issue promptly."
      },
      {
        question: "My foodman's number is unreachable. What should I do?",
        answer: "If you can't reach your delivery person, use the in-app chat function which maintains a record of all communications."
      },
      {
        question: "The foodman refused to take my order. What can I do?",
        answer: "If a delivery person refuses your order, it will be automatically reassigned to another available foodman in your area."
      },
      {
        question: "The foodman cancelled my order. What should I do?",
        answer: "If your order is cancelled by the delivery person, you'll be automatically notified and given the option to have your order reassigned."
      },
      {
        question: "I forgot to apply promo code on my food order. What can I do now?",
        answer: "Contact our support team immediately after placing your order. If the order hasn't been prepared yet, we may be able to apply the promo code."
      },
      {
        question: "I want to order from a restaurant that is not in the app. Possible?",
        answer: "Currently, we only partner with restaurants listed in our app. However, you can suggest new restaurants through the 'Suggest a Restaurant' feature."
      }
    ],
    foodman: [
      {
        question: "How do I accept an order?",
        answer: "Orders will appear in your app dashboard with details about pickup location, delivery destination, and estimated earnings."
      },
      {
        question: "What should I do if I can't deliver on time?",
        answer: "If you encounter delays, update your status in the app and notify the customer through the in-app messaging system."
      },
      {
        question: "How do I contact the customer?",
        answer: "Use the secure in-app messaging system which protects both your privacy and the customer's."
      },
      {
        question: "What happens if I cancel an order?",
        answer: "Frequent cancellations may affect your delivery rating and access to premium delivery opportunities."
      },
      {
        question: "How do I withdraw my earnings?",
        answer: "Earnings can be withdrawn weekly through the 'Earnings' section of your app to your linked bank account or digital wallet."
      }
    ]
  };

  const activeFaqs = faqData[activeTab];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container w-[90%] mx-auto py-16 ">
      <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
        Frequently Asked Questions
      </h1>

      {/* Tab Selection */}
      <div className="flex justify-center mb-12">
        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("customer")}
            className={`px-8 py-3 font-medium transition-all duration-200 ${
              activeTab === "customer" 
                ? "bg-[#ef451c] text-white border-[#ef451c]" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            I'm a customer
          </button>
          <button
            onClick={() => setActiveTab("foodman")}
            className={`px-8 py-3 font-medium transition-all duration-200 ${
              activeTab === "foodman" 
                ? "bg-red-500 text-white border-red-500" 
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            I'm a foodman
          </button>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-4">
        {activeFaqs.map((item, index) => (
          <div key={index} className="border-b border-gray-200 pb-4">
            <button
              className="flex items-center justify-between w-full text-left py-4 hover:text-[#ef451c] transition-colors duration-200"
              onClick={() => toggleAccordion(index)}
            >
              <div className="flex items-center">
                <div className="mr-4">
                  {openIndex === index ? (
                    <Minus className="w-5 h-5 text-[#ef451c]" />
                  ) : (
                    <Plus className="w-5 h-5 text-[#ef451c]" />
                  )}
                </div>
                <span className="text-lg font-medium text-gray-800">
                  {item.question}
                </span>
              </div>
            </button>
            
            {openIndex === index && (
              <div className="ml-9 mt-2 pb-4">
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Faq;