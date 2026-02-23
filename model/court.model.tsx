import { Player } from "./player.model";

export type Court = {
  id: string;
  name: string;
  team1: [Player | null, Player | null];
  team2: [Player | null, Player | null];
  isPlaying: boolean;
};
