"use client";

import { MembersView } from "@/components/members-view";
import { Level } from "@/constants/level";
import { useAppContext } from "@/contexts/app-context";
import { Gender } from "@/model/member.model";

export default function MembersPage() {
  const { members, setMembers } = useAppContext();

  const handleAddMember = (name: string, level: Level, gender: Gender) => {
    setMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        level,
        gender,
        createdAt: Date.now(),
      },
    ]);
  };

  const handleEditMember = (
    id: number,
    name: string,
    level: Level,
    gender: Gender,
  ) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, name, level, gender } : m)),
    );
  };

  const handleDeleteMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="p-6">
      <MembersView
        members={members}
        onAddMember={handleAddMember}
        onEditMember={handleEditMember}
        onDeleteMember={handleDeleteMember}
      />
    </div>
  );
}
