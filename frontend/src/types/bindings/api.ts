import { ShahrazadGame, ShahrazadGameSettings } from './game';
export type CreateGameQuery = { settings: ShahrazadGameSettings };
export type JoinGameQuery = { player_id?: string };
export type CreateGameResponse = { game_id: string; player_id: string;
    code: number };
export type JoinGameResponse = { game: ShahrazadGame; game_id: string;
    player_id: string; player_name: string; code: number;
    reconnected: boolean };
export type FetchGameResponse = { game_id: string; code: number };
