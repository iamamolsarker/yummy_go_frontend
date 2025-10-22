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
import RiderHistory from "../Dashboard/Rider/RiderHistory";
import RiderEarnings from "../Dashboard/Rider/RiderEarnings";
import RiderRoutes from "../Dashboard/Rider/RiderRoutes";
import RiderPerformance from "../Dashboard/Rider/RiderPerformance";
import SettingsPage from "../pages/profilePage/SettingsPage";

import Checkout from "../pages/checkout/Checkout";
import OrderConfirmation from "../pages/order-confirmation/OrderConfirmation";
import Restaurants from "../pages/Restaurants/Restaurants";
import RestaurantDetails from "../pages/Restaurants/RestaurantDetails";
import Analytics from "../Dashboard/Admin/Analytics/Analytics";
import Reports from "../Dashboard/Admin/Reports/Reports";
import MenuManagement from "../Dashboard/Restaurant_Owner/MenuManagement/MenuManagement";
import OrdersPageWithDelivery from "../Dashboard/Restaurant_Owner/OrdersManagements/Orders";





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
      {
        path: "restaurants/:id",
        element: <RestaurantDetails />
      },
      {
        path: "checkout",
        element: (
          <PrivateRoute>
            <Checkout />
          </PrivateRoute>
        )
      },
      {
        path: "order-confirmation/:orderId",
        element: (
          <PrivateRoute>
            <OrderConfirmation />
          </PrivateRoute>
        )
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
        path: "admin/analytics",
        element: <Analytics />
      },
      {
        path: "admin/reports",
        element: <Reports />
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
      {
        path: "restaurant/menu",
        element: <MenuManagement />
      },
      {
        path: "restaurant/orders",
        element: <OrdersPageWithDelivery></OrdersPageWithDelivery>
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
