import { createBrowserRouter } from "react-router";
import RootLayOut from "../layouts/RootLayOut";
import About from "../pages/aboutPage/About";
import Home from "../pages/homePage/Home";
import Error from "../pages/error page/Error";
import FoodManForm from "../pages/joinAsRider/FoodManForm";
import PartnerForm from "../pages/joinAsPartner/PartnerForm";
import Login from "../pages/login/Login";
import UserReg from "../pages/userReg/UserReg";



export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayOut />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "about",
        element: <About />
      },
       {
        path: "/log-in",
        element:<Login/>
      },
      {
        path: "/user-reg",
        element: <UserReg/>
      },
      {
        path: "/foodman-form",
        element: <FoodManForm />
      },
      {
        path: "/partner-form",
        element: <PartnerForm />
      },

    ]
  },
  {
<<<<<<< HEAD
    path: '/login',
    element: <LoginPage></LoginPage>
  },
  {
    path:"*",
    element:<Error></Error>
  }
]);
=======
    path: "*",
    element: <Error></Error>
  }
]);
>>>>>>> 8cf9b49baff498bc6c4be75d5425a6d74fb16cb0
