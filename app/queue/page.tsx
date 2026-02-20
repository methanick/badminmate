"use client";

import { QueueManager } from "@/components/queue-manager";
import { useAppContext } from "@/contexts/app-context";
import { useGameHandlers } from "@/hooks/use-game-handlers";

export default function QueuePage() {
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
    isEditMode,
  } = useAppContext();

  const {
    addPlayer,
    updatePlayerDetails,
    createEmptyQueue,
    deleteQueuedMatch,
    removePlayerFromQueue,
    addPlayerToQueue,
    autoMatchQueue,
    startQueueMatch,
    selectedCourts,
    handleCourtChange,
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

  return (
    <div className="p-6">
      <QueueManager
        players={players}
        courts={courts}
        restingPlayers={restingPlayers}
        queuedMatches={queuedMatches}
        members={members}
        isEditMode={isEditMode}
        onEditPlayer={updatePlayerDetails}
        onAddPlayer={addPlayer}
        onRemoveFromRest={(playerId: number) => {
          setRestingPlayers((prev) => prev.filter((p) => p.id !== playerId));
        }}
        onCreateQueue={createEmptyQueue}
        onDeleteQueue={deleteQueuedMatch}
        onRemovePlayerFromQueue={removePlayerFromQueue}
        onAddPlayerToQueue={addPlayerToQueue}
        onAutoMatchQueue={autoMatchQueue}
        onStartQueue={startQueueMatch}
        selectedCourts={selectedCourts}
        onCourtChange={handleCourtChange}
      />
    </div>
  );
}
