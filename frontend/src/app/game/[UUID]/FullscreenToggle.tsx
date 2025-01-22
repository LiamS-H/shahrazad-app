import { Button } from "@/components/(ui)/button";
import { useFullscreen } from "@/contexts/fullscreen";
import { Maximize2, Minimize2 } from "lucide-react";

export default function FullscreenToggle() {
    const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

    if (isFullscreen) {
        return (
            <Button size="icon" variant="outline" onClick={exitFullscreen}>
                <Minimize2 />
            </Button>
        );
    }

    return (
        <Button size="icon" variant="outline" onClick={enterFullscreen}>
            <Maximize2 />
        </Button>
    );
}
