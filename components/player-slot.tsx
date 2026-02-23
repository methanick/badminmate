import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LevelConfig } from "@/constants/level";
import { Player } from "@/model/player.model";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { X } from "lucide-react";
import { useMemo, useState } from "react";

interface PlayerSlotProps {
  player: Player | null;
  slotId: string;
  onRemove: () => void;
  onAddPlayer: (playerId: string) => void;
  availablePlayers: Player[];
  disabled?: boolean;
}

export function PlayerSlot({
  player,
  slotId,
  onRemove,
  onAddPlayer,
  availablePlayers,
  disabled = false,
}: PlayerSlotProps) {
  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: slotId,
    disabled,
  });

  const [open, setOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");

  const selectablePlayers = useMemo(
    () =>
      [...availablePlayers].sort(
        (a, b) => a.gamesPlayed - b.gamesPlayed || a.name.localeCompare(b.name),
      ),
    [availablePlayers],
  );

  const backgroundColor = player ? LevelConfig[player.level].color : "white";

  return (
    <div
      ref={setDroppableRef}
      style={{
        backgroundColor: player ? backgroundColor : undefined,
      }}
      className={`flex-1 border-2 border-dashed rounded-lg p-1 min-h-[36px] flex items-center justify-center transition-colors ${
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
        <>
          <button
            type="button"
            className="text-xs text-gray-400 hover:text-gray-600"
            onPointerDown={() => {
              if (disabled) return;
              setSelectedPlayerId("");
              setOpen(true);
            }}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedPlayerId("");
                setOpen(true);
              }
            }}
          >
            ว่าง (แตะเพื่อเพิ่ม)
          </button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มผู้เล่นลงช่อง</DialogTitle>
                <DialogDescription>
                  เลือกผู้เล่นที่ว่างอยู่เพื่อเพิ่มลงช่องนี้
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Select
                  value={selectedPlayerId}
                  onValueChange={setSelectedPlayerId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกผู้เล่น" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectablePlayers.length === 0 ? (
                      <SelectItem value="none" disabled>
                        ไม่มีผู้เล่นว่าง
                      </SelectItem>
                    ) : (
                      selectablePlayers.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full"
                              style={{
                                backgroundColor: LevelConfig[p.level].color,
                              }}
                            />
                            <span className="text-sm">{p.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({p.gamesPlayed})
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  disabled={!selectedPlayerId}
                  onClick={() => {
                    const playerId = selectedPlayerId;
                    if (playerId) {
                      onAddPlayer(playerId);
                    }
                    setOpen(false);
                  }}
                >
                  เพิ่มผู้เล่น
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
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
      className="text-center w-full relative group min-w-16"
    >
      {!disabled && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-1 -right-1 h-3.5 w-3.5 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <X className="h-2.5 w-2.5" />
        </Button>
      )}
      <div
        {...(disabled ? {} : listeners)}
        {...(disabled ? {} : attributes)}
        className={disabled ? "" : "cursor-grab active:cursor-grabbing"}
      >
        <p className="text-xs font-medium text-white leading-tight">
          {player.name}
        </p>
      </div>
    </div>
  );
}
