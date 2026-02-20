import { Player } from "./player.model";

export interface QueuedMatch {
  id: number;
  team1: [Player | null, Player | null];
  team2: [Player | null, Player | null];
  createdAt: number;
}
