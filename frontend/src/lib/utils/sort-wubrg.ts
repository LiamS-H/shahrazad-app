import { WUBRG } from "@/types/interfaces/color";

export const sortWUBRG = (colors: WUBRG[]): WUBRG[] => {
    const order: Record<WUBRG, number> = {
        W: 0,
        U: 1,
        B: 2,
        R: 3,
        G: 4,
    };

    return [...colors].sort((a, b) => order[a] - order[b]);
};
