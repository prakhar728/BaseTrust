import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Wallet,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Badge,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { ChitFundAbi } from "@/lib/Contract";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import Header from "@/components/header/Header";
import { formatEther } from "viem";
import { fetchEthereumPrice } from "@/lib/EthereumPrices";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function ChitFundPage() {
  const [activeTab, setActiveTab] = useState("details");
  const [userStatus, setUserStatus] = useState("Upcoming"); // This would be determined by the user's actual status
  const [isLoadingg, setIsLoading] = useState(false);
  const [ethereumPrice, setethereumPrice] = useState(0);
  const { fundid } = useParams(); // Get the id from the URL
  const { address } = useAccount();

  const { data: chitFundData, isLoading } = useReadContract({
    abi: ChitFundAbi,
    address: fundid,
    functionName: "getChitFundDetails",
  });

  const { data: userDetail, isLoading: isUserDetailLoading } = useReadContract({
    abi: ChitFundAbi,
    address: fundid,
    functionName: "getParticipantDetails",
    args: [address],
  });

  const totalParticipants = parseInt(chitFundData ? chitFundData[4] : 0);

  const participantReads = new Array(totalParticipants)
    .fill(null)
    .map((_, index) => ({
      abi: ChitFundAbi,
      address: fundid, // Should be 'address', not 'fundid'
      functionName: "participants",
      args: [index], // Pass the index directly
    }));

  const { data: participants } = useReadContracts({
    contracts: participantReads,
  });

  const handlePoolAction = () => {
    setIsLoading(true);
    // Simulate an API call or blockchain transaction
    setTimeout(() => {
      setUserStatus("Pooled In");
      setIsLoading(false);
    }, 2000);
  };

  const populateEthereumPrice = async () => {
    setethereumPrice(await fetchEthereumPrice());
  };

  useEffect(() => {
    populateEthereumPrice();
  }, []);

  const renderActionButton = () => {
    switch (userStatus) {
      case true:
        return (
          <Button
            disabled={isLoading}
            className="w-full md:w-auto bg-green-500 hover:bg-green-600"
          >
            Add collateral
          </Button>
        );
      case "Next Due":
        return (
          <Button
            onClick={handlePoolAction}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            {isLoading ? "Processing..." : "Pool In Now"}
          </Button>
        );
      case "Pooled In":
        return (
          <Button
            disabled
            className="w-full md:w-auto bg-green-500 hover:bg-green-600"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Already Pooled In
          </Button>
        );
      default:
        return (
          <Button disabled className="w-full md:w-auto">
            <XCircle className="mr-2 h-4 w-4" />
            Not Your Turn
          </Button>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      {!isLoading && (
        <>
          <header className="bg-primary text-white py-6">
            <div className="container mx-auto px-4">
              <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                <Shield className="mr-2 h-6 w-6" />
                {chitFundData[1]}
              </h1>
            </div>
          </header>

          <main className="flex-grow container mx-auto px-4 py-8">
            <motion.div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8"
              variants={fadeIn}
              initial="initial"
              animate="animate"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Wallet className="mr-2 h-5 w-5 text-primary" />
                    Contract Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm font-mono">
                  {chitFundData[0]}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    Participants
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  {chitFundData[4].toString()}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Wallet className="mr-2 h-5 w-5 text-primary" />
                    Amount in Circulation
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-2xl font-bold">
                  ₹{formatEther(chitFundData[3]) * ethereumPrice} total
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Wallet className="mr-2 h-5 w-5 text-primary" />
                    Next Pool Recipient
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm font-mono">
                  {chitFundData[2]}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-primary" />
                    Chit Fund Ends On
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {new Date(
                    (parseInt(chitFundData[10]) +
                      parseInt(chitFundData[6]) * 2629746) *
                      1000
                  ).toLocaleString()}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-primary" />
                    Your Action
                  </CardTitle>
                </CardHeader>
                <CardContent>{renderActionButton()}</CardContent>
              </Card>
            </motion.div>

            <div className="mb-4">
              <Button
                variant={activeTab === "details" ? "default" : "outline"}
                onClick={() => setActiveTab("details")}
                className="mr-2"
              >
                Participant Details
              </Button>
              <Button
                variant={activeTab === "defaulters" ? "default" : "outline"}
                onClick={() => setActiveTab("defaulters")}
              >
                Defaulters
              </Button>
            </div>

            {activeTab === "details" && (
              <motion.div variants={fadeIn} initial="initial" animate="animate">
                <Card>
                  <CardHeader>
                    <CardTitle>Participant Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">
                            Wallet Address
                          </TableHead>
                          <TableHead>Contributed</TableHead>
                          <TableHead>Staked Collateral</TableHead>
                          <TableHead>Received Fund</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participants &&
                          participants.map((participant, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono">
                                {participant.result[0]}
                              </TableCell>
                              <TableCell>
                                {participant.result[1] ? (
                                  <Badge
                                    variant="success"
                                    className="bg-green-100 text-green-800"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" /> Yes
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="bg-red-100 text-red-800"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" /> No
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {participant.result[2] ? (
                                  <Badge
                                    variant="success"
                                    className="bg-green-100 text-green-800"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" /> Yes
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="bg-red-100 text-red-800"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" /> No
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {participant.result[3] ? (
                                  <Badge
                                    variant="success"
                                    className="bg-green-100 text-green-800"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" /> Yes
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="destructive"
                                    className="bg-red-100 text-red-800"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" /> No
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            {/* 
            
            {activeTab === "defaulters" && (
              <motion.div variants={fadeIn} initial="initial" animate="animate">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                      Defaulters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chitFundData.defaulters.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Wallet Address</TableHead>
                            <TableHead>Missed Date</TableHead>
                            <TableHead>Amount Due</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {chitFundData.defaulters.map((defaulter, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-mono">
                                {defaulter.address}
                              </TableCell>
                              <TableCell>{defaulter.missedDate}</TableCell>
                              <TableCell>₹{defaulter.amountDue}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center py-4">
                        No defaulters at this time.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )} */}
          </main>

          <footer className="bg-white border-t border-gray-200 py-6">
            <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
              © 2024 BaseTrust. All rights reserved.
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

/// I need to setup a few details, make the collateral thing working, allow everyone to pool in, allow the person to claim the amount, and start the indexer
