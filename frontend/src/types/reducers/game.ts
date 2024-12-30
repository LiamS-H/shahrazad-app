import { ShahrazadGame } from "@/types/bindings/game";
import { ShahrazadAction } from "@/types/bindings/action";
import { GameState } from "shahrazad-wasm";

export type GameMoveApplier = (action: ShahrazadAction) => void;

export function GameMoveApplie() {}

export function applyMove(
    game: ShahrazadGame,
    action: ShahrazadAction
): ShahrazadGame | null {
    return null;
}
