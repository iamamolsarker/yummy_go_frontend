import { Outlet } from 'react-router';
import Navbar from '../components/shared/navbar/Navbar';
import Footer from '../components/shared/footer/Footer';


const RootLayOut: React.FC = () => {
    return (
        <div>
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    );
};

export default RootLayOut;