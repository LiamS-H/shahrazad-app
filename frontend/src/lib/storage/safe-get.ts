export function safeGetItem<T extends string | number | boolean>(
    key: string,
    defaultValue: T,
): T {
    try {
        const item = localStorage.getItem(key);
        return item !== null ? JSON.parse(item) : defaultValue;
    } catch {
        return defaultValue;
    }
}
