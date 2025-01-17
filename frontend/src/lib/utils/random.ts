export function randomU64() {
    const array = new BigUint64Array(1);
    crypto.getRandomValues(array);
    const num = array[0].toString();
    return num;
}
