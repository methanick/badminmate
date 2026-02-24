"use client";

import { HistoryPanel } from "@/components/history-panel";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppContext } from "@/contexts/app-context";
import { getAllSessions } from "@/lib/api/sessions";
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";

interface Session {
  id: string;
  name: string;
  created_at: string;
}

export default function HistoryPage() {
  const { currentUser } = useAppContext();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [currentUser]);

  const loadSessions = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const data = await getAllSessions();
      setSessions(data);
      // Auto-select first session if available
      if (data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Card className="border-gray-200 py-0">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex-shrink-0">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">
                  เลือกแมทช์ที่จะดู
                </label>
                {isLoading ? (
                  <p className="text-sm text-gray-400">กำลังโหลด...</p>
                ) : sessions.length > 0 ? (
                  <Select
                    value={selectedSessionId}
                    onValueChange={setSelectedSessionId}
                  >
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="เลือกแมทช์" />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          <div className="flex flex-col">
                            <p className="font-medium">{session.name}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-gray-400">
                    ยังไม่มีแมทช์ กรุณาสร้างแมทช์ใหม่ที่หน้าสนามหรือคิว
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedSessionId && <HistoryPanel sessionId={selectedSessionId} />}
    </div>
  );
}
