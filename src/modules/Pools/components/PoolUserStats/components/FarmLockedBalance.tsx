import * as React from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Placeholder } from '@/components/common/Placeholder'
import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'
import { usePoolRelatedGaugesStoreContext } from '@/modules/Pools/context/PoolRelatedGaugesStoreProvider'
import { usePoolStoreContext } from '@/modules/Pools/context/PoolStoreProvider'
import { abbrNumber, formattedAmount, formattedTokenAmount } from '@/utils'

import styles from './index.module.scss'

export function FarmLockedBalance(): JSX.Element {
    const intl = useIntl()

    const poolStore = usePoolStoreContext()
    const relatedGaugesStore = usePoolRelatedGaugesStoreContext()

    return (
        <Observer>
            {() => {
                const isFetchingPrices = poolStore.isFetchingPrices === undefined || poolStore.isFetchingPrices
                const isSyncingLpToken = poolStore.isSyncingLpToken === undefined || poolStore.isSyncingLpToken
                const isFetching = relatedGaugesStore.isFetching === undefined || relatedGaugesStore.isFetching
                const isSyncingCustomTokens = (
                    poolStore.isSyncingCustomTokens === undefined
                    || poolStore.isSyncingCustomTokens
                )
                const isSyncingGauges = relatedGaugesStore.isSyncingGaugesRewards
                const [scoredLpBalance, scoredLpBalanceAbbr] = abbrNumber(
                    new BigNumber(relatedGaugesStore.scoredLpBalance ?? 0)
                        .shiftedBy(-(poolStore.lpToken?.decimals ?? 0))
                        .toFixed(),
                )
                return (
                    <div className={classNames('card card--flat', styles.balances__card)}>
                        <header className={classNames('card__header', styles.balances__header)}>
                            {intl.formatMessage({ id: 'POOL_USER_STATS_FARM_LOCKED_BALANCE_TITLE' })}
                        </header>

                        <div className={classNames(styles.balances__usd_equivalent_price)}>
                            {(isFetching || isSyncingGauges || isFetchingPrices || isSyncingLpToken) ? (
                                <Placeholder height={28} width={100} />
                            ) : `$${formattedAmount(relatedGaugesStore.scoredUsdBalance)}`}
                        </div>

                        <div className={styles.balances__list}>
                            {(isFetching || isSyncingLpToken || isSyncingCustomTokens || isSyncingGauges)
                                ? (
                                    <>
                                        {poolStore.isNPool ? (
                                            <Placeholder height={20} width={100} />
                                        ) : null}
                                        <Placeholder height={20} width={100} />
                                        <Placeholder height={20} width={100} />
                                    </>
                                )
                                : relatedGaugesStore.tokens.map(token => (
                                    <TokenAmountBadge
                                        key={token.address}
                                        address={token.address}
                                        amount={formattedTokenAmount(
                                            token.balance,
                                            token.decimals,
                                        )}
                                        icon={token.icon}
                                        size="xsmall"
                                        symbol={token.symbol}
                                    />
                                ))}
                        </div>

                        <div className={styles.balances__list}>
                            {(isFetching || isSyncingLpToken || isSyncingGauges) ? (
                                <Placeholder height={22} width={180} />
                            ) : (
                                <TokenAmountBadge
                                    address={poolStore.lpToken?.root}
                                    amount={`${formattedTokenAmount(scoredLpBalance, undefined, {
                                        precision: 2,
                                        roundOn: false,
                                    })}${scoredLpBalanceAbbr}`}
                                    icon={poolStore.lpToken?.icon}
                                    size="xsmall"
                                    symbol={poolStore.lpToken?.symbol}
                                />
                            )}
                        </div>
                    </div>
                )
            }}
        </Observer>
    )
}
