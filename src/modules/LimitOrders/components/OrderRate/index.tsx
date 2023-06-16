import * as React from 'react'
import { useIntl } from 'react-intl'
// import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { SwapDirection } from '@/modules/Swap/types'
import { formattedAmount } from '@/utils'
import { Token } from '@/misc'
import { calcRate } from '@/modules/LimitOrders/utils'
// import { useP2PStoreContext } from '@/modules/LimitOrders/context/P2PStoreContext'
import { WalletNativeCoin } from '@/stores/WalletService'

import './index.scss'

type Props = {
    leftToken?: Token | WalletNativeCoin;
    rightToken?: Token | WalletNativeCoin;
    leftAmount?: string;
    rightAmount?: string;
    small?: boolean;
    inverse?: boolean;
    rateDirection?: SwapDirection;
    toggleRateDirection: () => void;
}

export function OrderRate({
    leftToken,
    rightToken,
    leftAmount,
    rightAmount,
    small,
    inverse,
    rateDirection,
    toggleRateDirection,
}: Props): JSX.Element {
    const intl = useIntl()
    // const p2p = useP2PStoreContext()

    if (leftToken === undefined || rightToken === undefined || leftAmount === undefined || rightAmount === undefined) {
        return <> </>
    }
    const smallStyles: React.CSSProperties | undefined = small
        ? {
            textAlign: 'left',
            whiteSpace: 'normal',
        }
        : undefined
    // const { rateDirection } = p2p
    const targetDirection = inverse ? SwapDirection.RTL : SwapDirection.LTR
    const direction = (rateDirection === targetDirection)
    const rate = formattedAmount(calcRate(
        direction ? leftAmount : rightAmount,
        direction ? leftToken.decimals : rightToken?.decimals,
        direction ? rightAmount : leftAmount,
        direction ? rightToken?.decimals : leftToken?.decimals,
    ).toFixed())
    return (
        <div className="order-rate">
            <span
                style={smallStyles}
                key="rate-toggle"
                dangerouslySetInnerHTML={{
                    __html: intl.formatMessage({
                        id: 'P2P_PRICE_RESULT',
                    }, {
                        leftSymbol: direction ? leftToken.symbol : rightToken.symbol,
                        rightSymbol: direction ? rightToken.symbol : leftToken.symbol,
                        value: rate === 'NaN' ? '-' : rate,
                    }, {
                        ignoreTag: true,
                    }),
                }}
            />
            <Button
                size="xs"
                className="order-rate__reverse-btn"
                onClick={toggleRateDirection}
            >
                <Icon icon="reverseHorizontal" />
            </Button>
        </div>
    )
}
