import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Level, LevelConfig } from "@/constants/level";
import { Court } from "@/model/court.model";
import { Player } from "@/model/player.model";
import { useDraggable } from "@dnd-kit/core";

interface PlayerBoxProps {
  level?: Level;
  players?: Player[];
  courts?: Court[];
  restingPlayers?: Player[];
}

export function PlayerBox({
  level,
  players,
  courts,
  restingPlayers,
}: PlayerBoxProps) {
  console.log("PlayerBox ~ players:", players);

  // เช็คว่า player อยู่ใน court หรือไม่
  const isPlayerInCourt = (playerId: number): boolean => {
    if (!courts) return false;
    return courts.some(
      (court) =>
        court.team1.some((p) => p?.id === playerId) ||
        court.team2.some((p) => p?.id === playerId),
    );
  };

  // เช็คว่า player กำลังพักหรือไม่
  const isPlayerResting = (playerId: number): boolean => {
    if (!restingPlayers) return false;
    return restingPlayers.some((p) => p.id === playerId);
  };

  // เรียง players: กำลังเล่นอยู่ไปท้าย, ที่เหลือเรียงตาม gamesPlayed น้อยไปมาก
  const sortedPlayers = players
    ? [...players].sort((a, b) => {
        const aInCourt = isPlayerInCourt(a.id);
        const bInCourt = isPlayerInCourt(b.id);

        // ถ้าคนหนึ่งกำลังเล่น คนหนึ่งไม่เล่น ให้คนที่เล่นอยู่ไปท้าย
        if (aInCourt && !bInCourt) return 1;
        if (!aInCourt && bInCourt) return -1;

        // ถ้าทั้งคู่สถานะเดียวกัน เรียงตาม gamesPlayed น้อยไปมาก
        return a.gamesPlayed - b.gamesPlayed;
      })
    : [];

  return (
    <Card className="w-full max-w-full">
      <CardHeader>
        <CardTitle>{level && LevelConfig[level].label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sortedPlayers.length > 0 ? (
            sortedPlayers.map((player) => (
              <DraggablePlayer
                key={player.id}
                player={player}
                isDisabled={
                  isPlayerInCourt(player.id) || isPlayerResting(player.id)
                }
                isResting={isPlayerResting(player.id)}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">ไม่มีผู้เล่น</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DraggablePlayer({
  player,
  isDisabled,
  isResting,
}: {
  player: Player;
  isDisabled: boolean;
  isResting?: boolean;
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
      className="rounded-sm p-2 text-white text-xs w-20 text-start"
      title={isResting ? `${player.name} (กำลังพัก)` : undefined}
    >
      <span className="line-clamp-1">{`${player.gamesPlayed} | ${player.name}${isResting ? " 💤" : ""}`}</span>
    </div>
  );
}
