type ArrayFiller<T> = (idx: number) => T;

export function makeArray<T>(length: number, fill?: ArrayFiller<T>): Array<T> {
    if (fill === undefined) {
        return Array(...Array(length))
    }

    if (typeof fill === 'function') {
        // It's just for flow fix see https://github.com/facebook/flow/issues/2819#issuecomment-260908054
        const filler = fill
        return makeArray(length).map((_, idx) => filler(idx))
    }

    return makeArray<T>(length).fill(fill)
}
