import BigNumber from 'bignumber.js'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { TokenIcon } from '@/components/common/TokenIcon'
import { appRoutes } from '@/routes'
import { PoolContent } from '@/modules/Pools/hooks/usePoolContent'
import { formattedTokenAmount } from '@/utils'
import { Placeholder } from '@/components/common/Placeholder'

type Props = {
    poolContent: PoolContent
}

export function TotalBalance({
    poolContent,
}: Props): JSX.Element {
    const intl = useIntl()
    const {
        pool,
        totalLp,
        totalLeft,
        totalRight,
        leftToken,
        rightToken,
        totalShare,
    } = poolContent

    return (
        <div className="card card--small card--flat">
            <div className="balance balance_theme_white">
                <h4 className="balance__title">
                    {intl.formatMessage({
                        id: 'POOLS_LIST_TOTAL_BALANCE_TITLE',
                    })}
                </h4>

                <div className="balance-rows">
                    <div className="balance-section">
                        <h5 className="balance-section__title">
                            {intl.formatMessage({
                                id: 'POOLS_LIST_TOTAL_BALANCE_AMOUNT',
                            }, {
                                name: pool?.lp.symbol,
                            })}
                        </h5>
                        <div className="balance-section__content">
                            <div className="balance-amount">
                                {pool ? (
                                    formattedTokenAmount(totalLp, pool.lp.decimals)
                                ) : (
                                    <Placeholder width={200} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="balance-cols">
                        <div className="balance-section">
                            <h5 className="balance-section__title">
                                {intl.formatMessage({
                                    id: 'POOLS_LIST_TOTAL_APPORTIONMENT',
                                })}
                            </h5>
                            <div className="balance-section__content">
                                <div className="balance__token">
                                    {!leftToken || !totalLeft ? (
                                        <Placeholder width={120} />
                                    ) : (
                                        <>
                                            <TokenIcon
                                                address={leftToken?.root || pool?.left.address}
                                                size="xsmall"
                                                icon={leftToken?.icon}
                                            />
                                            {intl.formatMessage({
                                                id: 'POOLS_LIST_TOKEN_BALANCE',
                                            }, {
                                                value: formattedTokenAmount(totalLeft),
                                                symbol: leftToken?.symbol,
                                            })}
                                        </>
                                    )}
                                </div>


                                <div className="balance__token">
                                    {!rightToken || !totalRight ? (
                                        <Placeholder width={120} />
                                    ) : (
                                        <>
                                            <TokenIcon
                                                address={rightToken?.root || pool?.right.address}
                                                size="xsmall"
                                                icon={rightToken?.icon}
                                            />
                                            {intl.formatMessage({
                                                id: 'POOLS_LIST_TOKEN_BALANCE',
                                            }, {
                                                value: formattedTokenAmount(totalRight),
                                                symbol: rightToken?.symbol,
                                            })}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="balance-section">
                        <h5 className="balance-section__title">
                            {intl.formatMessage({
                                id: 'POOLS_LIST_TOTAL_SHARE_TITLE',
                            })}
                        </h5>
                        {totalShare === undefined ? (
                            <Placeholder width={80} />
                        ) : (
                            <div className="balance-section__content">
                                {intl.formatMessage({
                                    id: 'POOLS_LIST_TOTAL_SHARE',
                                }, {
                                    value: totalShare,
                                })}
                            </div>
                        )}
                    </div>

                    <div className="balance-buttons balance-buttons_inline">
                        {pool?.lp.inWallet && new BigNumber(pool.lp.inWallet).isGreaterThan(0) && (
                            <Button
                                size="md"
                                type="empty"
                                className="btn-with-icon"
                                link={appRoutes.poolRemoveLiquidity.makeUrl({
                                    leftTokenRoot: leftToken?.root || pool.left.address,
                                    rightTokenRoot: rightToken?.root || pool.right.address,
                                })}
                            >
                                {intl.formatMessage({ id: 'POOLS_LIST_BURN_BUTTON' })}
                            </Button>
                        )}

                        <Button
                            size="md"
                            type="primary"
                            disabled={!leftToken && !pool}
                            link={leftToken || pool ? appRoutes.poolCreate.makeUrl({
                                leftTokenRoot: leftToken?.root || pool?.left.address,
                                rightTokenRoot: rightToken?.root || pool?.right.address,
                            }) : undefined}
                        >
                            {intl.formatMessage({ id: 'POOLS_LIST_ADD_BUTTON' })}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
