import { ShahrazadZoneId } from "./zone";

interface ShahrazadPlaymat {
    library: ShahrazadZoneId;
    hand: ShahrazadZoneId;
    graveyard: ShahrazadZoneId;
    battlefield: ShahrazadZoneId;
    exile: ShahrazadZoneId;
    command: ShahrazadZoneId;
}

export type { ShahrazadPlaymat };
