"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { signIn, signInWithProvider, signUp } from "@/lib/api/auth";
import { useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleLogin = async () => {
    setError("");

    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    if (!password.trim()) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
      // Auth state will be handled by onAuthStateChange in AppContext
    } catch (err: any) {
      setError(err.message || "เข้าสู่ระบบไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setError("");

    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    if (!password.trim()) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    try {
      setIsLoading(true);
      await signUp(email, password, username);
      setError("");
      alert("สมัครสมาชิกสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี");
      setMode("login");
    } catch (err: any) {
      setError(err.message || "สมัครสมาชิกไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (
    provider: "google" | "github" | "facebook",
  ) => {
    try {
      setIsLoading(true);
      setError("");
      await signInWithProvider(provider);
      // User will be redirected to OAuth provider
    } catch (err: any) {
      setError(err.message || `เข้าสู่ระบบด้วย ${provider} ไม่สำเร็จ`);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (mode === "login") {
        handleLogin();
      } else {
        handleSignUp();
      }
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="relative w-full max-w-md mx-4 shadow-2xl border-0 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-2 pb-6 pt-8">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-10 h-10 text-white"
                fill="currentColor"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1"
              >
                {/* Shuttlecock - ลูกขนไก่ */}
                {/* Feathers (ขนไก่) */}
                <path
                  d="M12 4 L14 8 L12 7 L10 8 Z"
                  fill="currentColor"
                  opacity="0.9"
                />
                <path
                  d="M12 5 L15 9 L12 8 L9 9 Z"
                  fill="currentColor"
                  opacity="0.8"
                />
                <path
                  d="M12 6 L16 10 L12 9 L8 10 Z"
                  fill="currentColor"
                  opacity="0.7"
                />
                <path
                  d="M12 7 L16.5 11 L12 10 L7.5 11 Z"
                  fill="currentColor"
                  opacity="0.6"
                />
                {/* Cork base (ส่วนหัว) */}
                <ellipse cx="12" cy="14" rx="3" ry="2.5" fill="currentColor" />
                <ellipse cx="12" cy="16" rx="2.5" ry="2" fill="currentColor" />
                <circle cx="12" cy="18" r="2" fill="currentColor" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            BadminMate
          </CardTitle>
          <p className="text-center text-sm text-gray-600">
            ระบบจัดการสนามแบดมินตัน
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {/* Mode Toggle Tabs */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              disabled={isLoading}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                mode === "login"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              disabled={isLoading}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all ${
                mode === "signup"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  ชื่อผู้ใช้ <span className="text-gray-400">(ไม่จำเป็น)</span>
                </label>
                <Input
                  type="text"
                  placeholder="ชื่อของคุณ"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                อีเมล
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                รหัสผ่าน
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={isLoading}
              />
              {mode === "signup" && (
                <p className="text-xs text-gray-500">
                  รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <Button
              onClick={mode === "login" ? handleLogin : handleSignUp}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  กำลังดำเนินการ...
                </div>
              ) : mode === "login" ? (
                "เข้าสู่ระบบ"
              ) : (
                "สมัครสมาชิก"
              )}
            </Button>

            {/* Social Login - ไว้เพิ่มทีหลัง */}
            {/* <div className="relative">
              <Separator className="my-4" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                หรือ
              </div>
            </div>

            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => handleSocialLogin("google")}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                เข้าสู่ระบบด้วย Google
              </Button>

              <Button
                type="button"
                onClick={() => handleSocialLogin("github")}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                <Github className="w-5 h-5 mr-2" />
                เข้าสู่ระบบด้วย GitHub
              </Button>

              <Button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                variant="outline"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                เข้าสู่ระบบด้วย Facebook
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
