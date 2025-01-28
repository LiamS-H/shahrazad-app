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
    private socket: WebSocket | null = null;
    private moveCount = 0;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isConnecting = false;
    private isCleanedUp = false;
    private queuedActions: ShahrazadAction[] = [];

    constructor(
        private gameId: string,
        private playerUUID: string,
        private playerName: string,
        private callbacks: GameClientCallbacks
    ) {}

    async connect() {
        if (this.isConnecting) return;
        this.isConnecting = true;
        console.log("connecting");

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
        for (const action of this.queuedActions) {
            this.queueAction(action);
        }
        this.queuedActions = [];
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
            this.moveCount = update.sequence_number;

            if (update.action) {
                if (update.action.type === ShahrazadActionCase.GameTerminated) {
                    this.callbacks.onGameTermination();
                    this.cleanup();
                    return;
                }

                const mutated = this.applyAction(update.action);
                if (update.action.type === ShahrazadActionCase.AddPlayer) {
                    this.callbacks.onPlayerJoin(
                        update.action.player.display_name
                    );
                }
                if (
                    mutated &&
                    update.action.type === ShahrazadActionCase.SetPlayer
                ) {
                    this.callbacks.onMessage(
                        `${update.action.player_id} has new name: ${update.action.player.display_name}`
                    );
                }
                console.log("[ws] received action:", update.action);
            } else if (update.game) {
                this.setState(update.game);
                console.log("[ws] received game:", update.game);
            }
        } catch (error) {
            console.error("[ws] message error:", error);
            this.callbacks.onMessage("Error processing action.");
        }
    };

    private handleError = (error: Event) => {
        console.log("[ws] error:", error, this.socket);
        console.log(this.reconnectAttempts);
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

    initializeGameState(initialState: ShahrazadGame) {
        this.gameState = new GameState(initialState);
        this.callbacks.onGameUpdate(initialState);
    }

    private applyAction(action: ShahrazadAction): boolean {
        if (!this.gameState) {
            throw new Error("Game state not initialized");
        }
        if (action.type === ShahrazadActionCase.ZoneImport) {
            this.callbacks.onPreloadCards(action.cards);
        }

        const newState = this.gameState.apply_action(action);

        if (newState) {
            this.callbacks.onGameUpdate(newState);
            return true;
        }
        return false;
    }

    setState(game: ShahrazadGame) {
        if (!this.gameState) {
            throw new Error("Game state not initialized");
        }

        const newState = this.gameState.set_state(game);
        if (newState) {
            this.callbacks.onGameUpdate(newState);
        }
    }

    queueAction(action: ShahrazadAction) {
        const success = this.applyAction(action);
        if (!success) return;
        this.broadcastAction(action);
    }

    private broadcastAction(action: ShahrazadAction) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.attemptReconnect();
            this.queuedActions.push(action);
            return;
        }

        this.moveCount++;
        const req: ClientAction = {
            action,
            sequence_number: this.moveCount,
        };

        console.log("[ws] broadcasting action", req);
        this.socket.send(JSON.stringify(req));
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
