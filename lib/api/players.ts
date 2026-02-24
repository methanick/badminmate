import { Level } from "@/constants/level";
import { supabase } from "@/lib/supabase/client";

export interface PlayerData {
  session_id: string;
  member_id?: string | null;
  name: string;
  level: Level;
  games_played?: number;
}

export interface Player extends PlayerData {
  id: string;
  created_at: string;
}

/**
 * สร้าง player ใหม่ใน session
 */
export async function createPlayer(playerData: PlayerData) {
  const { data, error } = await supabase
    .from("players")
    .insert({
      session_id: playerData.session_id,
      member_id: playerData.member_id,
      name: playerData.name,
      level: playerData.level,
      games_played: playerData.games_played || 0,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating player:", error);
    throw error;
  }

  return data as Player;
}

/**
 * สร้าง players หลายคนพร้อมกันใน session (bulk insert)
 */
export async function createPlayers(playersData: PlayerData[]) {
  const { data, error } = await supabase
    .from("players")
    .insert(
      playersData.map((p) => ({
        session_id: p.session_id,
        member_id: p.member_id,
        name: p.name,
        level: p.level,
        games_played: p.games_played || 0,
      })),
    )
    .select();

  if (error) {
    console.error("Error creating players:", error);
    throw error;
  }

  return data as Player[];
}

/**
 * ดึง players ทั้งหมดใน session
 */
export async function getPlayersBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching players:", error);
    throw error;
  }

  return data as Player[];
}

/**
 * อัพเดท player
 */
export async function updatePlayer(
  id: string,
  updates: Partial<Omit<PlayerData, "session_id">>,
) {
  const { data, error } = await supabase
    .from("players")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating player:", error);
    throw error;
  }

  return data as Player;
}

/**
 * ลบ player
 */
export async function deletePlayer(id: string) {
  const { error } = await supabase.from("players").delete().eq("id", id);

  if (error) {
    console.error("Error deleting player:", error);
    throw error;
  }

  return true;
}

/**
 * เพิ่มจำนวนเกมส์ที่เล่น
 */
export async function incrementGamesPlayed(playerId: string) {
  const { data: player } = await supabase
    .from("players")
    .select("games_played")
    .eq("id", playerId)
    .single();

  if (!player) return;

  return updatePlayer(playerId, {
    games_played: (player.games_played || 0) + 1,
  });
}

/**
 * รีเซ็ตจำนวนเกมส์ที่เล่นทั้งหมดใน session
 */
export async function resetAllGamesPlayed(sessionId: string) {
  const { error } = await supabase
    .from("players")
    .update({ games_played: 0 })
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error resetting games played:", error);
    throw error;
  }

  return true;
}
