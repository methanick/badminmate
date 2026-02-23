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
  availablePlayers: Player[];
  onDelete: (id: string) => void;
  onUpdateName: (id: string, name: string) => void;
  onRemovePlayer: (
    courtId: string,
    team: "team1" | "team2",
    slotIndex: number,
  ) => void;
  onAddPlayerToSlot: (
    courtId: string,
    team: "team1" | "team2",
    slotIndex: number,
    playerId: string,
  ) => void;
  onStartGame: (courtId: string) => void;
  onEndGame: (courtId: string) => void;
  onAutoMatch: (courtId: string) => void;
}

export function CourtCard({
  court,
  availablePlayers,
  onDelete,
  onUpdateName,
  onRemovePlayer,
  onAddPlayerToSlot,
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
    <Card className="p-2 gap-1 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-5 w-5 text-red-500 hover:text-red-700"
        onClick={() => onDelete(court.id)}
      >
        <X className="h-3 w-3" />
      </Button>

      {isEditing ? (
        <Input
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={handleKeyDown}
          className="text-center font-semibold mb-2 h-7 text-sm"
          autoFocus
        />
      ) : (
        <h3
          className="font-semibold text-center mb-2 cursor-pointer hover:text-blue-600 text-sm"
          onClick={() => setIsEditing(true)}
        >
          {court.name}
        </h3>
      )}

      <div className="space-y-1">
        {/* Team 1 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 text-center mb-1">
            ทีม 1 ({calculateTeamWeight(court.team1)})
          </p>
          <div className="flex gap-1">
            <PlayerSlot
              player={court.team1[0]}
              slotId={`court-${court.id}-team1-0`}
              onRemove={() => onRemovePlayer(court.id, "team1", 0)}
              onAddPlayer={(playerId) =>
                onAddPlayerToSlot(court.id, "team1", 0, playerId)
              }
              availablePlayers={availablePlayers}
              disabled={court.isPlaying}
            />
            <PlayerSlot
              player={court.team1[1]}
              slotId={`court-${court.id}-team1-1`}
              onRemove={() => onRemovePlayer(court.id, "team1", 1)}
              onAddPlayer={(playerId) =>
                onAddPlayerToSlot(court.id, "team1", 1, playerId)
              }
              availablePlayers={availablePlayers}
              disabled={court.isPlaying}
            />
          </div>
        </div>

        {/* VS */}
        <div className="text-center font-bold text-gray-400 text-xs my-1">
          VS
        </div>

        {/* Team 2 */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500 text-center mb-1">
            ทีม 2 ({calculateTeamWeight(court.team2)})
          </p>
          <div className="flex gap-1">
            <PlayerSlot
              player={court.team2[0]}
              slotId={`court-${court.id}-team2-0`}
              onRemove={() => onRemovePlayer(court.id, "team2", 0)}
              onAddPlayer={(playerId) =>
                onAddPlayerToSlot(court.id, "team2", 0, playerId)
              }
              availablePlayers={availablePlayers}
              disabled={court.isPlaying}
            />
            <PlayerSlot
              player={court.team2[1]}
              slotId={`court-${court.id}-team2-1`}
              onRemove={() => onRemovePlayer(court.id, "team2", 1)}
              onAddPlayer={(playerId) =>
                onAddPlayerToSlot(court.id, "team2", 1, playerId)
              }
              availablePlayers={availablePlayers}
              disabled={court.isPlaying}
            />
          </div>
        </div>

        {/* Start/End Button */}
        <div className="mt-2 space-y-1">
          {/* Auto Match and Clear Button */}
          {!court.isPlaying && (
            <div className="flex gap-1">
              <Button
                onClick={() => onAutoMatch(court.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 h-8"
              >
                จับคู่อัตโนมัติ
              </Button>
              <Button
                onClick={() => onEndGame(court.id)}
                variant="outline"
                className="border-orange-500 text-orange-600 hover:bg-orange-50 text-xs py-1 h-8"
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
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 h-8"
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
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1 h-8"
            >
              End Game
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
