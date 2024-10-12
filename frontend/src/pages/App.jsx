import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Menu, X, Wallet, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReadContract } from "wagmi";

import Header from "@/components/header/Header";
import { ChitFundFactoryAbi, deployedContract } from "@/lib/Contract";

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
  const navigate = useNavigate();
  const [chitFunds, setchitFunds] = useState([]);

  const { data: chitFundsFetch } = useReadContract({
    abi: ChitFundFactoryAbi,
    address: deployedContract,
    functionName: "getChitFunds",
  });

  useEffect(() => {
    if (chitFundsFetch) {
      setchitFunds(chitFundsFetch || []);
    }
  }, [chitFundsFetch]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
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
              <Button onClick={() => navigate("/chitfund/create")}>
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
