import React, { FormEvent, useState } from "react";
import axios from "axios";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      setMessage("⚠️ Please enter a valid email!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/newsletter", {
        email,
      });

      if (res.data.success) {
        setMessage("✅ Thank you for subscribing!");
        setEmail("");
      } else {
        setMessage("❌ You are already subscribed!");
      }
    } catch (error) {
      console.error(error);
      setMessage("❌ Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Fixed Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://i.ibb.co/zHDcNLwB/Newsletter.png')",
          backgroundAttachment: "fixed",
        }}
      ></div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>

      {/* Content Container */}
      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="bg-white/10 backdrop-blur-lg p-8 md:p-12 rounded-[10px] text-center max-w-2xl shadow-2xl border border-white/20">
          <h2 className="text-[40px] md:text-[48px] font-extrabold mb-4 text-white">
            📩 Join Our Newsletter
          </h2>
          <p className="text-gray-200 text-[16px] md:text-[20px] mb-8">
            Get exclusive offers, tasty updates, and delicious news straight to your inbox.
          </p>

          <form
            className="flex flex-col md:flex-row gap-4 justify-center"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-grow bg-white/90 px-6 py-3 rounded-[10px] text-[#363636] placeholder-[#7c848a] shadow-md transition duration-300 focus:outline-none focus:ring-4 focus:ring-[#EF451C]"
            />
            <button
              type="submit"
              className="bg-[#EF451C] hover:bg-opacity-90 px-8 py-3 rounded-[10px] font-bold text-white shadow-md transition duration-300 transform hover:scale-105"
            >
              Subscribe
            </button>
          </form>

          {message && (
            <p className="mt-6 text-white font-semibold text-[16px]">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
