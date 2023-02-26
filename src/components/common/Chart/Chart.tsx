import * as React from 'react'
import classNames from 'classnames'
import type {
    ChartOptions,
    DeepPartial,
    IChartApi,
    LogicalRangeChangeEventHandler,
    MouseEventHandler,
    TimeRangeChangeEventHandler,
} from 'lightweight-charts'

import { Container } from '@/components/common/Chart/Container'

export type ChartProps = React.PropsWithChildren<
    DeepPartial<ChartOptions> & {
        className?: string
        id?: string
        style?: React.CSSProperties
        onCrosshairMove?: MouseEventHandler
        onVisibleTimeRangeChange?: TimeRangeChangeEventHandler
        onVisibleLogicalRangeChange?: LogicalRangeChangeEventHandler
    }
>

type ContainerRefHandler = (ref: HTMLDivElement) => void

const ChartInternal = React.forwardRef<IChartApi, ChartProps>((props, ref) => {
    const {
        className, id, style, ...restProps
    } = props
    const [container, setContainer] = React.useState<HTMLDivElement>()
    const handleContainer = React.useCallback<ContainerRefHandler>(setContainer, [
        className,
        id,
        style,
    ])
    return (
        <div
            ref={handleContainer}
            className={classNames('chart', className)}
            id={id}
            style={style}
        >
            {container && <Container ref={ref} {...restProps} container={container} />}
        </div>
    )
})

export const Chart = React.memo(ChartInternal)

if (process.env.NODE_ENV !== 'production') {
    Chart.displayName = 'Chart'
    ChartInternal.displayName = 'Chart.Forwarded'
}
