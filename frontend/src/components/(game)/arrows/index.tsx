import { useEffect } from "react";

export function Arrows() {
    useEffect(() => {
        const controller = new AbortController();
        const options = {
            signal: controller.signal,
        };
        window.addEventListener(
            "mousedown",
            (event) => {
                if (event.button !== 2) return;
                let cur: EventTarget | null = event.target;
                while (cur && cur instanceof Element) {
                    if (!(cur instanceof HTMLElement)) {
                        cur = cur.parentElement;
                        continue;
                    }
                    if (cur.dataset.shahcard) {
                        return;
                    }
                    cur = cur.parentElement;
                }
            },
            options
        );
        window.addEventListener(
            "mouseup",
            (event) => {
                if (event.button !== 2) return;
                let cur: EventTarget | null = event.target;
                while (cur && cur instanceof Element) {
                    if (!(cur instanceof HTMLElement)) {
                        cur = cur.parentElement;
                        continue;
                    }
                    if (cur.dataset.shahcard) {
                        return;
                    }
                    if (cur.dataset.shahzone) {
                        return;
                    }
                    if (cur.dataset.shahplayer) {
                        return;
                    }
                    cur = cur.parentElement;
                }
            },
            options
        );
        return () => controller.abort();
    }, []);

    return null;
}
