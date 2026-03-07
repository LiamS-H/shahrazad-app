export function parseCode(codeStr: string | undefined): string | null {
    if (!codeStr) return null;
    if (codeStr.length !== 6) return null;
    const code = Number(codeStr);
    if (Number.isNaN(code)) return null;
    if (code >= 100000 && code <= 999999) {
        return codeStr;
    }
    return null;
}
