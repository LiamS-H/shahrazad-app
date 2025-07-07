import { useCard, useShahrazadGameContext } from "@/contexts/(game)/game";
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
    const { active_player: player_name } = useShahrazadGameContext();
    const { setPreview } = useSelection();
    const hover_timer = useRef<NodeJS.Timeout>(undefined);

    const shah_card = useCard(props.id);
    const scry_card = useScrycard(shah_card.card_name);
    const { dragging: draggingCards } = useDragging();
    const dragging = draggingCards.includes(props.id);

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
    }, [
        setPreview,
        props.id,
        shah_card.state.face_down,
        shah_card.state.revealed,
        player_name,
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
                { signal: controller.signal }
            );
        },
        [setPreview]
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
                    card={scry_card}
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
        [scry_card, shah_card, faceDown, props.children, props.id]
    );

    return useMemo(() => {
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
            <MotionCard
                id={props.id}
                dragging={dragging}
                duration={duration}
                handleMouseEnter={handleMouseEnter}
                handleMouseLeave={handleMouseLeave}
            >
                {card_comp}
            </MotionCard>
        );
    }, [
        card_comp,
        dragging,
        handleMouseEnter,
        handleMouseLeave,
        props.animationTime,
        props.id,
    ]);
}

function MotionCard({
    id,
    dragging,
    duration,
    handleMouseEnter,
    handleMouseLeave,
    children,
}: {
    id: ShahrazadCardId;
    dragging?: boolean;
    duration: number;
    handleMouseEnter: () => void;
    handleMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void;
    children: ReactNode;
}) {
    const [isAnimating, setIsAnimating] = useState(false);
    return useMemo(
        () => (
            <motion.div
                layoutId={id}
                transition={{
                    duration: dragging ? 0 : duration,
                    ease: "easeInOut",
                }}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationEnd={() => setIsAnimating(false)}
                className={`relative${isAnimating ? " z-20" : ""}`}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
                data-shahcard={dragging ? undefined : id}
            >
                {children}
            </motion.div>
        ),
        [
            id,
            dragging,
            duration,
            handleMouseEnter,
            handleMouseLeave,
            children,
            isAnimating,
        ]
    );
}
