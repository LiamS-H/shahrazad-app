import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadGame, ShahrazadGameSettings } from "@/types/bindings/game";
import { GameState } from "shahrazad-wasm";
import { GameClientCallbacks, GameClientOnMessage } from ".";

export class LocalGameClient {
    private gameState: GameState | null = null;

    constructor(private callbacks: GameClientCallbacks) {}

    beginGame(settings?: ShahrazadGameSettings): ShahrazadGame {
        // this.gameState = new GameState(null);
        this.gameState = GameState.new_local(
            settings,
            Math.floor(Date.now() / 1000)
        );
        const game = this.gameState.get_state();
        console.log("[local]", game);
        this.callbacks.onGameUpdate(game);
        return game;
    }

    private applyAction(action: ShahrazadAction): boolean {
        if (!this.gameState) {
            throw new Error("Game state not initialized");
        }
        if (action.type === ShahrazadActionCase.ZoneImport) {
            this.callbacks.onPreloadCards(action.cards.map(({ str }) => str));
        }

        const newState: ShahrazadGame = this.gameState.apply_action(action);
        if (!newState) {
            return false;
        }
        if (action.type === ShahrazadActionCase.Mulligan) {
            const playmat = newState.playmats[action.player_id];
            const mulligans = playmat.mulligans;
            const name = playmat.player.display_name;
            let message;
            if (mulligans == 0) {
                message = `${name} drew their 7.`;
            } else {
                message = `${name} mulliganed ${
                    mulligans < 0 ? "for free" : `to ${7 - mulligans}`
                }.`;
            }
            this.callbacks.onToast(message);
        }

        if (action.type == ShahrazadActionCase.SetPlayer) {
            if (action.player) {
                this.callbacks.onToast(
                    `${action.player_id} has new name: ${action.player.display_name}`
                );
            } else {
                this.callbacks.onToast(`${action.player_id} has left.`);
            }
        }
        if (action.type === ShahrazadActionCase.SendMessage) {
            this.callbacks.onMessage(action);
        }

        this.callbacks.onGameUpdate(newState);
        return true;
    }

    queueAction(action: ShahrazadAction) {
        if (!this.gameState) {
            console.error("[local] attempting queue action without gameState");
            return;
        }
        if (action.type == ShahrazadActionCase.GameTerminated) {
            this.callbacks.onGameTermination();
            return;
        }

        const success = this.applyAction(action);
        if (!success) {
            console.log(
                "[local] attempted to apply move that didn't update state.",
                action.type
            );
            return;
        }
    }

    public cleanup() {
        if (this.gameState) {
            this.gameState.free();
            this.gameState = null;
        }
    }
}
