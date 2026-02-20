"use client";

import { PlayerGrid } from "@/components/player-grid";
import { QueueItem } from "@/components/queue-item";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Level } from "@/constants/level";
import { Court } from "@/model/court.model";
import { Member } from "@/model/member.model";
import { Player } from "@/model/player.model";
import { QueuedMatch } from "@/model/queued-match.model";
import { Plus } from "lucide-react";

interface QueueManagerProps {
  players: Player[];
  courts: Court[];
  restingPlayers: Player[];
  queuedMatches: QueuedMatch[];
  members: Member[];
  isEditMode: boolean;
  onEditPlayer: (id: number, name: string, level: Level) => void;
  onAddPlayer: (name: string, level: Level, memberId?: number) => void;
  onRemoveFromRest: (playerId: number) => void;
  onCreateQueue: () => void;
  onDeleteQueue: (queueId: number) => void;
  onRemovePlayerFromQueue: (
    queueId: number,
    team: "team1" | "team2",
    slotIndex: number,
  ) => void;
  onAddPlayerToQueue: (
    queueId: number,
    team: "team1" | "team2",
    slotIndex: number,
    playerId: number,
  ) => void;
  onAutoMatchQueue: (queueId: number) => void;
  onStartQueue: (queueId: number, courtId: number) => void;
  selectedCourts: Record<number, number>;
  onCourtChange: (queueId: number, courtId: number) => void;
}

export function QueueManager({
  players,
  courts,
  restingPlayers,
  queuedMatches,
  members,
  isEditMode,
  onEditPlayer,
  onAddPlayer,
  onRemoveFromRest,
  onCreateQueue,
  onDeleteQueue,
  onRemovePlayerFromQueue,
  onAddPlayerToQueue,
  onAutoMatchQueue,
  onStartQueue,
  selectedCourts,
  onCourtChange,
}: QueueManagerProps) {
  // คำนวณผู้เล่นที่ว่าง (ไม่อยู่ในสนามและไม่อยู่ในคิว)
  const playersInCourts = new Set<number>();
  const playersInQueue = new Set<number>();

  courts.forEach((court) => {
    court.team1.forEach((p) => p && playersInCourts.add(p.id));
    court.team2.forEach((p) => p && playersInCourts.add(p.id));
  });

  queuedMatches.forEach((queue) => {
    queue.team1.forEach((p) => p && playersInQueue.add(p.id));
    queue.team2.forEach((p) => p && playersInQueue.add(p.id));
  });

  const restingPlayerIds = new Set(restingPlayers.map((p) => p.id));

  const availablePlayers = players.filter(
    (p) =>
      !playersInCourts.has(p.id) &&
      !playersInQueue.has(p.id) &&
      !restingPlayerIds.has(p.id),
  );

  // สนามว่าง (ไม่มีคนเล่นและไม่ได้เล่นอยู่)
  const availableCourts = courts.filter((court) => {
    const emptySlots =
      court.team1.filter((p) => !p).length +
      court.team2.filter((p) => !p).length;
    return emptySlots === 4 && !court.isPlaying;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
      {/* ฝั่งซ้าย: ผู้เล่น */}
      <div className="space-y-4 lg:col-span-1">
        <PlayerGrid
          players={players}
          courts={courts}
          restingPlayers={restingPlayers}
          members={members}
          onRemoveFromRest={onRemoveFromRest}
          onEditPlayer={onEditPlayer}
          onAddPlayer={onAddPlayer}
          isEditMode={isEditMode}
          playersInQueue={playersInQueue}
        />
      </div>

      {/* ฝั่งขวา: คิว */}
      <div className="space-y-4 overflow-y-auto lg:col-span-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">คิวแมตช์</CardTitle>
              <Button onClick={onCreateQueue} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                เพิ่มคิว
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <div className="flex gap-4">
                <span>คิวทั้งหมด: {queuedMatches.length}</span>
                <span>ผู้เล่นว่าง: {availablePlayers.length}</span>
                <span>สนามว่าง: {availableCourts.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {queuedMatches.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              ไม่มีคิว
              <p className="text-sm mt-2">
                กดปุ่ม &ldquo;เพิ่มคิว&rdquo; เพื่อสร้างคิวใหม่
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {queuedMatches.map((queue, index) => (
              <QueueItem
                key={queue.id}
                queue={queue}
                queueIndex={index}
                availablePlayers={availablePlayers}
                availableCourts={availableCourts}
                onRemovePlayer={onRemovePlayerFromQueue}
                onAddPlayerToSlot={onAddPlayerToQueue}
                onAutoMatch={onAutoMatchQueue}
                onStartQueue={onStartQueue}
                onDeleteQueue={onDeleteQueue}
                selectedCourt={selectedCourts[queue.id]}
                onCourtChange={onCourtChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
