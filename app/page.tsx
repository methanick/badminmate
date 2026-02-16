"use client";

import { AddPlayerForm } from "@/components/add-player-form";
import { ConfirmationDialogs } from "@/components/confirmation-dialogs";
import { CourtGrid } from "@/components/court-grid";
import { HistoryPanel } from "@/components/history-panel";
import { LoginForm } from "@/components/login-form";
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
import { LogOut } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  // ===== auth state =====
  const [currentUser, setCurrentUser] = useLocalStorage<string | null>(
    "badminton-current-user",
    null,
  );

  // ===== state - ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS =====
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCopyDisabled] = useLocalStorage<boolean>(
    "badminton-copy-disabled",
    false,
  );

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

  // Handle login
  const handleLogin = (username: string) => {
    setCurrentUser(username);
  };

  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
  };

  // If not logged in, show login form - CONDITIONAL RETURN AFTER ALL HOOKS
  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
      <main className="flex h-screen gap-4 p-6 bg-white rounded-2xl overflow-auto lg:overflow-hidden">
        <div className="w-screen bg-white flex flex-col overflow-auto lg:overflow-hidden">
          {/* Header with Logout */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b">
            <div>
              <h1 className="text-2xl font-bold">BadminMate</h1>
              <p className="text-sm text-gray-500">
                ยินดีต้อนรับ {currentUser}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">ออกจากระบบ</span>
            </button>
          </div>

          {/* Desktop Layout */}
          <div className="">
            <Tabs defaultValue="players" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="players">ผู้เล่น</TabsTrigger>
                <TabsTrigger value="courts">สนาม</TabsTrigger>
                <TabsTrigger value="history">ประวัติ</TabsTrigger>
              </TabsList>

              <TabsContent value="players" className="space-y-4">
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
                      onAddPlayer={addPlayer}
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
                  <div>
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
              </TabsContent>

              <TabsContent value="courts" className="space-y-4">
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
