export default function doSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
