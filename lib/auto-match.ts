import { Level } from "@/constants/level";
import { Court } from "@/model/court.model";
import { GameHistory } from "@/model/game-history.model";
import { Player } from "@/model/player.model";

interface AutoMatchParams {
  courtId: number;
  players: Player[];
  courts: Court[];
  gameHistory: GameHistory[];
  restingPlayers: Player[];
}

const levelWeight: Record<Level, number> = {
  [Level.Beginner]: 1,
  [Level.Amateur]: 2,
  [Level.Intermediate]: 3,
  [Level.Advanced]: 4,
  [Level.Pro]: 5,
};

export function autoMatchPlayers({
  courtId,
  players,
  courts,
  gameHistory,
  restingPlayers,
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

  // สร้าง pool ของผู้เล่นที่มี gamesPlayed ใกล้เคียงกับค่าน้อยสุด (ไม่เกิน +2)
  const candidatePool = availablePlayers.filter(
    (p) => p.gamesPlayed <= minGames + 2,
  );

  // Random เลือก 4 คนจาก pool
  const shuffled = [...candidatePool].sort(() => Math.random() - 0.5);
  const selectedPlayers = shuffled.slice(0, 4);

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
  let bestTeam1: Player[] = [];
  let bestTeam2: Player[] = [];
  let bestScore = -Infinity;

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

      // คำนวณคะแนน: ยิ่งเล่นด้วยกันน้อย + เจอกันน้อย + สมดุล = ดีกว่า
      const score =
        -team1TeammateCount * 30 - // ลดคะแนนถ้าทีม1 เล่นด้วยกันบ่อย
        team2TeammateCount * 30 - // ลดคะแนนถ้าทีม2 เล่นด้วยกันบ่อย
        opponentCount * 10 - // ลดคะแนนถ้าเจอกันฝั่งตรงข้ามบ่อย
        weightDiff * 80; // ลดคะแนนถ้าไม่สมดุล

      if (score > bestScore) {
        bestScore = score;
        bestTeam1 = team1;
        bestTeam2 = team2;
      }
    }
  }

  if (bestTeam1.length !== 2 || bestTeam2.length !== 2) {
    return null;
  }

  return {
    team1: [bestTeam1[0], bestTeam1[1]],
    team2: [bestTeam2[0], bestTeam2[1]],
  };
}
