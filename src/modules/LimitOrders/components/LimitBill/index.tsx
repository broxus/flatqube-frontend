import * as React from 'react'
import { useIntl } from 'react-intl'
import BigNumber from 'bignumber.js'

import { Icon } from '@/components/common/Icon'
import { TokenCache } from '@/stores/TokensCacheService'
import { WalletNativeCoin } from '@/stores/WalletService'
import { OrderRate } from '@/modules/LimitOrders/components/OrderRate'
import { SwapDirection } from '@/modules/Swap/types'

type Props = {
    fee?: string;
    feePercent?: string;
    leftToken?: TokenCache | WalletNativeCoin;
    rightToken?: TokenCache | WalletNativeCoin;
    leftAmount?: string,
    rightAmount?: string,
    child?: React.ReactElement,
    rateDirection?: SwapDirection,
    toggleRateDirection: () => void,
}

export function LimitBill({
    leftToken,
    rightToken,
    leftAmount,
    rightAmount,
    child,
    rateDirection,
    toggleRateDirection,
    fee,
    feePercent,
}: Props): JSX.Element | null {
    const intl = useIntl()

    if (leftToken === undefined || rightToken === undefined) {
        return null
    }

    return (
        <div className="list-bill">
            <div key="rate" className="list-bill__row">
                <div className="list-bill__info">
                    <span>
                        {intl.formatMessage({
                            id: 'P2P_BILL_LABEL_RATE',
                        })}
                    </span>
                    <span className="list-bill__icn">
                        <Icon icon="info" />
                    </span>
                </div>
                <div
                    className="list-bill__val"
                >
                    <OrderRate
                        leftAmount={new BigNumber(leftAmount ?? '0').shiftedBy(leftToken.decimals ?? 0).toFixed()}
                        leftToken={leftToken}
                        rightAmount={new BigNumber(rightAmount ?? '0').shiftedBy(rightToken.decimals ?? 0).toFixed()}
                        rightToken={rightToken}
                        rateDirection={rateDirection}
                        toggleRateDirection={toggleRateDirection}
                    />
                </div>
            </div>
            {fee && (
                <div key="fee" className="list-bill__row">
                    <div className="list-bill__info">
                        <span>
                            {intl.formatMessage({
                                id: 'SWAP_BILL_LABEL_FEE',
                            })}
                        </span>
                        <span className="list-bill__icn">
                            <Icon icon="info" />
                        </span>
                    </div>
                    <div
                        className="list-bill__val"
                    >
                        {fee}
                    </div>
                </div>
            )}
            {feePercent && (
                <div key="feePercent" className="list-bill__row">
                    <div className="list-bill__info">
                        <span>
                            {intl.formatMessage({
                                id: 'SWAP_BILL_LABEL_FEE_PERCENT',
                            })}
                        </span>
                        <span className="list-bill__icn">
                            <Icon icon="info" />
                        </span>
                    </div>
                    <div
                        className="list-bill__val"
                    >
                        {`${feePercent}%`}
                    </div>
                </div>
            )}
            {child}
        </div>
    )
}
