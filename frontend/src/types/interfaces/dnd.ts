import { ShahrazadZoneId } from "@/types/bindings/zone";

export interface IDraggableData {
    zone: ShahrazadZoneId;
    index?: number;
    x?: number;
    y?: number;
}
export interface IDroppableData {
    grid?: number;
    sortable?: true;
}
