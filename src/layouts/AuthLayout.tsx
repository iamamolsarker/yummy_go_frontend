import { Outlet } from 'react-router';
import Navbar from '../components/shared/navbar/Navbar';

const AuthLayout: React.FC = () => {
    return (
        <div>
            <Navbar />
            <Outlet />
        </div>
    );
};

export default AuthLayout;