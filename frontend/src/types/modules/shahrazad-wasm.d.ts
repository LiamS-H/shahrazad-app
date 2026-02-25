import { ShahrazadAction } from "@/types/bindings//action";
import { ShahrazadGame, ShahrazadGameSettings } from "@/types/bindings//game";
import { ClientAction, ServerUpdate } from "../bindings/ws";

declare module "shahrazad-wasm" {
    export class GameState {
        free(): void;
        constructor(game?: string);
        static new_local(
            settings?: ShahrazadGameSettings,
            time: bigInt,
            code?: string,
        ): GameState;
        apply_action(action: ShahrazadAction): ShahrazadGame | null;
        set_state(action: ShahrazadGame): ShahrazadGame | null;
        get_hash(): bigInt;
        get_state(): ShahrazadGame;
        get_bytes_str(): string;
    }
    export default function init(
        module?: WebAssembly.Module | Buffer,
    ): Promise<undefined>;
    export function encode_client_action(action: ClientAction): Uint8Array;
    export function decode_server_update(code: ArrayBuffer): ServerUpdate;
}
