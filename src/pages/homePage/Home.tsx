import React from "react";
import Newsletter from "../../components/Newsletter/Newsletter";
import Gallery from "../../components/Gallery/Gallery";
import Faq from "../../components/home/Faq";
import Feature from "../../components/home/Feature";
import OurCustomersSaying from "../../components/OurCustomersSaying/OurCustomersSaying";
import HeroSection from "../../components/home/HeroSection";

const Home: React.FC = () => {
  return (
    <main>
       
      {/* Hero Section */}
      <div id="hero">
        <HeroSection />
      </div>

      {/* Gallery Section */}
      <div id="gallery">
        <Gallery />
      </div>
      <Feature></Feature>

      <Faq></Faq>

      {/* OurCustomersSaying Section */}
      <OurCustomersSaying />

      {/* Newsletter Section */}
      <Newsletter />
    </main>
  );
};

export default Home;
