"use client";

import { MembersView } from "@/components/members-view";
import { Level } from "@/constants/level";
import { useAppContext } from "@/contexts/app-context";
import {
  createMember,
  deleteMember,
  getAllMembers,
  updateMember,
} from "@/lib/api/members";
import { Gender } from "@/model/member.model";
import { useEffect, useState } from "react";

export default function MembersPage() {
  const { setMembers, currentUser } = useAppContext();
  const [localMembers, setLocalMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // โหลดข้อมูลจาก Supabase
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await getAllMembers();
      setLocalMembers(data);
      // Sync กับ context
      setMembers(
        data.map((m) => ({
          id: m.id,
          name: m.name,
          level: m.level as Level,
          gender: m.gender as Gender,
          createdAt: new Date(m.created_at).getTime(),
        })),
      );
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
      // Sync กับ context
      setMembers((prev) => [
        ...prev,
        {
          id: newMember.id,
          name: newMember.name,
          level: newMember.level as Level,
          gender: newMember.gender as Gender,
          createdAt: new Date(newMember.created_at).getTime(),
        },
      ]);
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
      // Sync กับ context
      setMembers((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                name: updatedMember.name,
                level: updatedMember.level as Level,
                gender: updatedMember.gender as Gender,
              }
            : m,
        ),
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
      // Sync กับ context
      setMembers((prev) => prev.filter((m) => m.id !== id));
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
