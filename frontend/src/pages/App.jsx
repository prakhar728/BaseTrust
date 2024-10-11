import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Menu, X, Wallet, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAccount, useReadContract } from "wagmi";

import ChitFundFactory from "../assets/contracts/ChitFundFactory.json";
import ChitFund from "../assets/contracts/ChitFund.json";

// const chitFunds = [
//   {
//     id: 1,
//     name: "Community Growth Fund",
//     members: 50,
//     totalValue: "500,000",
//     duration: "12 months",
//   },
//   {
//     id: 2,
//     name: "Tech Startup Boost",
//     members: 30,
//     totalValue: "300,000",
//     duration: "6 months",
//   },
//   {
//     id: 3,
//     name: "Education Support Circle",
//     members: 100,
//     totalValue: "1,000,000",
//     duration: "24 months",
//   },
// ];

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [chitFunds, setchitFunds] = useState([]);
  const contractAddress = import.meta.env.VITE_APP_DEPLOYED_CONTRACTS;

  const { data: chitFundsFetch } = useReadContract({
    abi: ChitFundFactory.abi,
    address: contractAddress,
    functionName: "getChitFunds",
  });

  useEffect(() => {
    if (chitFundsFetch) {
      setchitFunds(chitFundsFetch || []);
    }
  }, [chitFundsFetch]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <span className="text-xl font-bold text-primary">BaseTrust</span>
          </a>
          <nav className="hidden md:flex space-x-4">
            <a href="/about" className="text-gray-600 hover:text-primary">
              About
            </a>
            <a href="/funds" className="text-gray-600 hover:text-primary">
              Funds
            </a>
            <a href="/dashboard" className="text-gray-600 hover:text-primary">
              Dashboard
            </a>
          </nav>
          <div className="flex items-center space-x-4">
            <w3m-button />
            <button
              className="md:hidden text-gray-600 hover:text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <main className="flex-grow justify-center items-center">
            <motion.nav
              className="md:hidden bg-white py-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="container mx-auto px-4 flex flex-col space-y-4">
                <a href="/about" className="text-gray-600 hover:text-primary">
                  About
                </a>
                <a href="/funds" className="text-gray-600 hover:text-primary">
                  Funds
                </a>
                <a
                  href="/dashboard"
                  className="text-gray-600 hover:text-primary"
                >
                  Dashboard
                </a>
                <Button className="w-full">
                  <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
                </Button>
              </div>
            </motion.nav>
          </main>
        )}
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.h1
          className="text-3xl font-bold text-gray-900 mb-6"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          Active Chit Funds
        </motion.h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chitFunds.length == 0 ? (
            <motion.div
              className="text-center p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                No Chit Funds Available
              </h2>
              <p className="text-gray-600 mb-6">
                There are currently no chit funds to display. Check back later
                or create a new one.
              </p>
              <Button onClick={() => navigate("/create-chitfund")}>
                Create New Chit Fund
              </Button>
            </motion.div>
          ) : (
            chitFunds.map((fund) => (
              <motion.div
                key={fund.id}
                variants={fadeIn}
                initial="initial"
                animate="animate"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {fund.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-600">
                          {fund.members} members
                        </span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-600">
                          ₹{fund.totalValue} total value
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-600">
                          {fund.duration} duration
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => navigate("/chitfund/123")}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          © 2024 BaseTrust. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
