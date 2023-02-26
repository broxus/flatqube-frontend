import * as React from 'react'
import classNames from 'classnames'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Placeholder } from '@/components/common/Placeholder'
import { TokenIcons } from '@/components/common/TokenIcons'
import { usePoolRelatedGaugesStoreContext } from '@/modules/Pools/context/PoolRelatedGaugesStoreProvider'
import { usePoolStoreContext } from '@/modules/Pools/context/PoolStoreProvider'
import { formattedAmount } from '@/utils'
import { Button } from '@/components/common/Button'
import { appRoutes } from '@/routes'

import styles from './index.module.scss'

export function DepositBanner(): JSX.Element {
    const intl = useIntl()

    const poolStore = usePoolStoreContext()
    const relatedGaugesStore = usePoolRelatedGaugesStoreContext()

    const tokens = React.useMemo(() => poolStore.tokens.slice(0, poolStore.tokens.length - 1), [poolStore.tokens])
    const lastToken = React.useMemo(() => poolStore.tokens.slice().pop(), [poolStore.tokens])

    return (
        <Observer>
            {() => {
                const isFetching = poolStore.isFetching === undefined || poolStore.isFetching
                const isFetchingGauges = relatedGaugesStore.isFetching === undefined || relatedGaugesStore.isFetching
                const isSyncingGauges = relatedGaugesStore.isSyncingGaugesRewards
                return (
                    <div className={classNames('card card--flat', styles.deposit_banner__card)}>
                        <div className={styles.deposit_banner__bg_icons_holder}>
                            {(!isFetching && poolStore.tokens.slice(0, 3)
                                .map((token, idx) => (token.icon !== undefined ? (
                                    <React.Fragment key={token.address}>
                                        <img className={`token_icon_${idx}_1`} src={token.icon} alt={token.symbol} />
                                        <img className={`token_icon_${idx}_2`} src={token.icon} alt={token.symbol} />
                                        <img className={`token_icon_${idx}_3`} src={token.icon} alt={token.symbol} />
                                    </React.Fragment>
                                ) : null)))}
                        </div>

                        <div className={styles.deposit_banner__content_holder}>
                            <div>
                                <header className="card__header">
                                    {isFetching
                                        ? <Placeholder circle width={44} />
                                        : (
                                            <TokenIcons
                                                icons={poolStore.tokens.map(token => ({
                                                    address: token.address,
                                                    icon: token.icon,
                                                }))}
                                                size="large"
                                            />
                                        )}
                                </header>

                                {(isFetching || isFetchingGauges || isSyncingGauges)
                                    ? (
                                        <>
                                            <Placeholder height={32} width={170} />
                                            <Placeholder height={32} width={230} />
                                            <Placeholder height={32} width={280} />
                                        </>
                                    )
                                    : (
                                        <div className={styles.deposit_banner__note}>
                                            {intl.formatMessage(
                                                { id: 'POOL_USER_STATS_DEPOSIT_BANNER_NOTE' },
                                                {
                                                    aprValue: formattedAmount(relatedGaugesStore.maxApr),
                                                    lastSymbol: lastToken?.symbol ?? '',
                                                    symbols: tokens.map(token => token.symbol).join(', '),
                                                },
                                            )}
                                        </div>
                                    )}
                            </div>
                            {isFetching ? (
                                <Placeholder height={44} width="100%" />
                            ) : (
                                <Button
                                    link={poolStore.isNPool
                                        ? appRoutes.poolAddLiquidity.makeUrl({ address: poolStore.address })
                                        : appRoutes.liquidityAdd.makeUrl({
                                            leftTokenRoot: poolStore.tokens[0]?.address,
                                            rightTokenRoot: poolStore.tokens[1]?.address,
                                        })}
                                    size="md"
                                    type="primary"
                                >
                                    {intl.formatMessage({
                                        id: 'POOL_USER_STATS_DEPOSIT_BANNER_DEPOSIT_LINK_TXT',
                                    })}
                                </Button>
                            )}
                        </div>
                    </div>
                )
            }}
        </Observer>
    )
}
