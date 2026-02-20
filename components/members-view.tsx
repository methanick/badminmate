"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Level, LevelConfig } from "@/constants/level";
import { Gender, GenderLabel, Member } from "@/model/member.model";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface MembersViewProps {
  members: Member[];
  onAddMember: (name: string, level: Level, gender: Gender) => void;
  onEditMember: (
    id: number,
    name: string,
    level: Level,
    gender: Gender,
  ) => void;
  onDeleteMember: (id: number) => void;
}

export function MembersView({
  members,
  onAddMember,
  onEditMember,
  onDeleteMember,
}: MembersViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  const [name, setName] = useState("");
  const [level, setLevel] = useState<Level>(Level.Beginner);
  const [gender, setGender] = useState<Gender>(Gender.Male);

  const handleAdd = () => {
    if (!name.trim()) return;
    onAddMember(name, level, gender);
    setName("");
    setLevel(Level.Beginner);
    setGender(Gender.Male);
    setShowAddModal(false);
  };

  const handleEdit = () => {
    if (!editingMember || !name.trim()) return;
    onEditMember(editingMember.id, name, level, gender);
    setEditingMember(null);
    setShowEditModal(false);
  };

  const openEdit = (member: Member) => {
    setEditingMember(member);
    setName(member.name);
    setLevel(member.level);
    setGender(member.gender);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              สมาชิกทั้งหมด ({members.length} คน)
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-1" />
              เพิ่มสมาชิก
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Members Table */}
      <Card>
        <CardContent className="pt-6">
          {members.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              ยังไม่มีสมาชิก
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-700 w-16">
                      ลำดับ
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-700">
                      ชื่อ
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-700">
                      ระดับ
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-sm text-gray-700">
                      เพศ
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-sm text-gray-700 w-24">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <tr
                      key={member.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-500">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium">
                          {member.name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{
                              backgroundColor: LevelConfig[member.level].color,
                            }}
                          />
                          <span className="text-sm">
                            {LevelConfig[member.level].label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {GenderLabel[member.gender]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(member)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeleteMember(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Member Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>เพิ่มสมาชิกใหม่</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อสมาชิก"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">ระดับ</Label>
              <Select
                value={level}
                onValueChange={(value) => setLevel(value as Level)}
              >
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Level).map((lv) => (
                    <SelectItem key={lv} value={lv}>
                      {LevelConfig[lv].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">เพศ</Label>
              <Select
                value={gender}
                onValueChange={(value) => setGender(value as Gender)}
              >
                <SelectTrigger id="gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Gender).map((g) => (
                    <SelectItem key={g} value={g}>
                      {GenderLabel[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleAdd}>เพิ่ม</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Member Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>แก้ไขสมาชิก</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">ชื่อ</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ชื่อสมาชิก"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-level">ระดับ</Label>
              <Select
                value={level}
                onValueChange={(value) => setLevel(value as Level)}
              >
                <SelectTrigger id="edit-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Level).map((lv) => (
                    <SelectItem key={lv} value={lv}>
                      {LevelConfig[lv].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-gender">เพศ</Label>
              <Select
                value={gender}
                onValueChange={(value) => setGender(value as Gender)}
              >
                <SelectTrigger id="edit-gender">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Gender).map((g) => (
                    <SelectItem key={g} value={g}>
                      {GenderLabel[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                ยกเลิก
              </Button>
              <Button onClick={handleEdit}>บันทึก</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
