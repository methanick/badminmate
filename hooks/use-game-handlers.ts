import { Level } from "@/constants/level";
import { autoMatchPlayers } from "@/lib/auto-match";
import { Court } from "@/model/court.model";
import { GameHistory } from "@/model/game-history.model";
import { Player } from "@/model/player.model";
import { useState } from "react";
import { useLocalStorage } from "./use-local-storage";

interface UseGameHandlersParams {
  players: Player[];
  setPlayers: (value: Player[] | ((prev: Player[]) => Player[])) => void;
  courts: Court[];
  setCourts: (value: Court[] | ((prev: Court[]) => Court[])) => void;
  gameHistory: GameHistory[];
  setGameHistory: (
    value: GameHistory[] | ((prev: GameHistory[]) => GameHistory[]),
  ) => void;
  restingPlayers: Player[];
  setRestingPlayers: (value: Player[] | ((prev: Player[]) => Player[])) => void;
}

export function useGameHandlers({
  players,
  setPlayers,
  courts,
  setCourts,
  gameHistory,
  setGameHistory,
  restingPlayers,
  setRestingPlayers,
}: UseGameHandlersParams) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<{
    player: Player;
    fromCourt: boolean;
    courtId?: number;
    team?: "team1" | "team2";
    slotIndex?: number;
  } | null>(null);

  const [deleteCourtConfirmOpen, setDeleteCourtConfirmOpen] = useState(false);
  const [courtToDelete, setCourtToDelete] = useState<number | null>(null);

  const [clearAllPlayersConfirmOpen, setClearAllPlayersConfirmOpen] =
    useState(false);

  const [resetGamesPlayedConfirmOpen, setResetGamesPlayedConfirmOpen] =
    useState(false);

  const [strictMode, setStrictMode] = useLocalStorage<boolean>(
    "badminton-strict-mode",
    false,
  );

  const addPlayer = (name: string, level: Level) => {
    setPlayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        level,
        gamesPlayed: 0,
      },
    ]);
  };

  const addCourt = () => {
    setCourts((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: `สนาม ${prev.length + 1}`,
        team1: [null, null],
        team2: [null, null],
        isPlaying: false,
      },
    ]);
  };

  const deleteCourt = (courtId: number) => {
    setCourtToDelete(courtId);
    setDeleteCourtConfirmOpen(true);
  };

  const confirmDeleteCourt = () => {
    if (courtToDelete !== null) {
      setCourts((prev) => prev.filter((c) => c.id !== courtToDelete));
    }
    setDeleteCourtConfirmOpen(false);
    setCourtToDelete(null);
  };

  const updateCourtName = (courtId: number, newName: string) => {
    setCourts((prev) =>
      prev.map((court) =>
        court.id === courtId ? { ...court, name: newName } : court,
      ),
    );
  };

  const removePlayerFromSlot = (
    courtId: number,
    team: "team1" | "team2",
    slotIndex: number,
  ) => {
    setCourts((prev) =>
      prev.map((court) => {
        if (court.id !== courtId) return court;

        const newTeam = [...court[team]] as [Player | null, Player | null];
        newTeam[slotIndex] = null;

        return {
          ...court,
          [team]: newTeam,
        };
      }),
    );
  };

  const updatePlayerDetails = (
    playerId: number,
    name: string,
    level: Level,
  ) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, name, level } : player,
      ),
    );

    setRestingPlayers((prev) =>
      prev.map((player) =>
        player.id === playerId ? { ...player, name, level } : player,
      ),
    );

    setCourts((prev) =>
      prev.map((court) => {
        const mapPlayer = (p: Player | null) =>
          p && p.id === playerId ? { ...p, name, level } : p;

        return {
          ...court,
          team1: [mapPlayer(court.team1[0]), mapPlayer(court.team1[1])],
          team2: [mapPlayer(court.team2[0]), mapPlayer(court.team2[1])],
        };
      }),
    );

    setGameHistory((prev) =>
      prev.map((game) => {
        const mapPlayer = (p: Player) =>
          p.id === playerId ? { ...p, name, level } : p;
        return {
          ...game,
          team1: [mapPlayer(game.team1[0]), mapPlayer(game.team1[1])],
          team2: [mapPlayer(game.team2[0]), mapPlayer(game.team2[1])],
        };
      }),
    );
  };

  const addPlayerToSlot = (
    courtId: number,
    team: "team1" | "team2",
    slotIndex: number,
    playerId: number,
  ) => {
    const playerToAdd = players.find((p) => p.id === playerId);
    if (!playerToAdd) return;

    const playerAlreadyInCourt = courts.some(
      (court) =>
        court.team1.some((p) => p?.id === playerId) ||
        court.team2.some((p) => p?.id === playerId),
    );

    if (playerAlreadyInCourt) return;

    setCourts((prev) =>
      prev.map((court) => {
        if (court.id !== courtId) return court;

        const newTeam = [...court[team]] as [Player | null, Player | null];
        newTeam[slotIndex] = playerToAdd;

        return {
          ...court,
          [team]: newTeam,
        };
      }),
    );

    setRestingPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const startGame = (courtId: number) => {
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;

    if (
      !court.team1[0] ||
      !court.team1[1] ||
      !court.team2[0] ||
      !court.team2[1]
    ) {
      return;
    }

    const newHistory: GameHistory = {
      id: Date.now(),
      timestamp: Date.now(),
      courtName: court.name,
      team1: [court.team1[0], court.team1[1]],
      team2: [court.team2[0], court.team2[1]],
    };
    setGameHistory((prev) => [newHistory, ...prev]);

    const playerIds: number[] = [];
    court.team1.forEach((p) => p && playerIds.push(p.id));
    court.team2.forEach((p) => p && playerIds.push(p.id));

    setPlayers((prev) =>
      prev.map((player) => {
        if (playerIds.includes(player.id)) {
          return {
            ...player,
            gamesPlayed: player.gamesPlayed + 1,
          };
        }
        return player;
      }),
    );

    setCourts((prev) =>
      prev.map((court) =>
        court.id === courtId ? { ...court, isPlaying: true } : court,
      ),
    );
  };

  const endGame = (courtId: number) => {
    setCourts((prev) =>
      prev.map((court) =>
        court.id === courtId
          ? {
              ...court,
              team1: [null, null],
              team2: [null, null],
              isPlaying: false,
            }
          : court,
      ),
    );
  };

  const handleAutoMatch = (courtId: number) => {
    const result = autoMatchPlayers({
      courtId,
      players,
      courts,
      restingPlayers,
      gameHistory,
      strictMode,
    });

    if (!result) {
      alert("ไม่มีผู้เล่นว่างเพียงพอ ต้องการอย่างน้อย 4 คน");
      return;
    }

    setCourts((prev) =>
      prev.map((court) => {
        if (court.id !== courtId) return court;
        return {
          ...court,
          team1: result.team1,
          team2: result.team2,
        };
      }),
    );
  };

  const clearAllPlayers = () => {
    setClearAllPlayersConfirmOpen(true);
  };

  const confirmClearAllPlayers = () => {
    setPlayers([]);
    setCourts((prev) =>
      prev.map((court) => ({
        ...court,
        team1: [null, null],
        team2: [null, null],
        isPlaying: false,
      })),
    );
    setRestingPlayers([]);
    setClearAllPlayersConfirmOpen(false);
  };

  const clearAllCourts = () => {
    setCourts((prev) =>
      prev.map((court) => ({
        ...court,
        team1: [null, null],
        team2: [null, null],
        isPlaying: false,
      })),
    );
  };

  const resetAllGamesPlayed = () => {
    setResetGamesPlayedConfirmOpen(true);
  };

  const confirmResetGamesPlayed = () => {
    setPlayers((prev) =>
      prev.map((player) => ({
        ...player,
        gamesPlayed: 0,
      })),
    );
    setResetGamesPlayedConfirmOpen(false);
  };

  const confirmDelete = () => {
    if (!playerToDelete) return;

    if (playerToDelete.fromCourt) {
      setCourts((prev) =>
        prev.map((court) => {
          if (court.id !== playerToDelete.courtId) return court;

          const teamKey = playerToDelete.team!;
          const slotIndex = playerToDelete.slotIndex!;

          const newTeam = [...court[teamKey]] as [Player | null, Player | null];
          newTeam[slotIndex] = null;

          return {
            ...court,
            [teamKey]: newTeam,
          };
        }),
      );
    }

    setPlayers((prev) => prev.filter((p) => p.id !== playerToDelete.player.id));
    setRestingPlayers((prev) =>
      prev.filter((p) => p.id !== playerToDelete.player.id),
    );

    setPlayerToDelete(null);
    setDeleteConfirmOpen(false);
  };

  return {
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
    courtToDelete,
    setCourtToDelete,
    clearAllPlayersConfirmOpen,
    setClearAllPlayersConfirmOpen,
    resetGamesPlayedConfirmOpen,
    setResetGamesPlayedConfirmOpen,
    strictMode,
    setStrictMode,
  };
}
