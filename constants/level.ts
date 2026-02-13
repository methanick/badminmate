export enum Level {
  Beginner = "BEGINNER",
  Amateur = "AMATEUR",
  Intermediate = "INTERMEDIATE",
  Advanced = "ADVANCED",
  Pro = "PRO",
}

// Object config สำหรับแต่ละ Level
export const LevelConfig = {
  [Level.Beginner]: {
    label: "Beginner",
    color: "#854d0e",
    bgColor: "#fef3c7",
    textColor: "#ffffff",
    weight: 1,
  },
  [Level.Amateur]: {
    label: "Amateur",
    color: "#4CAF50",
    bgColor: "#dcfce7",
    textColor: "#ffffff",
    weight: 2,
  },
  [Level.Intermediate]: {
    label: "Intermediate",
    color: "#2196F3",
    bgColor: "#dbeafe",
    textColor: "#ffffff",
    weight: 3,
  },
  [Level.Advanced]: {
    label: "Advanced",
    color: "#9C27B0",
    bgColor: "#f3e8ff",
    textColor: "#ffffff",
    weight: 4,
  },
  [Level.Pro]: {
    label: "Professional",
    color: "#F44336",
    bgColor: "#fee2e2",
    textColor: "#ffffff",
    weight: 5,
  },
} as const;
