import * as React from 'react'
import classNames from 'classnames'


import styles from './index.module.scss'

type Item = {
    label: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
}

type Props = {
    items: Item[];
}

export function DropdownList({
    items,
}: Props): JSX.Element {
    return (
        <>
            {items.map((item, index) => (
                <button
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    type="button"
                    onClick={item.onClick}
                    className={classNames(styles.item, {
                        [styles.active]: item.active,
                    })}
                >
                    {item.label}
                </button>
            ))}
        </>
    )
}
