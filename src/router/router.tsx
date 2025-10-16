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
import RiderManagement from "../Dashboard/Admin/Riders/RidersManagement";
import OrdersManagement from "../Dashboard/Admin/Orders/OrdersManagement";
import RestaurantManagement from "../Dashboard/Admin/Restaurants/RestaurantManagement";
import RiderOrders from "../Dashboard/Rider/RiderOrders";
import Restaurants from "../pages/restaurants/Restaurants";
import RiderHistory from "../Dashboard/Rider/RiderHistory";
import RiderEarnings from "../Dashboard/Rider/RiderEarnings";
import RiderRoutes from "../Dashboard/Rider/RiderRoutes";
import RiderPerformance from "../Dashboard/Rider/RiderPerformance";
import SettingsPage from "../pages/profilePage/SettingsPage";




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
        path: "settings",
        element: <SettingsPage />
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
        element: <UserManagement />
      },
      {
        path: "admin/riders",
        element: <RiderManagement></RiderManagement>
      },
      {
        path: "admin/orders",
        element: <OrdersManagement></OrdersManagement>
      },
      {
        path: "admin/restaurants",
        element: <RestaurantManagement />
      },
      {
        path: "rider/orders",
        element: <RiderOrders />
      },
      {
        path: "rider/history",
        element: <RiderHistory />
      },
      {
        path: "rider/earnings",
        element: <RiderEarnings />
      },
      {
        path: "rider/routes",
        element: <RiderRoutes />
      },
      {
        path: "rider/performance",
        element: <RiderPerformance />
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
