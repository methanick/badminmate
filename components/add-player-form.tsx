"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { MultiSelect } from "@/components/ui/multi-select";
import { Level, LevelConfig } from "@/constants/level";
import { Member } from "@/model/member.model";
import { Player } from "@/model/player.model";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface AddPlayerFormProps {
  members: Member[];
  players?: Player[];
  onAddPlayers: (
    playersData: Array<{ name: string; level: Level; memberId?: string }>,
  ) => void;
  onClearAllPlayers: () => void;
  onResetGamesPlayed: () => void;
  isEditMode?: boolean;
  onEditModeChange?: (isEditing: boolean) => void;
}

export function AddPlayerForm({
  members = [],
  players = [],
  onAddPlayers,
}: AddPlayerFormProps) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddAllPlayers = async () => {
    try {
      setIsLoading(true);

      const playersData = selectedMemberIds
        .map((memberId) => {
          const member = members.find((m) => String(m.id) === memberId);
          if (!member) return null;
          return {
            name: member.name,
            level: member.level,
            memberId: String(member.id),
          };
        })
        .filter(
          (p): p is { name: string; level: Level; memberId: string } =>
            p !== null,
        );

      await onAddPlayers(playersData);
      setSelectedMemberIds([]);
    } catch (error) {
      console.error("Error adding players:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert members to MultiSelect options
  const memberOptions = members.map((member) => ({
    label: member.name,
    value: String(member.id),
    style: {
      badgeColor: LevelConfig[member.level].color,
    },
  }));

  return (
    <div className="">
      {members.length === 0 && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ยังไม่มีสมาชิกในระบบ{" "}
          <Link href="/members" className="underline font-medium">
            เพิ่มสมาชิก
          </Link>
        </div>
      )}

      <Field>
        <FieldLabel>เลือกสมาชิก</FieldLabel>
        <MultiSelect
          options={memberOptions}
          onValueChange={setSelectedMemberIds}
          defaultValue={selectedMemberIds}
          placeholder="เลือกสมาชิก"
          maxCount={3}
          className="w-full"
        />
      </Field>

      {selectedMemberIds.length > 0 && (
        <Button
          onClick={handleAddAllPlayers}
          disabled={isLoading}
          size="sm"
          className="h-8 text-xs w-full mt-2"
        >
          {isLoading ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
              <span>กำลังเพิ่ม...</span>
            </>
          ) : (
            <>
              <UserPlus className="h-3 w-3 mr-1" />
              เพิ่มผู้เล่นทั้งหมด ({selectedMemberIds.length} คน)
            </>
          )}
        </Button>
      )}
    </div>
  );
}
