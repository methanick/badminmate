"use client";

import { CourtCard } from "@/components/court-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Court } from "@/model/court.model";
import { Player } from "@/model/player.model";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";

interface CourtGridProps {
  courts: Court[];
  players: Player[];
  restingPlayers: Player[];
  onDeleteCourt: (id: number) => void;
  onUpdateCourtName: (id: number, name: string) => void;
  onRemovePlayer: (
    courtId: number,
    team: "team1" | "team2",
    slotIndex: number,
  ) => void;
  onAddPlayerToSlot: (
    courtId: number,
    team: "team1" | "team2",
    slotIndex: number,
    playerId: number,
  ) => void;
  onStartGame: (courtId: number) => void;
  onEndGame: (courtId: number) => void;
  onAutoMatch: (courtId: number) => void;
  onAddCourt: () => void;
  onClearAllCourts: () => void;
  strictMode?: boolean;
  onStrictModeChange?: (value: boolean) => void;
  balancedLevelMode?: boolean;
  onBalancedLevelModeChange?: (value: boolean) => void;
}

export function CourtGrid({
  courts,
  players,
  restingPlayers,
  onDeleteCourt,
  onUpdateCourtName,
  onRemovePlayer,
  onAddPlayerToSlot,
  onStartGame,
  onEndGame,
  onAutoMatch,
  onAddCourt,
  strictMode = false,
  onStrictModeChange,
  balancedLevelMode = false,
  onBalancedLevelModeChange,
}: CourtGridProps) {
  const playersInCourts = new Set<number>();
  courts.forEach((court) => {
    court.team1.forEach((p) => p && playersInCourts.add(p.id));
    court.team2.forEach((p) => p && playersInCourts.add(p.id));
  });

  const restingPlayerIds = new Set(restingPlayers.map((p) => p.id));

  const availablePlayers = players.filter(
    (p) => !playersInCourts.has(p.id) && !restingPlayerIds.has(p.id),
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">สนาม ({courts.length})</CardTitle>
            <Button onClick={onAddCourt} size="sm" className="text-xs h-8 py-1">
              <Plus className="w-4 h-4 mr-1" />
              เพิ่มสนาม
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <div className="flex gap-1 items-center flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  checked={strictMode}
                  onCheckedChange={onStrictModeChange}
                  aria-label="Toggle strict mode"
                />
                <span className="text-xs">ไม่เจอคู่เดิม</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="balanced-level-mode"
                  checked={balancedLevelMode}
                  onCheckedChange={onBalancedLevelModeChange}
                />
                <Label htmlFor="balanced-level-mode">Balance Level</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 overflow-y-auto">
        {courts.map((court) => (
          <CourtCard
            key={court.id}
            court={court}
            availablePlayers={availablePlayers}
            onDelete={onDeleteCourt}
            onUpdateName={onUpdateCourtName}
            onRemovePlayer={onRemovePlayer}
            onAddPlayerToSlot={onAddPlayerToSlot}
            onStartGame={onStartGame}
            onEndGame={onEndGame}
            onAutoMatch={onAutoMatch}
          />
        ))}
      </div>
    </div>
  );
}
