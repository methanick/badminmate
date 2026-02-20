"use client";

import { ConfirmationDialogs } from "@/components/confirmation-dialogs";
import { CourtGrid } from "@/components/court-grid";
import { PlayerGrid } from "@/components/player-grid";
import { useAppContext } from "@/contexts/app-context";
import { useDisableCopy } from "@/hooks/use-disable-copy";
import { useDragHandler } from "@/hooks/use-drag-handler";
import { useGameHandlers } from "@/hooks/use-game-handlers";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

export default function CourtsPage() {
  const {
    players,
    setPlayers,
    courts,
    setCourts,
    gameHistory,
    setGameHistory,
    restingPlayers,
    setRestingPlayers,
    queuedMatches,
    setQueuedMatches,
    members,
    balancedLevelMode,
    setBalancedLevelMode,
    strictMode,
    setStrictMode,
    isEditMode,
    setIsEditMode,
    isCopyDisabled,
  } = useAppContext();

  useDisableCopy(isCopyDisabled);

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
    queuedMatches,
    setQueuedMatches,
  });

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
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <PlayerGrid
              players={players}
              courts={courts}
              restingPlayers={restingPlayers}
              members={members}
              onRemoveFromRest={(playerId) => {
                setRestingPlayers((prev) =>
                  prev.filter((p) => p.id !== playerId),
                );
              }}
              onEditPlayer={updatePlayerDetails}
              onAddPlayer={addPlayer}
              isEditMode={isEditMode}
            />
          </div>
          <div className="lg:col-span-2">
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
              balancedLevelMode={balancedLevelMode}
              onBalancedLevelModeChange={setBalancedLevelMode}
            />
          </div>
        </div>
      </div>

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
