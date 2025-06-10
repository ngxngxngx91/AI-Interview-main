"use client";

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';

function CustomLoginForm() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!isLoaded) return;
    try {
      const result = await signIn.create({ identifier: email, password });
      await setActive({ session: result.createdSessionId });
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.errors?.[0]?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Social login handlers (optional, can be implemented with Clerk's openSignIn)
  const handleSocial = (strategy) => {
    if (!isLoaded) return;
    signIn.authenticateWithRedirect({ strategy, redirectUrl: '/dashboard' });
  };

  return (
    <div className="w-full max-w-md flex flex-col items-center justify-center translate-x-36">
      <Image src="/logo.png" alt="Logo" width={64} height={64} className="mb-4" />
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Chào mừng bạn đến với<br />AI.Interview</h2>
      <p className="text-base text-center text-gray-500 mb-6">Đăng nhập để bắt đầu hành trình chinh phục phỏng vấn</p>
      <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
        <label className="text-left w-full text-gray-700 font-semibold mb-1">Email hoặc tên người dùng</label>
        <input
          className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 mb-4 text-base focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder:text-gray-400 transition-all"
          placeholder="Nhập email hoặc tên người dùng của bạn"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <label className="text-left w-full text-gray-700 font-semibold mb-1">Mật khẩu</label>
        <input
          type="password"
          className="w-full rounded-xl border border-gray-200 bg-white text-gray-900 px-4 py-3 mb-4 text-base focus:border-green-400 focus:ring-2 focus:ring-green-100 placeholder:text-gray-400 transition-all"
          placeholder="Nhập mật khẩu của bạn"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full rounded-full bg-[#B5ED76] hover:bg-[#b6f2c7] text-gray-900 font-semibold py-3 mt-2 mb-4 text-base transition-all duration-300"
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
        {error && <div className="text-red-500 text-center mb-2">{error}</div>}
      </form>
      <div className="text-center text-gray-500 mb-2">
        Chưa có tài khoản? <a href="/sign-up" className="font-bold text-gray-800">Đăng ký ngay</a>
      </div>
      <div className="flex items-center w-full my-4">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="mx-2 text-gray-400 text-sm">hoặc</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>
      <div className="flex flex-row items-center justify-center gap-4 mt-2 mb-2">
        <button
          type="button"
          aria-label="Đăng nhập với Facebook"
          className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-gray-100 mx-2 shadow-none"
          onClick={() => handleSocial('oauth_facebook')}
        >
          <Image src="/facebook.png" alt="Facebook" width={28} height={28} />
        </button>
        <button
          type="button"
          aria-label="Đăng nhập với Google"
          className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-200 bg-white hover:bg-gray-100 mx-2 shadow-none"
          onClick={() => handleSocial('oauth_google')}
        >
          <Image src="/google.png" alt="Google" width={28} height={28} />
        </button>
      </div>
    </div>
  );
}

export default function Page() {
    return (
        <div className="min-h-screen w-full flex flex-row bg-transparent">
            {/* Left Side: 3/4, sign-in form, background image */}
            <div
                className="w-full min-h-screen flex items-center justify-center relative"
                style={{
                    backgroundImage: 'url(/sign-in,up_background.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <CustomLoginForm />
            </div>
            {/* Right Side: 1/4, image only, background color and background image matches left bg */}
            <div
                className="w-full min-h-screen flex items-center justify-center relative overflow-hidden"
                style={{
                    backgroundColor: '#F7F5EF',
                    backgroundImage: 'url(/sign-in,up_background.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <Image
                        src="/sign-in.png"
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