"use client";

import { QueueManager } from "@/components/queue-manager";
import { SessionStarter } from "@/components/session-starter";
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
    currentSessionId,
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
    stopQueueMatch,
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
    currentSessionId,
  });

  return (
    <div className="p-6">
      <SessionStarter />

      {currentSessionId ? (
        <QueueManager
          players={players}
          courts={courts}
          restingPlayers={restingPlayers}
          queuedMatches={queuedMatches}
          members={members}
          isEditMode={isEditMode}
          onEditPlayer={updatePlayerDetails}
          onAddPlayer={addPlayer}
          onRemoveFromRest={(playerId: string) => {
            setRestingPlayers((prev) => prev.filter((p) => p.id !== playerId));
          }}
          onCreateQueue={createEmptyQueue}
          onDeleteQueue={deleteQueuedMatch}
          onRemovePlayerFromQueue={removePlayerFromQueue}
          onAddPlayerToQueue={addPlayerToQueue}
          onAutoMatchQueue={autoMatchQueue}
          onStartQueue={startQueueMatch}
          onStopQueue={stopQueueMatch}
          selectedCourts={selectedCourts}
          onCourtChange={handleCourtChange}
        />
      ) : (
        <div className="text-center py-12 text-gray-500">
          กรุณาเริ่มจัดก๊วนก่อนใช้งาน
        </div>
      )}
    </div>
  );
}
