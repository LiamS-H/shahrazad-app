// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { ShahrazadCard } from "./ShahrazadCard";
import type { ShahrazadCardId } from "./ShahrazadCardId";
import type { ShahrazadPlaymat } from "./ShahrazadPlaymat";
import type { ShahrazadZone } from "./ShahrazadZone";
import type { ShahrazadZoneId } from "./ShahrazadZoneId";

export type ShahrazadGame = { zone_count: number, card_count: number, cards: { [key in ShahrazadCardId]?: ShahrazadCard }, zones: { [key in ShahrazadZoneId]?: ShahrazadZone }, playmats: Array<ShahrazadPlaymat>, };
