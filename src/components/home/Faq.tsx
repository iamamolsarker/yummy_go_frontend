// NOTE: This component is completed by Abrar Shazid. 
// Reach out to me if any problem occurs. 
// (For development use only, remove before production)

import React, { useState } from "react";

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
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Frequently Asked Questions
      </h1>

      {/* Tab Selection */}
      <div className="flex justify-center mb-10">
        <div className="inline-flex rounded-md shadow-sm border border-gray-200 p-1 bg-gray-50">
          <button
            onClick={() => setActiveTab("customer")}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "customer" 
                ? "bg-white text-red-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            I'm a Customer
          </button>
          <button
            onClick={() => setActiveTab("foodman")}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === "foodman" 
                ? "bg-white text-red-600 shadow-sm" 
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            I'm a Foodman
          </button>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {activeFaqs.map((item, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm"
          >
            <button
              className="flex justify-between items-center w-full p-4 text-left bg-white hover:bg-gray-50 transition-colors duration-150"
              onClick={() => toggleAccordion(index)}
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-gray-800 pr-2">
                {item.question}
              </span>
              <svg 
                className={`w-5 h-5 text-red-500 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {openIndex === index && (
              <div className="px-4 pb-4 pt-2 bg-white">
                <p className="text-gray-600">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Support Contact */}
      <div className="mt-12 p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 text-center">
        <h3 className="font-semibold text-gray-800 mb-2">Still have questions?</h3>
        <p className="text-gray-600 text-sm mb-4">Our support team is here to help you</p>
        <button className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default Faq;