import React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Wallet, Users, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center">
          <img
            src="/BaseTrustLogo.png"
            alt="BaseTrust Logo"
            className="h-14"
          />
        </a>
        <nav className="hidden md:flex space-x-4">
          <a href="/app" className="text-gray-600 hover:text-primary">
            Funds
          </a>
          <a href="/chitfund/create" className="text-gray-600 hover:text-primary">
            Create
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
              <a href="/dashboard" className="text-gray-600 hover:text-primary">
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
  );
};

export default Header;
