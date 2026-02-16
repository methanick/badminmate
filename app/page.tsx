"use client";

import { AddPlayerForm } from "@/components/add-player-form";
import { ConfirmationDialogs } from "@/components/confirmation-dialogs";
import { CourtGrid } from "@/components/court-grid";
import { PlayerGrid } from "@/components/player-grid";
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

export default function HomePage() {
  // ===== state =====
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
      <main className="flex h-screen gap-4 p-4 bg-gray-100 overflow-hidden">
        {/* ================= LEFT ================= */}
        <div className="w-screen bg-white rounded-xl p-4 shadow flex flex-col overflow-hidden">
          <div className="grid grid-cols-2 gap-4">
            <div className="">
              <PlayerGrid
                players={players}
                courts={courts}
                restingPlayers={restingPlayers}
                onRemoveFromRest={(playerId) => {
                  setRestingPlayers((prev) =>
                    prev.filter((p) => p.id !== playerId),
                  );
                }}
              />
              <AddPlayerForm
                onAddPlayer={addPlayer}
                onClearAllPlayers={clearAllPlayers}
                onResetGamesPlayed={resetAllGamesPlayed}
              />
            </div>
            <CourtGrid
              courts={courts}
              onDeleteCourt={deleteCourt}
              onUpdateCourtName={updateCourtName}
              onRemovePlayer={removePlayerFromSlot}
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
