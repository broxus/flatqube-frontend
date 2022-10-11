import * as React from 'react'
import classNames from 'classnames'

type Props = {
    type?: 'default' | 'card';
    className?: string;
    size?: 's';
    items: {
        active?: boolean
        onClick: () => void
        label: React.ReactNode
    }[]
}

export function Tabs({
    type,
    className,
    size,
    items,
}: Props): JSX.Element {
    return (
        <ul
            className={classNames('tabs', className, {
                [`size-${size}`]: size !== undefined,
                [`type-${type}`]: type !== undefined,
            })}
        >
            {/* eslint-disable react/no-array-index-key */}
            {items.map(({ active, onClick, label }, index) => (
                <li className={classNames({ active })} key={index}>
                    {/* eslint-disable jsx-a11y/anchor-is-valid */}
                    <a onClick={onClick}>
                        {label}
                    </a>
                </li>
            ))}
        </ul>
    )
}
