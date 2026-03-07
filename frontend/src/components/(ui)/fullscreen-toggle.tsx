import { Button } from "@/components/(ui)/button";
import { useFullscreen } from "@/contexts/fullscreen";
import { Maximize2, Minimize2 } from "lucide-react";

export function FullscreenToggle() {
    const { isFullscreen, toggleFullscreen } = useFullscreen();

    return (
        <Button
            size="icon"
            variant="outline"
            onClick={() => toggleFullscreen()}
        >
            {isFullscreen ? <Minimize2 /> : <Maximize2 />}
        </Button>
    );
}
