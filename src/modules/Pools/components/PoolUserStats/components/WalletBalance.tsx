import * as React from 'react'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'
import { usePoolStoreContext } from '@/modules/Pools/context/PoolStoreProvider'
import { abbrNumber, formattedAmount, formattedTokenAmount } from '@/utils'
import { Placeholder } from '@/components/common/Placeholder'

import styles from './index.module.scss'

export function WalletBalance(): JSX.Element {
    const intl = useIntl()

    const poolStore = usePoolStoreContext()

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
                const [userLpBalance, userLpBalanceAbbr] = abbrNumber(
                    new BigNumber(poolStore.userLpBalance ?? 0)
                        .shiftedBy(-(poolStore.lpToken?.decimals ?? 0))
                        .toFixed(),
                )
                return (
                    <div className={classNames('card card--flat', styles.balances__card)}>
                        <header className={classNames('card__header', styles.balances__header)}>
                            {intl.formatMessage({ id: 'POOL_USER_STATS_WALLET_BALANCE_TITLE' })}
                        </header>

                        <div className={classNames(styles.balances__usd_equivalent_price)}>
                            {(isSyncingUserData || isFetchingPrices) ? (
                                <Placeholder height={28} width={100} />
                            ) : `$${formattedAmount(poolStore.userUsdBalance)}`}
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
                                : poolStore.tokens.map(token => (
                                    <TokenAmountBadge
                                        key={token.address}
                                        address={token.address}
                                        amount={formattedTokenAmount(token.balance, token.decimals)}
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
                                    amount={`${formattedTokenAmount(userLpBalance, undefined, {
                                        precision: 2,
                                        roundOn: false,
                                    })}${userLpBalanceAbbr}`}
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
