import { supabase } from "@/lib/supabase/client";

export interface CourtData {
  session_id: string;
  name: string;
  is_playing?: boolean;
  team1_slot1_Id?: string | null;
  team1_slot2_Id?: string | null;
  team2_slot1_Id?: string | null;
  team2_slot2_Id?: string | null;
}

export interface Court extends CourtData {
  id: string;
  created_at: string;
}

/**
 * สร้าง court ใหม่
 */
export async function createCourt(courtData: CourtData) {
  const { data, error } = await supabase
    .from("courts")
    .insert({
      session_id: courtData.session_id,
      name: courtData.name,
      is_playing: courtData.is_playing || false,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating court:", error);
    throw error;
  }

  return data as Court;
}

/**
 * ดึง courts ทั้งหมดใน session
 */
export async function getCourtsBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching courts:", error);
    throw error;
  }

  return data as Court[];
}

/**
 * อัพเดท court
 */
export async function updateCourt(
  id: string,
  updates: Partial<Omit<CourtData, "session_id">>,
) {
  const { data, error } = await supabase
    .from("courts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating court:", error);
    throw error;
  }

  return data as Court;
}

/**
 * ลบ court
 */
export async function deleteCourt(id: string) {
  const { error } = await supabase.from("courts").delete().eq("id", id);

  if (error) {
    console.error("Error deleting court:", error);
    throw error;
  }

  return true;
}

/**
 * ล้างผู้เล่นออกจากสนาม
 */
export async function clearCourtPlayers(courtId: string) {
  return updateCourt(courtId, {
    team1_slot1_id: null,
    team1_slot2_id: null,
    team2_slot1_id: null,
    team2_slot2_id: null,
    is_playing: false,
  });
}

/**
 * ล้างผู้เล่นออกจากทุกสนามใน session
 */
export async function clearAllCourts(sessionId: string) {
  const { error } = await supabase
    .from("courts")
    .update({
      team1_slot1_id: null,
      team1_slot2_id: null,
      team2_slot1_id: null,
      team2_slot2_id: null,
      is_playing: false,
    })
    .eq("session_id", sessionId);

  if (error) {
    console.error("Error clearing all courts:", error);
    throw error;
  }

  return true;
}
