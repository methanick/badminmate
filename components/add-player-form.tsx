"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Level, LevelConfig } from "@/constants/level";
import { Member } from "@/model/member.model";
import { Player } from "@/model/player.model";
import { UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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
  const [currentSelection, setCurrentSelection] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  // Debug: log members when it changes
  useEffect(() => {
    console.log("AddPlayerForm - members:", members);
  }, [members]);

  const handleAddToList = () => {
    if (currentSelection && !selectedMemberIds.includes(currentSelection)) {
      setSelectedMemberIds([...selectedMemberIds, currentSelection]);
      setCurrentSelection("");
    }
  };

  const handleRemoveFromList = (memberId: string) => {
    setSelectedMemberIds(selectedMemberIds.filter((id) => id !== memberId));
  };

  const handleAddAllPlayers = async () => {
    if (selectedMemberIds.length === 0) return;

    try {
      setIsLoading(true);

      const playersData = selectedMemberIds
        .map((memberId) => {
          const member = members.find((m) => m.id === memberId);
          if (!member) return null;
          return {
            name: member.name,
            level: member.level,
            memberId: member.id,
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

  return (
    <div className="bg-white rounded-xl p-2 shadow mt-4">
      {members.length === 0 && (
        <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          ยังไม่มีสมาชิกในระบบ{" "}
          <Link
            href="/members"
            className="underline font-medium hover:text-yellow-900"
          >
            คลิกที่นี่เพื่อเพิ่มสมาชิก
          </Link>
        </div>
      )}

      <div className="flex gap-1 text-xs items-end">
        <Field className="flex-1">
          <FieldLabel htmlFor="select-member" className="text-xs">
            เลือกสมาชิก
          </FieldLabel>
          <Select value={currentSelection} onValueChange={setCurrentSelection}>
            <SelectTrigger className="h-8 text-xs" id="select-member">
              <SelectValue placeholder="เลือกสมาชิก" />
            </SelectTrigger>
            <SelectContent>
              {members.length === 0 ? (
                <div className="p-2 text-xs text-gray-500 text-center">
                  ไม่มีสมาชิก
                </div>
              ) : (
                members
                  .filter((m) => !selectedMemberIds.includes(m.id))
                  .filter((m) => !players.some((p) => p.memberId === m.id))
                  .map((member) => (
                    <SelectItem
                      key={member.id}
                      value={String(member.id)}
                      className="text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded"
                          style={{
                            backgroundColor: LevelConfig[member.level].color,
                          }}
                        />
                        {member.name}
                      </div>
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>
        </Field>
        <div>
          <Button
            onClick={handleAddToList}
            disabled={!currentSelection || isLoading}
            size="sm"
            className="h-8 text-xs"
          >
            <UserPlus className="h-3 w-3 mr-1" />
            เพิ่มในรายการ
          </Button>
        </div>
      </div>

      {/* Selected Members List */}
      {selectedMemberIds.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="text-xs font-medium text-gray-700 mb-1">
            รายการที่เลือก ({selectedMemberIds.length} คน):
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedMemberIds.map((memberId) => {
              const member = members.find((m) => m.id === memberId);
              if (!member) return null;
              return (
                <div
                  key={memberId}
                  className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1 text-xs"
                >
                  <div
                    className="w-2 h-2 rounded"
                    style={{ backgroundColor: LevelConfig[member.level].color }}
                  />
                  <span>{member.name}</span>
                  <button
                    onClick={() => handleRemoveFromList(memberId)}
                    className="ml-1 text-gray-500 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
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
        </div>
      )}
    </div>
  );
}
