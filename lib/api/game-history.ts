import { supabase } from "@/lib/supabase/client";

export interface GameHistoryData {
  session_id: string;
  court_name: string;
  team1_player1_name?: string | null;
  team1_player1_level?: string | null;
  team1_player2_name?: string | null;
  team1_player2_level?: string | null;
  team2_player1_name?: string | null;
  team2_player1_level?: string | null;
  team2_player2_name?: string | null;
  team2_player2_level?: string | null;
}

export interface GameHistory extends GameHistoryData {
  id: string;
  timestamp: string;
}

/**
 * บันทึกประวัติการเล่น
 */
export async function createGameHistory(historyData: GameHistoryData) {
  const { data, error } = await supabase
    .from("game_history")
    .insert(historyData)
    .select()
    .single();

  if (error) {
    console.error("Error creating game history:", error);
    throw error;
  }

  return data as GameHistory;
}

/**
 * ดึงประวัติการเล่นทั้งหมดใน session
 */
export async function getGameHistoryBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("game_history")
    .select("*")
    .eq("session_id", sessionId)
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("Error fetching game history:", error);
    throw error;
  }

  return data as GameHistory[];
}

/**
 * ลบประวัติการเล่น
 */
export async function deleteGameHistory(id: string) {
  const { error } = await supabase.from("game_history").delete().eq("id", id);

  if (error) {
    console.error("Error deleting game history:", error);
    throw error;
  }

  return true;
}
