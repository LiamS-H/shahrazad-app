import { useCard, useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import Counters from "@/components/(game)/card/counters";
import { useSelection } from "@/contexts/(game)/selection";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDragging } from "@/contexts/(game)/dnd/dragging";
import { Annotation } from "./annotation";

export default function Card({
    id,
    faceUp,
    untapped,
    animationTime,
    previewDelay = 0,
    width,
    children,
}: {
    id: ShahrazadCardId;
    faceUp?: boolean;
    untapped?: boolean;
    animationTime?: number | null;
    previewDelay?: number;
    width?: string;
    children?: ReactNode;
}) {
    const { active_player: player_name } = useShahrazadGameContext();
    const { setPreview } = useSelection();
    const hover_timer = useRef<NodeJS.Timeout>(undefined);

    const shah_card = useCard(id);
    const scry_card = useScrycard(shah_card.card_name);
    const { dragging: draggingCards } = useDragging();
    const dragging = draggingCards.includes(id);

    const handleMouseEnter = useCallback(() => {
        if (
            shah_card.state.face_down &&
            !shah_card.state.revealed?.includes(player_name)
        )
            return;
        if (hover_timer.current) return;
        if (!previewDelay) {
            setPreview(id);
            return;
        }
        hover_timer.current = setTimeout(() => {
            setPreview(id);
            clearTimeout(hover_timer.current);
            hover_timer.current = undefined;
        }, previewDelay);
    }, [
        setPreview,
        id,
        shah_card.state.face_down,
        shah_card.state.revealed,
        player_name,
        previewDelay,
    ]);

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
                { signal: controller.signal },
            );
        },
        [setPreview],
    );

    const faceDown =
        !faceUp &&
        shah_card.state.face_down &&
        (!shah_card.state.revealed?.includes(player_name) ||
            (shah_card.state.x !== null && shah_card.state.x !== undefined));

    const card_comp = useMemo(
        () => (
            <>
                <Scrycard
                    width={width}
                    card={scry_card}
                    symbol_text_renderer={ScryNameCardText}
                    flipped={shah_card.state.flipped}
                    tapped={!untapped && shah_card.state.tapped}
                    faceDown={faceDown}
                />
                <Counters id={id} />
                <Annotation id={id} />
                {children}
            </>
        ),
        [scry_card, shah_card, faceDown, untapped, children, id, width],
    );

    return useMemo(() => {
        if (animationTime === null) {
            return (
                <div
                    onMouseLeave={handleMouseLeave}
                    onMouseEnter={handleMouseEnter}
                    data-shahcard={dragging ? undefined : id}
                    className="relative"
                >
                    {card_comp}
                </div>
            );
        }

        const duration = animationTime !== undefined ? animationTime : 0.5;

        return (
            <MotionCard
                id={id}
                shah_card={shah_card}
                dragging={dragging}
                duration={duration}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
            >
                {card_comp}
            </MotionCard>
        );
    }, [
        animationTime,
        id,
        shah_card,
        dragging,
        handleMouseEnter,
        handleMouseLeave,
        card_comp,
    ]);
}

function MotionCard({
    id,
    shah_card,
    dragging,
    duration,
    handleMouseEnter,
    handleMouseLeave,
    children,
}: {
    id: ShahrazadCardId;
    shah_card: ShahrazadCard;
    dragging?: boolean;
    duration: number;
    handleMouseEnter: () => void;
    handleMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void;
    children: ReactNode;
}) {
    const [isAnimating, setIsAnimating] = useState(false);
    return useMemo(() => {
        console.log(
            "rerendering motion.div",
            id,
            `${shah_card.state.x}-${shah_card.state.y}`,
        );
        return (
            <motion.div
                layoutId={id}
                transition={{
                    duration: dragging ? 0 : duration,
                    ease: "easeInOut",
                }}
                layout="position"
                layoutDependency={`${shah_card.state.x}-${shah_card.state.y}`}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationEnd={() => setIsAnimating(false)}
                className={`relative${isAnimating ? " z-20" : ""}`}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                data-shahcard={dragging ? undefined : id}
            >
                {children}
            </motion.div>
        );
    }, [
        id,
        dragging,
        duration,
        shah_card.state.x,
        shah_card.state.y,
        isAnimating,
        handleMouseLeave,
        handleMouseEnter,
        children,
    ]);
}
