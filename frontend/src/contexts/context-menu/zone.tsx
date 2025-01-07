import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
export default function ZoneMenu({ zoneId }: { zoneId: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuContent>
                <DropdownMenuLabel>Zone</DropdownMenuLabel>
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
