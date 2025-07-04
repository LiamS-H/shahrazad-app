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
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";

export class MouseSensor extends LibMouseSensor {
    public static ShahContext: IShahrazadGameContext;
    public static SelectedContext: ISelectionContext;
    static mouseDownHandler({ nativeEvent: event }: MouseEvent) {
        if (event.button == 2) {
            return false;
        }

        let cur: EventTarget | null = event.target;

        // skip for buttons
        while (cur && cur instanceof Element) {
            if (cur.tagName == "BUTTON") return false;
            if (cur instanceof HTMLElement && cur.dataset.nodrag) return false;
            cur = cur.parentElement;
        }
        cur = event.target;

        let shah_card: ShahrazadCard | null = null;
        let id: ShahrazadCardId | null = null;

        while (cur && cur instanceof Element) {
            if (cur instanceof HTMLElement && cur.dataset.shahcard) {
                id = cur.dataset.shahcard;
                shah_card = MouseSensor.ShahContext.getCard(id);
            }
            cur = cur.parentElement;
        }
        if (!shah_card || !id) return false;

        // tapping
        if (event.detail >= 2 && event.detail % 2 == 0) {
            if (shah_card.state.x === undefined) return false;
            let selectedCards = MouseSensor.SelectedContext.selectedCards;
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

        // preview
        if (
            !shah_card.state.face_down ||
            shah_card.state.revealed?.includes(
                MouseSensor.ShahContext.active_player
            )
        ) {
            MouseSensor.SelectedContext.setPreview(id);
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
