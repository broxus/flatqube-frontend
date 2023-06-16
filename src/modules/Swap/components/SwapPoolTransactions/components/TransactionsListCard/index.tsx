import * as React from 'react'
import classNames from 'classnames'
import { DateTime } from 'luxon'
import { useIntl } from 'react-intl'
import { Observer } from 'mobx-react-lite'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { TransactionExplorerLink } from '@/components/common/TransactionExplorerLink'
import { useSwapPoolStoreContext } from '@/modules/Swap/context/SwapPoolStoreProvider'
import type { PoolTransactionResponse } from '@/modules/Pools/types'
import { PoolTransactionEventType } from '@/modules/Pools/types'
import {
    formattedAmount, formattedTokenAmount, isGoodBignumber, sliceAddress,
} from '@/utils'
import styles
    from '@/modules/Currencies/components/CurrencyTransactions/components/TokensCell/index.module.scss'
import { Placeholder as PlaceholderBase } from '@/components/common/Placeholder'
import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'


type Props = {
    transaction: PoolTransactionResponse;
}

export function TransactionsListCard({ transaction }: Props): JSX.Element {
    const intl = useIntl()

    const swapPoolStore = useSwapPoolStoreContext()

    const tokens = React.useMemo(() => transaction.currencyAddresses.map((address, idx) => {
        const token = swapPoolStore.tokensCache.get(address)
        return {
            address,
            amount: transaction.volumes[idx],
            decimals: swapPoolStore.customTokensDecimals?.[address] || token?.decimals,
            icon: token?.icon,
            symbol: token?.symbol ?? transaction.currencies[idx],
        }
    }), [swapPoolStore.customTokensDecimals])

    return (
        <div className="list__card">
            <div className="list-bill">
                <div className="list-bill__row" style={{ alignItems: 'flex-start' }}>
                    <div className="list-bill__info">
                        <AccountExplorerLink address={transaction.userAddress}>
                            {sliceAddress(transaction.userAddress)}
                        </AccountExplorerLink>
                        &nbsp;
                        &nbsp;
                        <div
                            className={classNames('label', {
                                'label--danger': transaction.eventType === PoolTransactionEventType.Withdraw,
                                'label--success': transaction.eventType === PoolTransactionEventType.Deposit,
                            })}
                        >
                            {intl.formatMessage({
                                id: `POOL_TRANSACTION_EVENT_${transaction.eventType}`.toUpperCase(),
                            })}
                        </div>
                    </div>
                    <div className="list-bill__val text-bold">
                        {`$${formattedAmount(transaction.tv)}`}
                    </div>
                </div>
                <Observer>
                    {() => {
                        switch (true) {
                            case swapPoolStore.isSyncingCustomTokens:
                                return (
                                    <div className={styles.tokens_cell__token_placeholder}>
                                        <PlaceholderBase circle width={24} />
                                        <PlaceholderBase width={80} />
                                    </div>
                                )

                            case transaction.eventType === PoolTransactionEventType.Swap: {
                                const [from, to] = tokens
                                return (
                                    <>
                                        <div
                                            className="list-bill__row"
                                            style={{ alignItems: 'flex-start' }}
                                        >
                                            <div className="list-bill__info">
                                                {intl.formatMessage({
                                                    id: 'POOL_TRANSACTIONS_LIST_HEADER_SPENT_TOKEN_CELL',
                                                })}
                                            </div>
                                            <div
                                                className="list-bill__val"
                                                style={{ height: 'auto' }}
                                            >
                                                <TokenAmountBadge
                                                    address={from.address}
                                                    amount={formattedTokenAmount(
                                                        from.amount,
                                                        from.decimals,
                                                    )}
                                                    icon={from.icon}
                                                    size="xsmall"
                                                    symbol={from.symbol}
                                                />
                                            </div>
                                        </div>
                                        <div
                                            className="list-bill__row"
                                            style={{ alignItems: 'flex-start' }}
                                        >
                                            <div className="list-bill__info">
                                                {intl.formatMessage({
                                                    id: 'POOL_TRANSACTIONS_LIST_HEADER_RECEIVED_TOKEN_CELL',
                                                })}
                                            </div>
                                            <div
                                                className="list-bill__val"
                                                style={{ height: 'auto' }}
                                            >
                                                <TokenAmountBadge
                                                    address={to.address}
                                                    amount={formattedTokenAmount(
                                                        to.amount,
                                                        to.decimals,
                                                    )}
                                                    icon={to.icon}
                                                    size="xsmall"
                                                    symbol={to.symbol}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )
                            }

                            default:
                                return (
                                    <div className="list-bill__row" style={{ alignItems: 'flex-start' }}>
                                        <div className="list-bill__info">
                                            {intl.formatMessage({
                                                id: 'POOL_TRANSACTIONS_LIST_HEADER_TOKENS_CELL',
                                            })}
                                        </div>
                                        <div
                                            className="list-bill__val"
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: 8,
                                                height: 'auto',
                                            }}
                                        >
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
                                    </div>
                                )
                        }
                    }}
                </Observer>
                <div className="list-bill__row" style={{ alignItems: 'flex-start' }}>
                    <div className="list-bill__info">
                        {intl.formatMessage({ id: 'POOL_TRANSACTIONS_LIST_HEADER_DATE_CELL' })}
                    </div>
                    <div className="list-bill__val">
                        <TransactionExplorerLink id={transaction.transactionHash}>
                            {DateTime.fromSeconds(transaction.timestampBlock, {
                                locale: intl.locale,
                            }).toRelative()}
                        </TransactionExplorerLink>
                    </div>
                </div>
            </div>
        </div>
    )
}
