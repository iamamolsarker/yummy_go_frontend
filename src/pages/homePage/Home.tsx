import React from "react";
import Newsletter from "../../components/Newsletter/Newsletter";
import Gallery from "../../components/Gallery/Gallery";
import Faq from "../../components/home/Faq";
import Feature from "../../components/home/Feature";
import OurCustomersSaying from "../../components/OurCustomersSaying/OurCustomersSaying";
import HeroSection from "../../components/home/HeroSection";
import JoinAsSection from "../../components/home/JoinAsSection";
import FeaturesSection from "../../components/Features/Features";
import PartnersSection from "../../components/partners/Partners";

const Home: React.FC = () => {
  return (
    <main>
       
      {/* Hero Section */}
      <div id="hero">
        <HeroSection />
      </div>

      {/* Features Section */}
      {/* <div id="features">
        <FeaturesSection />
      </div> */}

      {/* Gallery Section */}
      <div id="gallery">
        <Gallery />
      </div>
     
      {/* Feature Section */}
      <div>
        <Feature />
      </div>

       {/* JoinAsSection */}
      <div>
        <JoinAsSection />
      </div>

       {/* Our Partners */}
      <div>
        <PartnersSection />
      </div>

      {/* FAQ Section */}
      <div>
        <Faq />
      </div>

      {/* OurCustomersSaying Section */}
      <OurCustomersSaying />

      {/* Newsletter Section */}
      <Newsletter />
    </main>
  );
};

export default Home;
