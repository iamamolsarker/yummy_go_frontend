import Newsletter from "../../components/Newsletter/Newsletter";
import Gallery from '../../components/Gallery/Gallery';


const Home = () => {
    return (
        <main>
            
            {/* Hero Section */}
            <section 
                className="relative bg-cover bg-center h-screen flex items-center justify-center pt-20" 
                style={{ backgroundImage: "url('https://placehold.co/1920x1080/2c1f12/333333?text=Yummy+Go')" }}
            >
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
                
                {/* Content */}
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg">
                        Taste the Flavor of Life
                    </h1>
                    <p className="mt-4 text-lg md:text-xl max-w-2xl">
                        Discover a world of delicious food, crafted with passion and served with love. Explore our menu and find your new favorite dish today.
                    </p>
                    <a 
                        href="#gallery" // This will scroll to the gallery section
                        className="mt-8 inline-block px-8 py-4 bg-yellow-500 text-white font-bold rounded-full shadow-lg hover:bg-orange-600 transform hover:scale-105 transition-all duration-300"
                    >
                        View Our Gallery
                    </a>
                </div>
            </section>

            {/* Gallery Section */}
            <div id="gallery">
                 <Gallery />
            </div>

            {/* Newsletter Section */}
            <Newsletter />
        </main>
    );
};

export default Home;