import * as React from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icon } from '@/components/common/Icon'
import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'
import { usePoolRelatedGaugesStoreContext } from '@/modules/Pools/context/PoolRelatedGaugesStoreProvider'
import { usePoolStoreContext } from '@/modules/Pools/context/PoolStoreProvider'
import { abbrNumber, formattedAmount, formattedTokenAmount } from '@/utils'
import { Placeholder } from '@/components/common/Placeholder'

import styles from './index.module.scss'

export function TotalBalance(): JSX.Element {
    const intl = useIntl()

    const poolStore = usePoolStoreContext()
    const relatedGaugesStore = usePoolRelatedGaugesStoreContext()

    return (
        <Observer>
            {() => {
                const isFetchingPrices = poolStore.isFetchingPrices === undefined || poolStore.isFetchingPrices
                const isSyncingLpToken = poolStore.isSyncingLpToken === undefined || poolStore.isSyncingLpToken
                const isSyncingUserData = poolStore.isSyncingUserData === undefined || poolStore.isSyncingUserData
                const isSyncingCustomTokens = (
                    poolStore.isSyncingCustomTokens === undefined
                    || poolStore.isSyncingCustomTokens
                )
                const [totalLpBalance, totalLpBalanceAbbr] = abbrNumber(
                    new BigNumber(relatedGaugesStore.totalLpBalance ?? 0)
                        .shiftedBy(-(poolStore.lpToken?.decimals ?? 0))
                        .toFixed(),
                )
                return (
                    <div className={classNames('card card--flat', styles.balances__card)}>
                        <header className={classNames('card__header', styles.balances__header)}>
                            {intl.formatMessage({ id: 'POOL_USER_STATS_TOTAL_BALANCE_TITLE' })}
                        </header>

                        <div className={classNames(styles.balances__usd_equivalent_price)}>
                            {(isSyncingUserData || isFetchingPrices) ? (
                                <Placeholder height={28} width={100} />
                            ) : `$${formattedAmount(relatedGaugesStore.totalUsdBalance)}`}
                        </div>

                        <div className={styles.balances__list}>
                            {(isSyncingLpToken || isSyncingCustomTokens || isSyncingUserData)
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
                                            token.totalBalance,
                                            token.decimals,
                                        )}
                                        icon={token.icon}
                                        size="xsmall"
                                        symbol={token.symbol}
                                    />
                                ))}
                        </div>

                        <div className={styles.balances__list}>
                            {(isSyncingLpToken || isSyncingUserData) ? (
                                <Placeholder height={22} width={180} />
                            ) : (
                                <TokenAmountBadge
                                    address={poolStore.lpToken?.root}
                                    amount={`${formattedTokenAmount(totalLpBalance, undefined, {
                                        precision: 2,
                                        roundOn: false,
                                    })}${totalLpBalanceAbbr}`}
                                    icon={poolStore.lpToken?.icon}
                                    size="xsmall"
                                    symbol={poolStore.lpToken?.symbol}
                                />
                            )}
                        </div>

                        <div className={styles.balances__list}>
                            {(isSyncingLpToken || isSyncingUserData) ? (
                                <Placeholder height={22} width={180} />
                            ) : (
                                <div className="token_amount_badge">
                                    <div className="token_amount_badge__icon">
                                        <Icon icon="share" />
                                    </div>
                                    <div className="token_amount_badge__label">
                                        {intl.formatMessage(
                                            { id: 'POOL_USER_STATS_SHARE_VALUE_HINT' },
                                            { value: formattedAmount(poolStore.userShare) },
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }}
        </Observer>
    )
}
