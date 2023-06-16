import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    LimitOrderList, LimitOrderCloseConfirmPopup, LimitOrderCancelConfirmPopup,
} from '@/modules/LimitOrders/components'
import { OrderViewMode } from '@/modules/LimitOrders/types'
import { useP2POrderListStoreContext } from '@/modules/LimitOrders/context/P2POrderListStoreContext'

import './index.scss'

export function LimitOrderListWrap(): JSX.Element {
    const intl = useIntl()
    const p2pOrderList = useP2POrderListStoreContext()
    return (
        <>
            <div className="limit__content">
                <Observer>
                    {() => (
                        <div className="limit__content">
                            {p2pOrderList.wallet.isConnected && (
                                <section className="section">
                                    <LimitOrderList
                                        viewMode={OrderViewMode.MY_OPEN_ORDERS}
                                        title={intl.formatMessage({ id: 'P2P_LIMIT_ORDER_LIST_FILTER_MY_OPEN_ORDERS' })}
                                    />
                                </section>
                            )}
                            <section className="section">
                                <LimitOrderList
                                    viewMode={OrderViewMode.OPEN_ORDERS}
                                    title={intl.formatMessage({ id: 'P2P_LIMIT_ORDER_LIST_FILTER_OPEN_ORDERS' })}
                                />
                            </section>
                            <section className="section">
                                <LimitOrderList
                                    viewMode={OrderViewMode.ORDERS_HISTORY}
                                    title={intl.formatMessage({ id: 'P2P_LIMIT_ORDER_LIST_FILTER_ORDERS_HISTORY' })}
                                />
                            </section>
                        </div>
                    )}
                </Observer>
            </div>
            <Observer>
                {() => (p2pOrderList.isCloseConfirmationAwait ? (
                    <LimitOrderCloseConfirmPopup key="isCloseConfirmationAwait" />
                ) : null
                )}
            </Observer>
            <Observer>
                {() => (p2pOrderList.isCancelConfirmationAwait ? (
                    <LimitOrderCancelConfirmPopup key="isCloseConfirmationAwait" />
                ) : null
                )}
            </Observer>
        </>
    )
}
