import { Level } from "@/constants/level";
import { autoMatchPlayers } from "@/lib/auto-match";
import { Court } from "@/model/court.model";
import { GameHistory } from "@/model/game-history.model";
import { Player } from "@/model/player.model";
import { QueuedMatch } from "@/model/queued-match.model";
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
  queuedMatches: QueuedMatch[];
  setQueuedMatches: (
    value: QueuedMatch[] | ((prev: QueuedMatch[]) => QueuedMatch[]),
  ) => void;
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
  queuedMatches,
  setQueuedMatches,
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

  const [balancedLevelMode, setBalancedLevelMode] = useLocalStorage<boolean>(
    "badminton-balanced-level-mode",
    false,
  );

  const [selectedCourts, setSelectedCourts] = useLocalStorage<
    Record<number, number>
  >("badminton-queue-selected-courts", {});

  const addPlayer = (name: string, level: Level, memberId?: number) => {
    setPlayers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        level,
        gamesPlayed: 0,
        memberId,
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
      players,
      courts,
      restingPlayers,
      gameHistory,
      strictMode,
      balancedLevelMode,
    });

    if (!result) {
      alert("ไม่สามารถจับคู่ผู้เล่นที่เหมาะสมได้");
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

  const autoFillAllCourts = () => {
    // หาสนามว่างทั้งหมด
    const emptyCourts = courts.filter((court) => {
      const emptySlots =
        court.team1.filter((p) => !p).length +
        court.team2.filter((p) => !p).length;
      return emptySlots === 4 && !court.isPlaying;
    });

    if (emptyCourts.length === 0) {
      alert("ไม่มีสนามว่าง");
      return;
    }

    let updatedCourts = [...courts];
    let filledCount = 0;

    // วนลูปจัดคู่ให้ทุกสนามว่าง
    for (const court of emptyCourts) {
      const result = autoMatchPlayers({
        players,
        courts: updatedCourts,
        restingPlayers,
        gameHistory,
        strictMode,
        balancedLevelMode,
      });

      if (result) {
        updatedCourts = updatedCourts.map((c) => {
          if (c.id !== court.id) return c;
          return {
            ...c,
            team1: result.team1,
            team2: result.team2,
          };
        });
        filledCount++;
      }
    }

    if (filledCount > 0) {
      setCourts(updatedCourts);
      alert(`จัดคู่สำเร็จ ${filledCount} สนาม`);
    } else {
      alert("ไม่สามารถจัดคู่ให้สนามใดได้");
    }
  };

  // Queue management functions
  const createQueuedMatch = () => {
    const result = autoMatchPlayers({
      players,
      courts,
      restingPlayers,
      gameHistory,
      strictMode,
      balancedLevelMode,
    });

    if (!result) {
      alert(
        "ไม่สามารถจัดคู่ผู้เล่นได้ (อาจไม่มีผู้เล่นเพียงพอหรือไม่ตรงเงื่อนไข)",
      );
      return;
    }

    const newMatch: QueuedMatch = {
      id: Date.now(),
      team1: result.team1,
      team2: result.team2,
      createdAt: Date.now(),
    };

    setQueuedMatches((prev) => [...prev, newMatch]);
  };

  const createEmptyQueue = () => {
    const newQueue: QueuedMatch = {
      id: Date.now(),
      team1: [null, null],
      team2: [null, null],
      createdAt: Date.now(),
    };

    setQueuedMatches((prev) => [...prev, newQueue]);
  };

  const deleteQueuedMatch = (matchId: number) => {
    setQueuedMatches((prev) => prev.filter((m) => m.id !== matchId));
    // ลบ selected court ด้วย
    setSelectedCourts((prev) => {
      const newSelected = { ...prev };
      delete newSelected[matchId];
      return newSelected;
    });
  };

  const removePlayerFromQueue = (
    queueId: number,
    team: "team1" | "team2",
    slotIndex: number,
  ) => {
    setQueuedMatches((prev) =>
      prev.map((queue) => {
        if (queue.id !== queueId) return queue;

        const newTeam = [...queue[team]] as [Player | null, Player | null];
        newTeam[slotIndex] = null;

        return {
          ...queue,
          [team]: newTeam,
        };
      }),
    );
  };

  const addPlayerToQueue = (
    queueId: number,
    team: "team1" | "team2",
    slotIndex: number,
    playerId: number,
  ) => {
    const playerToAdd = players.find((p) => p.id === playerId);
    if (!playerToAdd) return;

    // ตรวจสอบว่าผู้เล่นอยู่ในคิวอื่นหรือสนามอื่นแล้วหรือไม่
    const playerInQueue = queuedMatches.some(
      (queue) =>
        queue.team1.some((p) => p?.id === playerId) ||
        queue.team2.some((p) => p?.id === playerId),
    );

    const playerInCourt = courts.some(
      (court) =>
        court.team1.some((p) => p?.id === playerId) ||
        court.team2.some((p) => p?.id === playerId),
    );

    if (playerInQueue || playerInCourt) return;

    setQueuedMatches((prev) =>
      prev.map((queue) => {
        if (queue.id !== queueId) return queue;

        const newTeam = [...queue[team]] as [Player | null, Player | null];
        newTeam[slotIndex] = playerToAdd;

        return {
          ...queue,
          [team]: newTeam,
        };
      }),
    );

    // ลบผู้เล่นออกจาก resting
    setRestingPlayers((prev) => prev.filter((p) => p.id !== playerId));
  };

  const autoMatchQueue = (queueId: number) => {
    // สร้าง temporary courts ที่รวมคิวอื่นเข้าไปด้วย เพื่อไม่ให้เอาคนจากคิวอื่นมาจับคู่
    const playersInOtherQueues = new Set<number>();
    queuedMatches.forEach((queue) => {
      if (queue.id !== queueId) {
        queue.team1.forEach((p) => p && playersInOtherQueues.add(p.id));
        queue.team2.forEach((p) => p && playersInOtherQueues.add(p.id));
      }
    });

    // สร้าง fake courts ที่มีผู้เล่นจากคิวอื่น
    const tempCourts = [
      ...courts,
      ...Array.from(playersInOtherQueues).map((playerId, index) => {
        const player = players.find((p) => p.id === playerId);
        return {
          id: -1000 - index,
          name: `temp-${index}`,
          team1: [player, null] as [Player | null, Player | null],
          team2: [null, null] as [Player | null, Player | null],
          isPlaying: false,
        };
      }),
    ];

    const result = autoMatchPlayers({
      players,
      courts: tempCourts,
      restingPlayers,
      gameHistory,
      strictMode,
      balancedLevelMode,
    });

    if (!result) {
      alert("ไม่สามารถจัดคู่ผู้เล่นได้");
      return;
    }

    setQueuedMatches((prev) =>
      prev.map((queue) => {
        if (queue.id !== queueId) return queue;
        return {
          ...queue,
          team1: result.team1,
          team2: result.team2,
        };
      }),
    );
  };

  const startQueueMatch = (queueId: number, courtId: number) => {
    const queue = queuedMatches.find((q) => q.id === queueId);
    if (!queue) return;

    if (
      !queue.team1[0] ||
      !queue.team1[1] ||
      !queue.team2[0] ||
      !queue.team2[1]
    ) {
      alert("กรุณาใส่ผู้เล่นครบ 4 คน");
      return;
    }

    // ส่งผู้เล่นเข้าสนาม
    setCourts((prev) =>
      prev.map((court) => {
        if (court.id !== courtId) return court;
        return {
          ...court,
          team1: queue.team1,
          team2: queue.team2,
        };
      }),
    );

    // ลบคิวและ selected court
    deleteQueuedMatch(queueId);
  };

  const handleCourtChange = (queueId: number, courtId: number) => {
    setSelectedCourts((prev) => ({
      ...prev,
      [queueId]: courtId,
    }));
  };

  const assignMatchToCourt = (matchId: number, courtId: number) => {
    const match = queuedMatches.find((m) => m.id === matchId);
    if (!match) return;

    setCourts((prev) =>
      prev.map((court) => {
        if (court.id !== courtId) return court;
        return {
          ...court,
          team1: match.team1,
          team2: match.team2,
        };
      }),
    );

    // ลบ match จากคิว
    deleteQueuedMatch(matchId);
  };

  const autoFillFromQueue = () => {
    const emptyCourts = courts.filter((court) => {
      const emptySlots =
        court.team1.filter((p) => !p).length +
        court.team2.filter((p) => !p).length;
      return emptySlots === 4 && !court.isPlaying;
    });

    if (emptyCourts.length === 0) {
      alert("ไม่มีสนามว่าง");
      return;
    }

    if (queuedMatches.length === 0) {
      alert("ไม่มีคิวแมตช์");
      return;
    }

    const matchesToAssign = Math.min(emptyCourts.length, queuedMatches.length);
    let updatedCourts = [...courts];
    let updatedQueue = [...queuedMatches];

    for (let i = 0; i < matchesToAssign; i++) {
      const court = emptyCourts[i];
      const match = updatedQueue[0];

      updatedCourts = updatedCourts.map((c) => {
        if (c.id !== court.id) return c;
        return {
          ...c,
          team1: match.team1,
          team2: match.team2,
        };
      });

      updatedQueue = updatedQueue.slice(1);
    }

    setCourts(updatedCourts);
    setQueuedMatches(updatedQueue);
    alert(`ส่งคิวเข้าสนามสำเร็จ ${matchesToAssign} คู่`);
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
    autoFillAllCourts,
    createQueuedMatch,
    createEmptyQueue,
    deleteQueuedMatch,
    removePlayerFromQueue,
    addPlayerToQueue,
    autoMatchQueue,
    startQueueMatch,
    handleCourtChange,
    selectedCourts,
    assignMatchToCourt,
    autoFillFromQueue,
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
    balancedLevelMode,
    setBalancedLevelMode,
  };
}
