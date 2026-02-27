"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { AuthUser, getCurrentUser, onAuthStateChange } from "@/lib/api/auth";
import { getAllMembers } from "@/lib/api/members";
import { Court } from "@/model/court.model";
import { GameHistory } from "@/model/game-history.model";
import { Member } from "@/model/member.model";
import { Player } from "@/model/player.model";
import { QueuedMatch } from "@/model/queued-match.model";
import { usePathname } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AppContextType {
  currentUser: AuthUser | null;
  setCurrentUser: (user: AuthUser | null) => void;
  isAuthLoading: boolean;
  currentSessionId: string | null;
  setCurrentSessionId: (sessionId: string | null) => void;
  currentSessionName: string | null;
  setCurrentSessionName: (name: string | null) => void;
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
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const pathname = usePathname();
  const [members, setMembers] = useState<Member[]>([]);

  // Check if current route is public
  const isPublicRoute = pathname?.startsWith("/match/");

  // Load current user on mount (skip for public routes)
  useEffect(() => {
    if (isPublicRoute) {
      setIsAuthLoading(false);
      return;
    }

    getCurrentUser()
      .then((user) => setCurrentUser(user))
      .catch((error) => {
        console.error("Error loading user:", error);
        setCurrentUser(null);
      })
      .finally(() => setIsAuthLoading(false));

    // Listen to auth changes
    const subscription = onAuthStateChange((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isPublicRoute]);

  // Load members from Supabase when user is authenticated
  useEffect(() => {
    if (currentUser && !isPublicRoute) {
      getAllMembers()
        .then((data) => {
          // ensure returned members conform to model.Member by adding createdAt if missing
          const normalized = data.map((m) => ({
            ...m,
            createdAt: (m as any).createdAt ?? Date.now(),
          })) as Member[];
          setMembers(normalized);
        })
        .catch((error) => console.error("Error loading members:", error));
    }
  }, [currentUser, isPublicRoute]);

  const [currentSessionId, setCurrentSessionId] = useLocalStorage<
    string | null
  >("badminton-current-session-id", null);

  const [currentSessionName, setCurrentSessionName] = useLocalStorage<
    string | null
  >("badminton-current-session-name", null);

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
        isAuthLoading,
        currentSessionId,
        setCurrentSessionId,
        currentSessionName,
        setCurrentSessionName,
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
