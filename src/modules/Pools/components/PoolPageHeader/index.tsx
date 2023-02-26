import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import Media from 'react-media'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { Button } from '@/components/common/Button'
import { PageHeader } from '@/components/common/PageHeader'
import { Placeholder } from '@/components/common/Placeholder'
import { FaveButton, PoolRates, PoolTokensBadge } from '@/modules/Pools/components/PoolsCommon'
import { usePoolStoreContext } from '@/modules/Pools/context'
import { appRoutes } from '@/routes'
import { formattedTokenAmount, sliceAddress } from '@/utils'
import { CopyToClipboard } from '@/components/common/CopyToClipboard'

import styles from './index.module.scss'

export function PoolPageHeader(): JSX.Element {
    const intl = useIntl()

    const poolStore = usePoolStoreContext()

    return (
        <Observer>
            {() => {
                const isFetching = poolStore.isFetching === undefined || poolStore.isFetching
                const isSyncingCustomTokens = (
                    poolStore.isSyncingCustomTokens === undefined
                    || poolStore.isSyncingCustomTokens
                )

                return (
                    <PageHeader
                        actions={isFetching ? null : [
                            <Media key="fave" query={{ minWidth: 640 }}>
                                {matches => (matches
                                    ? <FaveButton poolAddress={poolStore.address.toString()} />
                                    : null)}
                            </Media>,
                            <Button
                                key="add-liquidity"
                                link={poolStore.isNPool ? appRoutes.poolAddLiquidity.makeUrl({
                                    address: poolStore.address,
                                }) : appRoutes.liquidityAdd.makeUrl({
                                    leftTokenRoot: poolStore.tokens[0].address,
                                    rightTokenRoot: poolStore.tokens[1].address,
                                })}
                                type="secondary"
                            >
                                {intl.formatMessage({ id: 'POOL_ACTIONS_ADD_LIQUIDITY_LINK_TEXT' })}
                            </Button>,
                            <Button
                                key="remove-liquidity"
                                link={poolStore.isNPool ? appRoutes.poolRemoveLiquidity.makeUrl({
                                    address: poolStore.address,
                                }) : appRoutes.liquidityRemove.makeUrl({
                                    leftTokenRoot: poolStore.tokens[0].address,
                                    rightTokenRoot: poolStore.tokens[1].address,
                                })}
                                type="secondary"
                            >
                                {intl.formatMessage({ id: 'POOL_ACTIONS_REMOVE_LIQUIDITY_LINK_TEXT' })}
                            </Button>,
                            <Button
                                key="trade"
                                link={poolStore.isNPool ? appRoutes.swap.makeUrl({
                                    leftTokenRoot: 'combined',
                                    rightTokenRoot: poolStore.pool?.meta.lpAddress,
                                }) : appRoutes.swap.makeUrl({
                                    leftTokenRoot: poolStore.tokens[0].address,
                                    rightTokenRoot: poolStore.tokens[1].address,
                                })}
                                type="primary"
                            >
                                {intl.formatMessage({ id: 'POOL_ACTIONS_TRADE_LINK_TEXT' })}
                            </Button>,
                        ]}
                        breadcrumb={isFetching ? [{
                            title: <Placeholder width={150} />,
                        }] : [{
                            link: appRoutes.pools.makeUrl(),
                            title: intl.formatMessage({ id: 'POOL_BREADCRUMB_ROOT' }),
                        }, {
                            title: (
                                <>
                                    {intl.formatMessage({ id: 'POOL_BREADCRUMB_POOL_ITEM' }, {
                                        label: poolStore.tokens.map(({ symbol }) => symbol).join('/'),
                                    })}
                                    &nbsp;
                                    &nbsp;
                                    <AccountExplorerLink
                                        address={poolStore.address}
                                        className="text-muted"
                                    >
                                        {sliceAddress(poolStore.address)}
                                    </AccountExplorerLink>
                                    <CopyToClipboard text={poolStore.address} />
                                </>
                            ),
                        }]}
                        className={styles.pool_header}
                        subtitle={(
                            <div className={styles.pool_header__tokens_prices}>
                                {(isFetching || isSyncingCustomTokens)
                                    ? (
                                        <>
                                            <Placeholder height={36} width={200} />
                                            <Placeholder height={36} width={200} />
                                        </>
                                    )
                                    : (
                                        <>
                                            {poolStore.tokens.map((token, idx) => (
                                                <PoolRates
                                                    key={token.address}
                                                    tokenIcon={{
                                                        address: token.address,
                                                        icon: token.icon,
                                                        name: token.symbol,
                                                        size: 'xsmall',
                                                    }}
                                                    label={poolStore.isNPool ? intl.formatMessage({
                                                        id: 'POOL_STABLE_TOKEN_PRICE_RATES',
                                                    }, {
                                                        amount: formattedTokenAmount(
                                                            poolStore.pool?.stableOneSwap[idx],
                                                        ),
                                                        symbol: token.symbol,
                                                    }) : intl.formatMessage({
                                                        id: 'POOL_TOKEN_PRICE_RATES',
                                                    }, {
                                                        amount: formattedTokenAmount(
                                                            idx === 0
                                                                ? poolStore.ltrPrice
                                                                : poolStore.rtlPrice,
                                                        ),
                                                        leftSymbol: token.symbol,
                                                        rightSymbol: poolStore.tokens[idx === 0 ? 1 : 0]?.symbol,
                                                    })}
                                                    link={appRoutes.token.makeUrl({ address: token.address })}
                                                />
                                            ))}
                                        </>
                                    )}
                            </div>
                        )}
                        title={(isFetching || isSyncingCustomTokens) ? (
                            <Placeholder height={32} width={120} />
                        ) : (
                            <>
                                <PoolTokensBadge
                                    items={poolStore.tokens}
                                    linkable={false}
                                    poolAddress={poolStore.address}
                                />

                                <Media query={{ maxWidth: 639 }}>
                                    {matches => (matches
                                        ? <FaveButton poolAddress={poolStore.address.toString()} iconRatio={0.8} />
                                        : null)}
                                </Media>
                            </>
                        )}
                    />
                )
            }}
        </Observer>
    )
}
