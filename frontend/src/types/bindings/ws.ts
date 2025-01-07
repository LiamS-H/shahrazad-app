import { ShahrazadAction } from './action';
import { ShahrazadGame } from './game';
type Uuid = string;
export type ClientAction = { action: ShahrazadAction; sequence_number: number };
export type ServerUpdate = { action?: ShahrazadAction; game?: ShahrazadGame;
    sequence_number: number; player_id: Uuid };
