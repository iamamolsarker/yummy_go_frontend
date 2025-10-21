import { Outlet } from 'react-router';
import Navbar from '../components/shared/navbar/Navbar';
import Footer from '../components/shared/footer/Footer';
import { CartProvider } from '../contextsProvider/CartContext';

const RootLayOut: React.FC = () => {
    return (
        <CartProvider>
            <div>
                <Navbar />
                <Outlet />
                <Footer />
            </div>
        </CartProvider>
    );
};

export default RootLayOut;