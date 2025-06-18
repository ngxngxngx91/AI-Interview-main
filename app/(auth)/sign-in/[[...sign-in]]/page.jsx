"use client";

import {SignIn} from '@clerk/nextjs';
import {motion} from 'framer-motion';
import {
    Brain,
    Target,
    Users,
    MessageSquare,
    Sparkles,
    CheckCircle2,
    Shield,
    Zap,
    Clock,
    Star,
    TrendingUp,
    Home
} from 'lucide-react';
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Link from "next/link";

const features = [
    {
        icon: Brain,
        title: "Thực Hành Cùng AI",
        description: "Nhận phản hồi tức thì từ hệ thống AI thông minh",
        color: "from-blue-500 to-blue-600"
    },
    {
        icon: MessageSquare,
        title: "Phản Hồi Chi Tiết",
        description: "Phân tích toàn diện về câu trả lời của bạn",
        color: "from-orange-500 to-orange-600"
    },
    {
        icon: Target,
        title: "Chuẩn Bị Đúng Mục Tiêu",
        description: "Chinh phục mọi câu hỏi và tình huống đặc trưng của ngành bạn chọn!",
        color: "from-purple-500 to-purple-600"
    },
    {
        icon: Users,
        title: "Dẫn Lối Từ Chuyên Gia",
        description: "Khám phá bí quyết thành công từ những chia sẻ của chuyên gia!",
        color: "from-green-500 to-green-600"
    },
];

const stats = [
    {
        icon: Shield,
        value: "500+",
        label: "Câu Hỏi Thách Thức",
        color: "text-blue-500"
    },
    {
        icon: Zap,
        value: "50+",
        label: "Ngành Nghề Đa Dạng",
        color: "text-purple-500"
    },
    {
        icon: Clock,
        value: "24/7",
        label: "Luôn Luôn Có Mặt",
        color: "text-green-500"
    }
];

const benefits = [
    {
        icon: Star,
        title: "Cải Thiện Sự Tự Tin",
        description: "Xây Dựng Sự Tự Tin Phỏng Vấn Thông Qua Thực Hành Thường Xuyên"
    },
    {
        icon: TrendingUp,
        title: "Theo Dõi Tiến Độ",
        description: "Giám Sát Sự Cải Thiện Của Bạn Theo Thời Gian"
    }
];

export default function Page() {
    return (
        <div
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
            {/* Enhanced Background Pattern */}
            <div className="absolute inset-0">
                <div
                    className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 bg-[size:3rem_3rem] opacity-20"/>
                <div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-pulse"/>
            </div>

            {/* Return to Landing Page Button */}
            <div className="absolute top-6 right-6 z-50">
                <Link href="/">
                    <Button
                        variant="outline"
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-200"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Về trang chủ
                    </Button>
                </Link>
            </div>

            <div className="relative container mx-auto flex min-h-screen items-center justify-center p-8">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
                    {/* Left Side - Enhanced Features */}
                    <div className="space-y-8 text-slate-900 dark:text-white lg:pr-8">
                        <motion.div
                            initial={{scale: 0.8}}
                            animate={{scale: 1}}
                            transition={{duration: 0.5}}
                        >
                            <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 border-black"
                            >
                                <Sparkles className="w-4 h-4 mr-2 text-blue-500"/>
                                Chào Mừng Trở Lại Hành Trình Chinh Phục Phỏng Vấn
                            </Badge>
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h1
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: 0.1}}
                                className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                            >
                                Tiếp Tục Chạm Đến Ước Mơ Thành Công Của Bạn
                            </motion.h1>
                            <motion.p
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: 0.2}}
                                className="text-lg text-slate-600 dark:text-slate-400"
                            >
                                Khởi động lại hành trình cũ với sự đồng hành của AI cá nhân hóa và chia sẻ từ chuyên
                                gia!
                            </motion.p>
                        </div>

                        {/* Enhanced Stats */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5, delay: 0.3}}
                            className="grid grid-cols-3 gap-4"
                        >
                            {stats.map((stat, index) => (
                                <div
                                    key={stat.label}
                                    className="relative group overflow-hidden rounded-lg bg-white dark:bg-gray-800 p-4 shadow-lg transition-all duration-300 hover:shadow-xl"
                                >
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                                    <div className="relative">
                                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                        <div
                                            className="text-sm text-slate-600 dark:text-slate-400 font-bold">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Enhanced Features Grid */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5, delay: 0.4}}
                            className="grid grid-cols-2 gap-4"
                        >
                            {features.map((feature, index) => (
                                <div
                                    key={feature.title}
                                    className="relative group"
                                >
                                    <Card
                                        className="relative overflow-hidden border-black bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                                        <CardContent className="p-6">
                                            <div
                                                className="p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 w-fit mb-4">
                                                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400"/>
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{feature.title}</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </motion.div>

                        {/* Benefits */}
                        <motion.div
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.5, delay: 0.5}}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-semibold text-slate-900">Tại Sao Nên Chọn AI-Interview?</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {benefits.map((benefit, index) => (
                                    <div key={benefit.title} className="flex items-center gap-2 text-slate-700">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0"/>
                                        <span>{benefit.title}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side - Enhanced Sign In Form */}
                    <motion.div
                        initial={{opacity: 0, x: 20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{duration: 0.6}}
                        className="lg:pl-8"
                    >
                        <Card
                            className="relative overflow-hidden border-transparent bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"/>
                            <div className="relative p-6">
                                <div className="space-y-6">
                                    <div className="space-y-2 text-center">
                                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            Chào Mừng Trở Lại
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Cùng tiếp tục hành trình biến giấc mơ phỏng vấn thành hiện thực!
                                        </p>
                                    </div>
                                    <SignIn
                                        appearance={{
                                            elements: {
                                                formButtonPrimary:
                                                    "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300",
                                                formButtonSecondary:
                                                    "bg-white border-slate-200 hover:bg-slate-50 text-slate-900 transition-colors",
                                                card: "bg-transparent shadow-none",
                                                headerTitle: "text-slate-900",
                                                headerSubtitle: "text-slate-600",
                                                socialButtonsBlockButton:
                                                    "bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 transition-colors",
                                                socialButtonsBlockButtonText: "text-slate-900",
                                                socialButtonsBlockButtonArrow: "text-slate-900",
                                                dividerLine: "bg-slate-200",
                                                dividerText: "text-slate-600",
                                                formFieldLabel: "text-slate-700",
                                                formFieldInput:
                                                    "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 transition-colors",
                                                formFieldInputShowPasswordButton: "text-slate-600",
                                                footerActionLink: "text-slate-900 hover:text-slate-700",
                                                footerActionText: "text-slate-600",
                                                identityPreviewText: "text-slate-900",
                                                identityPreviewEditButton:
                                                    "text-slate-600 hover:text-slate-900",
                                                alertText: "text-slate-600",
                                                formFieldWarningText: "text-red-600",
                                                formFieldErrorText: "text-red-600",
                                                headerBackIcon: "text-slate-900",
                                                headerBackLink: "text-slate-900 hover:text-slate-700",
                                            },
                                            layout: {
                                                unsafe_disableDevelopmentModeWarnings: true,
                                                socialButtonsIconButton: "hidden",
                                            }
                                        }}
                                        redirectUrl="/dashboard"
                                        routing="path"
                                        path="/sign-in"
                                        signUpUrl="/sign-up"
                                    />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}