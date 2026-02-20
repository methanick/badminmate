"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Level, LevelConfig } from "@/constants/level";
import { Member } from "@/model/member.model";
import { Pencil, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AddPlayerFormProps {
  members: Member[];
  onAddPlayer: (name: string, level: Level, memberId?: number) => void;
  onClearAllPlayers: () => void;
  onResetGamesPlayed: () => void;
  isEditMode?: boolean;
  onEditModeChange?: (isEditing: boolean) => void;
}

export function AddPlayerForm({
  members = [],
  onAddPlayer,
  onClearAllPlayers,
  onResetGamesPlayed,
  isEditMode = false,
  onEditModeChange,
}: AddPlayerFormProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  // Debug: log members when it changes
  useEffect(() => {
    console.log("AddPlayerForm - members:", members);
  }, [members]);

  const handleAddPlayer = () => {
    if (selectedMemberId) {
      const member = members.find((m) => m.id === Number(selectedMemberId));
      if (member) {
        onAddPlayer(member.name, member.level, member.id);
        setSelectedMemberId("");
      }
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
            เพิ่มผู้เล่น
          </FieldLabel>
          <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
            <SelectTrigger className="h-8 text-xs" id="select-member">
              <SelectValue placeholder="เลือกสมาชิก" />
            </SelectTrigger>
            <SelectContent>
              {members.length === 0 ? (
                <div className="p-2 text-xs text-gray-500 text-center">
                  ไม่มีสมาชิก
                </div>
              ) : (
                Object.values(Level).map((lv) => {
                  const levelMembers = members.filter((m) => m.level === lv);
                  if (levelMembers.length === 0) return null;

                  return (
                    <SelectGroup key={lv}>
                      <SelectLabel className="text-xs flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded"
                          style={{ backgroundColor: LevelConfig[lv].color }}
                        />
                        {LevelConfig[lv].label}
                      </SelectLabel>
                      {levelMembers.map((member) => (
                        <SelectItem
                          key={member.id}
                          value={String(member.id)}
                          className="text-xs"
                        >
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </Field>
        <div>
          <Button
            onClick={handleAddPlayer}
            disabled={!selectedMemberId}
            size="sm"
            className="h-8 text-xs"
          >
            <UserPlus className="h-3 w-3 mr-1" />
            เพิ่ม
          </Button>
        </div>
      </div>
      <div className="mt-2 flex justify-end gap-1 flex-wrap">
        <Button
          onClick={() => onEditModeChange?.(!isEditMode)}
          variant={isEditMode ? "default" : "outline"}
          className={`text-xs h-8 py-1 ${
            isEditMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "border-blue-500 text-blue-600 hover:bg-blue-50"
          }`}
          size="sm"
        >
          <Pencil className="h-3 w-3 mr-1" />
          {isEditMode ? "เสร็จแก้ไข" : "แก้ไขผู้เล่น"}
        </Button>
        <Button
          onClick={onResetGamesPlayed}
          variant="outline"
          className="border-orange-500 text-orange-600 hover:bg-orange-50 text-xs h-8 py-1"
          size="sm"
        >
          รีเซ็ตจำนวนเกม
        </Button>
        <Button
          onClick={onClearAllPlayers}
          variant="outline"
          className="border-red-500 text-red-600 hover:bg-red-50 text-xs h-8 py-1"
          size="sm"
        >
          ลบผู้เล่นทั้งหมด
        </Button>
      </div>
    </div>
  );
}
