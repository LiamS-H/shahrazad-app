import { ShahrazadGame, ShahrazadGameSettings } from './game';
export type CreateGameQuery = { settings: ShahrazadGameSettings };
export type JoinGameQuery = { player_id?: string };
export type CreateGameResponse = { game_id: string; player_id: string };
export type JoinGameResponse = { game: ShahrazadGame; game_id: string;
    player_id: string; reconnected: boolean };
