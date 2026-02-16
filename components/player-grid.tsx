"use client";

import { PlayerBox } from "@/components/player-box";
import { RestZone } from "@/components/rest-zone";
import { TrashZone } from "@/components/trash-zone";
import { Level } from "@/constants/level";
import { Court } from "@/model/court.model";
import { Player } from "@/model/player.model";

interface PlayerGridProps {
  players: Player[];
  courts: Court[];
  restingPlayers: Player[];
  onRemoveFromRest: (playerId: number) => void;
  onEditPlayer: (playerId: number, name: string, level: Level) => void;
  isEditMode?: boolean;
}

export function PlayerGrid({
  players,
  courts,
  restingPlayers,
  onRemoveFromRest,
  onEditPlayer,
  isEditMode = false,
}: PlayerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {Object.values(Level).map((lv) => {
        const levelPlayers = players.filter((p) => p.level === lv);

        return (
          <div key={lv} className="w-full h-full">
            <PlayerBox
              level={lv}
              players={levelPlayers}
              courts={courts}
              restingPlayers={restingPlayers}
              onEditPlayer={onEditPlayer}
              isEditMode={isEditMode}
            />
          </div>
        );
      })}
      <TrashZone />
      <RestZone
        restingPlayers={restingPlayers}
        onRemoveFromRest={onRemoveFromRest}
      />
    </div>
  );
}
