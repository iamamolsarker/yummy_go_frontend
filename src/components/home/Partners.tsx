import Marquee from "react-fast-marquee";
import { Fade } from "react-awesome-reveal";

const partners = [
  {
    name: "Pizza Hut",
    logo: "https://i.ibb.co.com/zTwLYTgc/Pizza-Hut-international-logo-2014-svg.png",
    url: "https://www.pizzahut.com/",
  },
  {
    name: "KFC",
    logo: "https://i.ibb.co.com/w2TzBcP/Kfc-Logo-PNG-Image.png",
    url: "https://www.kfc.com/",
  },
  {
    name: "Domino's",
    logo: "https://i.ibb.co.com/27jFDfDk/dominos-logo.png",
    url: "https://www.dominos.com/",
  },
  {
    name: "Tasty Treat",
    logo: "https://i.ibb.co.com/Df46hfLp/unnamed.png",
    url: "https://www.tastytreatbd.com/", 
  },
  {
    name: "Chillox",
    logo: "https://i.ibb.co.com/dxTv4gt/images-2.png",
    url: "https://chillox.com.bd/", 
  },
  {
    name: "Kacchi Bhai",
    logo: "https://i.ibb.co.com/MDsDgc3P/images.png",
    url: "https://www.kacchibhai.com/", 
  },
  {
    name: "PizzaBurg",
    logo: "https://i.ibb.co.com/msFqTBx/images-1.png",
    url: "https://pizzaburg.com.bd/", 
  },
];


export default function PartnersSection() {
  return (
    <section className="py-16 bg-[#fffaf5] overflow-hidden">
      <div className="mx-auto px-4 text-center">
        <Fade className="text-center mb-12" cascade>
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We collaborate with the top restaurants and brands to bring your
            favorite meals right to your doorstep.
          </p>
        </Fade>

        <Fade delay={300} triggerOnce>
          <Marquee pauseOnHover speed={40} gradient={false}>
            {partners.map((partner, i) => (
              <a
                key={i}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white mx-4 w-[180px] sm:w-[200px] rounded-xl shadow hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center p-4"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-16 sm:h-20 object-contain mb-3"
                />
                <p className="text-sm font-medium text-gray-800 text-center leading-tight">
                  {partner.name}
                </p>
              </a>
            ))}
          </Marquee>
        </Fade>
      </div>
    </section>
  );
}
