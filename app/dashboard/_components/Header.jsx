"use client";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Lightbulb,
  Crown,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function Header() {
  const path = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isDashboard = path === "/dashboard";
  const isInterview = path.includes("interview");

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Early return for interview pages
  if (isInterview) return null;

  const menuItems = [
    {
      name: "Dashboard",
      link: "/dashboard",
      icon: Home,
      description: "Your training hub"
    },
    {
      name: "Suggest Us",
      link: "/dashboard/questions",
      icon: Lightbulb,
      description: "Help us improve"
    },
    {
      name: "Upgrade Account",
      link: "/dashboard/upgrade",
      icon: Crown,
      description: "Unlock full potential"
    },
    {
      name: "How It Works?",
      link: "/dashboard/how",
      icon: HelpCircle,
      description: "Learn the process"
    },
  ];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed header */}
      <div className="h-[72px]" />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500
          ${isScrolled
            ? "bg-gradient-to-r from-black/95 via-gray-900/95 to-black/95 backdrop-blur-lg shadow-lg"
            : "bg-gradient-to-r from-black via-gray-900 to-black"}`}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 ${isDashboard ? "flex justify-between items-center" : "flex justify-center"
          }`}>
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
            <Image
              src="/Logo.png"
              alt="Logo"
              width={120}
              height={50}
              className="w-auto h-12 relative"
              priority
            />
          </motion.div>

          {/* Dashboard Menu */}
          {isDashboard && (
            <>
              {/* Centered Menu */}
              <div className="flex-1 flex items-center justify-center">
                {/* Desktop Menu */}
                <nav className="hidden md:flex items-center gap-2">
                  {menuItems.map(({ name, link, icon: Icon, description }) => (
                    <TooltipProvider key={link}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              variant="ghost"
                              className={`relative overflow-hidden group px-4 py-2
                                ${path === link
                                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white"
                                  : "text-gray-300 hover:text-white"}`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300" />
                              <div className="relative flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                <span>{name}</span>
                                {path === link && (
                                  <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" />
                                )}
                              </div>
                            </Button>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">{description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </nav>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(!isOpen)}
                  className="md:hidden text-white hover:bg-white/10 transition-colors"
                >
                  <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </motion.div>
                </Button>
              </div>

              {/* User Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0 relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 rounded-full" />
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10 ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300"
                    },
                    layout: {
                      unsafe_disableDevelopmentModeWarnings: true,
                      socialButtonsIconButton: "hidden",
                    }
                  }}
                  afterSignOutUrl="/"
                />
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-lg border-t border-white/10"
            >
              <div className="px-4 py-3 space-y-1">
                {menuItems.map(({ name, link, icon: Icon, description }) => (
                  <motion.div
                    key={link}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{ x: 5 }}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start group
                        ${path === link
                          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white"
                          : "text-gray-300 hover:text-white"}`}
                    >
                      <Icon className="w-4 h-4 mr-2 group-hover:text-blue-400 transition-colors" />
                      <div className="flex flex-col items-start">
                        <span>{name}</span>
                        <span className="text-xs text-gray-400">{description}</span>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}

export default Header;
