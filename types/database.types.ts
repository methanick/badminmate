export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string;
          level: string;
          gender: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          level: string;
          gender: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          level?: string;
          gender?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sessions: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          session_id: string;
          member_id: string | null;
          name: string;
          level: string;
          games_played: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          member_id?: string | null;
          name: string;
          level: string;
          games_played?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          member_id?: string | null;
          name?: string;
          level?: string;
          games_played?: number;
          created_at?: string;
        };
      };
      courts: {
        Row: {
          id: string;
          session_id: string;
          name: string;
          is_playing: boolean;
          team1_slot1_id: string | null;
          team1_slot2_id: string | null;
          team2_slot1_id: string | null;
          team2_slot2_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          name: string;
          is_playing?: boolean;
          team1_slot1_id?: string | null;
          team1_slot2_id?: string | null;
          team2_slot1_id?: string | null;
          team2_slot2_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          name?: string;
          is_playing?: boolean;
          team1_slot1_id?: string | null;
          team1_slot2_id?: string | null;
          team2_slot1_id?: string | null;
          team2_slot2_id?: string | null;
          created_at?: string;
        };
      };
      resting_players: {
        Row: {
          id: string;
          session_id: string;
          player_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          player_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          player_id?: string;
          created_at?: string;
        };
      };
      game_history: {
        Row: {
          id: string;
          session_id: string;
          court_name: string;
          team1_player1_id: string | null;
          team1_player2_id: string | null;
          team2_player1_id: string | null;
          team2_player2_id: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          court_name: string;
          team1_player1_id?: string | null;
          team1_player2_id?: string | null;
          team2_player1_id?: string | null;
          team2_player2_id?: string | null;
          timestamp?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          court_name?: string;
          team1_player1_id?: string | null;
          team1_player2_id?: string | null;
          team2_player1_id?: string | null;
          team2_player2_id?: string | null;
          timestamp?: string;
        };
      };
      queued_matches: {
        Row: {
          id: string;
          session_id: string;
          team1_slot1_id: string | null;
          team1_slot2_id: string | null;
          team2_slot1_id: string | null;
          team2_slot2_id: string | null;
          court_id: string | null;
          is_playing: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          team1_slot1_id?: string | null;
          team1_slot2_id?: string | null;
          team2_slot1_id?: string | null;
          team2_slot2_id?: string | null;
          court_id?: string | null;
          is_playing?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          team1_slot1_id?: string | null;
          team1_slot2_id?: string | null;
          team2_slot1_id?: string | null;
          team2_slot2_id?: string | null;
          court_id?: string | null;
          is_playing?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
