import BigNumber from 'bignumber.js'
import {
    computed,
    makeObservable,
} from 'mobx'

import { getFullContractState, TokenUtils } from '@/misc'
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
    address: string;
    lpToken?: TokenCache;
    pool?: PoolResponse;
    tokenPrices: Record<string, string>;
}

export type SwapPoolStoreState = {
    isFetching?: boolean;
    isFetchingPrices?: boolean;
    isInitializing?: boolean;
    isSyncingCustomTokens?: boolean;
    isSyncingLpToken?: boolean;
    isSyncingUserData?: boolean;
    notFound?: boolean;
}

export type SwapPoolTokenData = {
    address: string;
    balance?: string;
    decimals: number;
    icon?: string;
    symbol: string;
    totalBalance?: string;
    tvl?: string;
}

export class SwapPoolStore extends BaseStore<SwapPoolStoreData, SwapPoolStoreState> {

    protected readonly api = usePoolsApi()

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
    ) {
        super()

        this.setData({
            tokenPrices: {},
        })

        makeObservable(this, {
            customTokensDecimals: computed,
            isFetching: computed,
            isFetchingPrices: computed,
            isPoolEmpty: computed,
            isStablePool: computed,
            isSyncingCustomTokens: computed,
            isSyncingLpToken: computed,
            isSyncingUserData: computed,
            lpToken: computed,
            notFound: computed,
            pool: computed,
            poolAddress: computed,
            tokens: computed,
        })
    }

    public async init(): Promise<void> {
        if (this.state.isInitializing || !this.address) {
            return
        }

        this.setState('isInitializing', true)

        if (this.pool?.meta.poolAddress !== this.address) {
            await this.fetch()
        }
        await Promise.allSettled([
            await this.syncLpToken(),
            await this.fetchPrices(),
        ])
        this.setState('isInitializing', false)
    }

    protected async fetch(force?: boolean): Promise<void> {
        if (!force && this.isFetching) {
            return
        }
        if (!this.address) {
            return
        }
        try {
            this.setState('isFetching', true)
            const response = await this.api.pool({
                address: this.address,
            }, { method: 'POST' })

            this.setData('pool', response)

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

    public get address(): SwapPoolStoreData['address'] {
        return this.data.address
    }

    public get customTokensDecimals(): SwapPoolStoreData['customTokensDecimals'] {
        return this.data.customTokensDecimals
    }

    public get lpToken(): SwapPoolStoreData['lpToken'] {
        return this.data.lpToken
    }

    public get pool(): SwapPoolStoreData['pool'] {
        return this.data.pool
    }

    public get poolAddress(): string | undefined {
        return this.data.pool?.meta.poolAddress
    }

    public get isFetching(): SwapPoolStoreState['isFetching'] {
        return this.state.isFetching
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

    public getPrice(address: string): string | undefined {
        return this.data.tokenPrices[address]
    }


    public get isPoolEmpty(): boolean {
        return new BigNumber(this.pool?.lpLocked || 0).isZero()
    }

    public get isStablePool(): boolean {
        return this.pool?.meta.pairType === 'stable'
    }

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

}
