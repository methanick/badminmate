import { supabase } from "@/lib/supabase/client";

export interface Session {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

/**
 * สร้าง session ใหม่
 */
export async function createSession(name: string = "New Session") {
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({
      name,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating session:", error);
    throw error;
  }

  return data as Session;
}

/**
 * ดึงข้อมูล session ตาม id
 */
export async function getSession(id: string) {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching session:", error);
    throw error;
  }

  return data as Session;
}

/**
 * อัพเดท session
 */
export async function updateSession(id: string, name: string) {
  const { data, error } = await supabase
    .from("sessions")
    .update({ name })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating session:", error);
    throw error;
  }

  return data as Session;
}

/**
 * ลบ session (จะลบข้อมูลที่เกี่ยวข้องทั้งหมดด้วย)
 */
export async function deleteSession(id: string) {
  const { error } = await supabase.from("sessions").delete().eq("id", id);

  if (error) {
    console.error("Error deleting session:", error);
    throw error;
  }

  return true;
}

/**
 * ดึง sessions ทั้งหมด
 */
export async function getAllSessions() {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }

  return data as Session[];
}
