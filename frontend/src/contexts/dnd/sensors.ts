import {
    MouseSensor as LibMouseSensor,
    TouchSensor as LibTouchSensor,
    PointerSensor as LibPointerSensor,
} from "@dnd-kit/core";

import type { IShahrazadGameContext } from "../game";
import { MouseEvent, TouchEvent } from "react";
import { ShahrazadActionCase } from "@/types/bindings/action";

export class MouseSensor extends LibMouseSensor {
    public static ShahContext: IShahrazadGameContext;
    static handler({ nativeEvent: event }: MouseEvent) {
        if (event.detail >= 2 && event.detail % 2 == 0) {
            let cur: EventTarget | null = event.target;
            while (cur && cur instanceof Element) {
                if (cur instanceof HTMLElement && cur.dataset.shahcard) {
                    const id = cur.dataset.shahcard;
                    const shah_card = MouseSensor.ShahContext.getCard(id);
                    MouseSensor.ShahContext.applyAction({
                        type: ShahrazadActionCase.CardState,
                        cards: [id],
                        state: { tapped: !shah_card.state.tapped },
                    });
                    return false;
                }
                cur = cur.parentElement;
            }
        }

        let cur: EventTarget | null = event.target;
        while (cur && cur instanceof Element) {
            if (cur.tagName == "BUTTON") {
                return false;
            }
            cur = cur.parentElement;
        }

        return true;
    }
    public static getHandler() {
        return;
    }
    static activators = [
        {
            eventName: "onMouseDown",
            handler: MouseSensor.handler,
        },
    ] as (typeof LibMouseSensor)["activators"];
}
