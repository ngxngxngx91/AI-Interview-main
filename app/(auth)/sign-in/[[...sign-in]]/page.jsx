"use client";

import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
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
    ArrowRight
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Danh sách các tính năng chính của ứng dụng
const features = [
    {
        icon: Brain,
        title: "AI-Powered Practice",
        description: "Get instant feedback from our intelligent AI system",
        color: "from-blue-500 to-blue-600"
    },
    {
        icon: MessageSquare,
        title: "Detailed Feedback",
        description: "Comprehensive analysis of your responses",
        color: "from-orange-500 to-orange-600"
    },
    {
        icon: Target,
        title: "Industry-Specific Prep",
        description: "Master questions and scenarios specific to your field!",
        color: "from-purple-500 to-purple-600"
    },
    {
        icon: Users,
        title: "Expert Guidance",
        description: "Discover success secrets from industry experts!",
        color: "from-green-500 to-green-600"
    },
];

// Thống kê về nền tảng
const stats = [
    {
        icon: Shield,
        value: "500+",
        label: "Challenging Questions",
        color: "text-blue-400"
    },
    {
        icon: Zap,
        value: "50+",
        label: "Diverse Industries",
        color: "text-purple-400"
    },
    {
        icon: Clock,
        value: "24/7",
        label: "Always Available",
        color: "text-emerald-400"
    }
];

// Lợi ích khi sử dụng nền tảng
const benefits = [
    {
        icon: Star,
        title: "Build Confidence",
        description: "Develop interview confidence through regular practice"
    },
    {
        icon: TrendingUp,
        title: "Track Progress",
        description: "Monitor your improvement over time"
    }
];

export default function Page() {
    return (
        <div className="min-h-screen bg-gray-900">
            {/* Nền trang với hiệu ứng gradient và pattern */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-grid-gray-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-emerald-500/10 animate-pulse" />
            </div>

            <div className="relative container mx-auto flex min-h-screen items-center justify-center p-8">
                <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
                    {/* Cột trái - Giới thiệu tính năng */}
                    <div className="space-y-8 text-gray-100 lg:pr-8">
                        {/* Badge chào mừng với animation */}
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-gray-700/60"
                            >
                                <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
                                Welcome Back to Your Interview Journey
                            </Badge>
                        </motion.div>

                        {/* Tiêu đề và mô tả */}
                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent"
                            >
                                Continue Your Path to Success
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-lg text-gray-400"
                            >
                                Resume your journey with personalized AI coaching and expert insights!
                            </motion.p>
                        </div>

                        {/* Thống kê với hiệu ứng hover */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="grid grid-cols-3 gap-4"
                        >
                            {stats.map((stat, index) => (
                                <div
                                    key={stat.label}
                                    className="relative group overflow-hidden rounded-lg bg-gray-800/80 backdrop-blur-lg p-4 shadow-lg border border-gray-700/60 transition-all duration-300 hover:shadow-xl hover:border-blue-500/40"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="relative">
                                        <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                        <div className="text-sm text-gray-400 font-bold">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Lưới tính năng với hiệu ứng hover */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {features.map((feature, index) => (
                                <div
                                    key={feature.title}
                                    className="relative group"
                                >
                                    <Card className="relative overflow-hidden bg-gray-800/80 backdrop-blur-lg border border-gray-700/60 hover:border-blue-500/40 transition-all duration-300">
                                        <CardContent className="p-6">
                                            <div className="p-3 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 w-fit mb-4">
                                                <feature.icon className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <h3 className="font-bold text-gray-100">{feature.title}</h3>
                                            <p className="text-sm text-gray-400 mt-1">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </motion.div>

                        {/* Phần lợi ích */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="space-y-4"
                        >
                            <h2 className="text-xl font-semibold text-gray-100">Why Choose AI-Interview?</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {benefits.map((benefit, index) => (
                                    <div key={benefit.title} className="flex items-center gap-2 text-gray-300">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <span>{benefit.title}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Cột phải - Form đăng nhập */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:pl-8"
                    >
                        <Card className="relative overflow-hidden bg-gray-800/80 backdrop-blur-lg border border-gray-700/60 shadow-xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
                            <div className="relative p-6">
                                <div className="space-y-6">
                                    {/* Header form đăng nhập */}
                                    <div className="space-y-2 text-center">
                                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                                            Welcome Back
                                        </h2>
                                        <p className="text-sm text-gray-400">
                                            Continue your journey to interview success!
                                        </p>
                                    </div>
                                    {/* Component đăng nhập từ Clerk */}
                                    <SignIn
                                        appearance={{
                                            elements: {
                                                formButtonPrimary:
                                                    "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300",
                                                formButtonSecondary:
                                                    "bg-gray-700/80 border-gray-600 hover:bg-gray-700 text-gray-100 transition-colors",
                                                card: "bg-transparent shadow-none",
                                                headerTitle: "text-gray-100",
                                                headerSubtitle: "text-gray-400",
                                                socialButtonsBlockButton:
                                                    "bg-gray-700/80 border border-gray-600 hover:bg-gray-700 text-gray-100 transition-colors",
                                                socialButtonsBlockButtonText: "text-gray-100",
                                                socialButtonsBlockButtonArrow: "text-gray-100",
                                                dividerLine: "bg-gray-700",
                                                dividerText: "text-gray-400",
                                                formFieldLabel: "text-gray-300",
                                                formFieldInput:
                                                    "bg-gray-700/60 border-gray-600 text-gray-100 placeholder:text-gray-500 focus:border-blue-500/50 transition-colors",
                                                formFieldInputShowPasswordButton: "text-gray-400",
                                                footerActionLink: "text-blue-400 hover:text-blue-300",
                                                footerActionText: "text-gray-400",
                                                identityPreviewText: "text-gray-100",
                                                identityPreviewEditButton:
                                                    "text-gray-400 hover:text-gray-300",
                                                alertText: "text-gray-400",
                                                formFieldWarningText: "text-yellow-400",
                                                formFieldErrorText: "text-red-400",
                                                headerBackIcon: "text-gray-100",
                                                headerBackLink: "text-gray-100 hover:text-gray-300",
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