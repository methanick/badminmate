import { Level } from "@/constants/level";

export enum Gender {
  Male = "MALE",
  Female = "FEMALE",
  Other = "OTHER",
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.Male]: "ชาย",
  [Gender.Female]: "หญิง",
  [Gender.Other]: "อื่นๆ",
};

export type Member = {
  id: string;
  name: string;
  level: Level;
  gender: Gender;
  createdAt: number; // timestamp เมื่อสร้างสมาชิก
};
