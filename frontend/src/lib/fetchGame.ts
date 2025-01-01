import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
import { GameState } from "shahrazad-wasm";

export function fetchGame(): ShahrazadGame {
    const gameState = new GameState();
    const action: ShahrazadAction = {
        type: ShahrazadActionCase.AddPlayer,
        uuid: "1",
    };
    return gameState.apply_action(action);
}
