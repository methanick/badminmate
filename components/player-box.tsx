"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Level, LevelConfig } from "@/constants/level";
import { Court } from "@/model/court.model";
import { Player } from "@/model/player.model";
import { useDraggable } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";

interface PlayerBoxProps {
  level?: Level;
  players?: Player[];
  courts?: Court[];
  restingPlayers?: Player[];
  onEditPlayer: (playerId: string, name: string, level: Level) => void;
  isEditMode?: boolean;
  playersInQueue?: Set<string>;
}

export function PlayerBox({
  level,
  players,
  courts,
  restingPlayers,
  onEditPlayer,
  isEditMode = false,
  playersInQueue,
}: PlayerBoxProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState<Level>(Level.Beginner);

  // เช็คว่า player อยู่ใน court หรือไม่
  const isPlayerInCourt = (playerId: string): boolean => {
    if (!courts) return false;
    return courts.some(
      (court) =>
        court.team1.some((p) => p?.id === playerId) ||
        court.team2.some((p) => p?.id === playerId),
    );
  };

  // เช็คว่า player กำลังพักหรือไม่
  const isPlayerResting = (playerId: string): boolean => {
    if (!restingPlayers) return false;
    return restingPlayers.some((p) => p.id === playerId);
  };

  // เช็คว่า player อยู่ในคิวหรือไม่
  const isPlayerInQueue = (playerId: string): boolean => {
    if (!playersInQueue) return false;
    return playersInQueue.has(playerId);
  };

  // เรียง players: พักอยู่ไปท้ายสุด, คนกำลังเล่นอยู่รองลงมา, ที่เหลือเรียงตาม gamesPlayed น้อยไปมาก
  const sortedPlayers = players
    ? [...players].sort((a, b) => {
        const aInCourt = isPlayerInCourt(a.id);
        const bInCourt = isPlayerInCourt(b.id);
        const aResting = isPlayerResting(a.id);
        const bResting = isPlayerResting(b.id);

        const rank = (inCourt: boolean, resting: boolean) =>
          resting ? 2 : inCourt ? 1 : 0;

        const aRank = rank(aInCourt, aResting);
        const bRank = rank(bInCourt, bResting);

        if (aRank !== bRank) return aRank - bRank;

        return a.gamesPlayed - b.gamesPlayed;
      })
    : [];

  const levelOptions = useMemo(() => Object.values(Level), []);

  const openEdit = (player: Player) => {
    setEditingPlayer(player);
    setEditName(player.name);
    setEditLevel(player.level);
    setEditOpen(true);
  };

  useEffect(() => {
    console.log("players changed:", sortedPlayers);
  }, [sortedPlayers]);

  return (
    <>
      <div className="flex flex-wrap gap-1">
        {sortedPlayers.length > 0 ? (
          sortedPlayers.map((player) => (
            <DraggablePlayer
              key={player.id}
              player={player}
              isDisabled={
                isPlayerInCourt(player.id) ||
                isPlayerResting(player.id) ||
                isPlayerInQueue(player.id)
              }
              isResting={isPlayerResting(player.id)}
              isInQueue={isPlayerInQueue(player.id)}
              onEdit={() => openEdit(player)}
              isEditMode={isEditMode}
            />
          ))
        ) : (
          <p className="text-xs text-gray-500">ไม่มีผู้เล่น</p>
        )}
      </div>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          // Reset editingOpen flag when dialog closes
          if (!open) {
            setTimeout(() => {
              // Dialog close animation
            }, 100);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขผู้เล่น</DialogTitle>
            <DialogDescription>เปลี่ยนชื่อหรือระดับฝีมือ</DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">ชื่อ</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="ชื่อผู้เล่น"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">ระดับ</label>
              <Select
                value={editLevel}
                onValueChange={(value) => setEditLevel(value as Level)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="เลือกระดับ" />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((lv) => (
                    <SelectItem key={lv} value={lv}>
                      {LevelConfig[lv].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
              }}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={() => {
                if (!editingPlayer) return;
                const trimmed = editName.trim();
                if (!trimmed) return;
                onEditPlayer(editingPlayer.id, trimmed, editLevel);
                setEditOpen(false);
              }}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function DraggablePlayer({
  player,
  isDisabled,
  isResting,
  isInQueue,
  onEdit,
  isEditMode = false,
}: {
  player: Player;
  isDisabled: boolean;
  isResting?: boolean;
  isInQueue?: boolean;
  onEdit: () => void;
  isEditMode?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: player.id,
      data: player,
      disabled: isDisabled,
    });

  const style = {
    backgroundColor: isDisabled
      ? isResting
        ? "#fbbf24"
        : isInQueue
          ? "#9ca3af"
          : "#9ca3af"
      : LevelConfig[player.level].color,
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : isDisabled ? 0.6 : 1,
    cursor: isDisabled ? "not-allowed" : "grab",
    zIndex: isDragging ? 9999 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isDisabled ? {} : listeners)}
      {...(isDisabled ? {} : attributes)}
      className="rounded-sm p-1.5 text-white text-xs w-fit min-w-16 text-center relative"
      title={isResting ? `${player.name} (กำลังพัก)` : undefined}
    >
      <span className="line-clamp-1 text-start text-xs leading-tight">{`${player.gamesPlayed} | ${player.name}`}</span>
    </div>
  );
}
