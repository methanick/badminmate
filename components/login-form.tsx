"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LoginFormProps {
  onLogin: (username: string) => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (!username.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้");
      return;
    }

    if (!password.trim()) {
      setError("กรุณากรอกรหัสผ่าน");
      return;
    }

    // Simple validation - you can customize this
    if (username.trim() === "admin" && password.trim() === "password") {
      onLogin(username);
      setUsername("");
      setPassword("");
    } else {
      setError("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle className="text-center text-2xl">BadminMate</CardTitle>
          <p className="text-center text-sm mt-1 text-blue-100">
            ระบบจัดการสนามแบดมินตัน
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                ชื่อผู้ใช้
              </label>
              <Input
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">รหัสผ่าน</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 px-3 py-2 rounded text-sm text-blue-700">
              <p className="font-medium mb-1">ทดสอบล็อกอิน:</p>
              <p>
                ชื่อผู้ใช้: <code className="bg-white px-1">admin</code>
              </p>
              <p>
                รหัสผ่าน: <code className="bg-white px-1">password</code>
              </p>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              ล็อกอิน
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
