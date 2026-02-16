import { Card } from "@/components/ui/card";
import { LevelConfig } from "@/constants/level";
import { Player } from "@/model/player.model";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { X } from "lucide-react";

interface RestZoneProps {
  restingPlayers: Player[];
  onRemoveFromRest: (playerId: number) => void;
}

export function RestZone({ restingPlayers, onRemoveFromRest }: RestZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: "rest-zone",
  });

  return (
    <div ref={setNodeRef}>
      <Card
        className={`w-full max-w-full transition-colors ${
          isOver ? "bg-yellow-100 border-yellow-400 border-2" : "bg-yellow-50"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-sm font-semibold text-yellow-700">พักชั่วคราว</p>
            <span className="text-xs text-yellow-600">
              ({restingPlayers.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {restingPlayers.map((player) => (
              <DraggableRestingPlayer
                key={player.id}
                player={player}
                onRemove={onRemoveFromRest}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function DraggableRestingPlayer({
  player,
  onRemove,
}: {
  player: Player;
  onRemove: (playerId: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `resting-${player.id}`,
      data: player,
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 9999 : undefined,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "opacity-50" : ""}`}
    >
      <div
        className="rounded text-white text-xs p-2 relative group cursor-move flex items-center justify-between min-w-max"
        style={{
          backgroundColor: LevelConfig[player.level].color,
        }}
        {...listeners}
        {...attributes}
        title={`${player.name} - ${player.level}`}
      >
        <span className="line-clamp-1">{`${player.gamesPlayed} | ${player.name}`}</span>
        <button
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(player.id);
          }}
          className="ml-2 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-600 cursor-pointer flex-shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
