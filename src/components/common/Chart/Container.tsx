import * as React from 'react'
import {
    type ChartOptions,
    createChart,
    type DeepPartial,
    type IChartApi,
    type LogicalRangeChangeEventHandler,
    type MouseEventHandler,
    type TimeRangeChangeEventHandler,
} from 'lightweight-charts'

import {
    type ChartApi,
    ChartApiContext,
    ChartAppearanceContext,
} from '@/components/common/Chart/Context'
import { debug } from '@/utils'

type Props = DeepPartial<ChartOptions> &
    React.PropsWithChildren<{
        container: HTMLDivElement
        onCrosshairMove?: MouseEventHandler
        onVisibleTimeRangeChange?: TimeRangeChangeEventHandler
        onVisibleLogicalRangeChange?: LogicalRangeChangeEventHandler
    }>

const ContainerInternal = React.forwardRef<IChartApi | undefined, Props>((props, ref) => {
    const {
        children,
        container,
        layout,
        onCrosshairMove,
        onVisibleTimeRangeChange,
        onVisibleLogicalRangeChange,
        ...restProps
    } = props

    const appearance = React.useContext(ChartAppearanceContext)

    const internalChatApi = React.useRef<IChartApi>()
    const chatApi = React.useRef<ChartApi>({
        api() {
            if (internalChatApi.current === undefined) {
                // Create chart API and mount it to the container
                // Apply layout config, dimensions,
                // default appearance options and custom chart options
                internalChatApi.current = createChart(
                    container,
                    appearance.getDefaultChartOptions(),
                )
                internalChatApi.current.applyOptions({
                    ...restProps,
                    height: container.clientHeight,
                    layout,
                    width: container.clientWidth,
                })
            }
            return internalChatApi.current
        },
        remove() {
            internalChatApi.current?.remove()
            internalChatApi.current = undefined
        },
    })

    React.useEffect(() => {
        chatApi.current.api()
        return () => {
            chatApi.current.remove()
            internalChatApi.current = undefined
        }
    }, [container])

    React.useLayoutEffect(() => {
        const api = chatApi.current.api()

        if (typeof onCrosshairMove === 'function') {
            api.subscribeCrosshairMove(onCrosshairMove)
        }

        const timeScale = api.timeScale()
        const handleVisibleTimeRangeChange: TimeRangeChangeEventHandler = timeRange => {
            onVisibleTimeRangeChange?.(timeRange)
        }
        const handleLogicalRangeChange: LogicalRangeChangeEventHandler = logicalRange => {
            onVisibleLogicalRangeChange?.(logicalRange)
        }
        timeScale.subscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange)
        timeScale.subscribeVisibleLogicalRangeChange(handleLogicalRangeChange)

        return () => {
            if (typeof onCrosshairMove === 'function') {
                api.unsubscribeCrosshairMove(onCrosshairMove)
            }
            timeScale.unsubscribeVisibleTimeRangeChange(handleVisibleTimeRangeChange)
            timeScale.unsubscribeVisibleLogicalRangeChange(handleLogicalRangeChange)
        }
    }, [onCrosshairMove, onVisibleLogicalRangeChange, onVisibleTimeRangeChange])

    React.useLayoutEffect(() => {
        const api = chatApi.current.api()

        const handleResize = (): void => {
            try {
                api.resize(container.clientWidth, container.clientHeight, true)
            }
            catch (e) {
                try {
                    api.applyOptions({
                        height: container.clientHeight,
                        width: container.clientWidth,
                    })
                }
                catch (err: any) {
                    debug(err.message)
                }
            }
        }
        const resizeObserver = new ResizeObserver(handleResize)
        resizeObserver.observe(container)

        return () => {
            resizeObserver.disconnect()
            chatApi.current.remove()
        }
    }, [])

    React.useLayoutEffect(() => {
        chatApi.current.api().applyOptions(appearance.getDefaultChartOptions())
        chatApi.current.api().applyOptions({
            ...restProps,
            height: container.clientHeight,
            width: container.clientWidth,
        })
    })

    React.useImperativeHandle(ref, () => internalChatApi.current, [])

    React.useEffect(() => {
        chatApi.current.api().applyOptions({ layout })
    }, [layout])

    return <ChartApiContext.Provider value={chatApi.current}>{children}</ChartApiContext.Provider>
})

export const Container = React.memo(ContainerInternal)

if (process.env.NODE_ENV !== 'production') {
    Container.displayName = 'Container'
    ContainerInternal.displayName = 'Container.Forwarded'
}
