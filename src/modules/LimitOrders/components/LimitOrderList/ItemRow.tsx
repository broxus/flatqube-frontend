/* eslint-disable react/jsx-one-expression-per-line */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer, Observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'
import classNames from 'classnames'

import {
    LimitOrderExchangeItem, LimitOrderItem, OrderViewMode,
} from '@/modules/LimitOrders/types'
import { formattedAmount } from '@/utils'
import { TokenIcon } from '@/components/common/TokenIcon'
import { useP2POrderListStoreContext } from '@/modules/LimitOrders/context/P2POrderListStoreContext'
import { OrderRate } from '@/modules/LimitOrders/components/OrderRate'
import { ActionButton } from '@/modules/LimitOrders/components/LimitOrderList/ActionButton'
import { Token } from '@/misc'
import { RelativeTime } from '@/components/common/RelativeTime'
import { calcSwapDirection } from '@/modules/LimitOrders/utils'

type Props = {
    limitOrder: LimitOrderItem & LimitOrderExchangeItem;
    toggleOrderView: OrderViewMode;
    data: {
        spentToken?: Token;
        receiveToken?: Token;
        formatedSpentAmount: string;
        formatedReceiveAmount: string;
        selectedSpentAmount?: string;
        selectedReceiveAmount?: string;
    }
}

export const ItemRow = observer(({
    data: {
        spentToken,
        receiveToken,
        formatedSpentAmount,
        formatedReceiveAmount,
        selectedSpentAmount,
        selectedReceiveAmount,
    },
    limitOrder,
    limitOrder: {
        createdAt,
        expectedReceiveAmount,
        currentReceiveAmount,
        initialSpentAmount,
        currentSpentAmount,
    },
    toggleOrderView,
}: Props): JSX.Element => {
    const p2pOrderList = useP2POrderListStoreContext()
    const percent = new BigNumber(expectedReceiveAmount || '')
        .minus(new BigNumber(currentReceiveAmount || ''))
        .dividedBy(new BigNumber(expectedReceiveAmount || ''))
        .times(100)
        .dp(2, BigNumber.ROUND_DOWN)
    if (!p2pOrderList.leftToken || !p2pOrderList.rightToken) {
        return <> </>
    }
    const intl = useIntl()
    const left = new BigNumber(expectedReceiveAmount || '')
        .minus(new BigNumber(currentReceiveAmount || ''))
        .dividedBy(new BigNumber(expectedReceiveAmount || ''))
        .times(100)
        .dp(0, BigNumber.ROUND_HALF_DOWN)
        .toFixed()

    return (
        <div className="list__row limit-order-list__item">
            <div className="list__cell list__cell--left">
                <OrderRate
                    key="rate"
                    small
                    inverse
                    leftToken={receiveToken}
                    rightToken={spentToken}
                    leftAmount={selectedReceiveAmount}
                    rightAmount={selectedSpentAmount}
                    rateDirection={calcSwapDirection(
                        p2pOrderList.leftToken?.root === receiveToken?.root,
                        p2pOrderList.rateDirection,
                    )}
                    toggleRateDirection={p2pOrderList.toggleRateDirection}
                />
            </div>
            <div className="list__cell list__cell--left">
                <TokenIcon
                    icon={spentToken?.icon}
                    size="small"
                    address={spentToken?.root}
                    name={spentToken?.symbol}
                />
                {' '}
                {formatedSpentAmount}
                {' '}
                {spentToken?.symbol}
            </div>
            <div className="list__cell list__cell--left">
                <TokenIcon
                    icon={receiveToken?.icon}
                    size="small"
                    address={receiveToken?.root}
                    name={receiveToken?.symbol}
                />
                <span>
                    {' '}
                    {formatedReceiveAmount}
                    {' '}
                    {receiveToken?.symbol}
                </span>
            </div>
            {toggleOrderView === OrderViewMode.MY_OPEN_ORDERS && (
                <div
                    className="list__cell limit-order-list__wrap-words list__cell--right"
                    style={({
                        color: '#4AB44A',
                    })}
                >
                    {' '}
                    {formattedAmount(
                        new BigNumber(initialSpentAmount || '')
                            .minus(new BigNumber(currentSpentAmount || ''))
                            .toFixed(),
                        spentToken?.decimals,
                    )}
                    /
                    {formattedAmount(new BigNumber(initialSpentAmount || '').toFixed(), spentToken?.decimals)}
                    {' '}
                    {spentToken?.symbol}
                    {' '}
                    ({
                        // eslint-disable-next-line no-nested-ternary
                        percent.eq(0) ? '0' : percent.gt(0.01) ? `~${percent.toFixed()}` : '<0.01'
                    }%)
                    <div className="order-progress__bar">
                        <div
                            className="order-progress__progress order-progress__progress_left"
                            style={{
                                width: `${left}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            <div className={classNames('list__cell', 'limit-order-list__cell-right', {
                'limit-order-list__cell-left': toggleOrderView !== OrderViewMode.ORDERS_HISTORY,
                'limit-order-list__cell-right': toggleOrderView === OrderViewMode.ORDERS_HISTORY,
                'list__cell--left': toggleOrderView !== OrderViewMode.ORDERS_HISTORY,
                'list__cell--right': toggleOrderView === OrderViewMode.ORDERS_HISTORY,
                'visible@m': toggleOrderView !== OrderViewMode.ORDERS_HISTORY,
            })}
            >
                {createdAt && (
                    <RelativeTime
                        timestamp={createdAt * 1000}
                        locale={intl.locale}
                    />
                )}
            </div>
            <div className={classNames('list__cell', 'limit-order-list__cell-right')}>
                {toggleOrderView !== OrderViewMode.ORDERS_HISTORY
                    && (
                        <Observer>
                            {() => (
                                <ActionButton limitOrder={limitOrder} />
                            )}
                        </Observer>
                    )}
            </div>
        </div>
    )
})
