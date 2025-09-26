import { Outlet } from 'react-router';
import { ToastContainer } from "react-toastify";


const AuthLayout: React.FC = () => {
    return (
        <div>

            <Outlet />

            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />        </div>
    );
};

export default AuthLayout;