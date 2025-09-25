import { createBrowserRouter } from "react-router";
import RootLayOut from "../layouts/RootLayOut";
import About from "../pages/aboutPage/About";
import Home from "../pages/homePage/Home";
import Error from "../pages/error page/Error";
import FoodManForm from "../components/RegisterForm/FoodManForm";
import PartnerForm from "../components/RegisterForm/PartnerForm";
import PartnerLoginForm from "../LoginForm/PartnerLoginForm";
import FoodManLoginForm from "../LoginForm/FoodManLoginForm";

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
        path: "/foodman-login",
        element: <FoodManLoginForm />
      },
      {
        path: "/partner-login",
        element: <PartnerLoginForm />
      },

    ]
  },
  {
    path: "*",
    element: <Error></Error>
  }
]);