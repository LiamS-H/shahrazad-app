import { toast } from "sonner";

export function copy_with_toast({
    value,
    name = "",
    loading_name = "",
    error_name = "",
}: {
    value: string;
    name: string;
    loading_name?: string;
    error_name?: string;
}) {
    const promise = navigator.clipboard.writeText(value);
    toast.promise(promise, {
        loading: `Copying ${loading_name || name} to clipboard.`,
        success: `Copied ${name || name} to clipboard.`,
        error: `Couldn't write ${error_name || loading_name || name} to clipboard.`,
    });
    return promise;
}
