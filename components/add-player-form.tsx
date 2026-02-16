"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Level } from "@/constants/level";
import { Pencil } from "lucide-react";
import { useState } from "react";

interface AddPlayerFormProps {
  onAddPlayer: (name: string, level: Level) => void;
  onClearAllPlayers: () => void;
  onResetGamesPlayed: () => void;
  isEditMode?: boolean;
  onEditModeChange?: (isEditing: boolean) => void;
}

export function AddPlayerForm({
  onAddPlayer,
  onClearAllPlayers,
  onResetGamesPlayed,
  isEditMode = false,
  onEditModeChange,
}: AddPlayerFormProps) {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Level>(Level.Beginner);

  const handleAddPlayer = () => {
    if (name.trim()) {
      onAddPlayer(name.trim(), level);
      setName("");
      setLevel(Level.Beginner);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddPlayer();
    }
  };

  return (
    <div className="bg-white rounded-xl p-2 shadow mt-4">
      <div className="flex gap-1 text-xs">
        <Field>
          <FieldLabel htmlFor="input-field-name" className="text-xs">
            เพิ่มผู้เล่น
          </FieldLabel>
          <Input
            id="input-field-name"
            type="text"
            placeholder="ชื่อผู้เล่น"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-8 text-xs"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="select-level" className="text-xs">
            ระดับ
          </FieldLabel>
          <Select
            value={level}
            onValueChange={(value) => setLevel(value as Level)}
          >
            <SelectTrigger className="w-32 h-8 text-xs" id="select-level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="text-xs">ระดับผู้เล่น</SelectLabel>
                {Object.values(Level).map((lv) => (
                  <SelectItem key={lv} value={lv} className="text-xs">
                    {lv}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <div className="mt-5">
          <Button onClick={handleAddPlayer} size="sm" className="h-8 text-xs">
            Add
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
