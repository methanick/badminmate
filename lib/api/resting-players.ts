import { supabase } from "@/lib/supabase/client";

export interface RestingPlayerData {
  session_id: string;
  player_id: string;
}

export interface RestingPlayer extends RestingPlayerData {
  id: string;
  created_at: string;
}

/**
 * เพิ่มผู้เล่นเข้ารายการพัก
 */
export async function addRestingPlayer(data: RestingPlayerData) {
  const { data: result, error } = await supabase
    .from("resting_players")
    .insert(data)
    .select()
    .single();

  if (error) {
    console.error("Error adding resting player:", error);
    throw error;
  }

  return result as RestingPlayer;
}

/**
 * ดึงผู้เล่นที่พักทั้งหมดใน session
 */
export async function getRestingPlayersBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("resting_players")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching resting players:", error);
    throw error;
  }

  return data as RestingPlayer[];
}

/**
 * ลบผู้เล่นออกจากรายการพัก
 */
export async function removeRestingPlayer(playerId: string, sessionId: string) {
  const { error } = await supabase
    .from("resting_players")
    .delete()
    .eq("player_id", playerId)
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error removing resting player:", error);
    throw error;
  }

  return true;
}

/**
 * ตรวจสอบว่าผู้เล่นอยู่ในรายการพักหรือไม่
 */
export async function isPlayerResting(
  playerId: string,
  sessionId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("resting_players")
    .select("id")
    .eq("player_id", playerId)
    .eq("session_id", sessionId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error checking resting player:", error);
    return false;
  }

  return !!data;
}
