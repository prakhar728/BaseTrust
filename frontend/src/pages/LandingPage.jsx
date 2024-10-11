import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Shield, Zap, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function BaseTrustLanding() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('app'); // Navigate to /app when "Get Started" is clicked
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <motion.header
        className="px-4 lg:px-6 h-16 flex items-center border-b border-gray-200 bg-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <a className="flex items-center justify-center" href="#">
          <Shield className="h-6 w-6 text-primary" />
          <span className="ml-2 text-2xl font-bold text-primary">
            BaseTrust
          </span>
        </a>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <a className="text-sm font-medium hover:text-primary" href="#">
            Connect
          </a>
        </nav>
      </motion.header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary text-white">
          <motion.div
            className="container px-4 md:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div
                className="space-y-2"
                variants={fadeIn}
                initial="initial"
                animate="animate"
              >
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Welcome to BaseTrust
                </h1>
                <p className="mx-auto max-w-[700px] text-primary-100 md:text-xl">
                  Revolutionizing traditional Indian chit funds with blockchain
                  technology. Experience secure, transparent, and decentralized
                  financial communities.
                </p>
              </motion.div>
              <motion.div
                className="space-x-4"
                variants={fadeIn}
                initial="initial"
                animate="animate"
              >
                <Button
                  className="bg-white text-primary hover:bg-primary-50"
                  onClick={handleGetStarted}
                >
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-primary-600"
                  as="a"
                  href="https://github.com/your-repo-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-gray-900"
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              Key Features
            </motion.h2>
            <motion.div
              className="grid gap-6 lg:grid-cols-3"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Zap,
                  title: "On-Chain Chit Funds",
                  description:
                    "Transform traditional chit funds into secure and transparent blockchain-based communities.",
                },
                {
                  icon: Shield,
                  title: "Enhanced Security",
                  description:
                    "Leverage Base L2 solution for unparalleled security and transparency in all transactions.",
                },
                {
                  icon: TrendingUp,
                  title: "On-Chain Credit Score",
                  description:
                    "Build your financial reputation with an immutable, blockchain-based credit score.",
                },
              ].map((feature, index) => (
                <motion.div key={index} variants={fadeIn}>
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <feature.icon className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-gray-900">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <motion.h2
              className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-gray-900"
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              Benefits of BaseTrust
            </motion.h2>
            <motion.div
              className="grid gap-6 lg:grid-cols-2"
              variants={staggerChildren}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: Shield,
                  title: "Trust and Transparency",
                  description:
                    "Immutable blockchain records ensure complete transparency and build trust among participants.",
                },
                {
                  icon: Zap,
                  title: "Efficient Transactions",
                  description:
                    "Fast and low-cost transactions powered by Base L2 technology.",
                },
                {
                  icon: TrendingUp,
                  title: "Financial Inclusion",
                  description:
                    "Expand access to financial services for underserved communities.",
                },
                {
                  icon: Users,
                  title: "Decentralized Governance",
                  description:
                    "Participate in community decisions through decentralized voting mechanisms.",
                },
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start space-x-4"
                  variants={fadeIn}
                >
                  <benefit.icon className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <motion.footer
        className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs text-gray-500">
          © 2024 BaseTrust. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <a
            className="text-xs hover:underline underline-offset-4 text-gray-500 hover:text-primary"
            href="#"
          >
            Terms of Service
          </a>
          <a
            className="text-xs hover:underline underline-offset-4 text-gray-500 hover:text-primary"
            href="#"
          >
            Privacy
          </a>
        </nav>
      </motion.footer>
    </div>
  );
}
