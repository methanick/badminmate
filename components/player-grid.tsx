"use client";

import { AddPlayerForm } from "@/components/add-player-form";
import { PlayerBox } from "@/components/player-box";
import { RestZone } from "@/components/rest-zone";
import { TrashZone } from "@/components/trash-zone";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Level } from "@/constants/level";
import { Court } from "@/model/court.model";
import { Player } from "@/model/player.model";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface PlayerGridProps {
  players: Player[];
  courts: Court[];
  restingPlayers: Player[];
  onRemoveFromRest: (playerId: number) => void;
  onEditPlayer: (playerId: number, name: string, level: Level) => void;
  onAddPlayer: (name: string, level: Level) => void;
  isEditMode?: boolean;
}

export function PlayerGrid({
  players,
  courts,
  restingPlayers,
  onRemoveFromRest,
  onEditPlayer,
  onAddPlayer,
  isEditMode = false,
}: PlayerGridProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-2 gap-2">
        <h2 className="text-lg font-bold">ผู้เล่น ({players.length})</h2>
        <div className="flex gap-1 items-center flex-wrap">
          <Button
            size="sm"
            className="text-xs h-8 py-1"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            เพิ่มผู้เล่น
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
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

      {/* Modal for adding player */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มผู้เล่นใหม่</DialogTitle>
          </DialogHeader>
          <AddPlayerForm
            onAddPlayer={(name, level) => {
              onAddPlayer(name, level);
              setShowModal(false);
            }}
            onClearAllPlayers={() => {}}
            onResetGamesPlayed={() => {}}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
