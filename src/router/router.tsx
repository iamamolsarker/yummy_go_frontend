import { createBrowserRouter } from "react-router";
import RootLayOut from "../layouts/RootLayOut";
import About from "../pages/aboutPage/About";
import Home from "../pages/homePage/Home";

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
]);