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
}

export function PlayerGrid({
  players,
  courts,
  restingPlayers,
  onRemoveFromRest,
}: PlayerGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.values(Level).map((lv) => {
        const levelPlayers = players.filter((p) => p.level === lv);

        return (
          <div key={lv} className="w-full h-full">
            <PlayerBox
              level={lv}
              players={levelPlayers}
              courts={courts}
              restingPlayers={restingPlayers}
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
