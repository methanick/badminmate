import { Level } from "@/constants/level";
import { Court } from "@/model/court.model";
import { GameHistory } from "@/model/game-history.model";
import { Player } from "@/model/player.model";

interface AutoMatchParams {
  players: Player[];
  courts: Court[];
  gameHistory: GameHistory[];
  restingPlayers: Player[];
  strictMode?: boolean; // ไม่ให้เจอคู่เดิมเลย
}

const levelWeight: Record<Level, number> = {
  [Level.Beginner]: 1,
  [Level.Amateur]: 2,
  [Level.Intermediate]: 3,
  [Level.Advanced]: 4,
  [Level.Pro]: 5,
};

export function autoMatchPlayers({
  players,
  courts,
  gameHistory,
  restingPlayers,
  strictMode = false,
}: AutoMatchParams): {
  team1: [Player, Player];
  team2: [Player, Player];
} | null {
  // หา players ที่ว่าง (ไม่อยู่ใน court ไหน และไม่ได้พัก)
  const playersInCourts = new Set<number>();
  courts.forEach((court) => {
    court.team1.forEach((p) => p && playersInCourts.add(p.id));
    court.team2.forEach((p) => p && playersInCourts.add(p.id));
  });

  const restingPlayerIds = new Set(restingPlayers.map((p) => p.id));

  const availablePlayers = players
    .filter((p) => !playersInCourts.has(p.id) && !restingPlayerIds.has(p.id))
    .sort((a, b) => a.gamesPlayed - b.gamesPlayed);

  if (availablePlayers.length < 4) {
    return null;
  }

  // หาค่า gamesPlayed ที่น้อยที่สุด
  const minGames = availablePlayers[0].gamesPlayed;

  // สร้าง pool ของผู้เล่นที่มี gamesPlayed ใกล้เคียงกับค่าน้อยสุด (ไม่เกิน +1)
  let candidatePool = availablePlayers.filter(
    (p) => p.gamesPlayed === minGames,
  );

  // ถ้าไม่ครบ 4 คน ให้เพิ่มจากคนที่เล่น +1 เกมส์
  if (candidatePool.length < 4) {
    const additionalPlayers = availablePlayers
      .filter((p) => p.gamesPlayed === minGames + 1)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4 - candidatePool.length); // เพิ่มเฉพาะจำนวนที่ขาด
    candidatePool.push(...additionalPlayers);
  }

  if (candidatePool.length < 4) {
    return null;
  }

  candidatePool = candidatePool.filter((p) => p.gamesPlayed <= minGames + 1);
  console.log("Candidate Pool:", candidatePool);

  // สุ่มเลือก 4 คนจาก candidate pool
  const selectedPlayers = candidatePool
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  // สร้างฟังก์ชันนับว่าคู่นี้เล่นด้วยกันกี่ครั้งแล้ว
  const getTeammateCount = (p1: Player, p2: Player): number => {
    return gameHistory.filter(
      (game) =>
        (game.team1[0].id === p1.id && game.team1[1].id === p2.id) ||
        (game.team1[0].id === p2.id && game.team1[1].id === p1.id) ||
        (game.team2[0].id === p1.id && game.team2[1].id === p2.id) ||
        (game.team2[0].id === p2.id && game.team2[1].id === p1.id),
    ).length;
  };

  // นับว่าคนสองคนเจอกันฝั่งตรงข้ามกี่ครั้ง
  const getOpponentCount = (p1: Player, p2: Player): number => {
    return gameHistory.filter(
      (game) =>
        (game.team1.some((p) => p.id === p1.id) &&
          game.team2.some((p) => p.id === p2.id)) ||
        (game.team1.some((p) => p.id === p2.id) &&
          game.team2.some((p) => p.id === p1.id)),
    ).length;
  };

  // หาวิธีแบ่งที่ดีที่สุด
  const allDivisions: Array<{
    team1: Player[];
    team2: Player[];
    score: number;
  }> = [];

  // ลองทุกการแบ่งที่เป็นไปได้ (combinations of 2 from 4)
  for (let i = 0; i < 4; i++) {
    for (let j = i + 1; j < 4; j++) {
      const team1 = [selectedPlayers[i], selectedPlayers[j]];
      const team2 = selectedPlayers.filter((_, idx) => idx !== i && idx !== j);

      // คำนวณ weight ของทีม
      const team1Weight = team1.reduce(
        (sum, p) => sum + levelWeight[p.level],
        0,
      );
      const team2Weight = team2.reduce(
        (sum, p) => sum + levelWeight[p.level],
        0,
      );
      const weightDiff = Math.abs(team1Weight - team2Weight);

      // นับจำนวนครั้งที่คู่นี้เล่นด้วยกัน
      const team1TeammateCount = getTeammateCount(team1[0], team1[1]);
      const team2TeammateCount = getTeammateCount(team2[0], team2[1]);

      // นับจำนวนครั้งที่เจอกันฝั่งตรงข้าม (ทั้ง 4 คู่)
      const opponentCount =
        getOpponentCount(team1[0], team2[0]) +
        getOpponentCount(team1[0], team2[1]) +
        getOpponentCount(team1[1], team2[0]) +
        getOpponentCount(team1[1], team2[1]);

      // ในโหมด strict: ข้ามการแบ่งนี้ถ้ามีการเจอกันมาก่อน
      if (strictMode && opponentCount > 0) {
        continue;
      }

      // คำนวณคะแนน: ยิ่งเล่นด้วยกันน้อย + เจอกันน้อย + สมดุล = ดีกว่า
      const score =
        -team1TeammateCount * 30 - // ลดคะแนนถ้าทีม1 เล่นด้วยกันบ่อย
        team2TeammateCount * 30 - // ลดคะแนนถ้าทีม2 เล่นด้วยกันบ่อย
        opponentCount * 10 - // ลดคะแนนถ้าเจอกันฝั่งตรงข้ามบ่อย
        weightDiff * 80; // ลดคะแนนถ้าไม่สมดุล

      allDivisions.push({ team1, team2, score });
    }
  }

  // เรียงลำดับตามคะแนนจากสูงไปต่ำ
  allDivisions.sort((a, b) => b.score - a.score);

  if (allDivisions.length === 0) {
    return null;
  }

  // หาคะแนนสูงสุด และเลือก divisions ที่มีคะแนนใกล้เคียง (ภายใน 5% ของช่วง)
  const maxScore = allDivisions[0].score;
  const minScore = allDivisions[allDivisions.length - 1].score;
  const scoreRange = maxScore - minScore || 1;
  const threshold = maxScore - scoreRange * 0.1; // เลือก top 10% ของคะแนน

  const goodDivisions = allDivisions.filter((d) => d.score >= threshold);

  // สุ่มเลือกจาก divisions ที่ดีพอ
  const selectedDivision =
    goodDivisions[Math.floor(Math.random() * goodDivisions.length)];

  if (
    selectedDivision.team1.length !== 2 ||
    selectedDivision.team2.length !== 2
  ) {
    return null;
  }

  return {
    team1: [selectedDivision.team1[0], selectedDivision.team1[1]],
    team2: [selectedDivision.team2[0], selectedDivision.team2[1]],
  };
}
