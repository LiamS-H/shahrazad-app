"use client";
import Game from "@/components/(game)/game";
import { ShahrazadAction } from "@/types/interfaces/action";
import { ShahrazadGame } from "@/types/interfaces/game";
import { applyMove } from "@/types/reducers/game";
import { useState, useEffect } from "react";
// import { useEffect } from "react";
import "react-scrycards/dist/index.css";

export default function GamePage() {
    const [game, setGame] = useState<ShahrazadGame>({
        zoneCount: 0,
        cardCount: 0,
        cards: {},
        playmats: [],
        zones: {},
    });

    useEffect(() => {
        const newGame: ShahrazadGame = {
            zoneCount: 0,
            cardCount: 0,
            cards: {},
            playmats: [],
            zones: {},
        };
        applyMove(newGame, {
            type: "ADD_PLAYER",
        });
        applyMove(newGame, {
            type: "ADD_PLAYER",
        });
        applyMove(newGame, {
            type: "IMPORT",
            mode: "DECK",
            cards: [
                "Akki Lavarunner // Tok-Tok, Volcano Born",
                "Opt",
                "Mental Misstep",
            ],
            deck: newGame.playmats[0].library,
        });
        applyMove(newGame, {
            type: "IMPORT",
            mode: "DECK",
            cards: ["Akki Lavarunner // Tok-Tok, Volcano Born"],
            deck: newGame.playmats[1].command,
        });
        setGame(newGame);
    }, []);

    return (
        <Game
            game={game}
            applyMove={(m: ShahrazadAction.ANY) => {
                setGame((game: ShahrazadGame) => {
                    const new_game = applyMove(game, m);
                    if (!new_game) {
                        console.log("game state same");
                        return game;
                    }
                    console.log("resulting game:", new_game);
                    return { ...new_game };
                });
            }}
        />
    );
}
