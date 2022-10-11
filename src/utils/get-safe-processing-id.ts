export function getSafeProcessingId(): string {
    // eslint-disable-next-line no-bitwise
    return Math.abs(~~(Math.random() * (2 ** 32)) | 0).toString()
}
