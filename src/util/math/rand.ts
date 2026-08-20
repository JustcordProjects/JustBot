export function doGetRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function doGetRandomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
}
