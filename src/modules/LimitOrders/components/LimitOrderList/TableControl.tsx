import React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { BuySellSwitch, OrderViewMode } from '@/modules/LimitOrders/types'
import { Checkbox } from '@/components/common/Checkbox'
import { Tabs } from '@/components/common/Tabs'

type Props = {
    toggleOrderView: OrderViewMode,
    setOnlyMyOrders: (isOnlyMyOrders: boolean) => void,
    onlyMyOrders: boolean,
    setIsBuyOrSell: (isBuyOrSell: BuySellSwitch) => void,
    isBuyOrSell: BuySellSwitch,
    isWalletConected: boolean,
}
function TableControl({
    toggleOrderView,
    onlyMyOrders,
    setOnlyMyOrders,
    isBuyOrSell = BuySellSwitch.BUY,
    setIsBuyOrSell,
    isWalletConected,
}: Props): JSX.Element {
    const intl = useIntl()
    const tabsItems = [{
        active: isBuyOrSell === BuySellSwitch.BUY,
        // itemClassName: isBuyOrSell === BuySellSwitch.BUY ? 'limit-order-list__header-toggle-buy-sell-active' : '',
        label: intl.formatMessage({
            id: 'ORDER_LIST_HEADER_BUY_CELL',
        }),
        onClick: () => setIsBuyOrSell(BuySellSwitch.BUY),
    }, {
        active: isBuyOrSell === BuySellSwitch.SELL,
        // itemClassName: isBuyOrSell === BuySellSwitch.SELL ? 'limit-order-list__header-toggle-buy-sell-active' : '',
        label: intl.formatMessage({
            id: 'ORDER_LIST_HEADER_SELL_CELL',
        }),
        onClick: () => setIsBuyOrSell(BuySellSwitch.SELL),
    }]
    if (toggleOrderView === OrderViewMode.ORDERS_HISTORY) {
        tabsItems.unshift({
            active: isBuyOrSell === BuySellSwitch.ALL,
            // itemClassName: isBuyOrSell === BuySellSwitch.ALL ? 'limit-order-list__header-toggle-buy-sell-active' : '',
            label: intl.formatMessage({
                id: 'ORDER_LIST_HEADER_ALL_CELL',
            }),
            onClick: () => setIsBuyOrSell(BuySellSwitch.ALL),
        })
    }
    return (
        <div className={classNames('limit-order-list__header-flex-end')}>

            {toggleOrderView === OrderViewMode.ORDERS_HISTORY && isWalletConected
                && (
                    <Checkbox
                        checked={onlyMyOrders}
                        onChange={val => setOnlyMyOrders(val)}
                        label={intl.formatMessage({
                            id: 'P2P_LIMIT_ORDER_LIST_FILTER_ONLY_MY_TRADES',
                        })}
                    />
                )}

            {toggleOrderView !== OrderViewMode.MY_OPEN_ORDERS
                && (
                    <Tabs
                        size="s"
                        type="card"
                        items={tabsItems}
                    />
                )}
        </div>
    )
}

export default TableControl
