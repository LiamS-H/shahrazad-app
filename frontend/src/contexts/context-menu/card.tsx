import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
export default function CardMenu({ cardId }: { cardId: string }) {
    return (
        <DropdownMenu>
            <DropdownMenuContent>
                <DropdownMenuLabel>Card</DropdownMenuLabel>
                <DropdownMenuSeparator />
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
