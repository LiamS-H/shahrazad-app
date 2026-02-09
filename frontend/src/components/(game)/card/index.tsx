import { useCard, useShahrazadGameContext } from "@/contexts/(game)/game";
import { ShahrazadCard, ShahrazadCardId } from "@/types/bindings/card";
import { Scrycard, ScryNameCardText, useScrycard } from "react-scrycards";
import Counters from "@/components/(game)/card/counters";
import { useSelection } from "@/contexts/(game)/selection";
import { type ReactNode, useCallback, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useDragging } from "@/contexts/(game)/dnd/dragging";
import { Annotation } from "./annotation";

export default function Card({
    id,
    faceUp,
    untapped,
    animationTime,
    animateStrict,
    previewDelay = 0,
    width,
    children,
}: {
    id: ShahrazadCardId;
    faceUp?: boolean;
    untapped?: boolean;
    animationTime?: number | null;
    animateStrict?: boolean;
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

    // return useMemo(() => {
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
            key={id}
            id={id}
            shah_card={shah_card}
            dragging={dragging}
            duration={duration}
            animateStrict={animateStrict}
            handleMouseEnter={handleMouseEnter}
            handleMouseLeave={handleMouseLeave}
        >
            {card_comp}
        </MotionCard>
    );
    // }, [
    //     animationTime,
    //     id,
    //     shah_card,
    //     dragging,
    //     animateStrict,
    //     handleMouseEnter,
    //     handleMouseLeave,
    //     card_comp,
    // ]);
}

function MotionCard({
    id,
    shah_card,
    dragging,
    duration,
    animateStrict,
    handleMouseEnter,
    handleMouseLeave,
    children,
}: {
    id: ShahrazadCardId;
    shah_card: ShahrazadCard;
    dragging?: boolean;
    duration: number;
    animateStrict?: boolean;
    handleMouseEnter: () => void;
    handleMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => void;
    children: ReactNode;
}) {
    const prevPosition = useRef<{ x: null | number; y: null | number }>({
        x: null,
        y: null,
    });

    /** This break animation on render change, since the default state is no animation
     * TODO: Pick one of two options
     * 1) rewrite / path motion.div to display animation when height / width changes and or only listen to manual xy chages
     * 2) Write a better hack to fix this, most likely by disabling on tap instead of enabling on move. default = enabled
     */

    const positionChanged =
        !animateStrict ||
        shah_card.state.x === undefined ||
        prevPosition.current.x !== shah_card.state.x || // eslint-disable-line react-hooks/refs
        prevPosition.current.y !== shah_card.state.y; // eslint-disable-line react-hooks/refs

    // console.log(
    //     [shah_card.state.x, shah_card.state.y],
    //     prevPosition.current, // eslint-disable-line react-hooks/refs
    //     positionChanged,
    // );
    useEffect(() => {
        // console.log(shah_card.state.x, shah_card.state.y);
        prevPosition.current = {
            x: shah_card.state.x ?? null,
            y: shah_card.state.y ?? null,
        };
    }, [shah_card.state.x, shah_card.state.y]);

    return (
        <motion.div
            layoutId={id}
            transition={{
                duration: !dragging && positionChanged ? duration : 0,
                ease: "easeInOut",
            }}
            layout="position"
            onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            data-shahcard={dragging ? undefined : id}
        >
            {children}
        </motion.div>
    );
}
