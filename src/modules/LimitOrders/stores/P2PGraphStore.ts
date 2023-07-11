import {
    Address,
} from 'everscale-inpage-provider'
import {
    action,
    computed,
    IReactionDisposer,
    makeObservable,
    override,
    reaction,
} from 'mobx'
import { DateTime } from 'luxon'
import uniqBy from 'lodash.uniqby'
import { SeriesDataItemTypeMap, Time } from 'lightweight-charts'

import {
    DEFAULT_GRAPH_DATA,
} from '@/modules/LimitOrders/constants'
import {
    LimitOrderGraphRequest,
    LimitOrderOrderBookRequest,
    P2PGraphOptions,
    P2PGraphStoreData,
    P2PGraphStoreState,
    P2PPairStoreGraphData,
} from '@/modules/LimitOrders/types'
import { SwapDirection } from '@/modules/Swap/types'
import {
    prepareData,
} from '@/modules/LimitOrders/utils'
import { WalletService } from '@/stores/WalletService'
import { TokensCacheService } from '@/stores/TokensCacheService'
import {
    debug,
} from '@/utils'
import { Timeframe } from '@/modules/Gauges/api/models'
import { LimitOrderApi, useP2pApi } from '@/modules/LimitOrders/hooks/useApi'
import { P2PBaseStore } from '@/modules/LimitOrders/stores/P2PBaseStore'

export class P2PGraphStore extends P2PBaseStore<P2PGraphStoreData, P2PGraphStoreState> {

    protected readonly p2pApi: LimitOrderApi = useP2pApi()

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly options: P2PGraphOptions,
    ) {
        super(tokensCache)

        makeObservable<
            P2PGraphStore,
            | 'handleChangeTokens'
            | 'handleTokensCacheReady'
            | 'handleWalletAccountChange'
            | 'loadOhlcvGraph'
            | 'changeGraphData'
        >(this, {
            changeGraphData: action.bound,
            defaultLeftTokenRoot: computed,
            defaultRightTokenRoot: computed,
            handleChangeTokens: action.bound,
            handleTokensCacheReady: action.bound,
            handleWalletAccountChange: action.bound,
            isBusy: computed,
            isChangingTokens: computed,
            isDepthGraphLoading: computed,
            isFetching: computed,
            isLoading: computed,
            isOhlcvGraphLoading: computed,
            isPreparing: computed,
            isShowChartModal: computed,
            isValidTokens: computed,
            leftBalanceNumber: override,
            loadDepthGraph: action.bound,
            loadOhlcvGraph: action.bound,
            ohlcvGraphData: computed,
            rateDirection: computed,
        })

        this.setData(() => ({
            graphData: DEFAULT_GRAPH_DATA,
        }))

        this.setState(() => ({
            graph: 'depth',
            isPreparing: false,
            rateDirection: SwapDirection.LTR,
            timeframe: 'H1',
        }))
    }

    /**
     * Manually initiate store.
     * Run all necessary subscribers.
     */
    public async init(): Promise<void> {
        debug('debug +++ init this.data P2PGraphStore', this.data)
        this.tokensCacheDisposer?.()
        this.tokensCacheDisposer = reaction(
            () => this.tokensCache.isReady,
            this.handleTokensCacheReady,
            { fireImmediately: true },
        )
        this.timeframeDisposer = reaction(
            () => this.state.timeframe,
            async (timeframe, prevTimeframe) => {
                debug('timeframeDisposer', timeframe)
                if (timeframe !== prevTimeframe) {
                    this.changeGraphData('ohlcv', null)
                    await this.loadOhlcvGraph()
                }
            },
        )
        this.graphTypeDisposer = reaction(
            () => this.state.graph,
            async graphType => {
                debug('graphTypeDisposer', graphType)
                if (graphType === 'ohlcv' && !this.data.graphData.ohlcv) {
                    await this.loadOhlcvGraph()
                }
            },
        )
    }

    /**
     * 
     */
    public get rateDirection(): P2PGraphStoreState['rateDirection'] {
        return this.state.rateDirection
    }

    /**
     * 
     */
    public get isOhlcvGraphLoading(): P2PGraphStoreState['isOhlcvGraphLoading'] {
        return this.state.isOhlcvGraphLoading
    }

    /**
     * 
     */
    public get isDepthGraphLoading(): P2PGraphStoreState['isDepthGraphLoading'] {
        return this.state.isDepthGraphLoading
    }

    /**
     *
     * @param {number} [from]
     * @param {number} [to]
     */
    public async loadOhlcvGraph(fromArg?: number, toArg?: number): Promise<void> {
        debug('loadOhlcvGraph', fromArg, toArg)
        if (this.isOhlcvGraphLoading) {
            return
        }
        if (!this.leftToken || !this.rightToken) {
            this.setState('isOhlcvGraphLoading', false)
            return
        }
        const from = fromArg || DateTime.local().minus({
            days: this.timeframe === 'D1' ? 30 : 7,
        }).toUTC(undefined, {
            keepLocalTime: false,
        }).toMillis()
        const to = toArg || DateTime.local().toUTC(undefined, {
            keepLocalTime: false,
        }).toMillis()
        try {
            this.setState('isOhlcvGraphLoading', true)
            const body: LimitOrderGraphRequest = {
                fromTs: Math.round(from / 1000),
                leftTokenRoot: this.leftToken!.root,
                rightTokenRoot: this.rightToken!.root,
                step: this.timeframe === Timeframe.D1 ? 3600 * 24 : 3600,
                toTs: Math.round(to / 1000),
            }
            debug(
                'fromTs',
                DateTime.fromSeconds(body.fromTs).toFormat('dd.MM.yyyy HH:mm:ss'),
                'toTs',
                DateTime.fromSeconds(body.toTs).toFormat('dd.MM.yyyy HH:mm:ss'),
            )
            const result = await this.p2pApi.limitOrderGraph({}, {
                body: JSON.stringify(body),
            })

            const data = result.concat(this.graphData?.ohlcv ?? [])
            this.changeGraphData('ohlcv', data.length ? data : null)
        }
        catch (e) {
            this.changeGraphData('ohlcv', null)
        }
        finally {
            if (this.isOhlcvGraphLoading) {
                this.setState('isOhlcvGraphLoading', false)
            }
        }
    }

    /**
     *
     */
    public async loadDepthGraph(): Promise<void> {

        if (this.isDepthGraphLoading
            || !this.leftToken?.decimals
            || !this.rightToken?.decimals
            || !this.leftToken?.symbol
            || !this.rightToken?.symbol
            || !this.tokensCache.isReady
        ) {
            return
        }

        try {
            this.setState('isDepthGraphLoading', true)
            const body: LimitOrderOrderBookRequest = {
                leftTokenRoot: this?.leftToken!.root,
                rightTokenRoot: this?.rightToken!.root,
            }
            const result = await this?.p2pApi.limitOrderDepth({}, {
                body: JSON.stringify(body),
            })
            const data = prepareData(result, this.leftToken, this.rightToken)
            this.changeGraphData('depth', data.length ? data : null)
        }
        catch (e) {
            debug('loadDepthGraph err', e)
            this.changeGraphData('depth', null)
        }
        finally {
            this.setState('isDepthGraphLoading', false)
        }
    }

    /**
     *
     */
    public get timeframe(): P2PGraphStoreState['timeframe'] {
        return this.state.timeframe
    }

    /**
     *
     */
    public get graphData(): P2PGraphStoreData['graphData'] {
        return this.data.graphData
    }

    /**
     *
     */
    public get graph(): P2PGraphStoreState['graph'] {
        return this.state.graph
    }

    /**
     *
     */
    public get ohlcvGraphData(): SeriesDataItemTypeMap['Candlestick'][] {
        return uniqBy(this.graphData?.ohlcv, 'timestamp').map<SeriesDataItemTypeMap['Candlestick']>(item => ({
            close: parseFloat(item.close),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            open: parseFloat(item.open),
            time: item.timestamp as Time,
            timed: DateTime.fromSeconds(item.timestamp).toRelative(),
        }))
    }


    public changeGraphData<K extends keyof P2PPairStoreGraphData>(key: K, value: P2PPairStoreGraphData[K]): void {
        this.data.graphData[key] = value
    }

    /**
     * Manually dispose all the internal subscribers.
     * Clean last transaction result, intervals
     * and reset all data to their defaults.
     */
    public async dispose(): Promise<void> {
        this.formDataDisposer?.()
        this.tokensChangeDisposer?.()
        this.tokensCacheDisposer?.()
        this.walletAccountDisposer?.()
        this.timeframeDisposer?.()
        this.graphTypeDisposer?.()
        this.reset()
    }

    /**
     * Full refresh limit page
     * @protected
     */
    protected async refresh(): Promise<void> {
        debug('refresh loadLimitOrderList')
        switch (this.state.graph) {
            case 'ohlcv':
                await this.changeGraphData('ohlcv', null)
                await this.loadOhlcvGraph()
                break
            case 'depth':
                await this.loadDepthGraph()
                break
            default:
                break
        }
    }

    /**
     * Full reset P2P
     * instances to their default.
     * @protected
     */
    protected reset(): void {
        this.setData({
            graphData: DEFAULT_GRAPH_DATA,
            leftAmount: '',
            rightAmount: '',
        })
        if (this.isOhlcvGraphLoading) {
            this.setState('isOhlcvGraphLoading', false)
        }
    }

    /*
     * Memoized store data and state values
     * ----------------------------------------------------------------------------------
     */


    /**
     * @returns {P2PGraphStoreState['isShowChartModal']}
     */
    public get isShowChartModal(): P2PGraphStoreState['isShowChartModal'] {
        return this.state.isShowChartModal
    }

    /**
     * Returns memoized state of changing tokens
     * @returns {P2PGraphStoreState['isChangingTokens']}
     */
    public get isChangingTokens(): P2PGraphStoreState['isChangingTokens'] {
        return this.state.isChangingTokens
    }

    /**
     * Returns memoized preparing state value
     * @returns {P2PGraphStoreState['isPreparing']}
     */
    public get isPreparing(): P2PGraphStoreState['isPreparing'] {
        return this.state.isPreparing
    }


    public get isFetching(): P2PGraphStoreState['isFetching'] {
        return this.state.isFetching
    }

    /*
     * Computed values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns memoized default left token root address
     * @returns {string}
     */
    public get defaultLeftTokenRoot(): string | undefined {
        return this.options?.defaultLeftTokenAddress?.toString()
    }

    /**
     * Returns memoized default right token root address
     * @returns {string}
     */
    public get defaultRightTokenRoot(): string | undefined {
        return this.options?.defaultRightTokenAddress?.toString()
    }

    /**
     * Returns combined `isLoading` state from direct swap, cross-pair swap.
     * @returns {boolean}
     */
    public get isLoading(): boolean {
        return this.tokensCache.isFetching
    }

    /**
     * Returns combined `isBusy` state 
     * @returns {boolean}
     */
    public get isBusy(): boolean {
        return this.isPreparing
            || this.isLoading
            || !this.tokensCache.isReady
    }

    /**
     * Returns combined `isValidTokens` state 
     * @returns {boolean}
     */
    public get isValidTokens(): boolean {
        return this.state.isValidTokens
    }


    /*
     * Internal and external utilities methods
     * ----------------------------------------------------------------------------------
     */

    /**
     * Invalidate partial data of the internal stores
     */
    public forceInvalidate(): void {
        debug('+++ forceInvalidate')
        this.reset()
        this.setData('graphData', DEFAULT_GRAPH_DATA)
    }

    /*
     * Reactions handlers
     * ----------------------------------------------------------------------------------
     */

    /**
     *
     * @param {string} leftToken
     * @param {string} rightToken
     * @param {string} prevLeftToken
     * @param {string} prevRightToken
     * @protected
     */
    protected async handleChangeTokens(
        [leftToken, rightToken]: (string | undefined)[] = [],
        [prevLeftToken, prevRightToken]: (string | undefined)[] = [],
    ): Promise<void> {
        if (!this.tokensCache.isReady) {
            return
        }
        this.setState('isValidTokens', this.leftToken !== undefined && this.rightToken !== undefined)
        await Promise.all([
            (prevLeftToken !== undefined && ![leftToken, rightToken].includes(prevLeftToken))
                ? this.tokensCache.unwatch(prevLeftToken, 'p2p-graph')
                : undefined,
            (prevRightToken !== undefined && ![leftToken, rightToken].includes(prevRightToken))
                ? this.tokensCache.unwatch(prevRightToken, 'p2p-graph')
                : undefined,
        ])
        Promise.all([
            this.state.graph === 'ohlcv'
                ? new Promise(() => {
                    this.changeGraphData('ohlcv', null)
                }).then(() => this.loadOhlcvGraph())
                : this.loadDepthGraph(),
        ])
        if (this.wallet?.address !== undefined) {
            debug('handleChangeTokens loadLimitOrderList')

            await Promise.all([
                (leftToken !== undefined && ![prevLeftToken, prevRightToken, rightToken].includes(leftToken))
                    ? this.tokensCache.watch(this.leftToken?.root, 'p2p-graph')
                    : undefined,
                (rightToken !== undefined && ![prevLeftToken, prevRightToken, leftToken].includes(rightToken))
                    ? this.tokensCache.watch(this.rightToken?.root, 'p2p-graph')
                    : undefined,
            ])
            if (this.state.graph === 'ohlcv') {
                await this.changeGraphData('ohlcv', null)
                await this.loadOhlcvGraph()
            }
            else {
                await this.loadDepthGraph()
            }
        }
    }

    /**
     *
     * @param {boolean} isReady
     * @protected
     */
    protected async handleTokensCacheReady(isReady: boolean): Promise<void> {
        if (!isReady) {
            return
        }
        this.setState('isPreparing', this.wallet.isInitializing || this.wallet.isConnecting)
        if (this.data.leftToken !== undefined && this.data.rightToken !== undefined) {
            this.walletAccountDisposer?.()
            this.walletAccountDisposer = reaction(
                () => this.wallet.account?.address,
                this.handleWalletAccountChange,
                {
                    equals: (address, prevAddress) => (
                        address !== undefined
                        && address.toString().toLowerCase() !== prevAddress?.toString().toLowerCase()
                    ),
                    fireImmediately: true,
                },
            )
        }
        else if (this.data.leftToken === undefined && this.data.rightToken === undefined) {
            this.setData({
                leftToken: this.options.defaultLeftTokenAddress?.toString(),
                rightToken: this.options.defaultRightTokenAddress?.toString(),
            })

            this.walletAccountDisposer?.()
            this.walletAccountDisposer = reaction(
                () => this.wallet.account?.address,
                this.handleWalletAccountChange,
                {
                    delay: 50,
                    equals: (address, prevAddress) => (
                        address !== undefined
                        && address.toString().toLowerCase() !== prevAddress?.toString().toLowerCase()
                    ),
                    fireImmediately: true,
                },
            )
        }

        this.tokensChangeDisposer = reaction(
            () => [this.data.leftToken, this.data.rightToken],
            this.handleChangeTokens,
            // Delay uses here for debounce calls
            {
                delay: 50,
                equals: (
                    [leftToken, rightToken],
                    [prevLeftToken, prevRightToken],
                ) => (
                    (leftToken === prevRightToken && rightToken === prevLeftToken)
                    || (leftToken === prevLeftToken && rightToken === prevRightToken)
                ),
                fireImmediately: true,
            },
        )
    }

    /**
     * Handle wallet account change.
     * @param {Address} [address]
     * @protected
     */
    protected async handleWalletAccountChange(address?: Address): Promise<void> {
        if (address === undefined) {
            this.tokensCache.tokens.forEach(token => {
                this.tokensCache.update(token.root, 'balance', undefined)
                this.tokensCache.update(token.root, 'wallet', undefined)
            })
            return
        }
        this.setState('isPreparing', this.tokensCache.isFetching)
        if (this.state.graph === 'ohlcv') {
            await this.changeGraphData('ohlcv', null)
            this.loadOhlcvGraph()
        }
        else {
            this.loadDepthGraph()
        }
        await Promise.all([
            this.leftToken?.root && this.tokensCache.syncToken(this.leftToken.root, true),
            this.rightToken?.root && this.tokensCache.syncToken(this.rightToken.root, true),
        ])
        await Promise.all([
            this.leftToken?.root && this.tokensCache.watch(this.leftToken.root, 'p2p-graph'),
            this.rightToken?.root && this.tokensCache.watch(this.rightToken.root, 'p2p-graph'),
        ])
    }


    /*
     * Internal reaction disposers
     * ----------------------------------------------------------------------------------
     */

    protected formDataDisposer: IReactionDisposer | undefined

    protected tokensChangeDisposer: IReactionDisposer | undefined

    protected tokensCacheDisposer: IReactionDisposer | undefined

    protected walletAccountDisposer: IReactionDisposer | undefined

    protected timeframeDisposer: IReactionDisposer | undefined

    protected graphTypeDisposer: IReactionDisposer | undefined

}
