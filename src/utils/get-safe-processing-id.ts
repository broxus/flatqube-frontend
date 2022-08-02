export function getSafeProcessingId(): string {
    return (Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1)) + 1).toString()
}
