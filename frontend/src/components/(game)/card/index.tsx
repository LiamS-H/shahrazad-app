import { useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadCardId } from "@/types/bindings/card";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import Counters from "@/components/(game)/card/counters";
import { useSelection } from "@/contexts/(game)/selection";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDragging } from "@/contexts/(game)/dnd/dragging";

export default function Card(props: {
    id: ShahrazadCardId;
    faceUp?: boolean;
    animationTime?: number;
}) {
    const { getCard, player_name } = useShahrazadGameContext();
    const { setPreview } = useSelection();
    const shah_card = getCard(props.id);
    const hover_timer = useRef<NodeJS.Timeout>(undefined);

    const card = useScrycard(shah_card.card_name);
    const { dragging: draggingCards } = useDragging();
    const dragging = draggingCards?.includes(props.id);

    const [isAnimating, setIsAnimating] = useState(false);

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
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
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
            }}
            onMouseEnter={() => {
                if (hover_timer.current) return;
                hover_timer.current = setTimeout(() => {
                    setPreview(props.id);
                    clearTimeout(hover_timer.current);
                    hover_timer.current = undefined;
                }, 250);
            }}
            data-shahcard={props.id}
        >
            <Scrycard
                card={card}
                symbol_text_renderer={ScryNameCardText}
                flipped={shah_card.state.flipped}
                tapped={shah_card.state.tapped}
                faceDown={
                    !props.faceUp &&
                    shah_card.state.face_down &&
                    (!shah_card.state.revealed?.includes(player_name) ||
                        shah_card.state.x !== undefined)
                }
            />
            <Counters id={props.id} />
        </motion.div>
    );
}
