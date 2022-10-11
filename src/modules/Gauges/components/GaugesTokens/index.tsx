import * as React from 'react'

import { Item, ItemProps } from '@/modules/Gauges/components/GaugesTokens/Item'

import styles from './index.module.scss'

export type TokenItem = ItemProps

type Props = {
    items: ItemProps[];
}

export function GaugesTokens({
    items,
}: Props): JSX.Element {
    return (
        <div className={styles.tokens}>
            {items.map(item => (
                <Item {...item} key={item.token.root} />
            ))}
        </div>
    )
}
