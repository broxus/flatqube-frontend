import * as React from 'react'
import {
    Component, type PolymorphicProps, type TooltipProps, useConfig, useForceUpdate,
} from '@broxus/react-uikit'
import { DateTime } from 'luxon'
import classNames from 'classnames'

export type RelativeTimeOwnProps = TooltipProps & {
    locale?: string
    /** Unix-time (ms) */
    timestamp: number
    updateTimeout?: number
}

export type RelativeTimeProps<E extends React.ElementType = React.ElementType> = React.PropsWithChildren<
    RelativeTimeOwnProps & PolymorphicProps<E>
> & PolymorphicProps<E, RelativeTimeOwnProps>

const defaultElement: React.ElementType = 'time'

let interval: ReturnType<typeof setInterval>

export const RelativeTime = React.memo(
    <E extends React.ElementType = typeof defaultElement>(props: RelativeTimeProps<E>) => {
        const config = useConfig()
        const forceUpdate = useForceUpdate()

        const {
            className,
            component = defaultElement,
            locale = navigator.language,
            timestamp,
            tooltip = DateTime.fromMillis(timestamp)
                .toUTC()
                .toLocaleString(DateTime.DATETIME_FULL, { locale }),
            updateTimeout = 30000,
            ...restProps
        } = props

        const rootCls = React.useMemo(
            () => config.getRootPrefixCls(config.prefixCls, 'relative-time'),
            [config],
        )
        const tooltipConfig = React.useMemo(
            () => (tooltip ? config.getTooltipConfig(tooltip) : undefined),
            [config, tooltip],
        )
        const dateTimeAttr = React.useMemo(
            () => (component === 'time'
                ? {
                    dateTime: `${DateTime.fromMillis(timestamp, {
                        locale,
                    }).toFormat('yyyy-MM-dd HH:mm')}`,
                }
                : undefined),
            [component, locale, timestamp],
        )

        React.useEffect(() => {
            if (updateTimeout) {
                interval = setInterval(() => forceUpdate(), updateTimeout ?? 30000)
            }
            return () => {
                clearInterval(interval)
            }
        }, [forceUpdate, timestamp, updateTimeout])

        return (
            <Component
                className={classNames(rootCls, className)}
                component={component as React.ElementType}
                {...dateTimeAttr}
                {...tooltipConfig}
                {...restProps}
            >
                {DateTime.fromMillis(timestamp, {
                    locale,
                }).toRelative()}
            </Component>
        )
    },
)
