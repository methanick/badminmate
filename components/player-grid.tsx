"use client";

import { AddPlayerForm } from "@/components/add-player-form";
import { PlayerBox } from "@/components/player-box";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Level, LevelConfig } from "@/constants/level";
import { getAllMembers } from "@/lib/api/members";
import { Court } from "@/model/court.model";
import { Member } from "@/model/member.model";
import { Player } from "@/model/player.model";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

interface PlayerGridProps {
  players: Player[];
  courts: Court[];
  restingPlayers: Player[];
  onRemoveFromRest: (playerId: string) => void;
  onEditPlayer: (playerId: string, name: string, level: Level) => void;
  onAddPlayers: (
    playersData: Array<{ name: string; level: Level; memberId?: string }>,
  ) => Promise<void>;
  isEditMode?: boolean;
  playersInQueue?: Set<string>;
  onEditModeChange?: (isEditMode: boolean) => void;
  onResetGamesPlayed: () => void;
  onClearAllPlayers: () => void;
}

export function PlayerGrid({
  players,
  courts,
  restingPlayers,
  onEditPlayer,
  onAddPlayers,
  isEditMode = false,
  playersInQueue,
  onClearAllPlayers,
  onResetGamesPlayed,
}: PlayerGridProps) {
  const [showModal, setShowModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    // Fetch members from Supabase when component mounts
    async function fetchMembers() {
      try {
        const data = await getAllMembers();
        // Normalize API members to the app's Member model (ensure createdAt exists)
        const normalized = data.map((m) => ({
          id: m.id,
          name: m.name,
          level: (m as any).level,
          gender: (m as any).gender,
          createdAt: (m as any).createdAt ?? Date.now(),
        }));
        setMembers(normalized);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    }

    fetchMembers();
  }, []);

  return (
    <>
      <Card className="mb-4 gap-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              ผู้เล่น ({players.length})
            </CardTitle>
            <Button
              size="sm"
              className="text-xs h-8 py-1"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              เพิ่มผู้เล่น
            </Button>
          </div>
        </CardHeader>
        <CardContent className="py-0">
          <div className="flex justify-start gap-1 flex-wrap">
            <Button
              onClick={onResetGamesPlayed}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50 text-xs h-8 py-1"
              size="sm"
            >
              รีเซ็ตจำนวนเกม
            </Button>
            <Button
              onClick={onClearAllPlayers}
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50 text-xs h-8 py-1"
              size="sm"
            >
              ลบผู้เล่นทั้งหมด
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Single Card for All Players */}
      <Card>
        <CardContent className="p-3">
          <div className="space-y-4">
            {Object.values(Level).map((lv) => {
              const levelPlayers = players
                .filter((p) => p.level === lv)
                .sort((a, b) => a.gamesPlayed - b.gamesPlayed);

              if (levelPlayers.length === 0) return null;

              return (
                <div key={lv} className="space-y-2">
                  {/* Level Header */}
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: LevelConfig[lv].color }}
                    />
                    <span className="text-sm font-semibold text-gray-700">
                      {LevelConfig[lv].label} ({levelPlayers.length})
                    </span>
                  </div>

                  {/* Players in this level */}
                  <div className="grid grid-cols-2 gap-2">
                    {levelPlayers.map((player) => (
                      <PlayerBox
                        key={player.id}
                        level={lv}
                        players={[player]}
                        courts={courts}
                        restingPlayers={restingPlayers}
                        onEditPlayer={onEditPlayer}
                        isEditMode={isEditMode}
                        playersInQueue={playersInQueue}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {players.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                ยังไม่มีผู้เล่น
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* <div className="grid grid-cols-2 gap-2">
        <TrashZone />
        <RestZone
          restingPlayers={restingPlayers}
          onRemoveFromRest={onRemoveFromRest}
        />
      </div> */}

      {/* Modal for adding player */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มผู้เล่นใหม่</DialogTitle>
          </DialogHeader>
          <AddPlayerForm
            members={members}
            players={players}
            onAddPlayers={async (playersData) => {
              await onAddPlayers(playersData);
              setShowModal(false);
            }}
            onClearAllPlayers={() => {}}
            onResetGamesPlayed={() => {}}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
