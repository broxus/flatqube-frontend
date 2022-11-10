import * as React from 'react'
import * as ReactDOM from 'react-dom'
import classNames from 'classnames'

import './index.scss'

type Position = {
    top: number;
    left: number;
}

type Props = {
    children: React.ReactNode;
    target: React.RefObject<HTMLElement>;
    alignX?: 'left' | 'right' | 'center';
    alignY?: 'top' | 'bottom';
    width?: number;
    size?: 'small';
    forceShow?: boolean;
}

export function Tooltip({
    children,
    target,
    alignX = 'left',
    alignY = 'bottom',
    width,
    size,
    forceShow,
}: Props): JSX.Element | null {
    const [visible, setVisible] = React.useState(Boolean(forceShow))
    const tooltipRef = React.createRef<HTMLDivElement>()
    const [position, setPosition] = React.useState<Position>()

    React.useEffect(() => {
        if (visible && target.current && tooltipRef.current) {
            const rect = target.current.getBoundingClientRect()
            const tooltipRect = tooltipRef.current.getBoundingClientRect()

            let { top, left } = rect

            if (alignY === 'top') {
                top = rect.top - rect.height - tooltipRect.height
            }

            if (alignY === 'bottom') {
                top = rect.bottom
            }

            if (alignX === 'left') {
                left = rect.left
            }

            if (alignX === 'right') {
                left = rect.right - tooltipRect.width
            }

            if (alignX === 'center') {
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2)
            }

            left = Math.max(8, left)
            left = Math.min(window.innerWidth - 8, left)

            setPosition({ left, top })
        }
    }, [visible, target.current])

    React.useEffect(() => {
        const onMouseover = () => {
            setVisible(true)
        }

        const onMouseleave = () => {
            setVisible(false)
        }

        target.current?.addEventListener('mouseover', onMouseover)
        target.current?.addEventListener('mouseleave', onMouseleave)

        return () => {
            target.current?.removeEventListener('mouseover', onMouseover)
            target.current?.removeEventListener('mouseleave', onMouseleave)
        }
    }, [target])

    React.useEffect(() => {
        const onScroll = () => {
            setVisible(false)
        }

        window.addEventListener('scroll', onScroll)

        return () => {
            window.removeEventListener('scroll', onScroll)
        }
    }, [])

    return visible
        ? ReactDOM.createPortal(
            <div
                ref={tooltipRef}
                className={classNames('tooltip', {
                    tooltip_active: !!position,
                    [`tooltip_size_${size}`]: Boolean(size),
                })}
                style={{
                    left: position ? `${position.left}px` : undefined,
                    top: position ? `${position.top}px` : undefined,
                    width: width && `${width}px`,
                }}
            >
                {children}
            </div>,
            document.body,
        )
        : null
}
