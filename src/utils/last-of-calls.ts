/* eslint-disable max-len */
/* eslint-disable func-names */
/* eslint-disable no-plusplus */

export function lastOfCalls<A extends any[], T = unknown>(fn: (...args: A) => Promise<T>, delay?: number): (...args: A) => Promise<T | undefined> {
    let requestId = 0

    return async function (...args) {
        const id = ++requestId

        if (delay) {
            await new Promise(r => {
                setTimeout(r, delay)
            })

            if (id !== requestId) {
                return undefined
            }
        }

        try {
            const result = await fn(...args)
            if (id === requestId) {
                return result
            }
        }
        catch (e) {
            if (id === requestId) {
                throw e
            }
        }

        return undefined
    }
}
