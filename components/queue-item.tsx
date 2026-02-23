"use client";

import { PlayerSlot } from "@/components/player-slot";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Court } from "@/model/court.model";
import { Player } from "@/model/player.model";
import { QueuedMatch } from "@/model/queued-match.model";
import { Play, Shuffle, Square, Trash2 } from "lucide-react";

interface QueueItemProps {
  queue: QueuedMatch;
  queueIndex: number;
  availablePlayers: Player[];
  availableCourts: Court[];
  courts: Court[];
  isPlaying?: boolean;
  onRemovePlayer: (
    queueId: string,
    team: "team1" | "team2",
    slotIndex: number,
  ) => void;
  onAddPlayerToSlot: (
    queueId: string,
    team: "team1" | "team2",
    slotIndex: number,
    playerId: string,
  ) => void;
  onAutoMatch: (queueId: string) => void;
  onStartQueue: (queueId: string, courtId: string) => void;
  onStopQueue: (queueId: string) => void;
  onDeleteQueue: (queueId: string) => void;
  selectedCourt?: string;
  onCourtChange: (queueId: string, courtId: string) => void;
}

export function QueueItem({
  queue,
  queueIndex,
  availablePlayers,
  availableCourts,
  courts,
  isPlaying = false,
  onRemovePlayer,
  onAddPlayerToSlot,
  onAutoMatch,
  onStartQueue,
  onStopQueue,
  onDeleteQueue,
  selectedCourt,
  onCourtChange,
}: QueueItemProps) {
  const isComplete =
    queue.team1[0] && queue.team1[1] && queue.team2[0] && queue.team2[1];

  // หาชื่อสนามจาก courtId
  const currentCourt =
    isPlaying && queue.courtId
      ? courts.find((c) => c.id === queue.courtId)
      : null;

  return (
    <Card className="p-1">
      <CardContent className="py-3">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          {/* Players Row */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Queue Number */}
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-bold shrink-0">
              {queueIndex + 1}
            </div>

            {/* Team 1 */}
            <div className="flex gap-1 min-w-0">
              {[0, 1].map((slotIndex) => (
                <PlayerSlot
                  key={slotIndex}
                  slotId={`queue-${queue.id}-team1-${slotIndex}`}
                  player={queue.team1[slotIndex]}
                  availablePlayers={availablePlayers}
                  onRemove={() => onRemovePlayer(queue.id, "team1", slotIndex)}
                  onAddPlayer={(playerId) =>
                    onAddPlayerToSlot(queue.id, "team1", slotIndex, playerId)
                  }
                />
              ))}
            </div>

            {/* VS Separator */}
            <div className="text-xs font-bold text-gray-400 shrink-0">VS</div>

            {/* Team 2 */}
            <div className="flex gap-1 min-w-0">
              {[0, 1].map((slotIndex) => (
                <PlayerSlot
                  key={slotIndex}
                  slotId={`queue-${queue.id}-team2-${slotIndex}`}
                  player={queue.team2[slotIndex]}
                  availablePlayers={availablePlayers}
                  onRemove={() => onRemovePlayer(queue.id, "team2", slotIndex)}
                  onAddPlayer={(playerId) =>
                    onAddPlayerToSlot(queue.id, "team2", slotIndex, playerId)
                  }
                />
              ))}
            </div>
          </div>

          {/* Actions Row */}
          <div className="flex items-center gap-1 md:ml-auto shrink-0">
            {/* Auto Match - แสดงเฉพาะเมื่อไม่ได้เล่น */}
            {!isPlaying && (
              <Button
                onClick={() => onAutoMatch(queue.id)}
                variant="outline"
                size="sm"
              >
                <Shuffle className="w-4 h-4" />
              </Button>
            )}

            {/* Court Selection & Start/Stop */}
            {isComplete && (
              <>
                {isPlaying ? (
                  // แสดงชื่อสนามแทนปุ่มเลือกสนาม
                  <>
                    <div className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium rounded-md">
                      {currentCourt?.name || `สนาม ${queue.courtId}`}
                    </div>
                    <Button
                      onClick={() => onStopQueue(queue.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <Square className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  // แสดงปุ่มเลือกสนามและปุ่ม Play
                  <>
                    <Select
                      value={selectedCourt?.toString()}
                      onValueChange={(value) => onCourtChange(queue.id, value)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="สนาม" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourts.map((court) => (
                          <SelectItem
                            key={court.id}
                            value={court.id.toString()}
                          >
                            {court.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => {
                        if (selectedCourt) {
                          onStartQueue(queue.id, selectedCourt);
                        } else {
                          alert("กรุณาเลือกสนามก่อน");
                        }
                      }}
                      size="sm"
                      disabled={!selectedCourt}
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Delete */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteQueue(queue.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
