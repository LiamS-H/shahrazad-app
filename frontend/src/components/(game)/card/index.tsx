import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadCardId } from "@/types/bindings/card";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import Counters from "@/components/(game)/card/counters";
import { useSelection } from "@/contexts/(game)/selection";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDragging } from "@/contexts/(game)/dnd/dragging";
import { Annotation } from "./annotation";

export default function Card(props: {
    id: ShahrazadCardId;
    faceUp?: boolean;
    animationTime?: number | null;
    children?: ReactNode;
}) {
    const { getCard, active_player: player_name } = useShahrazadGameContext();
    const { setPreview } = useSelection();
    const shah_card = getCard(props.id);
    const hover_timer = useRef<NodeJS.Timeout>(undefined);

    const card = useScrycard(shah_card.card_name);
    const { dragging: draggingCards } = useDragging();
    const dragging = draggingCards?.includes(props.id);

    const [isAnimating, setIsAnimating] = useState(false);

    const handleMouseEnter = useCallback(() => {
        if (
            shah_card.state.face_down &&
            !shah_card.state.revealed?.includes(player_name)
        )
            return;
        if (hover_timer.current) return;
        hover_timer.current = setTimeout(() => {
            setPreview(props.id);
            clearTimeout(hover_timer.current);
            hover_timer.current = undefined;
        }, 250);
    }, [setPreview, hover_timer, props.id, shah_card, player_name]);

    const handleMouseLeave = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            clearTimeout(hover_timer.current);
            hover_timer.current = undefined;
            if (e.buttons != 1) {
                setPreview(null);
                return;
            }
            const controller = new AbortController();
            window.addEventListener(
                "mouseup",
                () => {
                    setPreview(null);
                    controller.abort();
                },
                { signal: controller.signal }
            );
        },
        [setPreview, hover_timer]
    );

    const faceDown =
        !props.faceUp &&
        shah_card.state.face_down &&
        (!shah_card.state.revealed?.includes(player_name) ||
            (shah_card.state.x !== null && shah_card.state.x !== undefined));

    const card_comp = useMemo(
        () => (
            <>
                <Scrycard
                    card={card}
                    symbol_text_renderer={ScryNameCardText}
                    flipped={shah_card.state.flipped}
                    tapped={shah_card.state.tapped}
                    faceDown={faceDown}
                />
                <Counters id={props.id} />
                <Annotation id={props.id} />
                {props.children}
            </>
        ),
        [card, shah_card, faceDown, props.children, props.id]
    );

    if (props.animationTime === null) {
        return (
            <div
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                data-shahcard={dragging ? undefined : props.id}
                className="relative"
            >
                {card_comp}
            </div>
        );
    }

    const duration =
        props.animationTime !== undefined ? props.animationTime : 0.5;

    return (
        <motion.div
            layoutId={props.id}
            transition={{
                duration: dragging ? 0 : duration,
                ease: "easeInOut",
            }}
            onAnimationStart={() => setIsAnimating(true)}
            onAnimationEnd={() => setIsAnimating(false)}
            className={`relative${isAnimating ? " z-20" : ""}`}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            data-shahcard={dragging ? undefined : props.id}
        >
            {card_comp}
        </motion.div>
    );
}
