"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { Court } from "@/model/court.model";
import { GameHistory } from "@/model/game-history.model";
import { Member } from "@/model/member.model";
import { Player } from "@/model/player.model";
import { QueuedMatch } from "@/model/queued-match.model";
import { createContext, ReactNode, useContext } from "react";

interface AppContextType {
  currentUser: string | null;
  setCurrentUser: (user: string | null) => void;
  players: Player[];
  setPlayers: (players: Player[] | ((prev: Player[]) => Player[])) => void;
  courts: Court[];
  setCourts: (courts: Court[] | ((prev: Court[]) => Court[])) => void;
  gameHistory: GameHistory[];
  setGameHistory: (
    history: GameHistory[] | ((prev: GameHistory[]) => GameHistory[]),
  ) => void;
  restingPlayers: Player[];
  setRestingPlayers: (
    players: Player[] | ((prev: Player[]) => Player[]),
  ) => void;
  queuedMatches: QueuedMatch[];
  setQueuedMatches: (
    matches: QueuedMatch[] | ((prev: QueuedMatch[]) => QueuedMatch[]),
  ) => void;
  members: Member[];
  setMembers: (members: Member[] | ((prev: Member[]) => Member[])) => void;
  balancedLevelMode: boolean;
  setBalancedLevelMode: (mode: boolean) => void;
  strictMode: boolean;
  setStrictMode: (mode: boolean) => void;
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;
  isCopyDisabled: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useLocalStorage<string | null>(
    "badminton-current-user",
    null,
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

  const [queuedMatches, setQueuedMatches] = useLocalStorage<QueuedMatch[]>(
    "badminton-queued-matches",
    [],
  );

  const [members, setMembers] = useLocalStorage<Member[]>(
    "badminton-members",
    [],
  );

  const [balancedLevelMode, setBalancedLevelMode] = useLocalStorage<boolean>(
    "badminton-balanced-level-mode",
    false,
  );

  const [strictMode, setStrictMode] = useLocalStorage<boolean>(
    "badminton-strict-mode",
    false,
  );

  const [isEditMode, setIsEditMode] = useLocalStorage<boolean>(
    "badminton-edit-mode",
    false,
  );

  const [isCopyDisabled] = useLocalStorage<boolean>(
    "badminton-copy-disabled",
    false,
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
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
        setMembers,
        balancedLevelMode,
        setBalancedLevelMode,
        strictMode,
        setStrictMode,
        isEditMode,
        setIsEditMode,
        isCopyDisabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
