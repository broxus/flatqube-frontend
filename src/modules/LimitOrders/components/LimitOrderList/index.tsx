import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import { reaction } from 'mobx'
import classNames from 'classnames'
import Media from 'react-media'

import { Breakpoints, Item } from '@/modules/LimitOrders/components/LimitOrderList/Item'
import { Pagination, PaginationProps } from '@/components/common/Pagination'
import { PanelLoader } from '@/components/common/PanelLoader'
import { useP2POrderListStoreContext } from '@/modules/LimitOrders/context/P2POrderListStoreContext'
import { EmptyList } from '@/modules/LimitOrders/components/LimitOrderList/EmptyList'
import TableControl from '@/modules/LimitOrders/components/LimitOrderList/TableControl'
import { BuySellSwitch, OrderViewMode } from '@/modules/LimitOrders/types'
import { OrderListPlaceholder } from '@/modules/LimitOrders/components/LimitOrderList/OrderListPlaceholder'
import { useP2PNotifyStore } from '@/stores/P2PNotifyStore'
import { useP2PNotificationCallbacks } from '@/modules/LimitOrders/hooks/useP2PNotificationCallbacks'
import { SectionTitle } from '@/components/common/SectionTitle'

import './index.scss'

const breakpoints: Breakpoints = {
    xsmall: 480, // Phone portrait
    // eslint-disable-next-line sort-keys
    small: 640, // Phone landscape
    // eslint-disable-next-line sort-keys
    medium: 960, // Tablet Landscape
    // eslint-disable-next-line sort-keys
    large: 1200, // Desktop
    xlarge: 1600, // Large Screens
}
type Props = {
    noContentNote?: React.ReactNode;
    viewMode: OrderViewMode;
    title: string;
}

const defineIsEmpty = (
    validTokens: boolean,
    notEmpty: boolean,
): boolean => {
    if (validTokens === undefined) return false
    if (!validTokens) return true
    return !notEmpty
}
function LimitOrderListComponent({
    noContentNote, viewMode = OrderViewMode.OPEN_ORDERS, title,
}: Props): JSX.Element {
    const intl = useIntl()
    const p2pOrderList = useP2POrderListStoreContext()
    const limitOrdersFilter = p2pOrderList.limitOrdersFilter[viewMode]
    const [itemsPerPage] = React.useState(limitOrdersFilter?.take ?? 10)
    const [onlyMyOrders, setOnlyMyOrders] = React.useState(limitOrdersFilter?.onlyMyOrders ?? false)
    const defaultBuyOrSell = viewMode === OrderViewMode.ORDERS_HISTORY
        ? BuySellSwitch.ALL
        : BuySellSwitch.BUY
    const [isBuyOrSell, setIsBuyOrSell] = React.useState<BuySellSwitch>(limitOrdersFilter?.isBuyOrSell === undefined
        ? defaultBuyOrSell
        : limitOrdersFilter?.isBuyOrSell)
    const limitOrdersData = p2pOrderList.limitOrdersData[viewMode]
    const totalPages = Math.ceil(limitOrdersData.total / itemsPerPage)
    const currentPage = limitOrdersData.skip ? (limitOrdersData.skip / itemsPerPage) + 1 : 1

    const onNext = (): void => {
        const skip = currentPage ? (currentPage) * itemsPerPage : 0
        p2pOrderList.setLimitOrdersFilter(viewMode, {
            isBuyOrSell,
            onlyMyOrders,
            skip,
            take: itemsPerPage,
        })
    }

    const onPrev = (): void => {
        const skip = limitOrdersData.skip ? limitOrdersData.skip - itemsPerPage : 0
        p2pOrderList.setLimitOrdersFilter(viewMode, {
            isBuyOrSell,
            onlyMyOrders,
            skip,
            take: itemsPerPage,
        })
    }

    const onSubmit = (value: number): void => {
        const skip = value ? (value - 1) * itemsPerPage : 0
        p2pOrderList.setLimitOrdersFilter(viewMode, {
            isBuyOrSell,
            onlyMyOrders,
            skip,
            take: itemsPerPage,
        })
    }

    const pagination: PaginationProps = {
        currentPage,
        onNext,
        onPrev,
        onSubmit,
        totalPages,
    }

    React.useEffect(() => {
        const skip = 0
        p2pOrderList.setLimitOrdersFilter(viewMode, {
            isBuyOrSell,
            onlyMyOrders,
            skip,
            take: itemsPerPage,
        })
    }, [viewMode, onlyMyOrders, isBuyOrSell])

    const isPlaceHolderVisible = (p2pOrderList.isPreparing
        || p2pOrderList.isLoading
        || !p2pOrderList.tokensCache.isReady
        || p2pOrderList.wallet.isInitializing)
        && p2pOrderList.isValidTokens
    // debug(
    //     '+++isPlaceHolderVisible',
    //     isPlaceHolderVisible,
    //     p2pOrderList.isPreparing,
    //     p2pOrderList.isLoading,
    //     !p2pOrderList.tokensCache.isReady,
    //     p2pOrderList.wallet.isInitializing,
    //     p2pOrderList.isValidTokens,
    //     p2pOrderList.isValidTokens,
    //     `-${OrderViewMode[viewMode]}`,
    //     p2pOrderList.isLimitOrderListLoading[viewMode],
    // )

    const p2pNotifyCallbacks = useP2PNotificationCallbacks()
    const globalP2PNotify = useP2PNotifyStore(p2pNotifyCallbacks)
    React.useEffect(() => reaction(
        () => globalP2PNotify.lastNotifyTransactionId,
        async (lastNotifyTransactionId, prevLastNotifyTransactionId) => {
            if (!lastNotifyTransactionId || lastNotifyTransactionId === prevLastNotifyTransactionId) {
                return
            }
            p2pOrderList.loadLimitOrderList()
        },
    ), [])

    const isEmptyList = defineIsEmpty(
        p2pOrderList.isValidTokens,
        p2pOrderList.limitOrdersData[viewMode].items.length > 0,
    )
    // debug('isEmptyList', viewMode, isEmptyList, p2p.isValidTokens, p2p.limitOrdersData[viewMode].items)
    return (
        <>
            <SectionTitle size="small">
                <header className="section__header">
                    <div>
                        {title}
                    </div>
                    <TableControl
                        toggleOrderView={viewMode}
                        onlyMyOrders={onlyMyOrders}
                        setOnlyMyOrders={setOnlyMyOrders}
                        isBuyOrSell={isBuyOrSell}
                        setIsBuyOrSell={setIsBuyOrSell}
                        isWalletConected={p2pOrderList.wallet.isConnected}
                    />
                </header>
            </SectionTitle>

            <div className="card card--small card--flat">
                <Media
                    queries={{
                        xsmall: `(min-width: ${breakpoints.xsmall}px)`,
                        // eslint-disable-next-line sort-keys
                        small: `(min-width: ${breakpoints.small}px)`,
                        // eslint-disable-next-line sort-keys
                        medium: `(min-width: ${breakpoints.medium}px)`,
                        // eslint-disable-next-line sort-keys
                        large: `(min-width: ${breakpoints.large}px)`,
                        // eslint-disable-next-line sort-keys
                        xlarge: `(min-width: ${breakpoints.xlarge}px)`,
                    }}
                >
                    {matches => (

                        <div className={classNames('limit-order-list list', {
                            'one-extra-column': viewMode === OrderViewMode.OPEN_ORDERS,
                            'two-extra-column': viewMode === OrderViewMode.MY_OPEN_ORDERS,
                        })}
                        >
                            {matches.medium
                                && p2pOrderList.limitOrdersData[viewMode].items.length > 0 && (
                                <div className="list__header">
                                    <div className="list__cell list__cell--left">
                                        {intl.formatMessage({
                                            id: 'ORDER_LIST_HEADER_RATE_CELL',
                                        })}
                                    </div>
                                    <div className="list__cell list__cell--left">
                                        {intl.formatMessage({
                                            id: 'ORDER_LIST_HEADER_SELL_CELL',
                                        })}
                                    </div>
                                    <div className="list__cell list__cell--left">
                                        {intl.formatMessage({
                                            id: 'ORDER_LIST_HEADER_BUY_CELL',
                                        })}
                                    </div>
                                    {viewMode === OrderViewMode.MY_OPEN_ORDERS && matches.medium && (
                                        <div className="list__cell list__cell--left">
                                            {intl.formatMessage({
                                                id: 'ORDER_LIST_HEADER_FILL_PROCENT',
                                            })}
                                        </div>
                                    )}
                                    <div className={classNames('list__cell', 'visible@l', {
                                        'list__cell--left': viewMode !== OrderViewMode.ORDERS_HISTORY,
                                        'list__cell--right': viewMode === OrderViewMode.ORDERS_HISTORY,
                                    })}
                                    >
                                        {intl.formatMessage({
                                            id: viewMode === OrderViewMode.ORDERS_HISTORY
                                                ? 'ORDER_LIST_HEADER_DATE'
                                                : 'ORDER_LIST_HEADER_CREATED',
                                        })}
                                    </div>
                                </div>
                            )}
                            {(isPlaceHolderVisible === undefined
                                || isPlaceHolderVisible)
                                && (
                                    <div className={classNames('limit-order-list list', {
                                        'one-extra-column': viewMode === OrderViewMode.OPEN_ORDERS,
                                        'two-extra-column': viewMode === OrderViewMode.MY_OPEN_ORDERS,
                                    })}
                                    >
                                        <OrderListPlaceholder toggleOrderView={viewMode} />
                                    </div>
                                )}

                            {(!isPlaceHolderVisible
                                && p2pOrderList.limitOrdersData[viewMode].items.length > 0)
                                && (
                                    <PanelLoader
                                        loading={p2pOrderList.isLimitOrderListLoading[viewMode] === undefined
                                            || p2pOrderList.isLimitOrderListLoading[viewMode]}
                                    >
                                        {p2pOrderList.limitOrdersData[viewMode].items.map(limitOrderItem => (
                                            <Item
                                                breakpoints={matches}
                                                key={Object.values(limitOrderItem).join('-')}
                                                limitOrder={limitOrderItem}
                                                toggleOrderView={viewMode}
                                            />
                                        ))}
                                    </PanelLoader>
                                )}

                            {isEmptyList
                                && (
                                    <EmptyList
                                        noContentNote={noContentNote}
                                    />
                                )}
                        </div>
                    )}
                </Media>
                {pagination && pagination.totalPages > 1 && (
                    <Pagination {...(pagination || {})} />
                )}
            </div>
        </>
    )
}

export const LimitOrderList = observer(LimitOrderListComponent)
