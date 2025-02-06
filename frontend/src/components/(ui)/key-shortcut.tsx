import { useDevice } from "@/contexts/device";
import { Shortcut } from "@/types/interfaces/keys";

export function KeyShortcut({ keys }: { keys: Shortcut }): string {
    const device = useDevice();
    if (device !== "OSX") {
        return keys.join(" + ");
    }

    if (keys.length === 1) {
        return keys[0];
    }

    if (keys[0] === "Shift") {
        return "⇧" + keys[1];
    }
    if (keys[1] === "Shift") {
        return "⇧" + "⌘" + keys[2];
    }
    return "⌘" + keys[1];
}
