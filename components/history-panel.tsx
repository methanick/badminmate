"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LevelConfig } from "@/constants/level";
import { supabase } from "@/lib/supabase/client";
import { GameHistory } from "@/model/game-history.model";
import { Player } from "@/model/player.model";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HistoryPanelProps {
  sessionId?: string;
  showBackButton?: boolean;
  showTitle?: boolean;
  className?: string;
}

export function HistoryPanel({
  sessionId,
  showBackButton = false,
  showTitle = true,
  className,
}: HistoryPanelProps) {
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load game history from Supabase when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadGameHistory(sessionId);
    } else {
      setGameHistory([]);
    }
  }, [sessionId]);

  const loadGameHistory = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("game_history")
        .select("*")
        .eq("session_id", sessionId)
        .order("timestamp", { ascending: false });

      if (error) throw error;

      // Transform data to GameHistory format
      const history: GameHistory[] = data.map((record) => ({
        id: record.id,
        courtName: record.court_name,
        team1: [
          {
            id: crypto.randomUUID(),
            name: record.team1_player1_name || "",
            level: record.team1_player1_level as keyof typeof LevelConfig,
            gamesPlayed: 0,
          },
          {
            id: crypto.randomUUID(),
            name: record.team1_player2_name || "",
            level: record.team1_player2_level as keyof typeof LevelConfig,
            gamesPlayed: 0,
          },
        ],
        team2: [
          {
            id: crypto.randomUUID(),
            name: record.team2_player1_name || "",
            level: record.team2_player1_level as keyof typeof LevelConfig,
            gamesPlayed: 0,
          },
          {
            id: crypto.randomUUID(),
            name: record.team2_player2_name || "",
            level: record.team2_player2_level as keyof typeof LevelConfig,
            gamesPlayed: 0,
          },
        ],
        timestamp: new Date(record.timestamp).getTime(),
      }));

      setGameHistory(history);
    } catch (error) {
      console.error("Failed to load game history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPlayerPairings = () => {
    const pairings = new Map<string, number>();
    const opponents = new Map<string, number>();

    gameHistory.forEach((game) => {
      const team1Pair = [game.team1[0].id, game.team1[1].id].sort().join("-");
      const team2Pair = [game.team2[0].id, game.team2[1].id].sort().join("-");

      pairings.set(team1Pair, (pairings.get(team1Pair) || 0) + 1);
      pairings.set(team2Pair, (pairings.get(team2Pair) || 0) + 1);

      game.team1.forEach((p1) => {
        game.team2.forEach((p2) => {
          const key = [p1.id, p2.id].sort().join("-");
          opponents.set(key, (opponents.get(key) || 0) + 1);
        });
      });
    });

    return { pairings, opponents };
  };

  const { pairings, opponents } = getPlayerPairings();

  const clearHistory = async () => {
    if (!sessionId) return;
    if (confirm("ต้องการลบประวัติทั้งหมดของแมทช์นี้ใช่หรือไม่?")) {
      try {
        const { error } = await supabase
          .from("game_history")
          .delete()
          .eq("session_id", sessionId);

        if (error) throw error;
        setGameHistory([]);
      } catch (error) {
        console.error("Failed to clear history:", error);
        alert("ไม่สามารถลบประวัติได้");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        กำลังโหลดประวัติการแข่งขัน...
      </div>
    );
  }

  return (
    <div className={className}>
      {(showBackButton || showTitle) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {showBackButton && (
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  กลับหน้าหลัก
                </Button>
              </Link>
            )}
            {showTitle && (
              <h1 className="text-xl sm:text-2xl font-bold">
                ประวัติการแข่งขัน
              </h1>
            )}
          </div>
          <Button
            onClick={clearHistory}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50 w-full sm:w-auto"
          >
            ลบประวัติทั้งหมด
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main history - 50% on desktop, 100% on mobile */}
        <div className="lg:col-span-2">
          <Card className="p-3 sm:p-4">
            <h2 className="text-base sm:text-lg font-semibold mb-3">
              ประวัติการเล่น ({gameHistory.length} เกม)
            </h2>
            <div className="space-y-2 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
              {gameHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  ยังไม่มีประวัติการเล่น
                </p>
              ) : (
                gameHistory.map((game) => (
                  <Card key={game.id} className="p-2 bg-gray-50 gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                      <h3 className="text-sm font-semibold">
                        {game.courtName}
                      </h3>
                      <p className="text-[11px] text-gray-500">
                        {formatDate(game.timestamp)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex flex-wrap gap-1">
                        {game.team1.map((player: Player) => (
                          <div
                            key={player.id}
                            className="text-[11px] px-2 py-1 rounded w-20 text-center"
                            style={{
                              backgroundColor: LevelConfig[player.level].color,
                              color: "white",
                            }}
                          >
                            {player.name}
                          </div>
                        ))}
                      </div>

                      <div className="text-[10px] font-bold text-gray-400 self-center">
                        VS
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {game.team2.map((player: Player) => (
                          <div
                            key={player.id}
                            className="text-[11px] px-2 py-1 rounded w-20 text-center"
                            style={{
                              backgroundColor: LevelConfig[player.level].color,
                              color: "white",
                            }}
                          >
                            {player.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right section with two cards - 25% each on desktop, 100% each on mobile */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-4">
            <h2 className="text-base sm:text-lg font-semibold mb-3">
              คู่ที่เล่นด้วยกันบ่อย
            </h2>
            <div className="space-y-2 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
              {Array.from(pairings.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([pair, count]) => {
                  const [id1, id2] = pair.split("-").map(String);
                  const game = gameHistory.find(
                    (g) =>
                      (g.team1[0].id === id1 && g.team1[1].id === id2) ||
                      (g.team1[0].id === id2 && g.team1[1].id === id1) ||
                      (g.team2[0].id === id1 && g.team2[1].id === id2) ||
                      (g.team2[0].id === id2 && g.team2[1].id === id1),
                  );
                  if (!game) return null;

                  let player1, player2;
                  if (game.team1[0].id === id1 || game.team1[0].id === id2) {
                    player1 = game.team1.find((p) => p.id === id1);
                    player2 = game.team1.find((p) => p.id === id2);
                  } else {
                    player1 = game.team2.find((p) => p.id === id1);
                    player2 = game.team2.find((p) => p.id === id2);
                  }

                  if (!player1 || !player2) return null;

                  return (
                    <div
                      key={pair}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div className="text-sm">
                        <span className="font-medium">{player1.name}</span>
                        <span className="text-gray-500"> + </span>
                        <span className="font-medium">{player2.name}</span>
                      </div>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {count} เกม
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1 space-x-4">
          <Card className="p-4">
            <h2 className="text-base sm:text-lg font-semibold mb-3">
              คู่ที่เจอกันบ่อย (ฝ่ายตรงข้าม)
            </h2>
            <div className="space-y-2 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
              {Array.from(opponents.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([pair, count]) => {
                  const [id1, id2] = pair.split("-").map(String);
                  const game = gameHistory.find(
                    (g) =>
                      (g.team1.some((p) => p.id === id1) &&
                        g.team2.some((p) => p.id === id2)) ||
                      (g.team1.some((p) => p.id === id2) &&
                        g.team2.some((p) => p.id === id1)),
                  );
                  if (!game) return null;

                  let player1, player2;
                  if (game.team1.some((p) => p.id === id1)) {
                    player1 = [...game.team1, ...game.team2].find(
                      (p) => p.id === id1,
                    );
                    player2 = [...game.team1, ...game.team2].find(
                      (p) => p.id === id2,
                    );
                  } else {
                    player1 = [...game.team1, ...game.team2].find(
                      (p) => p.id === id1,
                    );
                    player2 = [...game.team1, ...game.team2].find(
                      (p) => p.id === id2,
                    );
                  }

                  if (!player1 || !player2) return null;

                  return (
                    <div
                      key={pair}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded"
                    >
                      <div className="text-sm">
                        <span className="font-medium">{player1.name}</span>
                        <span className="text-gray-500"> vs </span>
                        <span className="font-medium">{player2.name}</span>
                      </div>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {count} เกม
                      </span>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
