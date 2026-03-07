import { TabsContent } from "@/components/(ui)/tabs";
import { createGame } from "@/lib/api/createGame";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { loadPlayer, savePlayer } from "@/lib/storage/localPlayer";
import { GameSettings } from "@/components/(game)/game-settings";
import { ShahrazadGameSettings } from "@/types/bindings/game";
import { safeGetItem } from "@/lib/storage/safe-get";

export default function CreateGameForm() {
    const { push: pushRoute } = useRouter();
    const [loading, setLoading] = useState(false);
    const [defaultSettings, setDefaultGameSettings] =
        useState<GameSettings | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Still think this is the best storage pattern
        setDefaultGameSettings({
            starting_life: safeGetItem(
                "default-game-startingLife",
                "20",
            ) as string,
            custom_starting_life: safeGetItem(
                "default-game-customLife",
                "",
            ) as string,
            free_mulligans: safeGetItem(
                "default-game-freeMulligans",
                1,
            ) as number,
            scry_rule: safeGetItem("default-game-scryRule", false) as boolean,
            commander: safeGetItem("default-game-command", true) as boolean,
        });
    }, []);

    const handleCreateGame = async (settings: ShahrazadGameSettings) => {
        setLoading(true);
        const gamePromise = createGame({
            settings,
            player: loadPlayer()?.player,
        });
        async function toastPromise() {
            const data = await gamePromise;
            if (!data || !("player_id" in data) || !("game_id" in data)) {
                throw { message: "Something went wrong" };
            }
        }
        toast.promise(toastPromise(), {
            loading: "Creating Game...",
            success: "Game Created.",
            error: (e) => `${e.message}`,
        });
        const gameResult = await gamePromise;
        if (gameResult === null) {
            setLoading(false);
            return;
        }
        const { player_id, code } = gameResult;
        savePlayer(player_id);
        pushRoute(`/game/${code}`);
    };

    return (
        <TabsContent value="create">
            <GameSettings
                onSubmit={handleCreateGame}
                submitButtonText={loading ? "loading..." : "Create Game"}
                isLoading={loading}
                initialSettings={defaultSettings}
            />
        </TabsContent>
    );
}
