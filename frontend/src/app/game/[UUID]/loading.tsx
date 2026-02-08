import { Loader2 } from "lucide-react";
import { LoadingMessage } from "./loading-message";

export default function Loading({
    server_loading,
}: {
    server_loading?: boolean;
}) {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background overflow-hidden">
            <div className="relative flex flex-col items-center">
                <Loader2 className="h-48 w-48 animate-spin text-secondary" />

                <div className="space-y-4 text-center">
                    <LoadingMessage server_loading={server_loading} />
                </div>
            </div>
        </div>
    );
}
