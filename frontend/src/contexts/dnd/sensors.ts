import {
    MouseSensor as LibMouseSensor,
    // TouchSensor as LibTouchSensor,
    // PointerSensor as LibPointerSensor,
} from "@dnd-kit/core";

import type { IShahrazadGameContext } from "../game";
import type { MouseEvent } from "react";
// import type { TouchEvent } from "react";
import { ShahrazadActionCase } from "@/types/bindings/action";
import { ISelectionContext } from "../selection";

export class MouseSensor extends LibMouseSensor {
    public static ShahContext: IShahrazadGameContext;
    public static SelectedContext: ISelectionContext;
    static mouseDownHandler({ nativeEvent: event }: MouseEvent) {
        if (event.button == 2) {
            return false;
        }

        // skip for buttons
        let cur: EventTarget | null = event.target;
        while (cur && cur instanceof Element) {
            if (cur.tagName == "BUTTON") return false;
            if (cur instanceof HTMLElement && cur.dataset.nodrag) return false;
            cur = cur.parentElement;
        }

        // tapping
        if (event.detail >= 2 && event.detail % 2 == 0) {
            cur = event.target;
            while (cur && cur instanceof Element) {
                if (cur instanceof HTMLElement && cur.dataset.shahcard) {
                    const id = cur.dataset.shahcard;
                    const shah_card = MouseSensor.ShahContext.getCard(id);
                    if (shah_card.state.x === undefined) break;
                    let selectedCards =
                        MouseSensor.SelectedContext.selectedCards;
                    if (!selectedCards.includes(id)) {
                        MouseSensor.SelectedContext.selectCards(null);
                        selectedCards = [id];
                    }

                    MouseSensor.ShahContext.applyAction({
                        type: ShahrazadActionCase.CardState,
                        cards: selectedCards,
                        state: { tapped: !shah_card.state.tapped },
                    });
                    return false;
                }
                cur = cur.parentElement;
            }
        }

        cur = event.target;
        while (cur && cur instanceof Element) {
            if (cur instanceof HTMLElement && cur.dataset.shahcard) {
                const id = cur.dataset.shahcard;
                const shah_card = MouseSensor.ShahContext.getCard(id);
                if (
                    shah_card.state.face_down &&
                    !shah_card.state.revealed?.includes(
                        MouseSensor.ShahContext.player_name
                    )
                ) {
                    return true;
                }
                MouseSensor.SelectedContext.setPreview(id);
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
            handler: MouseSensor.mouseDownHandler,
        },
    ] as (typeof LibMouseSensor)["activators"];
}
