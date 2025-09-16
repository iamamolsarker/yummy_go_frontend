import { createBrowserRouter } from "react-router";
import RootLayOut from "../layouts/RootLayOut";
import Home from "../components/home/Home";
import About from "../pages/aboutPage/About";

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