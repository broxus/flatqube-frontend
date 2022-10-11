import classNames from 'classnames'
import * as React from 'react'


import styles from './index.module.scss'

interface Props extends React.HTMLAttributes<HTMLElement> {
    as?: React.ElementType;
    className?: string;
    disabled?: boolean;
    children?: React.ReactNode;
    onClick?: () => void;
}

export function GaugesToolBtn({
    as: Tag = 'button',
    disabled,
    className,
    children,
    onClick,
}: Props): JSX.Element {
    return (
        <Tag
            type="button"
            disabled={disabled}
            className={classNames(styles.toolBtn, className)}
            onClick={onClick}
        >
            {children}
        </Tag>
    )
}
