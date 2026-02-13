import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LevelConfig } from "@/constants/level";
import { Court } from "@/model/court.model";
import { Player } from "@/model/player.model";
import { X } from "lucide-react";
import { useState } from "react";
import { PlayerSlot } from "./player-slot";

interface CourtCardProps {
  court: Court;
  onDelete: (id: number) => void;
  onUpdateName: (id: number, name: string) => void;
  onRemovePlayer: (
    courtId: number,
    team: "team1" | "team2",
    slotIndex: number,
  ) => void;
  onStartGame: (courtId: number) => void;
  onEndGame: (courtId: number) => void;
  onAutoMatch: (courtId: number) => void;
}

export function CourtCard({
  court,
  onDelete,
  onUpdateName,
  onRemovePlayer,
  onStartGame,
  onEndGame,
  onAutoMatch,
}: CourtCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(court.name);

  const calculateTeamWeight = (team: (Player | null)[]) => {
    return team.reduce((sum, player) => {
      if (!player) return sum;
      const weight = LevelConfig[player.level]?.weight || 0;
      return sum + weight;
    }, 0);
  };

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateName(court.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveName();
    } else if (e.key === "Escape") {
      setEditName(court.name);
      setIsEditing(false);
    }
  };

  return (
    <Card className="p-4 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-red-500 hover:text-red-700"
        onClick={() => onDelete(court.id)}
      >
        <X className="h-4 w-4" />
      </Button>

      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={handleKeyDown}
          className="text-center font-semibold mb-4 h-8"
          autoFocus
        />
      ) : (
        <h3
          className="font-semibold text-center mb-4 cursor-pointer hover:text-blue-600"
          onClick={() => setIsEditing(true)}
        >
          {court.name}
        </h3>
      )}

      <div className="space-y-4">
        {/* Team 1 */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 text-center">
            ทีม 1 ({calculateTeamWeight(court.team1)})
          </p>
          <div className="flex gap-2">
            <PlayerSlot
              player={court.team1[0]}
              slotId={`court-${court.id}-team1-0`}
              onRemove={() => onRemovePlayer(court.id, "team1", 0)}
              disabled={court.isPlaying}
            />
            <PlayerSlot
              player={court.team1[1]}
              slotId={`court-${court.id}-team1-1`}
              onRemove={() => onRemovePlayer(court.id, "team1", 1)}
              disabled={court.isPlaying}
            />
          </div>
        </div>

        {/* VS */}
        <div className="text-center font-bold text-gray-400">VS</div>

        {/* Team 2 */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500 text-center">
            ทีม 2 ({calculateTeamWeight(court.team2)})
          </p>
          <div className="flex gap-2">
            <PlayerSlot
              player={court.team2[0]}
              slotId={`court-${court.id}-team2-0`}
              onRemove={() => onRemovePlayer(court.id, "team2", 0)}
              disabled={court.isPlaying}
            />
            <PlayerSlot
              player={court.team2[1]}
              slotId={`court-${court.id}-team2-1`}
              onRemove={() => onRemovePlayer(court.id, "team2", 1)}
              disabled={court.isPlaying}
            />
          </div>
        </div>

        {/* Start/End Button */}
        <div className="mt-4 space-y-2">
          {/* Auto Match and Clear Button */}
          {!court.isPlaying && (
            <div className="flex gap-2">
              <Button
                onClick={() => onAutoMatch(court.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                จับคู่อัตโนมัติ
              </Button>
              <Button
                onClick={() => onEndGame(court.id)}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                disabled={
                  !court.team1[0] &&
                  !court.team1[1] &&
                  !court.team2[0] &&
                  !court.team2[1]
                }
              >
                ล้าง
              </Button>
            </div>
          )}

          {/* Start/End Game Button */}
          {!court.isPlaying ? (
            <Button
              onClick={() => onStartGame(court.id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={
                !court.team1[0] ||
                !court.team1[1] ||
                !court.team2[0] ||
                !court.team2[1]
              }
            >
              Start Game
            </Button>
          ) : (
            <Button
              onClick={() => onEndGame(court.id)}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              End Game
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
