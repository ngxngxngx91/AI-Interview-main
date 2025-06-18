"use client";

import {SignUp} from '@clerk/nextjs';
import {motion} from 'framer-motion';
import {
    Brain,
    Rocket,
    Shield,
    Star,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    Mail,
    Lock,
    Loader2,
    Github,
    User,
    Home
} from 'lucide-react';
import {Badge} from "@/components/ui/badge";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {useState, useRef} from "react";
import {useRouter} from 'next/navigation';

const features = [
    {
        icon: Brain,
        title: "Học Hỏi Thông Minh",
        description: "AI linh hoạt thích nghi với phong cách phỏng vấn và sự tiến bộ của bạn, đưa bạn đến gần hơn với thành công!",
        color: "from-blue-500 to-blue-600"
    },
    {
        icon: Rocket,
        title: "Phát Triển Sự Nghiệp",
        description: "Tăng cường sự tự tin và nâng cao tỷ lệ thành công trong phỏng vấn, mở ra cánh cửa tương lai rực sáng!",
        color: "from-purple-500 to-purple-600"
    },
    {
        icon: Shield,
        title: "Trải Nghiệm An Toàn",
        description: "Môi trường bảo mật thông tin để bạn rèn giũa câu trả lời hoàn hảo, sẵn sàng tỏa sáng!",
        color: "from-green-500 to-green-600"
    },
    {
        icon: Star,
        title: "Tính Năng Cao Cấp",
        description: "Truy cập kho dữ liệu phỏng vấn chuyên sâu, đặc thù cho từng ngành, giúp bạn vượt qua mọi thử thách!",
        color: "from-orange-500 to-orange-600"
    }
];

const stats = [
    {
        icon: Brain,
        value: "24/7",
        label: "Hỗ Trợ Từ AI",
        color: "text-blue-500"
    },
    {
        icon: Rocket,
        value: "95%",
        label: "Tỷ Lệ Thành Công Đột Phá",
        color: "text-purple-500"
    },
    {
        icon: Shield,
        value: "100%",
        label: "Bảo Mật Thông Tin",
        color: "text-green-500"
    }
];

const benefits = [
    {
        title: "Personalized Learning",
        description: "AI adapts to your unique interview style"
    },
    {
        title: "Instant Feedback",
        description: "Get real-time analysis of your responses"
    }
];

export default function Page() {
    const router = useRouter();

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
                                Khởi Đầu Câu Chuyện Thành Công Với Phỏng Vấn Của Bạn
                            </Badge>
                        </motion.div>

                        <div className="space-y-4">
                            <motion.h1
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: 0.1}}
                                className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                            >
                                Bắt Đầu Hành Trình Ngay Hôm Nay
                            </motion.h1>
                            <motion.p
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                transition={{duration: 0.5, delay: 0.2}}
                                className="text-lg text-slate-600 dark:text-slate-400"
                            >
                                Cùng gia nhập hàng ngàn người đã thay đổi hoàn toàn kỹ năng phỏng vấn của họ với sự đồng
                                hành của AI-Interview!
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

                        {/* Enhanced Success Story */}
                        {/* <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Câu Chuyện Thành Công
              </h2>
              <Card className="relative overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-transparent">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
                <CardContent className="relative p-6">
                  <p className="text-slate-700 dark:text-slate-300 italic">
                    "AI-Interview đã giúp tôi chinh phục công việc mơ ước. Phản hồi cá nhân hóa chính là chìa khóa tạo nên sự khác biệt!"
                  </p>
                  <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Sarah K., Kỹ Sư Phần Mềm
                  </div>
                </CardContent>
              </Card>
            </motion.div> */}
                    </div>

                    {/* Right Side - Enhanced Sign Up Form */}
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
                                            Tạo Tài Khoản Của Bạn
                                        </h2>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            Bắt đầu con đường dẫn bạn đến đỉnh cao thành công trong phỏng vấn!
                                        </p>
                                    </div>
                                    <SignUp
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
                                        path="/sign-up"
                                        signInUrl="/sign-in"
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