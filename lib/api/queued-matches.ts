import { supabase } from "@/lib/supabase/client";

export interface QueuedMatchData {
  session_id: string;
  team1_slot1_Id?: string | null;
  team1_slot2_Id?: string | null;
  team2_slot1_Id?: string | null;
  team2_slot2_Id?: string | null;
  court_Id?: string | null;
  is_playing?: boolean;
}

export interface QueuedMatch extends QueuedMatchData {
  id: string;
  created_at: string;
}

/**
 * สร้างคิวใหม่
 */
export async function createQueuedMatch(queueData: QueuedMatchData) {
  const { data, error } = await supabase
    .from("queued_matches")
    .insert({
      session_id: queueData.session_id,
      team1_slot1_id: queueData.team1_slot1_id,
      team1_slot2_id: queueData.team1_slot2_id,
      team2_slot1_id: queueData.team2_slot1_id,
      team2_slot2_id: queueData.team2_slot2_id,
      court_id: queueData.court_id,
      is_playing: queueData.is_playing || false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating queued match:", error);
    throw error;
  }

  return data as QueuedMatch;
}

/**
 * ดึงคิวทั้งหมดใน session
 */
export async function getQueuedMatchesBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("queued_matches")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching queued matches:", error);
    throw error;
  }

  return data as QueuedMatch[];
}

/**
 * อัพเดทคิว
 */
export async function updateQueuedMatch(
  id: string,
  updates: Partial<Omit<QueuedMatchData, "session_id">>,
) {
  const { data, error } = await supabase
    .from("queued_matches")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating queued match:", error);
    throw error;
  }

  return data as QueuedMatch;
}

/**
 * ลบคิว
 */
export async function deleteQueuedMatch(id: string) {
  const { error } = await supabase.from("queued_matches").delete().eq("id", id);

  if (error) {
    console.error("Error deleting queued match:", error);
    throw error;
  }

  return true;
}
