export function randomU64(): number {
    const array = new BigUint64Array(1);
    crypto.getRandomValues(array);
    return array[0] as unknown as number;
}
