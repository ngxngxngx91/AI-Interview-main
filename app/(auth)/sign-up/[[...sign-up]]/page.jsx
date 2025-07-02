"use client";

import { Brain, Eye, EyeOff, Rocket, Shield, Star } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Danh sách các tính năng chính của ứng dụng
const features = [
    {
        icon: Brain,
        title: "Smart Learning",
        description:
            "AI adapts to your interview style and progress, bringing you closer to success!",
        color: "from-blue-500 to-blue-600",
    },
    {
        icon: Rocket,
        title: "Career Growth",
        description:
            "Boost confidence and increase interview success rates, opening doors to a bright future!",
        color: "from-purple-500 to-purple-600",
    },
    {
        icon: Shield,
        title: "Secure Experience",
        description:
            "A secure environment to perfect your answers and shine in your interviews!",
        color: "from-green-500 to-green-600",
    },
    {
        icon: Star,
        title: "Premium Features",
        description:
            "Access in-depth interview resources tailored to your industry!",
        color: "from-orange-500 to-orange-600",
    },
];

// Thống kê về nền tảng
const stats = [
    {
        icon: Brain,
        value: "24/7",
        label: "AI Support",
        color: "text-blue-400",
    },
    {
        icon: Rocket,
        value: "95%",
        label: "Success Rate",
        color: "text-purple-400",
    },
    {
        icon: Shield,
        value: "100%",
        label: "Data Security",
        color: "text-emerald-400",
    },
];

// Lợi ích khi sử dụng nền tảng
const benefits = [
    {
        title: "Personalized Learning",
        description: "AI adapts to your unique interview style",
    },
    {
        title: "Instant Feedback",
        description: "Get real-time analysis of your responses",
    },
];

function CustomSignUpForm() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            fetch(`/api/auth/sign-up`, {
                method: "POST",
                body: JSON.stringify({
                    fullName: name,
                    username,
                    email,
                    password,
                }),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Đã xảy ra lỗi");
                    }
                    router.push("/sign-in");
                })
                .catch((error) => {
                    console.error("Đã xảy ra lỗi:", error);
                });
        } catch (err) {
            setError(err.errors?.[0]?.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleSocial = (strategy) => {
        window.location.href = `/api/auth/${strategy}/login`;
    };

    return (
        <div className="w-full max-w-md flex flex-col items-center justify-center min-[1500px]:translate-x-36 max-sm:px-2">
            <Image
                src="/logo.png"
                alt="Logo"
                width={64}
                height={64}
                className="mb-4"
            />
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                Đăng ký tài khoản
            </h2>
            <p className="text-base text-center text-gray-500 mb-6">
                Tạo tài khoản để Bắt đầu con đường dẫn bạn đến đỉnh cao thành
                công trong phỏng vấn
            </p>
            <form
                onSubmit={handleSubmit}
                className="w-full flex flex-col items-center"
            >
                <label className="text-left w-full text-gray-700 font-semibold mb-1">
                    Họ và tên
                </label>
                <input
                    className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 mb-4 text-base focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder:text-gray-400 transition-all"
                    placeholder="Nhập họ và tên"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <label className="text-left w-full text-gray-700 font-semibold mb-1">
                    Tên người dùng
                </label>
                <input
                    className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 mb-4 text-base focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder:text-gray-400 transition-all"
                    placeholder="Nhập tên người dùng"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label className="text-left w-full text-gray-700 font-semibold mb-1">
                    Địa chỉ email
                </label>
                <input
                    type="email"
                    className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 mb-4 text-base focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder:text-gray-400 transition-all"
                    placeholder="Nhập địa chỉ email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label className="text-left w-full text-gray-700 font-semibold mb-1">
                    Mật khẩu
                </label>
                <div className="w-full relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 text-base focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder:text-gray-400 transition-all pr-12"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                        onClick={() => setShowPassword((v) => !v)}
                    >
                        {showPassword ? (
                            <EyeOff size={20} />
                        ) : (
                            <Eye size={20} />
                        )}
                    </button>
                </div>
                <button
                    type="submit"
                    className="w-full rounded-full bg-[#B5ED76] hover:bg-[#b6f2c7] text-gray-900 font-semibold py-3 mt-2 mb-4 text-base transition-all duration-300"
                    disabled={loading}
                >
                    {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>
                {error && (
                    <div className="text-red-500 text-center mb-2">{error}</div>
                )}
            </form>
            <div className="text-center text-gray-500 mb-2">
                Đã có tài khoản?{" "}
                <a href="/sign-in" className="font-bold text-gray-800">
                    Đăng nhập ngay
                </a>
            </div>
            <div className="flex items-center w-full my-4">
                <div className="flex-grow h-px bg-gray-300" />
                <span className="mx-2 text-gray-400 text-sm">hoặc</span>
                <div className="flex-grow h-px bg-gray-300" />
            </div>
            <div className="flex flex-row items-center justify-center gap-4 mt-2 mb-2">
                <button
                    type="button"
                    aria-label="Đăng ký với Google"
                    className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-gray-100 mx-2 shadow-none"
                    onClick={() => handleSocial("google")}
                >
                    <Image
                        src="/google.png"
                        alt="Google"
                        width={28}
                        height={28}
                    />
                </button>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <div className="min-h-screen w-full flex flex-row bg-transparent">
            {/* Button to go to landing page */}
            <Link href="/" className="absolute top-6 left-6 z-50">
                <button className="bg-white border border-gray-200 rounded-full px-4 py-2 shadow hover:bg-gray-100 font-semibold text-gray-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                    Trang chủ
                </button>
            </Link>
            {/* Left Side: 3/4, sign-up form, background image */}
            <div className="w-full min-h-screen flex items-center justify-center relative bg-[#F7F5EF]">
                <Image
                    src={"/bg-bottom-icon.png"}
                    alt={"Bottom Icon"}
                    className={"absolute bottom-0 left-0"}
                    width={100}
                    height={100}
                />
                <CustomSignUpForm />
            </div>
            {/* Right Side: 1/4, image only, background color and background image matches left bg */}
            <div className="w-full min-h-screen flex items-center justify-center relative overflow-hidden bg-[#F7F5EF] max-[1500px]:hidden">
                <Image
                    src={"/bg-top-icon.png"}
                    alt={"Top Icon"}
                    className={
                        "absolute top-0 right-[33rem] max-[1500px]:hidden"
                    }
                    width={100}
                    height={100}
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <Image
                        src="/sign-up.png"
                        alt="Sign In Illustration"
                        width={750}
                        height={950}
                        quality={100}
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
