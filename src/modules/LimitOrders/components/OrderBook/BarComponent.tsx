import * as React from 'react'

export function BarComponent( // TODO not used
    {
        fill, x, y, width, height,
    }:
        { fill?: string; x?: number; y?: number; width?: any; height?: any; },
): JSX.Element {
    return (
        <path
            d={`M${x},${y} L${x + width},${y} L${x + width},${y + height} L${x},${y + height} Z`}
            stroke="none"
            fill={fill}
        />
    )
}
