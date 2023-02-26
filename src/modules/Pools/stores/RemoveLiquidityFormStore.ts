import BigNumber from 'bignumber.js'
import type { Address, Subscription } from 'everscale-inpage-provider'
import {
    action,
    computed,
    makeObservable,
    reaction,
    toJS,
} from 'mobx'
import type { IReactionDisposer } from 'mobx'

import { useStaticRpc } from '@/hooks'
import {
    getFullContractState,
    LiquidityStablePoolUtils,
    StablePoolUtils,
    TokenWalletUtils,
} from '@/misc'
import type {
    LiquidityStablePoolTokenData,
    LiquidityStablePoolWithdrawCallbacks,
} from '@/misc'
import type { StablePoolData } from '@/modules/Pools/types'
import { BaseStore } from '@/stores/BaseStore'
import type { DexAccountService } from '@/stores/DexAccountService'
import type { TokenCache, TokensCacheService } from '@/stores/TokensCacheService'
import type { WalletService } from '@/stores/WalletService'
import {
    addressesComparer,
    debug,
    error,
    isGoodBignumber,
    resolveEverscaleAddress,
} from '@/utils'


export type RemoveLiquidityFormStoreData = {
    amount: string;
    leftToken?: string
    pool?: StablePoolData;
    rightToken?: string;
}

export type RemoveLiquidityFormStoreState = {
    isAwaitingConfirmation?: boolean;
    isCheckingDexAccount?: boolean;
    isInitializing?: boolean;
    isPreparing?: boolean;
    isSyncingPool?: boolean;
    isWithdrawingLiquidity?: boolean;
}


const staticRpc = useStaticRpc()


export class RemoveLiquidityFormStore extends BaseStore<RemoveLiquidityFormStoreData, RemoveLiquidityFormStoreState> {

    public readonly poolAddress: string

    constructor(
        poolAddress: Address | string,
        public readonly wallet: WalletService,
        public readonly dex: DexAccountService,
        public readonly tokensCache: TokensCacheService,
    ) {
        super()

        this.poolAddress = poolAddress.toString()

        this.setData(() => ({
            amount: '',
        }))

        this.setState(() => ({
            isPreparing: !wallet.isReady,
        }))

        makeObservable<RemoveLiquidityFormStore,
            | 'handleTokensCacheReady'
            | 'handleWalletAccountChange'
        >(this, {
            amount: computed,
            changeAmount: action.bound,
            currentSharePercent: computed,
            handleTokensCacheReady: action.bound,
            handleWalletAccountChange: action.bound,
            isAmountValid: computed,
            isAwaitingConfirmation: computed,
            isCheckingDexAccount: computed,
            isPoolConnected: computed,
            isPoolDataAvailable: computed,
            isPoolEmpty: computed,
            isPreparing: computed,
            isSoleLiquidityProvider: computed,
            isSyncingPool: computed,
            isWithdrawingLiquidity: computed,
            isWithdrawLiquidityAvailable: computed,
            pool: computed,
            resultingLpUserBalance: computed,
            resultingSharePercent: computed,
        })
    }

    public async init(): Promise<void> {
        if (this.state.isInitializing) {
            return
        }

        this.setState('isInitializing', true)

        await this.dex.init()

        this.tokensCacheDisposer = reaction(
            () => this.tokensCache.isReady,
            this.handleTokensCacheReady,
            { fireImmediately: this.tokensCache.isReady },
        )

        this.setState('isInitializing', false)
    }

    public async dispose(): Promise<void> {
        this.tokensCacheDisposer?.()
        this.tokensChangeDisposer?.()
        this.walletAccountDisposer?.()
        await Promise.allSettled([
            this.dex.dispose(),
            this.unsubscribe(),
        ])
    }

    public currentTokenShare(address: string): string {
        const token = this.tokensMap.get(address)
        return new BigNumber(this.pool?.lp.userBalance || 0)
            .times(token?.balance || 0)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(0, BigNumber.ROUND_DOWN)
            .shiftedBy(-(token?.decimals ?? 0))
            .toFixed()
    }

    public resultingTokenShare(address: string): string | undefined {
        if (!isGoodBignumber(this.amount)) {
            return undefined
        }

        const token = this.tokensMap.get(address)

        return new BigNumber(this.resultingLpUserBalance)
            .times(token?.balance || 0)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(0, BigNumber.ROUND_DOWN)
            .shiftedBy(-(token?.decimals ?? 0))
            .toFixed()
    }

    public receiveTokenAmount(address: string): string {
        const token = this.tokensMap.get(address)
        return new BigNumber(new BigNumber(this.amount || 0).shiftedBy(this.pool?.lp.decimals ?? 0))
            .times(token?.balance || 0)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(0, BigNumber.ROUND_DOWN)
            .shiftedBy(-(token?.decimals ?? 0))
            .toFixed()
    }

    public async changeAmount(value: string): Promise<void> {
        this.setData('amount', value)

        if (this.isPoolEmpty) {
            // await this.syncPoolShare()

        }
    }

    public async withdrawLiquidity(callbacks?: LiquidityStablePoolWithdrawCallbacks): Promise<void> {
        if (this.wallet.address === undefined || this.dex.address === undefined || this.pool === undefined) {
            return
        }

        try {
            this.setState('isAwaitingConfirmation', true)

            const pool = { ...this.pool }
            const poolAddress = this.pool.address

            const onSend: LiquidityStablePoolWithdrawCallbacks['onSend'] = async (message, params) => {
                this.setState({
                    isAwaitingConfirmation: false,
                    isWithdrawingLiquidity: true,
                })
                await this.unsubscribe()
                await callbacks?.onSend?.(message, params)
            }

            const onTransactionSuccess: LiquidityStablePoolWithdrawCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    if (this.pool?.address.toString() === poolAddress.toString()) {
                        const [balances, userWalletBalance] = await Promise.all([
                            StablePoolUtils.balances(poolAddress),
                            pool.lp.userWalletAddress
                                ? TokenWalletUtils.balance({
                                    tokenWalletAddress: pool.lp.userWalletAddress,
                                })
                                : TokenWalletUtils.balance({
                                    tokenRootAddress: pool.lp.address!,
                                    walletOwnerAddress: this.wallet.address!,
                                }),
                        ])
                        this.setData('pool', {
                            ...pool,
                            lp: {
                                ...pool.lp,
                                balance: balances.lpSupply,
                                userBalance: userWalletBalance,
                            },
                            tokens: pool.tokens.map(
                                (token, idx) => ({
                                    ...token,
                                    balance: balances.tokens[idx],
                                }),
                            ),
                        })
                    }
                    else {
                        await this.syncUserLiquidity()
                    }
                    this.setState({
                        isAwaitingConfirmation: false,
                        isWithdrawingLiquidity: false,
                    })
                    await callbacks?.onTransactionSuccess?.(result)
                    await this.unsubscribe()
                    await this.subscribe()
                }, 30)
            }

            const onTransactionFailure: LiquidityStablePoolWithdrawCallbacks['onTransactionFailure'] = async reason => {
                this.setState({
                    isAwaitingConfirmation: false,
                    isWithdrawingLiquidity: false,
                })
                await callbacks?.onTransactionFailure?.(reason)
                await this.unsubscribe()
                await this.subscribe()
            }

            await LiquidityStablePoolUtils.withdrawLiquidity({
                amount: new BigNumber(this.amount ?? 0)
                    .dp(this.pool.lp.decimals ?? 0, BigNumber.ROUND_DOWN)
                    .shiftedBy(this.pool.lp.decimals ?? 0)
                    .toFixed(),
                lpPoolWalletAddress: this.pool.lp.walletAddress,
                lpRootAddress: this.pool.lp.address,
                lpRootState: this.pool.lp.state,
                lpUserWalletAddress: this.pool.lp.userWalletAddress,
                poolAddress: this.pool.address,
                poolState: toJS(this.pool.state),
                referrer: resolveEverscaleAddress('0:0000000000000000000000000000000000000000000000000000000000000000'),
                roots: this.tokens.map(token => ({
                    address: token.address,
                    userWalletAddress: token.userWalletAddress,
                })),
                userAddress: this.wallet.address,
                // eslint-disable-next-line sort-keys
                onSend,
                onTransactionFailure,
                onTransactionSuccess,
            })
        }
        catch (e) {
            this.setState({
                isAwaitingConfirmation: false,
                isWithdrawingLiquidity: false,
            })
        }
    }

    protected async checkDexAccount(): Promise<void> {
        if (this.isCheckingDexAccount) {
            return
        }

        try {
            this.setState('isCheckingDexAccount', true)
            await this.dex.connectAndSync()
            await this.dex.subscribe()
        }
        catch (e) {
            error('DEX account connect and sync error', e)
            this.setState('isCheckingDexAccount', false)
        }

        if (this.dex.address === undefined) {
            this.setState('isCheckingDexAccount', false)
            return
        }

        this.setState('isCheckingDexAccount', false)
    }

    protected async syncPool(): Promise<void> {
        if (this.isSyncingPool) {
            return
        }

        try {
            this.setState('isSyncingPool', true)

            const pool = await LiquidityStablePoolUtils.get(this.poolAddress, this.wallet.address)

            const lpToken = this.tokensCache.get(pool.lp.address.toString())
            pool.lp.symbol = lpToken?.symbol ?? pool.lp.symbol

            this.setData('pool', pool)

            debug('Liquidity pool successfully synced', pool)

            if (pool.lp.userWalletAddress === undefined) {
                await this.syncUserLiquidity()
            }
        }
        catch (e) {
            debug('Liquidity pool has been synced with error', e)
        }
        finally {
            this.setState('isSyncingPool', false)
        }

        await this.subscribe()

        await Promise.allSettled(this.tokens.map(token => {
            const root = token.address.toString()
            if (this.tokensCache.isCustomToken(root) && !this.tokensCache.has(root)) {
                this.tokensCache.add({ root } as TokenCache)
            }
            return this.tokensCache.watch(root, 'liquidity-pool')
        }))
    }

    protected async syncUserLiquidity(): Promise<void> {
        if (this.wallet.address === undefined || this.pool?.lp === undefined) {
            return
        }

        try {
            const pool = { ...toJS(this.pool) }
            pool.lp.userBalance = this.pool.lp.userWalletAddress
                ? await TokenWalletUtils.balance({
                    tokenWalletAddress: this.pool.lp.userWalletAddress,
                })
                : await TokenWalletUtils.balance({
                    tokenRootAddress: this.pool.lp.address,
                    walletOwnerAddress: this.wallet.address,
                })

            this.setData('pool', pool)
        }
        catch (e) {

        }
    }

    protected async subscribe(): Promise<void> {
        if (this.dex.address === undefined) {
            return
        }

        try {
            this.contractSubscriber = await staticRpc.subscribe(
                'contractStateChanged',
                { address: resolveEverscaleAddress(this.poolAddress) },
            )
            debug('Subscribe to the Pool contract changes', this.poolAddress)

            this.contractSubscriber.on('data', action(async event => {
                debug(
                    '%cRPC%c The Pool `contractStateChanged` event was captured',
                    'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 3px 6.5px',
                    'color: #c5e4f3',
                    event,
                )

                if (this.pool === undefined) {
                    return
                }

                const pool = { ...toJS(this.pool) }
                pool.state = await getFullContractState(event.address)
                const balances = await StablePoolUtils.balances(event.address, pool.state)

                balances.tokens.forEach((balance, idx) => {
                    pool.tokens[idx].balance = balance
                })

                this.setData('pool', pool)

                await this.syncUserLiquidity()
            }))
        }
        catch (e) {
            error('Contract subscribe error', e)
            this.contractSubscriber = undefined
        }
    }

    protected async unsubscribe(): Promise<void> {
        if (this.contractSubscriber !== undefined) {
            try {
                debug('Unsubscribe from the Pool Contract changes')
                await this.contractSubscriber.unsubscribe()
            }
            catch (e) {
                error('The Pool contract unsubscribe error', e)
            }
            this.contractSubscriber = undefined
        }
    }

    /*
     * Memoized store data values
     * ----------------------------------------------------------------------------------
     */

    public get amount(): RemoveLiquidityFormStoreData['amount'] {
        return this.data.amount
    }

    public get pool(): RemoveLiquidityFormStoreData['pool'] {
        return this.data.pool
    }

    /*
     * Memoized store state values
     * ----------------------------------------------------------------------------------
     */

    public get isAwaitingConfirmation(): RemoveLiquidityFormStoreState['isAwaitingConfirmation'] {
        return this.state.isAwaitingConfirmation
    }

    public get isCheckingDexAccount(): RemoveLiquidityFormStoreState['isCheckingDexAccount'] {
        return this.state.isCheckingDexAccount
    }

    public get isPreparing(): RemoveLiquidityFormStoreState['isPreparing'] {
        return this.state.isPreparing
    }

    public get isSyncingPool(): RemoveLiquidityFormStoreState['isSyncingPool'] {
        return this.state.isSyncingPool
    }

    public get isWithdrawingLiquidity(): RemoveLiquidityFormStoreState['isWithdrawingLiquidity'] {
        return this.state.isWithdrawingLiquidity
    }

    /*
     * Computed states and values
     * ----------------------------------------------------------------------------------
     */

    public get currentSharePercent(): string {
        return new BigNumber(this.pool?.lp.userBalance || 0)
            .times(100)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(8, BigNumber.ROUND_DOWN)
            .toFixed()
    }

    public get isAmountValid(): boolean {
        return this.amount.length > 0
            ? new BigNumber(this.amount)
                .shiftedBy(this.pool?.lp.decimals ?? 0)
                .lte(this.pool?.lp.userBalance ?? 0)
            : true
    }

    public get isPoolConnected(): boolean {
        return (
            this.pool?.lp.address !== undefined
            && this.dex.getAccountWallet(this.pool.lp.address) !== undefined
        )
    }

    public get isPoolDataAvailable(): boolean {
        return this.wallet.isReady && this.dex.address !== undefined
    }

    public get isPoolEmpty(): boolean {
        return new BigNumber(this.pool?.lp.balance || 0).isZero()
    }

    public get isSoleLiquidityProvider(): boolean {
        return this.isPoolEmpty || new BigNumber(this.pool?.lp.balance ?? 0).eq(this.pool?.lp.userBalance ?? 0)
    }

    public get isWithdrawLiquidityAvailable(): boolean {
        return isGoodBignumber(this.pool?.lp.userBalance ?? 0) && isGoodBignumber(this.amount)
    }

    public get resultingLpUserBalance(): string {
        return new BigNumber(this.pool?.lp.userBalance || 0)
            .minus(new BigNumber(this.amount || 0).shiftedBy(this.pool?.lp.decimals ?? 0))
            .toFixed()
    }

    public get resultingSharePercent(): string | undefined {
        if (!isGoodBignumber(this.amount)) {
            return undefined
        }

        if (
            this.isSoleLiquidityProvider
            && !(new BigNumber(this.amount).shiftedBy(this.pool?.lp.decimals ?? 0).eq(this.pool?.lp.userBalance ?? 0))
        ) {
            return '100'
        }

        return new BigNumber(this.resultingLpUserBalance)
            .times(100)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(8, BigNumber.ROUND_DOWN)
            .toFixed()
    }

    public get tokens(): LiquidityStablePoolTokenData[] {
        return this.pool?.tokens.map<LiquidityStablePoolTokenData>(
            token => {
                const cachedToken = this.tokensCache.get(token.address.toString())
                return {
                    address: token.address,
                    balance: token.balance,
                    decimals: cachedToken?.decimals ?? token.decimals ?? 0,
                    icon: cachedToken?.icon,
                    symbol: cachedToken?.symbol ?? token.symbol ?? '',
                    userBalance: cachedToken?.balance,
                    userWalletAddress: cachedToken?.wallet ? resolveEverscaleAddress(cachedToken?.wallet) : undefined,
                }
            },
        ) ?? []
    }

    public get tokensMap(): Map<string, LiquidityStablePoolTokenData> {
        return this.tokens.reduce<Map<string, LiquidityStablePoolTokenData>>(
            (acc, value) => acc.set(value.address.toString(), value),
            new Map(),
        )
    }

    /*
     * Reactions handlers
     * ----------------------------------------------------------------------------------
     */

    protected async handleTokensCacheReady(isReady: boolean): Promise<void> {
        if (!isReady) {
            return
        }

        this.walletAccountDisposer = reaction(
            () => this.wallet.account?.address,
            this.handleWalletAccountChange,
            {
                equals: addressesComparer,
                fireImmediately: true,
            },
        )

        await this.syncPool()
    }

    protected async handleWalletAccountChange(address?: Address): Promise<void> {
        if (address === undefined) {
            this.setState(() => ({
                isInitializing: false,
                isPreparing: false,
            }))
            await Promise.allSettled(this.tokens.map(
                token => this.tokensCache.unwatch(token.address.toString(), 'liquidity-pool'),
            ))
            this.tokensCache.tokens.forEach(token => {
                this.tokensCache.update(token.root, 'balance', undefined)
                this.tokensCache.update(token.root, 'wallet', undefined)
            })
            return
        }

        await this.checkDexAccount()

        if (this.pool?.lp.userWalletAddress === undefined) {
            await this.syncUserLiquidity()
        }

        await Promise.allSettled(this.tokens.map(
            token => this.tokensCache.watch(token.address.toString(), 'liquidity-pool'),
        ))
    }

    protected contractSubscriber: Subscription<'contractStateChanged'> | undefined

    protected tokensCacheDisposer: IReactionDisposer | undefined

    protected tokensChangeDisposer: IReactionDisposer | undefined

    protected walletAccountDisposer: IReactionDisposer | undefined

}
