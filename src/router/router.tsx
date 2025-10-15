import { createBrowserRouter } from "react-router";
import RootLayOut from "../layouts/RootLayOut";
import About from "../pages/aboutPage/About";
import Home from "../pages/homePage/Home";
import Error from "../pages/error page/Error";
import FoodManForm from "../pages/joinAsRider/FoodManForm";
import PartnerForm from "../pages/joinAsPartner/PartnerForm";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import ProfilePage from "../pages/profilePage/ProfilePage";
import Forbidden from "../pages/forbidden/Forbidden";
import UserReg from "../Authentication/UserReg";
import Login from "../Authentication/Login";
import PrivateRoute from "../routes/PrivateRoute";
import DashboardHome from "../Dashboard/DashboardHome";
import UserManagement from "../Dashboard/Admin/userManegement/UserManagement";
import Restaurants from "../pages/Restaurants/Restaurants";
import RiderManagement from "../Dashboard/Admin/Riders/RidersManagement";




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
        path: "profile/:email",
        element: <ProfilePage />
      },
      {
        path: "restaurants",
        element: <Restaurants />
      },

    ]
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute>
        <DashboardLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />
      },
      {
        path: "admin/users",
        element: <UserManagement/>
      },
      {
        path: "admin/riders",
        element: <RiderManagement></RiderManagement>
      },
      {
        path: "admin/restaurants",
        element: <div>Restaurant Management</div>
      }

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
