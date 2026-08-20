export default function doClamp<T>(min: T, value: T, max: T): T {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}
