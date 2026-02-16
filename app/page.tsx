"use client";

import { AddPlayerForm } from "@/components/add-player-form";
import { ConfirmationDialogs } from "@/components/confirmation-dialogs";
import { CourtGrid } from "@/components/court-grid";
import { HistoryPanel } from "@/components/history-panel";
import { PlayerGrid } from "@/components/player-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDisableCopy } from "@/hooks/use-disable-copy";
import { useDragHandler } from "@/hooks/use-drag-handler";
import { useGameHandlers } from "@/hooks/use-game-handlers";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Court } from "@/model/court.model";
import { GameHistory } from "@/model/game-history.model";
import { Player } from "@/model/player.model";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";

export default function HomePage() {
  // ===== state =====
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCopyDisabled, setIsCopyDisabled] = useLocalStorage<boolean>(
    "badminton-copy-disabled",
    false,
  );

  useDisableCopy(isCopyDisabled);

  const [players, setPlayers] = useLocalStorage<Player[]>(
    "badminton-players",
    [],
  );
  const [courts, setCourts] = useLocalStorage<Court[]>("badminton-courts", []);
  const [gameHistory, setGameHistory] = useLocalStorage<GameHistory[]>(
    "badminton-game-history",
    [],
  );
  const [restingPlayers, setRestingPlayers] = useLocalStorage<Player[]>(
    "badminton-resting-players",
    [],
  );

  const {
    addPlayer,
    addCourt,
    deleteCourt,
    confirmDeleteCourt,
    updateCourtName,
    removePlayerFromSlot,
    updatePlayerDetails,
    addPlayerToSlot,
    startGame,
    endGame,
    handleAutoMatch,
    clearAllPlayers,
    confirmClearAllPlayers,
    clearAllCourts,
    resetAllGamesPlayed,
    confirmResetGamesPlayed,
    confirmDelete,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    playerToDelete,
    setPlayerToDelete,
    deleteCourtConfirmOpen,
    setDeleteCourtConfirmOpen,
    clearAllPlayersConfirmOpen,
    setClearAllPlayersConfirmOpen,
    strictMode,
    setStrictMode,
    resetGamesPlayedConfirmOpen,
    setResetGamesPlayedConfirmOpen,
  } = useGameHandlers({
    players,
    setPlayers,
    courts,
    setCourts,
    gameHistory,
    setGameHistory,
    restingPlayers,
    setRestingPlayers,
  });

  // Configure sensors for better touch support
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const { handleDragEnd } = useDragHandler({
    courts,
    setCourts,
    setRestingPlayers,
    setDeleteConfirmOpen,
    setPlayerToDelete,
    removePlayerFromSlot,
  });

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <main className="flex h-screen gap-4 p-4 bg-gray-100 overflow-auto lg:overflow-hidden">
        <div className="w-screen bg-white rounded-xl p-4 shadow flex flex-col overflow-auto lg:overflow-hidden">
          {/* Mobile/Tablet Tabs */}
          <div className="lg:hidden">
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="add">เพิ่มคน</TabsTrigger>
                <TabsTrigger value="court">เลือกคนลงสนาม</TabsTrigger>
                <TabsTrigger value="history">ประวัติ</TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="space-y-4">
                <PlayerGrid
                  players={players}
                  courts={courts}
                  restingPlayers={restingPlayers}
                  onRemoveFromRest={(playerId) => {
                    setRestingPlayers((prev) =>
                      prev.filter((p) => p.id !== playerId),
                    );
                  }}
                  onEditPlayer={updatePlayerDetails}
                  isEditMode={isEditMode}
                />
                <AddPlayerForm
                  onAddPlayer={addPlayer}
                  onClearAllPlayers={clearAllPlayers}
                  onResetGamesPlayed={resetAllGamesPlayed}
                  isEditMode={isEditMode}
                  onEditModeChange={setIsEditMode}
                />
              </TabsContent>

              <TabsContent value="court" className="space-y-4">
                <CourtGrid
                  courts={courts}
                  players={players}
                  restingPlayers={restingPlayers}
                  onDeleteCourt={deleteCourt}
                  onUpdateCourtName={updateCourtName}
                  onRemovePlayer={removePlayerFromSlot}
                  onAddPlayerToSlot={addPlayerToSlot}
                  onStartGame={startGame}
                  onEndGame={endGame}
                  onAutoMatch={handleAutoMatch}
                  onAddCourt={addCourt}
                  onClearAllCourts={clearAllCourts}
                  strictMode={strictMode}
                  onStrictModeChange={setStrictMode}
                />
              </TabsContent>

              <TabsContent value="history">
                <HistoryPanel showTitle />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <PlayerGrid
                  players={players}
                  courts={courts}
                  restingPlayers={restingPlayers}
                  onRemoveFromRest={(playerId) => {
                    setRestingPlayers((prev) =>
                      prev.filter((p) => p.id !== playerId),
                    );
                  }}
                  onEditPlayer={updatePlayerDetails}
                  isEditMode={isEditMode}
                />
                <AddPlayerForm
                  onAddPlayer={addPlayer}
                  onClearAllPlayers={clearAllPlayers}
                  onResetGamesPlayed={resetAllGamesPlayed}
                  isEditMode={isEditMode}
                  onEditModeChange={setIsEditMode}
                />
              </div>
              <CourtGrid
                courts={courts}
                players={players}
                restingPlayers={restingPlayers}
                onDeleteCourt={deleteCourt}
                onUpdateCourtName={updateCourtName}
                onRemovePlayer={removePlayerFromSlot}
                onAddPlayerToSlot={addPlayerToSlot}
                onStartGame={startGame}
                onEndGame={endGame}
                onAutoMatch={handleAutoMatch}
                onAddCourt={addCourt}
                onClearAllCourts={clearAllCourts}
                strictMode={strictMode}
                onStrictModeChange={setStrictMode}
              />
            </div>
          </div>
        </div>
      </main>

      <ConfirmationDialogs
        deleteConfirm={{
          open: deleteConfirmOpen,
          onOpenChange: setDeleteConfirmOpen,
          onConfirm: confirmDelete,
          playerToDelete: playerToDelete,
        }}
        deleteCourtConfirm={{
          open: deleteCourtConfirmOpen,
          onOpenChange: setDeleteCourtConfirmOpen,
          onConfirm: confirmDeleteCourt,
        }}
        clearAllPlayersConfirm={{
          open: clearAllPlayersConfirmOpen,
          onOpenChange: setClearAllPlayersConfirmOpen,
          onConfirm: confirmClearAllPlayers,
        }}
        resetGamesPlayedConfirm={{
          open: resetGamesPlayedConfirmOpen,
          onOpenChange: setResetGamesPlayedConfirmOpen,
          onConfirm: confirmResetGamesPlayed,
        }}
      />
    </DndContext>
  );
}
