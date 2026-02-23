"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/contexts/app-context";
import { createSession, getAllSessions } from "@/lib/api/sessions";
import { Calendar, Play, X } from "lucide-react";
import { useEffect, useState } from "react";

interface Session {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export function SessionStarter() {
  const {
    currentUser,
    currentSessionId,
    setCurrentSessionId,
    currentSessionName,
    setCurrentSessionName,
  } = useAppContext();
  const [sessionName, setSessionName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Load all sessions
  useEffect(() => {
    if (currentUser?.id) {
      loadSessions();
    }
  }, [currentUser]);

  const loadSessions = async () => {
    try {
      const data = await getAllSessions();
      setSessions(data);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    }
  };

  // Generate default session name
  useEffect(() => {
    if (!currentSessionId) {
      const now = new Date();
      const dateStr = now.toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      const timeStr = now.toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setSessionName(`Badminmate ${dateStr} ${timeStr}`);
    }
  }, [currentSessionId]);

  const handleStartSession = async () => {
    if (!currentUser?.id) {
      alert("กรุณาเข้าสู่ระบบ");
      return;
    }

    if (!sessionName.trim()) {
      alert("กรุณาใส่ชื่อแมทช์");
      return;
    }

    try {
      setIsLoading(true);
      const newSession = await createSession(sessionName);
      setCurrentSessionId(newSession.id);
      setCurrentSessionName(newSession.name);
      setShowForm(false);
      await loadSessions();
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("ไม่สามารถสร้างแมทช์ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      setCurrentSessionId(session.id);
      setCurrentSessionName(session.name);
    }
  };

  const handleEndSession = () => {
    if (confirm("ต้องการจบการจัดก๊วนนี้ใช่หรือไม่?")) {
      setCurrentSessionId(null);
      setCurrentSessionName(null);
    }
  };

  // If session already started, show session info bar
  if (currentSessionId && currentSessionName) {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full flex-shrink-0">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">กำลังจัดก๊วน</p>
                <p className="font-semibold text-blue-900 truncate">
                  {currentSessionName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                onClick={handleEndSession}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="w-4 h-4 mr-2" />
                จบการจัดก๊วน
              </Button>
            </div>
          </div>

          {showForm && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="max-w-xl space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สร้างแมทช์ใหม่
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Badminmate 23/02/2026 14:30"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleStartSession();
                        }
                      }}
                      className="h-10"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleStartSession}
                      disabled={isLoading || !sessionName.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? "..." : "สร้าง"}
                    </Button>
                    <Button
                      onClick={() => setShowForm(false)}
                      variant="outline"
                      disabled={isLoading}
                    >
                      ยกเลิก
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Session starter form
  return (
    <Card className="mb-6 border-purple-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardContent className="py-6">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-3 shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            เริ่มจัดก๊วนใหม่
          </h2>
          <p className="text-gray-600 mt-1">
            ตั้งชื่อแมทช์และเริ่มจัดการสนามของคุณ
          </p>
        </div>

        <div className="max-w-xl mx-auto space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ชื่อแมทช์
            </label>
            <Input
              type="text"
              placeholder="Badminmate 23/02/2026 14:30"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleStartSession();
                }
              }}
              className="h-12 text-center text-lg"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleStartSession}
            disabled={isLoading || !sessionName.trim()}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                กำลังสร้างแมทช์...
              </div>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                เริ่มจัดก๊วน
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
