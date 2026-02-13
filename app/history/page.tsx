"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LevelConfig } from "@/constants/level";
import { GameHistory } from "@/model/game-history.model";
import { Player } from "@/model/player.model";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HistoryPage() {
  const [gameHistory, setGameHistory] = useState<GameHistory[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("badminton-game-history");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

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
    // สร้าง map สำหรับเก็บว่าใครเล่นกับใครบ้าง
    const pairings = new Map<string, number>();
    const opponents = new Map<string, number>();

    gameHistory.forEach((game) => {
      // teammates
      const team1Pair = [game.team1[0].id, game.team1[1].id].sort().join("-");
      const team2Pair = [game.team2[0].id, game.team2[1].id].sort().join("-");

      pairings.set(team1Pair, (pairings.get(team1Pair) || 0) + 1);
      pairings.set(team2Pair, (pairings.get(team2Pair) || 0) + 1);

      // opponents
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

  const clearHistory = () => {
    if (confirm("ต้องการลบประวัติทั้งหมดใช่หรือไม่?")) {
      localStorage.removeItem("badminton-game-history");
      setGameHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                กลับหน้าหลัก
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">ประวัติการแข่งขัน</h1>
          </div>
          <Button
            onClick={clearHistory}
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            ลบประวัติทั้งหมด
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game History */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                ประวัติการเล่น ({gameHistory.length} เกม)
              </h2>
              <div className="space-y-4 max-h-[800px] overflow-y-auto">
                {gameHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    ยังไม่มีประวัติการเล่น
                  </p>
                ) : (
                  gameHistory.map((game) => (
                    <Card key={game.id} className="p-4 bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{game.courtName}</h3>
                          <p className="text-xs text-gray-500">
                            {formatDate(game.timestamp)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 items-center">
                        {/* Team 1 */}
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 font-semibold">
                            ทีม 1
                          </p>
                          {game.team1.map((player: Player) => (
                            <div
                              key={player.id}
                              className="text-sm p-2 rounded"
                              style={{
                                backgroundColor:
                                  LevelConfig[player.level].color,
                                color: "white",
                              }}
                            >
                              {player.name}
                            </div>
                          ))}
                        </div>

                        {/* VS */}
                        <div className="text-center font-bold text-gray-400">
                          VS
                        </div>

                        {/* Team 2 */}
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500 font-semibold">
                            ทีม 2
                          </p>
                          {game.team2.map((player: Player) => (
                            <div
                              key={player.id}
                              className="text-sm p-2 rounded"
                              style={{
                                backgroundColor:
                                  LevelConfig[player.level].color,
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

          {/* Statistics */}
          <div className="space-y-6">
            {/* Most Common Pairings */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                คู่ที่เล่นด้วยกันบ่อย
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.from(pairings.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([pair, count]) => {
                    const [id1, id2] = pair.split("-").map(Number);
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

            {/* Most Common Opponents */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                คู่ที่เจอกันบ่อย (ฝ่ายตรงข้าม)
              </h2>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.from(opponents.entries())
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 10)
                  .map(([pair, count]) => {
                    const [id1, id2] = pair.split("-").map(Number);
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
    </div>
  );
}
