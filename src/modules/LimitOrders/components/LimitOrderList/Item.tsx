/* eslint-disable react/jsx-one-expression-per-line */
import * as React from 'react'
import { observer } from 'mobx-react-lite'

import {
    LimitOrderExchangeItem, LimitOrderItem, OrderViewMode,
} from '@/modules/LimitOrders/types'
import { formattedTokenAmount } from '@/utils'
import { useP2POrderListStoreContext } from '@/modules/LimitOrders/context/P2POrderListStoreContext'
import { ItemRow } from '@/modules/LimitOrders/components/LimitOrderList/ItemRow'
import { ItemCard } from '@/modules/LimitOrders/components/LimitOrderList/ItemCard'

export type Breakpoints = {
    xsmall: number, // Phone portrait
    // eslint-disable-next-line sort-keys
    small: number, // Phone landscape
    // eslint-disable-next-line sort-keys
    medium: number, // Tablet Landscape
    // eslint-disable-next-line sort-keys
    large: number, // Desktop
    xlarge: number, // Large Screens
}

type Matches = {
    xsmall: boolean, // Phone portrait
    // eslint-disable-next-line sort-keys
    small: boolean, // Phone landscape
    // eslint-disable-next-line sort-keys
    medium: boolean, // Tablet Landscape
    // eslint-disable-next-line sort-keys
    large: boolean, // Desktop
    // eslint-disable-next-line sort-keys
    xlarge: boolean, // Large Screens
}

type Props = {
    limitOrder?: LimitOrderItem & LimitOrderExchangeItem;
    toggleOrderView: OrderViewMode;
    breakpoints: Matches;
}

const formatAmount = (val?: string, decimals?: number): string => (val
    ? formattedTokenAmount(val, decimals)
    : '-')

export const Item = observer(({
    limitOrder,
    toggleOrderView,
    breakpoints,
}: Props): JSX.Element => {
    const p2pOrderList = useP2POrderListStoreContext()
    if (!p2pOrderList.leftToken || !p2pOrderList.rightToken || !limitOrder) {
        return <> </>
    }
    const {
        currentReceiveAmount,
        receiveAmount,
        receiveTokenRoot,
        currentSpentAmount,
        spentAmount,
        spentTokenRoot,
    } = limitOrder
    const spentToken = p2pOrderList.tokensCache.get(spentTokenRoot)
    const receiveToken = p2pOrderList.tokensCache.get(receiveTokenRoot)


    const selectedSpentAmount = toggleOrderView !== OrderViewMode.ORDERS_HISTORY
        ? currentSpentAmount
        : spentAmount
    const selectedReceiveAmount = toggleOrderView !== OrderViewMode.ORDERS_HISTORY
        ? currentReceiveAmount
        : receiveAmount
    const formatedSpentAmount = formatAmount(selectedSpentAmount, spentToken?.decimals)
    const formatedReceiveAmount = formatAmount(selectedReceiveAmount, receiveToken?.decimals)
    return breakpoints.medium
        ? (
            <ItemRow
                data={({
                    formatedReceiveAmount,
                    formatedSpentAmount,
                    receiveToken,
                    selectedReceiveAmount,
                    selectedSpentAmount,
                    spentToken,
                })}
                limitOrder={limitOrder}
                toggleOrderView={toggleOrderView}
            />
        )
        : (
            <ItemCard
                data={({
                    formatedReceiveAmount,
                    formatedSpentAmount,
                    receiveToken,
                    selectedReceiveAmount,
                    selectedSpentAmount,
                    spentToken,
                })}
                limitOrder={limitOrder}
                toggleOrderView={toggleOrderView}
            />
        )
})
