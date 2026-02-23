import { Player } from "./player.model";

export interface GameHistory {
  id: string;
  timestamp: number;
  courtName: string;
  team1: [Player, Player];
  team2: [Player, Player];
}
