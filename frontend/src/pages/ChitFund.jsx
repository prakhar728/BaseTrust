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
  Calendar,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { ChitFundAbi } from "@/lib/Contract";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import Header from "@/components/header/Header";
import { formatEther, parseEther } from "viem";
import { fetchEthereumPrice } from "@/lib/EthereumPrices";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function ChitFundPage() {
  const [activeTab, setActiveTab] = useState("details");
  const [isLoading, setIsLoading] = useState(false);
  const [ethereumPrice, setEthereumPrice] = useState(0);
  const [timeLeft, setTimeLeft] = useState("");
  const [nextDeadline, setNextDeadline] = useState("");
  const { fundid } = useParams();
  const { address } = useAccount();
  const { writeContract } = useWriteContract();

  const { data: chitFundData, isLoading: isChitFundLoading } = useReadContract({
    abi: ChitFundAbi,
    address: fundid,
    functionName: "getChitFundDetails",
  });

  const { data: contributionAmount } = useReadContract({
    abi: ChitFundAbi,
    address: fundid,
    functionName: "getContributionAmount",
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
      address: fundid,
      functionName: "participants",
      args: [index],
    }));

  const { data: participants } = useReadContracts({
    contracts: participantReads,
  });

  const handlePoolIn = async () => {
    setIsLoading(true);
    console.log(contributionAmount.toString());
    
    try {
      writeContract({
        address: fundid,
        abi: ChitFundAbi,
        functionName: "contribute",
        value: contributionAmount.toString(),
      });
    } catch (error) {
      console.error("Error pooling in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStakeCollateral = async () => {
    setIsLoading(true);

    try {
      writeContract({
        address: fundid,
        abi: ChitFundAbi,
        functionName: "stakeCollateral",
        value: chitFundData[11].toString(),
      });
    } catch (error) {
      console.error("Error staking collateral:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimFund = async () => {
    setIsLoading(true);
    try {
      writeContract({
        address: fundid,
        abi: ChitFundAbi,
        functionName: "claim",
      });
    } catch (error) {
      console.error("Error claiming fund:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const populateEthereumPrice = async () => {
    setEthereumPrice(await fetchEthereumPrice());
  };

  useEffect(() => {
    populateEthereumPrice();
  }, []);

  useEffect(() => {
    if (chitFundData) {
      console.log(chitFundData);

      const endTime =
        (parseInt(chitFundData[10]) +
          (parseInt(chitFundData[6]) * parseInt(chitFundData[9]))) *
        1000;
      const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = endTime - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 60000);

      // Calculate next deadline
      const startTime = parseInt(chitFundData[10]) * 1000;
      const cycleDuration = parseInt(chitFundData[9]) * 1000;
      const currentTime = new Date().getTime();
      const nextDeadlineTime = new Date(
        startTime + cycleDuration * parseInt(5)
      );
      setNextDeadline(
        `${nextDeadlineTime.toLocaleDateString()} ${nextDeadlineTime.toLocaleTimeString()}`
      );

      return () => clearInterval(interval);
    }
  }, [chitFundData]);

  const renderActionButton = () => {
    if (!userDetail) return null;

    console.log(userDetail);

    if (!userDetail[0]) {
      return (
        <Button
          onClick={handleStakeCollateral}
          disabled={isLoading}
          className="w-full md:w-auto bg-yellow-500 hover:bg-yellow-600"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Shield className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Processing..." : "Stake Collateral"}
        </Button>
      );
    }

    if (!userDetail[1]) {
      return (
        <Button
          onClick={handlePoolIn}
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Processing..." : "Pool In"}
        </Button>
      );
    }

    if (chitFundData && chitFundData[2] === address && !userDetail[3]) {
      return (
        <Button
          onClick={handleClaimFund}
          disabled={isLoading}
          className="w-full md:w-auto bg-green-500 hover:bg-green-600"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Processing..." : "Claim Fund"}
        </Button>
      );
    }

    return (
      <Button disabled className="w-full md:w-auto">
        <CheckCircle className="mr-2 h-4 w-4" />
        All Actions Completed
      </Button>
    );
  };

  if (isChitFundLoading || isUserDetailLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
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
              ₹
              {(
                parseFloat(formatEther(chitFundData[3])) * ethereumPrice
              ).toFixed(2)}{" "}
              total
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
                Chit Fund Ends In
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{timeLeft}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Next Deadline
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {nextDeadline}
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
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {participant.result[2] ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {participant.result[3] ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
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
                <p className="text-center py-4">No defaulters at this time.</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          © 2024 BaseTrust. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
