import { Level } from "@/constants/level";

export type Player = {
  id: number;
  name: string;
  level: Level;
  gamesPlayed: number;
  memberId?: number; // reference to Member (optional for backward compatibility)
};

// Deprecated: ใช้ LevelConfig จาก constants/level.ts แทน
export const SkillLevelColor: Record<Level, string> = {
  BEGINNER: "#854d0e",
  AMATEUR: "#4CAF50",
  INTERMEDIATE: "#2196F3",
  ADVANCED: "#9C27B0",
  PRO: "#F44336",
};
