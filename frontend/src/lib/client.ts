import { ShahrazadAction, ShahrazadActionCase } from "@/types/bindings/action";
import { ShahrazadGame } from "@/types/bindings/game";
import { ClientAction, ServerUpdate } from "@/types/bindings/ws";
import { GameState } from "shahrazad-wasm";

type GameClientCallbacks = {
    onGameUpdate: (game: ShahrazadGame) => void;
    onPreloadCards: (cards: string[]) => void;
    onError?: (error: Error) => void;
};

export class GameClient {
    private gameState: GameState | null = null;
    private socket: WebSocket | null = null;
    private moveCount = 0;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectTimeout: NodeJS.Timeout | null = null;
    private isConnecting = false;

    constructor(
        private gameId: string,
        private playerUUID: string,
        private callbacks: GameClientCallbacks
    ) {}

    async connect() {
        if (this.isConnecting) return;
        this.isConnecting = true;

        try {
            const wsUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/ws/game/${this.gameId}/player/${this.playerUUID}`;
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
                this.applyAction(update.action);
                console.log("[ws] received action:", update.action);
            } else if (update.game) {
                this.setState(update.game);
                console.log("[ws] received game:", update.game);
            }
        } catch (error) {
            console.error("[ws] error processing message:", error);
            this.callbacks.onError?.(error as Error);
        }
    };

    private handleError = (error: Event) => {
        console.error("[ws] connection error:", error);
        this.callbacks.onError?.(new Error("WebSocket connection error"));
        this.socket?.close();
    };

    private attemptReconnect = () => {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error("[ws] max reconnection attempts reached");
            this.callbacks.onError?.(
                new Error("Failed to reconnect to game server")
            );
            return;
        }

        const backoffMs = Math.min(
            1000 * Math.pow(2, this.reconnectAttempts),
            10000
        );
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectAttempts++;
            this.connect();
        }, backoffMs);
    };

    initializeGameState(initialState: ShahrazadGame) {
        this.gameState = new GameState(initialState);
        this.callbacks.onGameUpdate(initialState);
    }

    applyAction(action: ShahrazadAction) {
        if (!this.gameState) {
            throw new Error("Game state not initialized");
        }

        const newState = this.gameState.apply_action(action);
        if (action.type === ShahrazadActionCase.ZoneImport) {
            this.callbacks.onPreloadCards(action.cards);
        }

        if (newState) {
            this.callbacks.onGameUpdate(newState);
        }
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

    broadcastAction(action: ShahrazadAction) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.attemptReconnect();
            throw new Error("WebSocket not connected");
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
        if (this.gameState) {
            this.gameState.free();
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        if (this.socket) {
            this.socket.close(1000);
        }
    }
}
