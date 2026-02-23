import { Player } from "./player.model";

export interface QueuedMatch {
  id: string;
  team1: [Player | null, Player | null];
  team2: [Player | null, Player | null];
  createdAt: number;
  courtId?: string;
  isPlaying?: boolean;
}
