import { Level } from "@/constants/level"; // Removed Gender import
import { supabase } from "@/lib/supabase/client";
import { Gender } from "@/model/member.model"; // Added Gender

export interface MemberData {
  name: string;
  level: Level;
  gender: Gender;
}

export interface Member extends MemberData {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * ดึงข้อมูล members ทั้งหมด
 */
export async function getAllMembers() {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching members:", error);
    throw error;
  }

  return data as Member[];
}

/**
 * ดึงข้อมูล member ตาม id
 */
export async function getMemberById(id: string) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching member:", error);
    throw error;
  }

  return data as Member;
}

/**
 * สร้าง member ใหม่
 */
export async function createMember(userId: string, memberData: MemberData) {
  const { data, error } = await supabase
    .from("members")
    .insert({
      user_id: userId,
      name: memberData.name,
      level: memberData.level,
      gender: memberData.gender,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating member:", error);
    throw error;
  }

  return data as Member;
}

/**
 * แก้ไขข้อมูล member
 */
export async function updateMember(
  id: string,
  memberData: Partial<MemberData>,
) {
  const { data, error } = await supabase
    .from("members")
    .update({
      ...memberData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating member:", error);
    throw error;
  }

  return data as Member;
}

/**
 * ลบ member
 */
export async function deleteMember(id: string) {
  const { error } = await supabase.from("members").delete().eq("id", id);

  if (error) {
    console.error("Error deleting member:", error);
    throw error;
  }

  return true;
}

/**
 * ค้นหา members ตามชื่อ
 */
export async function searchMembers(query: string) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching members:", error);
    throw error;
  }

  return data as Member[];
}

/**
 * ดึง members ตาม level
 */
export async function getMembersByLevel(level: Level) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("level", level)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching members by level:", error);
    throw error;
  }

  return data as Member[];
}

/**
 * ดึง members ตาม gender
 */
export async function getMembersByGender(gender: Gender) {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("gender", gender)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching members by gender:", error);
    throw error;
  }

  return data as Member[];
}
