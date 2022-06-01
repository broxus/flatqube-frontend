import * as React from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { Icon } from '@/components/common/Icon'
import { Placeholder } from '@/components/common/Placeholder'
import { PairRates } from '@/components/common/PairRates'
import { TogglePoolButton } from '@/modules/Pools/components/TogglePoolButton'
import { PoolContent } from '@/modules/Pools/hooks/usePoolContent'
import { formattedTokenAmount } from '@/utils'
import { appRoutes } from '@/routes'

type Props = {
    poolContent: PoolContent
}

export function PoolToolbar({
    poolContent,
}: Props): JSX.Element {
    const intl = useIntl()
    const params = useParams<any>()
    const {
        pool,
        priceLeftToRight,
        priceRightToLeft,
        leftToken,
        rightToken,
    } = poolContent

    return (
        <div className="pools-toolbar">
            <div className="pools-pair-buttons">
                {!pool ? (
                    <>
                        <Placeholder width={160} height={36} />
                        <Placeholder width={160} height={36} />
                    </>
                ) : (
                    <>
                        <PairRates
                            link={appRoutes.tokenItem.makeUrl({
                                address: pool.left.address,
                            })}
                            label={intl.formatMessage({
                                id: 'PAIR_TOKEN_PRICE',
                            }, {
                                amount: formattedTokenAmount(
                                    priceLeftToRight,
                                    rightToken?.decimals,
                                ),
                                symbolLeft: leftToken?.symbol,
                                symbolRight: rightToken?.symbol,
                            })}
                            tokenIcon={{
                                address: leftToken?.root || pool.left.address,
                                icon: leftToken?.icon,
                            }}
                        />
                        <PairRates
                            link={appRoutes.tokenItem.makeUrl({
                                address: pool.right.address,
                            })}
                            label={intl.formatMessage({
                                id: 'PAIR_TOKEN_PRICE',
                            }, {
                                amount: formattedTokenAmount(
                                    priceRightToLeft,
                                    leftToken?.decimals,
                                ),
                                symbolLeft: rightToken?.symbol,
                                symbolRight: leftToken?.symbol,
                            })}
                            tokenIcon={{
                                address: rightToken?.root || pool.right.address,
                                icon: rightToken?.icon,
                            }}
                        />
                    </>
                )}
            </div>

            {(params.address || pool?.address) && (
                <div>
                    <TogglePoolButton
                        poolAddress={params.address || pool?.address}
                        leftSymbol={leftToken?.symbol}
                        rightSymbol={rightToken?.symbol}
                    />

                    <AccountExplorerLink
                        address={params.address || pool?.address}
                        className="btn btn-md btn-square btn-icon"
                    >
                        <Icon icon="externalLink" />
                    </AccountExplorerLink>
                </div>
            )}
        </div>
    )
}
