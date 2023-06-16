import BigNumber from 'bignumber.js'
import {
    computed,
    makeObservable,
} from 'mobx'

import { NPoolsList } from '@/config'
import { getFullContractState, TokenUtils } from '@/misc'
// import type { Timeframe } from '@/modules/Charts/types'
import type { PoolResponse } from '@/modules/Pools/types'
import { usePoolsApi } from '@/modules/Pools/hooks/useApi'
import { BaseStore } from '@/stores/BaseStore'
import type { TokenCache, TokensCacheService } from '@/stores/TokensCacheService'
import type { WalletService } from '@/stores/WalletService'
import {
    debug,
    error,
    // isGoodBignumber,
    stripHtmlTags,
} from '@/utils'

export type SwapPoolStoreData = {
    customTokensDecimals?: Record<string, number>;
    // graph: OhlcvBar[] | null;
    lpToken?: TokenCache;
    pool?: PoolResponse;
    tokenPrices: Record<string, string>;
    // userLpBalance?: string;
}

export type SwapPoolStoreState = {
    // graphType: SwapPoolGraphType;
    isFetching?: boolean;
    isFetchingGraph?: boolean;
    isFetchingPrices?: boolean;
    isInitializing?: boolean;
    isSyncingCustomTokens?: boolean;
    isSyncingLpToken?: boolean;
    isSyncingUserData?: boolean;
    notFound?: boolean;
    // timeframe: Timeframe;
}

// export enum SwapPoolGraphType {
//     Ohlcv,
//     OhlcvInverse,
//     Tvl,
//     TvlRatio,
//     Volume,
// }

export type SwapPoolTokenData = {
    address: string;
    balance?: string;
    decimals: number;
    icon?: string;
    symbol: string;
    totalBalance?: string;
    tvl?: string;
}

// function getPrice(
//     leftLocked?: string | number,
//     rightLocked?: string | number,
//     leftDecimals?: number,
//     rightDecimals?: number,
// ): string {
//     const price = (leftDecimals !== undefined && rightDecimals !== undefined)
//         ? new BigNumber(rightLocked || 0)
//             .shiftedBy(-rightDecimals)
//             .div(new BigNumber(leftLocked || 0).shiftedBy(-leftDecimals))
//             .dp(rightDecimals, BigNumber.ROUND_UP)
//         : new BigNumber(0)

//     return isGoodBignumber(price) ? price.toFixed() : '0'
// }

export class SwapPoolStore extends BaseStore<SwapPoolStoreData, SwapPoolStoreState> {

    protected readonly api = usePoolsApi()

    constructor(
        public readonly address: string,
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
    ) {
        super()

        this.setData({
            // graph: null,
            tokenPrices: {},
        })

        // this.setState(() => ({
        //     graphType: SwapPoolGraphType.Ohlcv,
        //     timeframe: 'H1',
        // }))

        makeObservable(this, {
            customTokensDecimals: computed,
            // fetchGraph: action.bound,
            // graph: computed,
            // graphType: computed,
            isFetching: computed,
            isFetchingGraph: computed,
            isFetchingPrices: computed,
            isNPool: computed,
            isPoolEmpty: computed,
            isStablePool: computed,
            isSyncingCustomTokens: computed,
            isSyncingLpToken: computed,
            isSyncingUserData: computed,
            lpToken: computed,
            // ltrPrice: computed,
            notFound: computed,
            // ohlcvGraphData: computed,
            // ohlcvGraphInverseData: computed,
            pool: computed,
            // rtlPrice: computed,
            // timeframe: computed,
            tokens: computed,
            // tvlGraphData: computed,
            // userLpBalance: computed,
            // userShare: computed,
            // userUsdBalance: computed,
            // volumeGraphData: computed,
        })
    }

    public async init(): Promise<void> {
        if (this.state.isInitializing) {
            return
        }

        this.setState('isInitializing', true)

        if (this.pool === undefined) {
            await this.fetch()
        }

        // if (this.graph == null) {
        //     await this.fetchGraph()
        // }

        await Promise.allSettled([
            await this.syncLpToken(),
            await this.fetchPrices(),
        ])

        // this.walletDisposer = reaction(() => this.wallet.address, async (address?: string, prevAddress?: string) => {
        //     if (address !== prevAddress) {
        //         await this.syncPoolUserData()
        //     }
        // }, { fireImmediately: true })

        this.setState('isInitializing', false)
    }

    // public dispose(): void {
    //     this.walletDisposer?.()
    // }

    protected async fetch(force?: boolean): Promise<void> {
        if (!force && this.isFetching) {
            return
        }

        try {
            this.setState('isFetching', true)

            const response = await this.api.pool({
                address: this.address,
            }, { method: 'POST' })

            this.setData('pool', response)

            // if (this.isNPool) {
            //     this.setState('graphType', SwapPoolGraphType.TvlRatio)
            // }

            try {
                const unavailableTokens = response.meta.currencyAddresses.filter(
                    address => !this.tokensCache.has(address) || this.tokensCache.get(address)?.decimals === undefined,
                )

                if (unavailableTokens.length > 0) {
                    this.setState('isSyncingCustomTokens', true)

                    const customTokensDecimals = (await Promise.all(unavailableTokens.map(async address => {
                        const decimals = await TokenUtils.getDecimals(address)
                        return [address, decimals]
                    }))).reduce((acc, [address, decimals]) => ({
                        ...acc,
                        [address]: decimals,
                    }), {})

                    this.setData('customTokensDecimals', customTokensDecimals)
                }
            }
            catch (e) {
                debug('Sync custom tokens error', e)
            }
            finally {
                this.setState('isSyncingCustomTokens', false)
            }
        }
        catch (e) {
            this.setState('notFound', true)
        }
        finally {
            this.setState('isFetching', false)
        }
    }

    protected async fetchPrices(force?: boolean): Promise<void> {
        if (!force && this.isFetchingPrices) {
            return
        }

        if (this.pool?.meta.lpAddress === undefined) {
            return
        }

        try {
            this.setState('isFetchingPrices', true)

            const response = await this.api.currenciesUsdtPrices({}, { method: 'POST' }, {
                currency_addresses: [this.pool?.meta.lpAddress],
            })

            this.setData('tokenPrices', response)
        }
        catch (e) {
            debug('Error while fetch prices', e)
        }
        finally {
            this.setState('isFetchingPrices', false)
        }
    }

    // public async fetchGraph(from?: number, to?: number): Promise<void> {
    //     if (this.isFetchingGraph) {
    //         return
    //     }

    //     try {
    //         this.setState('isFetchingGraph', true)

    //         let ohlcvKind = OhlcvKind.Price
    //         if (this.graphType === SwapPoolGraphType.Tvl || this.graphType === SwapPoolGraphType.TvlRatio) {
    //             ohlcvKind = OhlcvKind.Tvl
    //         }
    //         else if (this.graphType === SwapPoolGraphType.Volume) {
    //             ohlcvKind = OhlcvKind.Volume
    //         }

    //         const result = await this.api.poolOhlcv({
    //             address: this.address,
    //         }, {
    //             method: 'POST',
    //         }, {
    //             from: from || DateTime.local().minus({
    //                 days: this.timeframe === 'D1' ? 30 : 7,
    //             }).toUTC(undefined, {
    //                 keepLocalTime: false,
    //             }).toMillis(),
    //             ohlcvKind,
    //             poolAddress: this.address,
    //             timeframe: this.timeframe,
    //             to: to || DateTime.local().toUTC(undefined, {
    //                 keepLocalTime: false,
    //             }).toMillis(),
    //         })
    //         const data = result.concat(this.graph ?? [])

    //         this.setData('graph', data.length > 0 ? data : null)
    //     }
    //     catch (e) {}
    //     finally {
    //         this.setState('isFetchingGraph', false)
    //     }
    // }

    protected async syncLpToken(force?: boolean): Promise<void> {
        if (!force && this.isSyncingLpToken) {
            return
        }

        if (this.pool?.meta.lpAddress === undefined) {
            return
        }

        try {
            this.setState('isSyncingLpToken', true)

            const state = await getFullContractState(this.pool.meta.lpAddress)
            const [decimals, /* symbol, */ name] = await Promise.all([
                TokenUtils.getDecimals(this.pool.meta.lpAddress, state),
                // TokenUtils.getSymbol(this.pool.meta.lpAddress, state),
                TokenUtils.getName(this.pool.meta.lpAddress, state),
            ])
            const token = this.tokensCache.get(this.pool.meta.lpAddress)

            this.setData('lpToken', {
                decimals,
                icon: this.tokensCache.get(this.pool.meta.lpAddress)?.icon,
                name,
                root: this.pool.meta.lpAddress,
                symbol: token?.symbol ?? 'LP',
            })
        }
        catch (e) {
            error('Sync LP token error', e)
        }
        finally {
            this.setState('isSyncingLpToken', false)
        }
    }

    // protected async syncPoolUserData(): Promise<void> {
    //     if (this.wallet.account?.address === undefined || this.lpToken === undefined) {
    //         return
    //     }

    //     try {
    //         this.setState('isSyncingUserData', true)

    //         const userLpBalance = await TokenWalletUtils.balance({
    //             tokenRootAddress: this.lpToken.root,
    //             walletOwnerAddress: this.wallet.account.address,
    //         })

    //         this.setData('userLpBalance', userLpBalance)
    //     }
    //     catch (e) {
    //         debug('Sync pool user data error', e)
    //     }
    //     finally {
    //         this.setState('isSyncingUserData', false)
    //     }
    // }

    public get customTokensDecimals(): SwapPoolStoreData['customTokensDecimals'] {
        return this.data.customTokensDecimals
    }

    // public get graph(): SwapPoolStoreData['graph'] {
    //     return this.data.graph
    // }

    public get lpToken(): SwapPoolStoreData['lpToken'] {
        return this.data.lpToken
    }

    public get pool(): SwapPoolStoreData['pool'] {
        return this.data.pool
    }

    // public get userLpBalance(): SwapPoolStoreData['userLpBalance'] {
    //     return this.data.userLpBalance
    // }

    // public get graphType(): SwapPoolStoreState['graphType'] {
    //     return this.state.graphType
    // }

    public get isFetching(): SwapPoolStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get isFetchingGraph(): SwapPoolStoreState['isFetchingGraph'] {
        return this.state.isFetchingGraph
    }

    public get isFetchingPrices(): SwapPoolStoreState['isFetchingPrices'] {
        return this.state.isFetchingPrices
    }

    public get isSyncingCustomTokens(): SwapPoolStoreState['isSyncingCustomTokens'] {
        return this.state.isSyncingCustomTokens
    }

    public get isSyncingLpToken(): SwapPoolStoreState['isSyncingLpToken'] {
        return this.state.isSyncingLpToken
    }

    public get isSyncingUserData(): SwapPoolStoreState['isSyncingUserData'] {
        return this.state.isSyncingUserData
    }

    public get notFound(): SwapPoolStoreState['notFound'] {
        return this.state.notFound
    }

    // public get timeframe(): SwapPoolStoreState['timeframe'] {
    //     return this.state.timeframe
    // }

    public getPrice(address: string): string | undefined {
        return this.data.tokenPrices[address]
    }

    public get isNPool(): boolean {
        return (
            (this.isStablePool && this.tokens.length > 2)
            || Array.from(NPoolsList.entries()).some(
                ([, value]) => value.poolAddress.toString() === this.address,
            )
        )
    }

    public get isPoolEmpty(): boolean {
        return new BigNumber(this.pool?.lpLocked || 0).isZero()
    }

    public get isStablePool(): boolean {
        return this.pool?.meta.pairType === 'stable'
    }

    // public get ltrPrice(): string {
    //     return (this.isStablePool ? this.pool?.stableOneSwap[0] : undefined)
    //         ?? getPrice(
    //             this.pool?.volumesLocked[0],
    //             this.pool?.volumesLocked[1],
    //             this.tokens[0]?.decimals,
    //             this.tokens[1]?.decimals,
    //         )
    // }

    // public get ohlcvGraphData(): OhlcvBarData[] {
    //     return uniqBy(this.graph, 'timestamp').map<OhlcvBarData>(item => ({
    //         close: parseFloat(item.close),
    //         currencyVolumes: item.currencyVolumes,
    //         high: parseFloat(item.high),
    //         low: parseFloat(item.low),
    //         open: parseFloat(item.open),
    //         time: item.timestamp as Time,
    //         tvl: parseFloat(item.tvl),
    //         usdtVolume: item.usdtVolume,
    //         volume: parseFloat(item.usdtVolume),
    //     }))
    // }

    // public get ohlcvGraphInverseData(): OhlcvData[] {
    //     return this.ohlcvGraphData.map<OhlcvData>(item => ({
    //         close: item.open,
    //         high: item.low,
    //         low: item.high,
    //         open: item.close,
    //         time: item.time,
    //         volume: item.volume,
    //     }))
    // }

    // public get rtlPrice(): string {
    //     return (this.isStablePool ? this.pool?.stableOneSwap[1] : undefined)
    //         ?? getPrice(
    //             this.pool?.volumesLocked[1],
    //             this.pool?.volumesLocked[0],
    //             this.tokens[1]?.decimals,
    //             this.tokens[0]?.decimals,
    //         )
    // }

    public get tokens(): SwapPoolTokenData[] {
        return this.pool?.meta.currencyAddresses.map((address, idx) => {
            const token = this.tokensCache.get(address)
            const tvl = this.pool?.volumesLocked[idx]
            return {
                address,
                balance: new BigNumber(0)
                    .times(tvl || 0)
                    .div(parseInt(this.pool?.lpLocked ?? '0', 10) || 1)
                    .dp(0, BigNumber.ROUND_DOWN)
                    .toFixed(),
                decimals: this.data.customTokensDecimals?.[address] || token?.decimals || 0,
                icon: token?.icon,
                symbol: stripHtmlTags(token?.symbol ?? this.pool?.meta.currencies[idx] ?? ''),
                tvl,
            }
        }) ?? []
    }

    // public get tvlGraphData(): SingleValueData[] {
    //     return uniqBy(this.graph, 'timestamp').map<SingleValueData>(item => ({
    //         time: item.timestamp as Time,
    //         value: parseFloat(item.tvl),
    //     }))
    // }

    // public get userShare(): string {
    //     if (this.isPoolEmpty) {
    //         return '0'
    //     }

    //     if (new BigNumber(this.userLpBalance || 0).eq(this.pool?.lpLocked ?? 0)) {
    //         return '100'
    //     }
    //     return new BigNumber(this.userLpBalance || 0)
    //         .div(parseInt(this.pool?.lpLocked ?? '0', 10) || 1)
    //         .times(100)
    //         .toFixed()
    // }

    // public get userUsdBalance(): string {
    //     if (this.lpToken?.root === undefined || this.lpToken.decimals === undefined) {
    //         return '0'
    //     }
    //     return new BigNumber(this.userLpBalance || 0).shiftedBy(-this.lpToken.decimals).times(
    //         this.getPrice(this.lpToken.root) ?? 0,
    //     ).toFixed()
    // }

    // public get volumeGraphData(): SingleValueData[] {
    //     return uniqBy(this.graph, 'timestamp').map<SingleValueData>(item => ({
    //         time: item.timestamp as Time,
    //         value: parseFloat(item.usdtVolume),
    //     }))
    // }

    // protected walletDisposer: IReactionDisposer | undefined

}
