import { createBrowserRouter } from "react-router";
import RootLayOut from "../layouts/RootLayOut";
import About from "../pages/aboutPage/About";
import Home from "../pages/homePage/Home";
import Error from "../pages/error page/Error";
import FoodManForm from "../pages/joinAsRider/FoodManForm";
import PartnerForm from "../pages/joinAsPartner/PartnerForm";
import Login from "../pages/login/Login";
import UserReg from "../pages/userReg/UserReg";
import AuthLayout from "../layouts/AuthLayout";
import ProfilePage from "../pages/profilePage/ProfilePage";
import Dashboard from "../pages/dashboard/Dashboard";
import Forbidden from "../pages/forbidden/Forbidden";
import Restaurants from "../pages/Restaurants/Restaurants";




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
        path: "/foodman-form",
        element: <FoodManForm />
      },
      {
        path: "/partner-form",
        element: <PartnerForm />
      },
      {
        path: "forbidden",
        element: <Forbidden />
      },
      {
        path: "/dashboard",
        element: <Dashboard />
      },
      {
        path: "profile/:email",
        element: <ProfilePage />
      },
      {
        path: "restaurants",
        element: <Restaurants/>
      },

    ]
  },
  {
    path: "/auth",
    element: <AuthLayout></AuthLayout>,
    children: [
      {
        path: "log-in",
        element: <Login />
      },
      {
        path: "user-reg",
        element: <UserReg />
      },


    ]
  },
  {
    path: "*",
    element: <Error></Error>
  }
]);
