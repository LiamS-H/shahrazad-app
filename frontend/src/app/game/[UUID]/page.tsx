"use server";
import Game from "./game";
import { useParams } from "next/navigation";

export default async function GamePage() {
    const { uuid: game_uuid } = useParams<{ uuid: string }>();

    return <Game uuid={game_uuid} />;
}
