"use client";

import { CourtCard } from "@/components/court-card";
import { HistoryPanel } from "@/components/history-panel";
import { QueueItem } from "@/components/queue-item";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import { Court } from "@/model/court.model";
import { QueuedMatch } from "@/model/queued-match.model";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface MatchPublicViewProps {
  sessionId: string;
}

interface Session {
  id: string;
  name: string;
  date: string;
  user_id: string;
  created_at: string;
}

export function MatchPublicView({ sessionId }: MatchPublicViewProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [queuedMatches, setQueuedMatches] = useState<QueuedMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (!error && data) {
      setSession(data);
    }
  }, [sessionId]);

  const loadCourts = useCallback(async () => {
    const { data, error } = await supabase
      .from("courts")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setCourts(
        data.map((court) => ({
          id: court.id,
          name: court.name,
          team1: court.team1 || [null, null],
          team2: court.team2 || [null, null],
          isPlaying: court.is_playing || false,
        })),
      );
    }
  }, [sessionId]);

  const loadQueues = useCallback(async () => {
    const { data, error } = await supabase
      .from("queued_matches")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setQueuedMatches(
        data.map((queue) => ({
          id: queue.id,
          team1: queue.team1 || [null, null],
          team2: queue.team2 || [null, null],
          createdAt: queue.created_at,
          courtId: queue.court_id,
        })),
      );
    }
  }, [sessionId]);

  const loadMatchData = useCallback(async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadSession(), loadCourts(), loadQueues()]);
    } finally {
      setIsLoading(false);
    }
  }, [loadSession, loadCourts, loadQueues]);

  useEffect(() => {
    loadMatchData();

    // Set up real-time subscriptions
    const courtsChannel = supabase
      .channel(`courts-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "courts",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          loadCourts();
        },
      )
      .subscribe();

    const queuesChannel = supabase
      .channel(`queues-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queued_matches",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          loadQueues();
        },
      )
      .subscribe();

    return () => {
      courtsChannel.unsubscribe();
      queuesChannel.unsubscribe();
    };
  }, [sessionId, loadMatchData, loadCourts, loadQueues]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container mx-auto p-4 max-w-7xl">
        <Card className="p-8 text-center">
          <p className="text-gray-500">ไม่พบข้อมูล Match</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {session.name}
          </h1>
          <Link
            href="/courts"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            เข้าสู่ระบบจัดการ
          </Link>
        </div>
        <p className="text-gray-500 text-sm">
          {new Date(session.date).toLocaleDateString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="status">สถานะการเล่น</TabsTrigger>
          <TabsTrigger value="history">ประวัติการเล่น</TabsTrigger>
        </TabsList>

        {/* Tab: สถานะการเล่น */}
        <TabsContent value="status" className="space-y-4">
          {/* คู่ที่กำลังเล่น */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                คู่ที่กำลังเล่น ({courts.filter((c) => c.isPlaying).length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {courts.filter((c) => c.isPlaying).length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  ยังไม่มีคู่ที่กำลังเล่น
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courts
                    .filter((c) => c.isPlaying)
                    .map((court) => (
                      <CourtCard
                        key={court.id}
                        court={court}
                        onDelete={() => {}}
                        onUpdateName={() => {}}
                        onRemovePlayer={() => {}}
                        onAddPlayerToSlot={() => {}}
                        onStartGame={() => {}}
                        onEndGame={() => {}}
                        onAutoMatch={() => {}}
                        availablePlayers={[]}
                        strictMode={false}
                        balancedLevelMode={false}
                        readOnly={true}
                      />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* คิวผู้เล่น */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                คิวผู้เล่น ({queuedMatches.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {queuedMatches.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  ยังไม่มีคิว
                </p>
              ) : (
                <div className="space-y-3">
                  {queuedMatches.map((queue, index) => (
                    <QueueItem
                      key={queue.id}
                      queue={queue}
                      index={index}
                      courts={courts}
                      availablePlayers={[]}
                      selectedCourtId=""
                      onDelete={() => {}}
                      onRemovePlayer={() => {}}
                      onAddPlayer={() => {}}
                      onAutoMatch={() => {}}
                      onStart={() => {}}
                      onStop={() => {}}
                      onCourtChange={() => {}}
                      strictMode={false}
                      balancedLevelMode={false}
                      readOnly={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: ประวัติการเล่น */}
        <TabsContent value="history">
          <HistoryPanel
            sessionId={sessionId}
            showBackButton={false}
            showTitle={false}
            className="mt-0"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
