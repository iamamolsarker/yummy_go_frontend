import { createBrowserRouter } from "react-router";
import RootLayOut from "../layouts/RootLayOut";
import About from "../pages/aboutPage/About";
import Home from "../pages/homePage/Home";
import Error from "../pages/error page/Error";
import LoginPage from "../pages/auth/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayOut />,
    children:[
        {
            index:true,
            element:<Home/>
        },
        {
            path: "about",
            element: <About/>
        }
    ]
  },
  {
    path: '/login',
    element: <LoginPage></LoginPage>
  },
  {
    path:"*",
    element:<Error></Error>
  }
]);