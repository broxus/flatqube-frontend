import * as React from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { Placeholder as PlaceholderBase } from '@/components/common/Placeholder'
import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'
import { usePoolStoreContext } from '@/modules/Pools/context'
import { PoolTransactionEventType } from '@/modules/Pools/types'
import type { PoolTransactionResponse } from '@/modules/Pools/types'
import { formattedTokenAmount, isGoodBignumber } from '@/utils'
import { Icon } from '@/components/common/Icon'

import styles from './index.module.scss'

type Props = {
    transaction: PoolTransactionResponse;
}

function TokensCellInternal({ transaction }: Props): JSX.Element {
    const poolStore = usePoolStoreContext()

    const tokens = React.useMemo(() => transaction.currencyAddresses.map((address, idx) => {
        const token = poolStore.tokensCache.get(address)
        return {
            address,
            amount: transaction.volumes[idx],
            decimals: poolStore.customTokensDecimals?.[address] || token?.decimals,
            icon: token?.icon,
            symbol: token?.symbol ?? transaction.currencies[idx],
        }
    }), [poolStore.customTokensDecimals])

    if (poolStore.isSyncingCustomTokens) {
        return (
            <div className={styles.tokens_cell__token_placeholder}>
                <PlaceholderBase circle width={24} />
                <PlaceholderBase width={80} />
            </div>
        )
    }

    switch (transaction.eventType) {
        case PoolTransactionEventType.Swap: {
            const [from, to] = tokens
            return (
                <div className={classNames(styles.tokens_cell, styles.tokens_cell__swap)}>
                    <div className={styles.tokens_cell__token_holder}>
                        <TokenAmountBadge
                            address={from.address}
                            amount={formattedTokenAmount(from.amount, from.decimals)}
                            icon={from.icon}
                            size="xsmall"
                            symbol={from.symbol}
                        />
                    </div>
                    <Icon icon="swapLeftArrow" />
                    <div className={styles.tokens_cell__token_holder}>
                        <TokenAmountBadge
                            address={to.address}
                            amount={formattedTokenAmount(to.amount, to.decimals)}
                            icon={to.icon}
                            size="xsmall"
                            symbol={to.symbol}
                        />
                    </div>
                </div>
            )
        }
        case PoolTransactionEventType.Deposit:
        case PoolTransactionEventType.Withdraw:
            return (
                <div className={classNames(styles.tokens_cell, styles.tokens_cell__other)}>
                    {tokens.map(token => (isGoodBignumber(token.amount) ? (
                        <TokenAmountBadge
                            key={token.address}
                            address={token.address}
                            amount={formattedTokenAmount(token.amount, token.decimals)}
                            icon={token.icon}
                            size="xsmall"
                            symbol={token.symbol}
                        />
                    ) : null))}
                </div>
            )

        default:
            return <>&mdash;</>
    }
}

export const TokensCell = observer(TokensCellInternal)
