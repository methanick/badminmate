"use client";

import { MembersView } from "@/components/members-view";
import { Level } from "@/constants/level";
import { useAppContext } from "@/contexts/app-context";
import {
  createMember,
  deleteMember,
  getAllMembers,
  Member,
  updateMember,
} from "@/lib/api/members";
import { Gender } from "@/model/member.model";
import { useEffect, useState } from "react";

export default function MembersPage() {
  const { currentUser } = useAppContext();
  const [localMembers, setLocalMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // โหลดข้อมูลจาก Supabase
  useEffect(() => {
    if (localMembers.length === 0) {
      console.log("Loading members from Supabase...");
      console.log("Current user:", localMembers.length, currentUser);
      loadMembers();
    }
  }, [currentUser, localMembers.length]);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllMembers();
      console.log("Fetched members:", data);
      setLocalMembers(data);
    } catch (error) {
      console.error("Failed to load members:", error);
      alert("ไม่สามารถโหลดข้อมูลสมาชิกได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (
    name: string,
    level: Level,
    gender: Gender,
  ) => {
    if (!currentUser?.id) {
      alert("กรุณาเข้าสู่ระบบ");
      return;
    }

    try {
      const newMember = await createMember(currentUser.id, {
        name,
        level,
        gender,
      });
      setLocalMembers((prev) => [newMember, ...prev]);
    } catch (error) {
      console.error("Failed to add member:", error);
      alert("ไม่สามารถเพิ่มสมาชิกได้");
    }
  };

  const handleEditMember = async (
    id: string,
    name: string,
    level: Level,
    gender: Gender,
  ) => {
    try {
      const updatedMember = await updateMember(id, { name, level, gender });
      setLocalMembers((prev) =>
        prev.map((m) => (m.id === id ? updatedMember : m)),
      );
    } catch (error) {
      console.error("Failed to update member:", error);
      alert("ไม่สามารถแก้ไขสมาชิกได้");
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteMember(id);
      setLocalMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      console.error("Failed to delete member:", error);
      alert("ไม่สามารถลบสมาชิกได้");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <MembersView
        members={localMembers.map((m) => ({
          id: m.id,
          name: m.name,
          level: m.level as Level,
          gender: m.gender as Gender,
          createdAt: new Date(m.created_at).getTime(),
        }))}
        onAddMember={handleAddMember}
        onEditMember={handleEditMember}
        onDeleteMember={handleDeleteMember}
      />
    </div>
  );
}
