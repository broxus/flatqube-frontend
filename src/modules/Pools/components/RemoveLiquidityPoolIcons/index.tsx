import * as React from 'react'
import { Observer } from 'mobx-react-lite'

import { TokenIcons } from '@/components/common/TokenIcons'
import { useRemoveLiquidityFormStoreContext } from '@/modules/Pools/context'

import styles from './index.module.scss'

export function RemoveLiquidityPoolIcons(): JSX.Element {
    const formStore = useRemoveLiquidityFormStoreContext()

    return (
        <div className={styles.remove_liquidity}>
            <Observer>
                {() => (
                    <>
                        <TokenIcons
                            icons={formStore.tokens.map(token => ({
                                address: token.address.toString(),
                                icon: token.icon,
                            }))}
                            limit={3}
                            size="medium"
                        />
                        <div className={styles.remove_liquidity__symbol}>{formStore.tokens.map(token => token.symbol).join('/')}</div>
                    </>
                )}
            </Observer>
        </div>
    )
}
