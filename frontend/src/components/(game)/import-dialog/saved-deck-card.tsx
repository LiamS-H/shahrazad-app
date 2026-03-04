import { TimeBadge } from "@/components/(ui)/time-badge";
import { IDeckData } from "@/lib/client/import-deck/importFromUrl";
import { ISavedDeck } from "@/lib/storage/deck-storage";
import { getCardArt } from "@/lib/utils/card-art";
import { UserCircle } from "lucide-react";
import { useScrycard, useSymbols } from "react-scrycards";

function SiteBadge({
    site,
    creator,
}: {
    site: IDeckData["website"];
    creator: IDeckData["creator"];
}) {
    switch (site) {
        case "moxfield":
            return (
                <div className="flex flex-col items-end text-xs">
                    <span className="bg-[#5f1b8b] text-white rounded-full w-fit px-2">
                        Moxfield
                    </span>
                    <a
                        className="flex items-center hover:underline"
                        href={`https://moxfield.com/users/${creator.username}`}
                        target="_blank"
                    >
                        <UserCircle className="h-3 w-3" />
                        {creator.display}
                    </a>
                </div>
            );
        case "archidekt":
            return (
                <div className="flex flex-col items-end text-xs">
                    <span className="bg-[#ff9600] text-white rounded-full w-fit px-2">
                        Archidekt
                    </span>
                    <a
                        className="flex items-center hover:underline"
                        href={`https://archidekt.com/u/${creator.username}`}
                        target="_blank"
                    >
                        <UserCircle className="h-3 w-3" />
                        {creator.display}
                    </a>
                </div>
            );
    }
}

export function SavedDeckCard({
    deck: { deck, lastUsed },
    onClick,
}: {
    deck: ISavedDeck;
    onClick: () => void;
}) {
    const face_card = useScrycard(deck.face_card.id ?? null);
    const symbols = useSymbols();
    const image =
        deck.face_card.image ?? (face_card && getCardArt(face_card)) ?? null;
    return (
        <button
            onClick={onClick}
            className="
                relative
                min-w-56 h-28
                overflow-hidden
                border border-white/10
                hover:border-white/30
                transition
                group
                shadow-xl
                p-1
            "
        >
            {/* Background Image */}
            {image && (
                <img
                    src={image}
                    alt={deck.name}
                    className="
                        absolute inset-0
                        w-full h-full
                        object-cover
                        opacity-80
                        transition-transform duration-500
                        group-hover:scale-105
                    "
                />
            )}

            {/* Radial Edge Darkening */}
            <div
                className="
                    absolute inset-0
                    pointer-events-none
                "
                style={{
                    background:
                        "radial-gradient(circle at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)",
                }}
            />

            {/* Content Overlay */}
            <div className="relative h-full w-full flex flex-col justify-between text-white">
                {/* Top Section */}
                <div className="flex justify-between">
                    <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm leading-tight">
                            {deck.name}
                        </span>
                        <span className="text-xs opacity-80">
                            {deck.format}
                        </span>
                    </div>
                    <SiteBadge site={deck.website} creator={deck.creator} />
                </div>

                {/* Bottom Section */}
                <div className="flex justify-between items-end">
                    {/* Colors */}
                    <div className="flex gap-1 h-4">
                        {deck.colors.map((c) => {
                            const src = symbols[`{${c}}`];
                            if (!src) return `{${c}}`;
                            return <img key={c} src={src} alt={c} />;
                        })}
                    </div>
                    <span className="text-xs">
                        <TimeBadge iso={lastUsed} />
                    </span>
                </div>
            </div>
        </button>
    );
}
