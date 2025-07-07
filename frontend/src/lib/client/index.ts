import {
    ShahrazadAction,
    ShahrazadActionCase,
    ShahrazadActionCaseSendMessage,
} from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
import { ClientAction, ServerUpdate } from "@/types/bindings/ws";
import {
    decode_server_update,
    encode_client_action,
    GameState,
} from "shahrazad-wasm";

export type GameClientOnMessage = (
    messages: ShahrazadActionCaseSendMessage
) => void;

export interface GameClientCallbacks {
    onGameUpdate: (game: ShahrazadGame) => void;
    onPreloadCards: (cards: string[]) => void;
    onToast: (message: string) => void;
    onGameTermination: (message?: string) => void;
    onPlayerJoin: (player: string) => void;
    onMessage: GameClientOnMessage;
}

export class GameClient {
    private gameState: GameState | null = null;
    private hash: number | null = null; // actually BigInt
    private socket: WebSocket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isConnecting = false;
    private isCleanedUp = false;
    private queuedClientMessage: ClientAction[] = [];
    // private queuedServerMessages: ServerUpdate[] = [];

    constructor(
        private gameId: string,
        private playerUUID: string,
        private player_id: string,
        private callbacks: GameClientCallbacks
    ) {}

    async connect() {
        if (this.isConnecting) return;
        this.isConnecting = true;
        console.log("[ws] connecting...");

        try {
            const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "";
            const wsUrl = `${backend
                .replace("http://", "ws://")
                .replace("https://", "wss://")}/ws/game/${this.gameId}/player/${
                this.playerUUID
            }`;
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = this.handleOpen;
            this.socket.onclose = this.handleClose;
            this.socket.onmessage = this.handleMessage;
            this.socket.onerror = this.handleError;
        } catch (error) {
            this.handleError(error as Event);
        } finally {
            this.isConnecting = false;
        }
    }

    private handleOpen = () => {
        console.log("[ws] connected");
        this.reconnectAttempts = 0;
        for (const action of this.queuedClientMessage) {
            this.broadcastAction(action, true);
        }
        this.queuedClientMessage = [];
    };

    private handleClose = (event: CloseEvent) => {
        console.log("[ws] closed", event);
        if (event.wasClean === false) {
            this.attemptReconnect();
        }
    };

    private handleMessage = async (event: MessageEvent) => {
        if (!this.gameState) {
            console.error(
                "[ws] received message before game state initialized"
            );
            return;
        }

        const blob: Blob = event.data;
        const array = await blob.arrayBuffer();

        try {
            const update: ServerUpdate = decode_server_update(array);
            if (!update) {
                console.error("[client] couldn't parse update:", event.data);
                return;
            }
            if (update.game) {
                console.log(`[ws] ${array.byteLength}B game received:`, update);
                if (update.hash && update.hash === this.hash) {
                    console.log(
                        "[client] received a game that already matched hash"
                    );
                    return;
                }
                this.setState(update.game);
                return;
            }
            if (update.action) {
                console.log(
                    `[ws] ${array.byteLength}B move received:`,
                    update.action.type
                );
                if (update.action.type === ShahrazadActionCase.GameTerminated) {
                    this.callbacks.onGameTermination();
                    this.cleanup();
                    return;
                }

                if (update.action.type === ShahrazadActionCase.AddPlayer) {
                    this.callbacks.onPlayerJoin(
                        update.action.player.display_name
                    );
                }

                this.applyAction(update.action);
            }
            if (update.hash && update.hash !== this.hash) {
                console.error(
                    "[client] move validation failed, requesting new state."
                );
                this.broadcastAction({});
            }
        } catch (error) {
            console.error("[ws] message error:", error);
            this.callbacks.onToast("Error processing action.");
        }
    };

    private handleError = (error: Event) => {
        console.log("[ws] error:", error, this.socket);
        if (this.reconnectAttempts === 1) {
            this.callbacks.onToast("Game Disconnected.");
        }
        if (this.reconnectAttempts > 1) {
            this.callbacks.onToast("Reconnect failed.");
        }
        if (this.socket?.OPEN) {
            this.socket?.close();
        }
    };

    private attemptReconnect = () => {
        if (this.reconnectTimeout) return;
        console.log("[ws] scheduling reconnect");

        this.reconnectAttempts++;

        if (this.reconnectAttempts > this.maxReconnectAttempts) {
            this.callbacks.onGameTermination();
            this.cleanup();
            return;
        }

        const backoffMs = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts),
            10000
        );
        this.reconnectTimeout = setTimeout(() => {
            if (this.isCleanedUp) return;
            if (this.reconnectAttempts > 1) {
                this.callbacks.onToast("Reconnecting...");
            }
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }
            this.connect();
        }, backoffMs);
    };

    initializeGameState(initialState: string): ShahrazadGame {
        this.gameState = new GameState(initialState);
        return this.gameState.get_state();
    }

    private applyAction(action: ShahrazadAction): boolean {
        if (!this.gameState) {
            throw new Error("Game state not initialized");
        }
        if (action.type === ShahrazadActionCase.ZoneImport) {
            this.callbacks.onPreloadCards(action.cards.map(({ str }) => str));
        }
        if (
            action.type === ShahrazadActionCase.SetPlayer &&
            !action.player &&
            action.player_id == this.player_id
        ) {
            localStorage.setItem("saved-player-id", "");
            this.callbacks.onGameTermination("You were kicked from the lobby.");
        }

        const newState: ShahrazadGame = this.gameState.apply_action(action);
        if (!newState) {
            return false;
        }
        this.hash = this.gameState.get_hash();
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

    setState(game: ShahrazadGame) {
        if (!this.gameState) {
            throw new Error("Game state not initialized");
        }

        const newState = this.gameState.set_state(game);
        if (newState) {
            this.hash = this.gameState.get_hash();
            this.callbacks.onGameUpdate(newState);
        }
    }

    queueAction(action: ShahrazadAction) {
        if (!this.gameState) {
            console.error("[ws] attempting queue action without gameState");
            return;
        }
        if (action.type == ShahrazadActionCase.GameTerminated) {
            this.broadcastAction({
                action,
            });
            this.callbacks.onGameTermination();
            return;
        }

        const success = this.applyAction(action);
        if (!success) {
            console.log(
                "[client] attempted to apply move that didn't update state.",
                action.type
            );
            return;
        }
        this.hash ??= this.gameState.get_hash() as number;
        const req: ClientAction = {
            action,
            hash: this.hash,
        };
        this.broadcastAction(req);
    }

    private broadcastAction(action: ClientAction, fromQueue?: true) {
        if (!this.gameState) {
            console.error("[ws] attempting broadcast without gameState");
            return;
        }

        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.attemptReconnect();
            if (!fromQueue) this.queuedClientMessage.push(action);
            return;
        }

        console.log("[ws] broadcasting action", action);
        this.socket.send(encode_client_action(action));
    }

    public cleanup() {
        this.isCleanedUp = true;
        if (this.gameState) {
            this.gameState.free();
            this.gameState = null;
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.socket) {
            this.socket.close(1000);
            this.socket = null;
        }
    }
}
