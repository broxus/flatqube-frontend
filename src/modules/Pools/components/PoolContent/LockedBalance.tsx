import * as React from 'react'
import { useIntl } from 'react-intl'

import { TokenIcon } from '@/components/common/TokenIcon'
import { formattedTokenAmount } from '@/utils'
import { Placeholder } from '@/components/common/Placeholder'
import { PoolContent } from '@/modules/Pools/hooks/usePoolContent'

type Props = {
    poolContent: PoolContent
}

export function LockedBalance({
    poolContent,
}: Props): JSX.Element {
    const intl = useIntl()
    const {
        pool,
        lockedLp,
        lockedLeft,
        lockedRight,
        leftToken,
        rightToken,
    } = poolContent

    return (
        <div className="card card--small card--flat">
            <div className="balance">
                <h4 className="balance__title">
                    {intl.formatMessage({
                        id: 'POOLS_LIST_LOCKED_FARM',
                    })}
                </h4>

                <div className="balance-rows">
                    <div className="balance-section">
                        <h5 className="balance-section__title">
                            {intl.formatMessage({
                                id: 'POOLS_LIST_AMOUNT',
                            }, {
                                name: pool?.lp.symbol,
                            })}
                        </h5>
                        <div className="balance-section__content">
                            <div className="balance-amount">
                                {pool ? (
                                    formattedTokenAmount(lockedLp, pool.lp.decimals, {
                                        preserve: true,
                                    })
                                ) : (
                                    <Placeholder width={200} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="balance-section">
                        <h5 className="balance-section__title">
                            {intl.formatMessage({
                                id: 'POOLS_LIST_APPORTIONMENT',
                            })}
                        </h5>
                        <div className="balance-section__content">
                            <div className="balance__token">
                                {!leftToken ? (
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
                                            value: formattedTokenAmount(lockedLeft),
                                            symbol: leftToken?.symbol,
                                        })}
                                    </>
                                )}
                            </div>
                            <div className="balance__token">
                                {!rightToken ? (
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
                                            value: formattedTokenAmount(lockedRight),
                                            symbol: rightToken?.symbol,
                                        })}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
