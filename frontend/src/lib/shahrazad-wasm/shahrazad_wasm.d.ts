/* tslint:disable */
/* eslint-disable */
export function encode_client_action(action: any): Uint8Array;
export function decode_server_update(code: any): any;
export class GameState {
  free(): void;
  constructor(game: any);
  get_hash(): any;
  get_state(): any;
  apply_action(action: any): any;
  set_state(game: any): any;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_gamestate_free: (a: number, b: number) => void;
  readonly gamestate_new: (a: any) => number;
  readonly gamestate_get_hash: (a: number) => [number, number, number];
  readonly gamestate_get_state: (a: number) => [number, number, number];
  readonly gamestate_apply_action: (a: number, b: any) => [number, number, number];
  readonly gamestate_set_state: (a: number, b: any) => [number, number, number];
  readonly encode_client_action: (a: any) => [number, number, number];
  readonly decode_server_update: (a: any) => [number, number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
