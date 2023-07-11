import {
    action,
    computed,
    IReactionDisposer,
    makeObservable,
    reaction,
} from 'mobx'
import { DateTime } from 'luxon'
import uniqBy from 'lodash.uniqby'
import { Time } from 'lightweight-charts'

import {
    DEFAULT_GRAPH_DATA,
} from '@/modules/LimitOrders/constants'
import {
    P2PPairStoreGraphData,
    PairGraphRequest,
} from '@/modules/LimitOrders/types'
import {
    debug,
} from '@/utils'
import { CandlestickGraphShape, OhlcvGraphModel } from '@/modules/Chart/types'
// import { useRpc } from '@/hooks/useRpc'
import { Timeframe } from '@/modules/Gauges/api/models'
import { BaseStore } from '@/stores/BaseStore'
import { Token } from '@/misc'
import { SwapApi, useSwapApi } from '@/modules/Swap/hooks/useApi'

export interface PoolAddressesData {
    address: string;
    left: string;
    right: string;
}
export interface SwapGraphStoreData {
    graphData: P2PPairStoreGraphData;
    leftToken?: Token;
    rightToken?: Token;
    poolData: PoolAddressesData;
}

export interface SwapGraphStoreState {
    isPreparing: boolean;
    graph: 'ohlcv' | 'ohlcv-inverse' | 'tvl' | 'volume' | 'depth'
    isOhlcvGraphLoading: boolean;
    isPairMetaLoading: boolean;
    isDepthGraphLoading: boolean;
    timeframe: Timeframe;
    isToggling: boolean;
}

export class SwapGraphStore extends BaseStore<SwapGraphStoreData, SwapGraphStoreState> {

    protected readonly swapApi: SwapApi = useSwapApi()

    constructor() {
        super()

        makeObservable<
            SwapGraphStore,
            | 'loadOhlcvGraph'
            | 'changeGraphData'
        >(this, {
            changeGraphData: action.bound,
            isBusy: computed,
            isInvertGraph: computed,
            isOhlcvGraphLoading: computed,
            isPairMetaLoading: computed,
            isPreparing: computed,
            isToggling: computed,
            leftToken: computed,
            loadOhlcvGraph: action.bound,
            ohlcvGraphData: computed,
            pairByTokensRoot: action.bound,
            rightToken: computed,
            setTokens: action.bound,
            timeframe: computed,
        })

        this.setData(() => ({
            graphData: DEFAULT_GRAPH_DATA,
        }))
        this.setState(() => ({
            graph: 'ohlcv',
            timeframe: Timeframe.H1,
        }))

    }

    /**
     * Manually initiate store.
     * Run all necessary subscribers.
     */
    public async init(): Promise<void> {
        this.timeframeDisposer = reaction(
            () => this.state.timeframe,
            (timeframe, prevTimeframe) => {
                debug('timeframeDisposer', timeframe)
                if (timeframe !== prevTimeframe) {
                    this.loadOhlcvGraph()
                }
            },
        )

        this.tokensDisposer = reaction(
            () => [this.leftToken, this.rightToken],
            async (
                [leftTokenAddress, rightTokenAddress]: (Token | undefined)[],
                [prevLeftTokenAddress, prevRightTokenAddress]: (Token | undefined)[],
            ) => {
                debug('tokensDisposer leftTokenAddress, rightTokenAddress', leftTokenAddress, rightTokenAddress, leftTokenAddress
                    && rightTokenAddress
                    && (prevLeftTokenAddress !== leftTokenAddress))
                if (
                    leftTokenAddress
                    && rightTokenAddress
                    && (prevLeftTokenAddress !== leftTokenAddress
                        || prevRightTokenAddress !== rightTokenAddress)
                ) {
                    this.reset()
                    await this.pairByTokensRoot()
                    await this.loadOhlcvGraph()
                    if (this.isToggling) this.setState('isToggling', false)
                }
            },
        )
    }

    /*
     * Chart state
     * ----------------------------------------------------------------------------------
     */

    public get isOhlcvGraphLoading(): SwapGraphStoreState['isOhlcvGraphLoading'] {
        return this.state.isOhlcvGraphLoading
    }

    public get isPairMetaLoading(): SwapGraphStoreState['isPairMetaLoading'] {
        return this.state.isPairMetaLoading
    }

    public get isDepthGraphLoading(): SwapGraphStoreState['isDepthGraphLoading'] {
        return this.state.isDepthGraphLoading
    }

    /*
     * Chart data
     * ----------------------------------------------------------------------------------
     */

    public get leftToken(): SwapGraphStoreData['leftToken'] {
        return this.data.leftToken
    }

    public get rightToken(): SwapGraphStoreData['rightToken'] {
        return this.data.rightToken
    }

    public async pairByTokensRoot(): Promise<void> {
        if (this.isPairMetaLoading || !this.leftToken || !this.rightToken) {
            return
        }
        try {
            this.setState('isPairMetaLoading', true)
            const result = await this.swapApi.pairByTokensRoot({
                leftTokenAddress: this.leftToken.root,
                rightTokenAddress: this.rightToken.root,
            })
            const { poolAddress, baseAddress, counterAddress } = result.meta
            debug('baseAddress, counterAddress', baseAddress, counterAddress)
            this.setData('poolData', {
                address: poolAddress,
                left: baseAddress,
                right: counterAddress,
            })
        }
        catch (error) {

        }
        finally {
            this.setState('isPairMetaLoading', false)
        }
    }


    /**
     *
     * @param {number} [from]
     * @param {number} [to]
     */
    public async loadOhlcvGraph(fromArg?: number, toArg?: number): Promise<void> {
        if (this.isOhlcvGraphLoading || !this.leftToken || !this.rightToken) {
            return
        }
        debug('loadOhlcvGraph', this.isOhlcvGraphLoading, this.leftToken.root, this.rightToken.root)
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
            const body: PairGraphRequest = {
                from,
                timeframe: this.timeframe,
                to,
            }

            const result: OhlcvGraphModel[] = await this.swapApi.pairOhlcvByTokensRoot({
                leftTokenAddress: this.leftToken.root,
                rightTokenAddress: this.rightToken.root,
            }, {
                body: JSON.stringify(body),
            })

            const data = result.concat(this.graphData?.ohlcv ?? [])
            this.changeGraphData('ohlcv', data.length ? data : null)
        }
        catch (e) {
            debug('loadOhlcvGraph error', e)
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
    public get timeframe(): SwapGraphStoreState['timeframe'] {
        return this.state.timeframe
    }

    /**
     *
     */
    public get graphData(): SwapGraphStoreData['graphData'] {
        return this.data.graphData
    }

    /**
     *
     */
    public get graph(): SwapGraphStoreState['graph'] {
        return this.state.graph
    }

    /**
     *
     */
    public get isInvertGraph(): boolean | undefined {
        debug('this.data.poolData?.left, this.leftToken?.root, this.data.poolData?.right, this.rightToken?.root', this.data.poolData?.left, this.leftToken?.root, this.data.poolData?.right, this.rightToken?.root)
        return this.data.poolData?.left === this.leftToken?.root && this.data.poolData?.right === this.rightToken?.root
    }

    /**
     *
     */
    public get ohlcvGraphData(): CandlestickGraphShape[] {
        return uniqBy(this.graphData?.ohlcv, 'timestamp').map<CandlestickGraphShape>(item => ({
            close: parseFloat(item.close),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            open: parseFloat(item.open),
            // eslint-disable-next-line no-self-compare
            time: item.timestamp / 1000 as Time,
        }))
    }

    public get ohlcvGraphInverseData(): CandlestickGraphShape[] {
        return this.ohlcvGraphData.map<CandlestickGraphShape>(item => ({
            close: item.open,
            high: item.low,
            low: item.high,
            open: item.close,
            time: item.time,
        }))
    }

    /**
     *
     * @template {extends keyof P2PPairStoreGraphData} K
     * @param {K} key
     * @param {P2PPairStoreGraphData[K]} value
     * @protected
     */
    protected changeGraphData<K extends keyof P2PPairStoreGraphData>(key: K, value: P2PPairStoreGraphData[K]): void {
        debug('changeGraphData', value)
        this.data.graphData[key] = value
    }

    /*
     * Public actions. Useful in UI
     * ----------------------------------------------------------------------------------
     */
    public async setTokens(leftToken: Token, rightToken: Token): Promise<void> {
        this.setData({ leftToken, rightToken })
    }

    /**
     * Manually dispose all the internal subscribers.
     * Clean last transaction result, intervals
     * and reset all data to their defaults.
     */
    public async dispose(): Promise<void> {
        this.tokensDisposer?.()
        this.timeframeDisposer?.()
        this.reset()
    }

    /**
     * Full reset
     * instances to their default.
     * @protected
     */
    protected reset(): void {
        this.setData({
            graphData: DEFAULT_GRAPH_DATA,
        })
        if (this.isOhlcvGraphLoading) {
            this.setState('isOhlcvGraphLoading', false)
        }
        // this.setState(() => ({
        //     isOhlcvGraphLoading: false,
        // }))
    }

    /*
     * Memoized store data and state values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns memoized preparing state value
     * @returns {SwapGraphStoreState['isPreparing']}
     */
    public get isPreparing(): SwapGraphStoreState['isPreparing'] {
        return this.state.isPreparing
    }

    /**
     * Returns memoized preparing state value
     * @returns {SwapGraphStoreState['isToggling']}
     */
    public get isToggling(): SwapGraphStoreState['isToggling'] {
        return this.state.isToggling
    }


    /*
     * Computed values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns combined `isBusy` state 
     * @returns {boolean}
     */
    public get isBusy(): boolean {
        return this.isPreparing
    }

    /*
     * Internal and external utilities methods
     * ----------------------------------------------------------------------------------
     */

    /*
     * Reactions handlers
     * ----------------------------------------------------------------------------------
     */


    /*
     * Internal swap processing results handlers
     * ----------------------------------------------------------------------------------
     */

    /*
     * Internal reaction disposers
     * ----------------------------------------------------------------------------------
     */

    protected tokensDisposer: IReactionDisposer | undefined

    protected timeframeDisposer: IReactionDisposer | undefined

}
