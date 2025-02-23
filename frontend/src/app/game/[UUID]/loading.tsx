import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="w-full h-full flex justify-center pt-48">
            <Loader2 className="h-48 w-48 animate-spin text-secondary" />
        </div>
    );
}
// import { Skeleton } from "@/components/(ui)/skeleton";

// function Card() {
//     return <Skeleton className="w-[100] h-[140] border-r-[4.75% / 3.5%]" />;
// }
// function Button() {
//     return <Skeleton className="w-9 h-9 rounded-sm" />;
// }

// export default function Loading() {
//     return (
//         <div className="mx-4 w-ful h-ful flex flex-col gap-4">
//             {/* Playmat */}
//             <div className="w-full h-fit flex gap-4 select-none">
//                 <div className="flex flex-col gap-3 items-center">
//                     <div className="flex h-[140px]">
//                         <div className="flex flex-col justify-around">
//                             <Button />
//                             <Button />
//                         </div>
//                         <div className="flex flex-col justify-center items-center">
//                             <Button />
//                             <div className="h-[48px] p-4 flex">
//                                 <Skeleton className="w-full h-full" />
//                             </div>
//                             <Button />
//                         </div>
//                     </div>
//                     {/* Exile, Graveyard, Deck */}
//                     {[0, 1, 2].map((i) => (
//                         <Card key={i} />
//                     ))}
//                     {/* under deck options */}
//                     <div className="flex justify-around z-10 gap-4">
//                         <Button />
//                         <Button />
//                     </div>
//                 </div>
//                 <div className="flex flex-col gap-4 w-full">
//                     {/* Board */}
//                     <Skeleton className="h-[501px] min-w-[901px] max-w-[1301] relative -z-10" />

//                     {/* Command Hand */}
//                     <div className="flex gap-4">
//                         {[0, 1, 2, 3].map((i) => (
//                             <Card key={i} />
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
