import { ShahrazadGame } from './game';
export type JoinGameQuery = { player_id?: string };
export type CreateGameResponse = { game_id: string; player_id: string };
export type JoinGameResponse = { game: ShahrazadGame; game_id: string;
    player_id: string; reconnected: boolean };
