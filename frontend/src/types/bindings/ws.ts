import { ShahrazadAction } from './action';
import { ShahrazadGame } from './game';
type Uuid = string;
export type ClientAction = { action?: ShahrazadAction; hash?: string };
export type ServerUpdate = { action?: ShahrazadAction; game?: ShahrazadGame;
    player_id: Uuid; hash?: string };
