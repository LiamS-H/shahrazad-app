import { Skeleton } from "@/components/(ui)/skeleton";
import { TabsContent } from "@/components/(ui)/tabs";

export default function JoinGameLoading() {
    return (
        <TabsContent value="join">
            <div className="space-y-4 pt-4">
                {/*Game Code Label*/}
                <Skeleton className="h-4 w-18 mt-1 -mb-1" /> {/* Label */}
                {/*Game Code input */}
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-9 w-9" />
                    <div className="flex items-center">
                        <Skeleton className="rounded-r-none h-12 w-12" />
                        <Skeleton className="rounded-none h-12 w-12" />
                        <Skeleton className="rounded-l-none h-12 w-12" />
                        <Skeleton className="rounded h-1 w-4 mx-1"></Skeleton>
                        <Skeleton className="rounded-r-none h-12 w-12" />
                        <Skeleton className="rounded-none h-12 w-12" />
                        <Skeleton className="rounded-l-none h-12 w-12" />
                    </div>
                    <Skeleton className="h-9 w-9" />
                </div>
                <Skeleton className="h-9 w-full rounded-md" />
            </div>
        </TabsContent>
    );
}
