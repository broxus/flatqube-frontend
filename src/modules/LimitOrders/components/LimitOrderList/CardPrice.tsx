import * as React from 'react'
import { useIntl } from 'react-intl'
import { Observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { SwapDirection } from '@/modules/Swap/types'
import { formattedTokenAmount } from '@/utils'
import { Token } from '@/misc'
import { calcRate, calcSwapDirection } from '@/modules/LimitOrders/utils'
import { useP2POrderListStoreContext } from '@/modules/LimitOrders/context/P2POrderListStoreContext'

import './index.scss'

type Props = {
    leftToken?: Token;
    rightToken?: Token;
    leftAmount?: string;
    rightAmount?: string;
}

export function CardPrice({
    leftToken,
    rightToken,
    leftAmount,
    rightAmount,
}: Props): JSX.Element {
    const intl = useIntl()
    const p2pOrderList = useP2POrderListStoreContext()

    if (leftToken === undefined || rightToken === undefined || leftAmount === undefined || rightAmount === undefined) {
        return <> </>
    }
    return (
        <>
            <Button
                size="xs"
                className="order-rate__reverse-btn"
                onClick={p2pOrderList.toggleRateDirection}
            >
                <Icon icon="reverseHorizontal" />
            </Button>
            <Observer>
                {() => {
                    const direction = calcSwapDirection(
                        p2pOrderList.leftToken?.root === leftToken?.root,
                        p2pOrderList.rateDirection,
                    ) === SwapDirection.LTR
                    const rate = formattedTokenAmount(calcRate(
                        direction ? rightAmount : leftAmount,
                        direction ? rightToken?.decimals : leftToken?.decimals,
                        direction ? leftAmount : rightAmount,
                        direction ? leftToken.decimals : rightToken?.decimals,
                    ).toFixed())

                    return (
                        <span
                            style={({
                                textAlign: 'left',
                                whiteSpace: 'normal',
                            })}
                            key="rate-toggle"
                            dangerouslySetInnerHTML={{
                                __html: intl.formatMessage({
                                    id: 'P2P_PRICE_RESULT',
                                }, {
                                    leftSymbol: direction ? rightToken.symbol : leftToken.symbol,
                                    rightSymbol: direction ? leftToken.symbol : rightToken.symbol,
                                    value: rate,
                                }, {
                                    ignoreTag: true,
                                }),
                            }}
                        />
                    )
                }}
            </Observer>
        </>
    )
}
