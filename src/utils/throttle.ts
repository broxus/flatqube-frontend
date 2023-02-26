export function throttle<T>(
    fn: (...args: T[]) => unknown,
    limit: number,
): (...args: T[]) => void {
    let wait = false

    return (...args: T[]) => {
        if (!wait) {
            // @ts-ignore
            fn.apply(this, args)

            wait = true

            setTimeout(() => {
                wait = false
            }, limit)
        }
    }
}
