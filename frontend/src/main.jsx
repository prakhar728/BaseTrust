import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import BaseTrustLanding from "./pages/LandingPage.jsx";
import App from "./pages/App.jsx";
import ChitFund from "./pages/ChitFund.jsx";
import ChitFunds from "./pages/ChitFunds.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseTrustLanding />,
  },
  {
    path: "/app",
    element: <App />,
    children: [
      {
        path: "/app/:fundid",
        element: <ChitFund />
      }
    ]
  },
  {
    path: "/chitfund",
    element: <ChitFunds />,
    children: [
      {
        path: "/chitfund/:fundid",
        element: <ChitFund />
      }
    ]
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
