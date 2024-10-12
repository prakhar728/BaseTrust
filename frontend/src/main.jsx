import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import BaseTrustLanding from "./pages/LandingPage.jsx";
import App from "./pages/App.jsx";
import ChitFund from "./pages/ChitFund.jsx";
import ChitFunds from "./pages/ChitFunds.jsx";
import { AppKitProvider } from "./WalletProvider";
import CreateChitFund from "./pages/CreateChitFunds";

const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseTrustLanding />,
  },
  {
    path: "/app",
    element: <App />,
  },
  {
    path: "/chitfund",
    element: <ChitFunds />,
    children: [
      {
        path: "/chitfund/create",
        element: <CreateChitFund />
      },
      {
        path: "/chitfund/:fundid",
        element: <ChitFund />
      }
    ]
  }
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppKitProvider>
    <RouterProvider router={router} />
    </AppKitProvider>
  </StrictMode>
);
