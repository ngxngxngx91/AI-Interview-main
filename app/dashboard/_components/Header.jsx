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
    Sparkles,
    CircleUserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/app/context/UserContext";

// Component Header chính của ứng dụng
function Header() {
    const path = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isDashboard = path === "/dashboard";
    const isInterview = path.includes("interview");
    const [showMenuDrawer, setShowMenuDrawer] = useState(false);
    const user = useUser();

    const handleLogout = () => {
        window.location.href = "/";
        fetch("/api/auth/logout", {
            method: "POST",
        }).catch((error) => {
            console.error("Lỗi khi đăng xuất:", error);
        });
    };

    // Xử lý hiệu ứng cuộn trang
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Không hiển thị header ở trang phỏng vấn
    if (isInterview) return null;

    // Danh sách các mục menu chính
    const menuItems = [
        {
            name: "Dashboard",
            link: "/dashboard",
            icon: Home,
            description: "Your training hub",
        },
        {
            name: "Suggest Us",
            link: "/dashboard/questions",
            icon: Lightbulb,
            description: "Help us improve",
        },
        {
            name: "Upgrade Account",
            link: "/dashboard/upgrade",
            icon: Crown,
            description: "Unlock full potential",
        },
        {
            name: "How It Works?",
            link: "/dashboard/how",
            icon: HelpCircle,
            description: "Learn the process",
        },
    ];

    return (
        <>
            {/* Khoảng trống để tránh nội dung bị che bởi header cố định */}
            <div className="h-[72px]" />

            <header className="w-full bg-[#FAF8F6] border-b border-[#eceae6] fixed top-0 left-0 right-0 z-50">
                <div className="relative">
                    <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 xl:px-32 py-3 z-20">
                        {/* Logo và tên ứng dụng */}
                        <Link href="/" className="flex-shrink-0 relative group flex items-center gap-2">
                            <Image
                                src="/Logo.png"
                                alt="Logo"
                                width={40}
                                height={40}
                                className="w-auto h-12 relative"
                                priority
                            />
                            <span className="hidden sm:inline text-2xl font-bold text-[#3d463b] ml-1">
                                AI.Interview
                            </span>
                        </Link>

                        {/* Menu chính ở giữa */}
                        <nav className="flex-1 flex items-center justify-center max-lg:hidden">
                            <ul className="flex gap-8">
                                <li>
                                    <a
                                        href="/dashboard"
                                        className="text-[#3d463b] font-semibold px-2 py-1 border-b-2 border-[#3d463b] hover:text-lime-700"
                                    >
                                        Dashboard
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-[#3d463b] font-normal px-2 py-1 hover:underline hover:text-lime-700"
                                    >
                                        Về chúng tôi
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-[#3d463b] font-normal px-2 py-1 hover:underline hover:text-lime-700"
                                    >
                                        Affiliate
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="text-[#3d463b] font-normal px-2 py-1 hover:underline hover:text-lime-700"
                                    >
                                        Cách hoạt động
                                    </a>
                                </li>
                            </ul>
                        </nav>

                        {/* Phần bên phải: Nút nâng cấp và tài khoản người dùng */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/pricing"
                                className="text-[#4B6358] hover:text-[#22372B] transition-colors font-normal relative"
                            >
                                <Image
                                    src="/header-diamond.png"
                                    alt="Diamond"
                                    width={39}
                                    height={39}
                                    className="absolute -left-4"
                                />
                                <Button className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-full px-6 py-2 flex items-center gap-2 shadow-md">
                                    Nâng cấp
                                </Button>
                            </Link>
                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <CircleUserRound className="w-7 h-7 text-black cursor-pointer" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuContent className="p-2">
                                            <DropdownMenuItem className="text-white hover:!bg-black">
                                                {user.email}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="cursor-pointer"
                                                onClick={handleLogout}
                                            >
                                                <span className="w-full text-center">
                                                    Đăng xuất
                                                </span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenuPortal>
                                </DropdownMenu>
                            ) : (
                                ""
                            )}
                            <Menu
                                className="cursor-pointer ml-1 text-[50px] lg:hidden"
                                color="black"
                                onClick={() =>
                                    setShowMenuDrawer(!showMenuDrawer)
                                }
                            />
                        </div>
                    </div>

                    <AnimatePresence>
                        {showMenuDrawer && (
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute left-0 right-0 top-full block w-full bg-[#f4f3f2] p-5 rounded-b-[32px] shadow-lg z-10"
                            >
                                <ul className="flex gap-8 flex-col justify-center items-center">
                                    <li>
                                        <a
                                            href="/dashboard"
                                            className="text-[#3d463b] font-semibold px-2 py-1 border-b-2 border-[#3d463b] hover:text-lime-700"
                                        >
                                            Dashboard
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-[#3d463b] font-normal px-2 py-1 hover:underline hover:text-lime-700"
                                        >
                                            Về chúng tôi
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-[#3d463b] font-normal px-2 py-1 hover:underline hover:text-lime-700"
                                        >
                                            Affiliate
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-[#3d463b] font-normal px-2 py-1 hover:underline hover:text-lime-700"
                                        >
                                            Cách hoạt động
                                        </a>
                                    </li>
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>
        </>
    );
}

export default Header;
