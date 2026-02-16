"use client";

import { CourtCard } from "@/components/court-card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Court } from "@/model/court.model";
import Link from "next/link";

interface CourtGridProps {
  courts: Court[];
  onDeleteCourt: (id: number) => void;
  onUpdateCourtName: (id: number, name: string) => void;
  onRemovePlayer: (
    courtId: number,
    team: "team1" | "team2",
    slotIndex: number,
  ) => void;
  onStartGame: (courtId: number) => void;
  onEndGame: (courtId: number) => void;
  onAutoMatch: (courtId: number) => void;
  onAddCourt: () => void;
  onClearAllCourts: () => void;
  strictMode?: boolean;
  onStrictModeChange?: (value: boolean) => void;
}

export function CourtGrid({
  courts,
  onDeleteCourt,
  onUpdateCourtName,
  onRemovePlayer,
  onStartGame,
  onEndGame,
  onAutoMatch,
  onAddCourt,
  onClearAllCourts,
  strictMode = false,
  onStrictModeChange,
}: CourtGridProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">สนาม ({courts.length})</h2>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-2">
            <Switch
              checked={strictMode}
              onCheckedChange={onStrictModeChange}
              aria-label="Toggle strict mode"
            />
            <span className="text-sm">ไม่เจอคู่เดิม</span>
          </div>
          <Link href="/history">
            <Button variant="outline">ประวัติ</Button>
          </Link>
          <Button onClick={onAddCourt}>เพิ่มสนาม</Button>
          <Button
            onClick={onClearAllCourts}
            variant="outline"
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
            disabled={courts.length === 0}
          >
            ล้างสนามทั้งหมด
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {courts.map((court) => (
          <CourtCard
            key={court.id}
            court={court}
            onDelete={onDeleteCourt}
            onUpdateName={onUpdateCourtName}
            onRemovePlayer={onRemovePlayer}
            onStartGame={onStartGame}
            onEndGame={onEndGame}
            onAutoMatch={onAutoMatch}
          />
        ))}
      </div>
    </div>
  );
}
