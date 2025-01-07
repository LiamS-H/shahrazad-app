"use server";
import Game from "./game";

export default async function GamePage({
    params,
}: {
    params: Promise<{ UUID: string }>;
}) {
    const { UUID } = await params;

    return <Game game_id={UUID} />;
}
