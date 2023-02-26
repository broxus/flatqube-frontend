export interface EventLike {
    preventDefault(): void;
    stopPropagation(): void;
}

export function cancelEvent<T extends EventLike = EventLike>(event: T): void {
    event.preventDefault()
    event.stopPropagation()
}

export function preventEvent<T extends EventLike = EventLike>(event: T): void {
    event.preventDefault()
}

export function stopEventPropagate<T extends EventLike = EventLike>(event: T): void {
    event.stopPropagation()
}
