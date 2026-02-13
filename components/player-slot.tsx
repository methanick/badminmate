import { Button } from "@/components/ui/button";
import { LevelConfig } from "@/constants/level";
import { Player } from "@/model/player.model";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { X } from "lucide-react";

interface PlayerSlotProps {
  player: Player | null;
  slotId: string;
  onRemove: () => void;
  disabled?: boolean;
}

export function PlayerSlot({
  player,
  slotId,
  onRemove,
  disabled = false,
}: PlayerSlotProps) {
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: slotId,
    disabled,
  });

  const backgroundColor = player ? LevelConfig[player.level].color : "white";

  return (
    <div
      ref={setDroppableRef}
      style={{
        backgroundColor: player ? backgroundColor : undefined,
      }}
      className={`flex-1 border-2 border-dashed rounded-lg p-3 min-h-[60px] flex items-center justify-center transition-colors ${
        isOver ? "bg-blue-100 border-blue-400" : "border-gray-300"
      } ${!player ? "bg-white" : ""} ${disabled ? "opacity-60" : ""}`}
    >
      {player ? (
        <DraggablePlayerInSlot
          player={player}
          slotId={slotId}
          onRemove={onRemove}
          disabled={disabled}
        />
      ) : (
        <p className="text-xs text-gray-400">ว่าง</p>
      )}
    </div>
  );
}

function DraggablePlayerInSlot({
  player,
  slotId,
  onRemove,
  disabled = false,
}: {
  player: Player;
  slotId: string;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `player-in-${slotId}`,
      data: player,
      disabled,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="text-center w-full relative group"
    >
      {!disabled && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 h-4 w-4 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      <div
        {...(disabled ? {} : listeners)}
        {...(disabled ? {} : attributes)}
        className={disabled ? "" : "cursor-grab active:cursor-grabbing"}
      >
        <p className="text-sm font-medium text-white">{player.name}</p>
        <p className="text-xs text-white opacity-90">{player.level}</p>
      </div>
    </div>
  );
}
