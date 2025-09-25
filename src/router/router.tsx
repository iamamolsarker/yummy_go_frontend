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
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
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
        element: <FoodManForm />,
      },
      {
        path: "/partner-form",
        element: <PartnerForm />,
      },
    ],
  },
  {
    path: "*",
    element: <Error></Error>,
  },
]);
