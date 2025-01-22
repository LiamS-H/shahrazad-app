import { Skeleton } from "@/components/(ui)/skeleton";
import { TabsContent } from "@/components/(ui)/tabs";

export default function CreateGameLoading() {
    return (
        <TabsContent value="create">
            <div className="space-y-4 pt-4">
                {/* Starting Life Section */}
                <div>
                    <Skeleton className="h-4 w-24 mb-2" /> {/* Label */}
                    <Skeleton className="h-10 w-full rounded-md" />{" "}
                    {/* Select */}
                </div>

                {/* Free Mulligans Section */}
                <div>
                    <Skeleton className="h-4 w-32 mb-2" /> {/* Label */}
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-5 w-full rounded-full" />{" "}
                        {/* Slider */}
                        <Skeleton className="h-6 w-12" /> {/* Number display */}
                    </div>
                </div>

                {/* Scry Rule Section */}
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-6 rounded-full" /> {/* Switch */}
                    <Skeleton className="h-4 w-20" /> {/* Label */}
                </div>

                {/* Button */}
                <Skeleton className="h-10 w-full rounded-md" />
            </div>
        </TabsContent>
    );
}
