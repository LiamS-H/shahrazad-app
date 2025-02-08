import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
import { ClientAction, ServerUpdate } from "@/types/bindings/ws";
import { GameState } from "shahrazad-wasm";

type GameClientCallbacks = {
    onGameUpdate: (game: ShahrazadGame) => void;
    onPreloadCards: (cards: string[]) => void;
    onMessage: (error: string) => void;
    onGameTermination: () => void;
    onPlayerJoin: (player: string) => void;
};

export class GameClient {
    private gameState: GameState | null = null;
    private hash: string | null = null;
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
        private playerName: string,
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
        this.attemptReconnect();
    };

    private handleMessage = (event: MessageEvent) => {
        if (!this.gameState) {
            console.error(
                "[ws] received message before game state initialized"
            );
            return;
        }

        try {
            const update: ServerUpdate = JSON.parse(event.data);

            if (update.action) {
                console.log("[ws] received action:", update.action);
                if (update.action.type === ShahrazadActionCase.GameTerminated) {
                    this.callbacks.onGameTermination();
                    this.cleanup();
                    return;
                }

                this.applyAction(update.action);
                if (update.hash && update.hash !== this.hash) {
                    console.log(
                        "[ws] client server mismatch, requesting resync"
                    );
                    this.broadcastAction({});
                }

                if (update.action.type === ShahrazadActionCase.AddPlayer) {
                    this.callbacks.onPlayerJoin(
                        update.action.player.display_name
                    );
                }
            } else if (update.game) {
                console.log("[ws] received game:", update.game);
                if (update.hash && update.hash === this.hash) {
                    console.log(
                        "[ws] received game matches current, no update needed"
                    );
                    return;
                }
                this.setState(update.game);
            }
        } catch (error) {
            console.error("[ws] message error:", error);
            this.callbacks.onMessage("Error processing action.");
        }
    };

    private handleError = (error: Event) => {
        console.log("[ws] error:", error, this.socket);
        if (this.reconnectAttempts === 1) {
            this.callbacks.onMessage("Game Disconnected.");
        }
        if (this.reconnectAttempts > 1) {
            this.callbacks.onMessage("Reconnect failed.");
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
                this.callbacks.onMessage("Reconnecting...");
            }
            if (this.reconnectTimeout) {
                clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }
            this.connect();
        }, backoffMs);
    };

    initializeGameState(initialState: ShahrazadGame, hash: string) {
        this.gameState = new GameState(initialState);
        this.hash = hash;
        this.callbacks.onGameUpdate(initialState);
    }

    private applyAction(action: ShahrazadAction): boolean {
        if (!this.gameState) {
            throw new Error("Game state not initialized");
        }
        if (action.type === ShahrazadActionCase.ZoneImport) {
            this.callbacks.onPreloadCards(action.cards);
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
            this.callbacks.onMessage(message);
        }

        if (action.type == ShahrazadActionCase.SetPlayer) {
            this.callbacks.onMessage(
                `${action.player_id} has new name: ${action.player.display_name}`
            );
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
        const success = this.applyAction(action);
        if (!success) return;
        const hash = this.hash || this.gameState.get_hash();
        const req: ClientAction = {
            action,
            hash,
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
        this.socket.send(JSON.stringify(action));
    }

    cleanup() {
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
