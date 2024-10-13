import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Menu, X, Wallet, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useReadContract, useReadContracts } from "wagmi";

import Header from "@/components/header/Header";
import {
  ChitFundAbi,
  ChitFundFactoryAbi,
  deployedContract,
} from "@/lib/Contract";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function App() {
  const navigate = useNavigate();
  const [chitFunds, setchitFunds] = useState([]);

  const { data: chitFundsAddresses } = useReadContract({
    abi: ChitFundFactoryAbi,
    address: deployedContract,
    functionName: "getAllChitFunds",
  });

  const chitFundReads =
    chitFundsAddresses?.map((address) => ({
      abi: ChitFundAbi,
      address,
      functionName: "getChitFundDetails",
    })) || [];

  const { data: chitFundDetails } = useReadContracts({
    contracts: chitFundReads,
  });

  useEffect(() => {
    if (chitFundDetails) {
      console.log(chitFundDetails);

      setchitFunds(chitFundDetails);
    }
  }, [chitFundDetails]);

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
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    No Chit Funds Available
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">
                    There are currently no chit funds to display. Check back
                    later or create a new one.
                  </p>
                  <Button onClick={() => navigate("/chitfund/create")}>
                    Create New Chit Fund
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            chitFunds.map((fund, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                initial="initial"
                animate="animate"
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {fund.result[1]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-600">
                          {fund.result[4].toString()} members
                        </span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-600">
                          ₹{fund.result[3].toString()} total value
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-600">
                          {fund.result[6].toString()} duration
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      onClick={() => navigate(`/chitfund/${fund.result[0]}`)}
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
