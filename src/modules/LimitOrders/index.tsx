import * as React from 'react'
import { IReactionDisposer, reaction } from 'mobx'

import { LimitOrderForm } from '@/modules/LimitOrders/components'
import { USDTRootAddress, WEVERRootAddress } from '@/config'
import { SwapBanner } from '@/modules/Swap/components'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useWallet } from '@/stores/WalletService'
import { P2PGraphStoreProvider } from '@/modules/LimitOrders/context/P2PGraphStoreContext'
import { useP2PNotificationCallbacks } from '@/modules/LimitOrders/hooks/useP2PNotificationCallbacks'
import { Token } from '@/misc'
import { LimitGraphWrap } from '@/modules/LimitOrders/graph'
import { P2PFormStoreProvider } from '@/modules/LimitOrders/context/P2PFormStoreContext'
import { LimitOrderListWrap } from '@/modules/LimitOrders/order-list'
import { P2PGraphStore } from '@/modules/LimitOrders/stores/P2PGraphStore'
import { P2PFormStore } from '@/modules/LimitOrders/stores/P2PFormStore'
import { P2POrderListStoreProvider } from '@/modules/LimitOrders/context/P2POrderListStoreContext'
import { P2POrderListStore } from '@/modules/LimitOrders/stores/P2POrderListStore'
import { debug } from '@/utils'

import './index.scss'


export function Limit(): JSX.Element {
    const tokenCache = useTokensCache()
    const wallet = useWallet()
    const callbacks = useP2PNotificationCallbacks()

    const graphStore = React.useRef<P2PGraphStore>()
    const formStore = React.useRef<P2PFormStore>()
    const orderListStore = React.useRef<P2POrderListStore>()

    const tokensChangeDisposerGraph = React.useRef<IReactionDisposer>()
    const tokensChangeDisposerOrderList = React.useRef<IReactionDisposer>()
    const initDisposerGraph = React.useRef<IReactionDisposer>()
    const initDisposerOrderList = React.useRef<IReactionDisposer>()
    const rateDirectionDisposerForm = React.useRef<IReactionDisposer>()
    const rateDirectionDisposerOrderList = React.useRef<IReactionDisposer>()
    const lastUpdateDisposerOrderList = React.useRef<IReactionDisposer>()
    const lastUpdateDisposerForm = React.useRef<IReactionDisposer>()
    const isShowChartModalDisposerForm = React.useRef<IReactionDisposer>()
    const isShowChartModalDisposerGraph = React.useRef<IReactionDisposer>()

    React.useEffect(() => () => {
        tokensChangeDisposerGraph.current?.()
        tokensChangeDisposerOrderList.current?.()
        rateDirectionDisposerForm.current?.()
        rateDirectionDisposerOrderList.current?.()
        lastUpdateDisposerOrderList.current?.()
        lastUpdateDisposerForm.current?.()
        isShowChartModalDisposerForm.current?.()
        isShowChartModalDisposerGraph.current?.()
        initDisposerGraph.current?.()
        initDisposerOrderList.current?.()
        graphStore.current?.dispose?.()
        formStore.current?.dispose?.()
        orderListStore.current?.dispose?.()
    }, [])

    const beforeInitP2PForm = async (store: P2PFormStore): Promise<void> => {
        formStore.current = store
        initDisposerGraph.current = reaction(
            () => store.isInitialized,
            async isInitialized => {
                if (isInitialized) {
                    debug('+++ isInitialized reaction', orderListStore.current, graphStore.current)
                    await graphStore.current?.init()
                    graphStore.current?.setData({
                        leftToken: store.leftToken?.root,
                        rightToken: store.rightToken?.root,
                    })
                }
            },
            { delay: 50, fireImmediately: true },
        )
        tokensChangeDisposerGraph.current = reaction(
            () => [store.leftToken, store.rightToken],
            async (
                [leftToken, rightToken]: (Token | undefined)[],
                [prevLeftToken, prevRightToken]: (Token | undefined)[],
            ) => {
                if (!leftToken || !rightToken) return
                graphStore.current?.setData({ leftToken: leftToken.root, rightToken: rightToken.root })
                orderListStore.current?.setData({ leftToken: leftToken.root, rightToken: rightToken.root })
                if (leftToken.root !== prevLeftToken?.root || rightToken.root !== prevRightToken?.root) {
                    if (graphStore.current?.graph === 'ohlcv') {
                        graphStore.current?.changeGraphData('ohlcv', null)
                        await graphStore.current?.loadOhlcvGraph()
                    }
                    else {
                        await graphStore.current?.loadDepthGraph()
                    }
                }
            },
        )
        rateDirectionDisposerForm.current = reaction(
            () => store.rateDirection,
            rateDirection => {
                orderListStore.current?.setState('rateDirection', rateDirection)
            },
            // Delay uses here for debounce calls
            {
                delay: 50,
                equals: (
                    rateDirection,
                    prevRateDirection,
                ) => (
                    rateDirection === prevRateDirection
                ),
                fireImmediately: true,
            },
        )
        lastUpdateDisposerForm.current = reaction(
            () => store.lastUpdate,
            async () => {
                if (graphStore.current?.graph === 'ohlcv') {
                    graphStore.current?.changeGraphData('ohlcv', null)
                    graphStore.current?.loadOhlcvGraph()
                }
                else {
                    graphStore.current?.loadDepthGraph()
                }
            },
            // Delay uses here for debounce calls
            {
                delay: 50,
                equals: (
                    lastUpdate,
                    prevLastUpdate,
                ) => (
                    lastUpdate?.toMillis() === prevLastUpdate?.toMillis()
                ),
                fireImmediately: true,
            },
        )
        isShowChartModalDisposerForm.current = reaction(
            () => store.isShowChartModal,
            async isShowChartModal => {
                graphStore.current?.setState('isShowChartModal', isShowChartModal)
            },
            {
                delay: 50,
                equals: (
                    isShowChartModal,
                    prevIsShowChartModal,
                ) => (
                    isShowChartModal === prevIsShowChartModal
                ),
                fireImmediately: true,
            },
        )

    }

    return (
        <>
            <SwapBanner />
            <div className="limit__container">
                <P2PGraphStoreProvider
                    tokensCache={tokenCache}
                    wallet={wallet}
                    defaultLeftTokenAddress={WEVERRootAddress.toString()}
                    defaultRightTokenAddress={USDTRootAddress.toString()}
                    beforeInit={async store => {
                        graphStore.current = store
                        isShowChartModalDisposerGraph.current = reaction(
                            () => store.isShowChartModal,
                            async isShowChartModal => {
                                formStore.current?.setState('isShowChartModal', isShowChartModal)
                            },
                            {
                                delay: 50,
                                equals: (
                                    isShowChartModal,
                                    prevIsShowChartModal,
                                ) => (
                                    isShowChartModal === prevIsShowChartModal
                                ),
                                fireImmediately: true,
                            },
                        )
                    }}
                >
                    <LimitGraphWrap />
                </P2PGraphStoreProvider>
                <P2PFormStoreProvider
                    tokensCache={tokenCache}
                    wallet={wallet}
                    defaultLeftTokenAddress={WEVERRootAddress.toString()}
                    defaultRightTokenAddress={USDTRootAddress.toString()}
                    {...callbacks}
                    beforeInit={beforeInitP2PForm}
                >
                    <div className="limit__sidebar">
                        <div className="card limit-card">
                            <div className="card__wrap">
                                <LimitOrderForm />
                            </div>
                        </div>
                    </div>
                </P2PFormStoreProvider>
            </div>
            <P2POrderListStoreProvider
                tokensCache={tokenCache}
                wallet={wallet}
                defaultLeftTokenAddress={WEVERRootAddress.toString()}
                defaultRightTokenAddress={USDTRootAddress.toString()}
                beforeInit={async store => {
                    orderListStore.current = store
                    initDisposerOrderList.current = reaction(
                        () => formStore.current?.isInitialized,
                        async isInitialized => {
                            if (isInitialized) {
                                debug('+++ isInitialized reaction', orderListStore.current)
                                await orderListStore.current?.init()
                                orderListStore.current?.setData({
                                    leftToken: store.leftToken?.root,
                                    rightToken: store.rightToken?.root,
                                })
                            }
                        },
                        { delay: 50, fireImmediately: true },
                    )
                    tokensChangeDisposerOrderList.current = reaction(
                        () => [formStore.current?.leftToken, formStore.current?.rightToken],
                        (
                            [leftToken, rightToken]: (Token | undefined)[],
                        ) => {
                            if (!leftToken || !rightToken) return
                            orderListStore.current?.setData({ leftToken: leftToken.root, rightToken: rightToken.root })
                        },
                    )
                    rateDirectionDisposerOrderList.current = reaction(
                        () => store.rateDirection,
                        rateDirection => {
                            formStore.current?.setState('rateDirection', rateDirection)
                        },
                        // Delay uses here for debounce calls
                        {
                            delay: 50,
                            equals: (
                                rateDirection,
                                prevRateDirection,
                            ) => (
                                rateDirection === prevRateDirection
                            ),
                            fireImmediately: true,
                        },
                    )
                    lastUpdateDisposerOrderList.current = reaction(
                        () => formStore.current?.lastUpdate,
                        lastUpdate => {
                            debug('lastUpdate', lastUpdate?.toMillis())
                            store.loadLimitOrderList()
                        },
                        // Delay uses here for debounce calls
                        {
                            delay: 50,
                            equals: (
                                lastUpdate,
                                prevLastUpdate,
                            ) => (
                                lastUpdate?.toMillis() === prevLastUpdate?.toMillis()
                            ),
                            fireImmediately: true,
                        },
                    )
                }}
                {...callbacks}
            >
                <LimitOrderListWrap />
            </P2POrderListStoreProvider>
        </>
    )
}
