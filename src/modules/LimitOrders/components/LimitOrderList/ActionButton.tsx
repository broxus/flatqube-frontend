/* eslint-disable react/jsx-one-expression-per-line */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import {
    LimitOrderExchangeItem, LimitOrderItem, LimitOrderState,
} from '@/modules/LimitOrders/types'
import { Button } from '@/components/common/Button'
import { useP2POrderListStoreContext } from '@/modules/LimitOrders/context/P2POrderListStoreContext'
import { Icon } from '@/components/common/Icon'

type Props = {
    limitOrder?: LimitOrderItem & LimitOrderExchangeItem;
}

export const ActionButton = observer(({
    limitOrder,
}: Props): JSX.Element => {
    const p2pOrderList = useP2POrderListStoreContext()
    if (!p2pOrderList.leftToken || !p2pOrderList.rightToken) {
        return <> </>
    }
    const isLimitOrderCanceling = limitOrder !== undefined
        ? p2pOrderList.isLimitOrderCanceling?.get(limitOrder.accountAddr)
        : false
    const isLimitOrderClosing = limitOrder !== undefined
        ? p2pOrderList.isLimitOrderClosing?.get(limitOrder.accountAddr)
        : false
    if (p2pOrderList.isPreparing
        || isLimitOrderCanceling
        || isLimitOrderClosing
        || p2pOrderList.isLoading
        || !p2pOrderList.tokensCache.isReady
        || p2pOrderList.wallet.isInitializing) {
        return (
            <Button
                block
                type="secondary"
                aria-disabled="true"
                disabled
            >
                <Icon icon="loader" className="spin" />
            </Button>
        )
    }

    const intl = useIntl()

    const isMyOrder = limitOrder?.ownerAddress !== undefined
        && p2pOrderList.wallet.address !== undefined
        && limitOrder?.ownerAddress === p2pOrderList.wallet.address
    const checkWalletConnected = async (): Promise<void> => {
        if (!p2pOrderList.wallet.isConnected) {
            await p2pOrderList.wallet.connect()
        }
    }

    return !isMyOrder && limitOrder?.state === LimitOrderState.ACTIVE
        ? (
            <Button
                block
                size="sm"
                className={classNames({
                    'hover-visible-btn': !p2pOrderList.wallet.isConnected,
                })}
                type="secondary"
                onClick={async () => {
                    if (!p2pOrderList.wallet.isConnected) {
                        await checkWalletConnected()
                        return
                    }
                    p2pOrderList.setCurrentLimitOrder(limitOrder)
                    p2pOrderList.setState('isCloseConfirmationAwait', true)
                }}
            >
                {intl.formatMessage({
                    id: p2pOrderList.wallet.isConnected
                        ? 'ORDER_LIST_BUTTON_CLOSE_ORDER'
                        : 'EVER_WALLET_CONNECT_BTN_TEXT',
                })}
            </Button>
        )
        : (
            <Button
                block
                size="sm"
                className={classNames({
                    'hover-visible-btn': !p2pOrderList.wallet.isConnected,
                })}
                disabled={!p2pOrderList.wallet.isConnected}
                type="link"
                style={({ margin: 'auto' })}
                onClick={async () => {
                    if (!p2pOrderList.wallet.isConnected) {
                        await checkWalletConnected()
                        return
                    }
                    p2pOrderList.setCurrentLimitOrder(limitOrder)
                    p2pOrderList.setState('isCancelConfirmationAwait', true)
                }}
            >
                {intl.formatMessage({
                    id: p2pOrderList.wallet.isConnected
                        ? 'ORDER_LIST_BUTTON_CANCEL_ORDER'
                        : 'EVER_WALLET_CONNECT_BTN_TEXT',
                })}
            </Button>
        )
})
