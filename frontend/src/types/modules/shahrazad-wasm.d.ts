import { ShahrazadAction } from "@@/types/bindings//action";
import { ShahrazadGame } from "@@/types/bindings//game";

declare module "shahrazad-wasm" {
    // export class GameState {
    //     free(): void;
    //     constructor();
    //     apply_action(action: ShahrazadAction): ShahrazadGame | null;
    // }
    export default function init(
        module?: WebAssembly.Module | Buffer
    ): Promise<any>;
}
