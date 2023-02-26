import BigNumber from 'bignumber.js'
import type { Address, Subscription } from 'everscale-inpage-provider'
import {
    action,
    computed,
    makeObservable,
    ObservableMap,
    reaction,
    toJS,
} from 'mobx'
import type { IReactionDisposer } from 'mobx'

import { useStaticRpc } from '@/hooks'
import {
    DexAccountUtils,
    getFullContractState,
    LiquidityStablePoolUtils,
    StablePoolUtils,
    TokenWalletUtils,
} from '@/misc'
import type {
    DexAccountDepositTokenCallbacks,
    DexAccountWithdrawTokenCallbacks,
    LiquidityStablePoolConnectCallbacks,
    LiquidityStablePoolConnectSuccessResult,
    LiquidityStablePoolDepositCallbacks,
    LiquidityStablePoolTokenData,
    LiquidityStablePoolWithdrawCallbacks,
    TransactionSuccessResult,
} from '@/misc'
import { RECEIPTS } from '@/modules/Liqudity/constants'
import type { DepositTokenCallbacks, WithdrawTokenCallbacks } from '@/modules/Liqudity/types'
import type { DepositLiquidityCallbacks, StablePoolData } from '@/modules/Pools/types'
import { BaseStore } from '@/stores/BaseStore'
import type { DexAccountService } from '@/stores/DexAccountService'
import type { TokenCache, TokensCacheService } from '@/stores/TokensCacheService'
import type { WalletService } from '@/stores/WalletService'
import {
    debug,
    error,
    getSafeProcessingId,
    isGoodBignumber,
    resolveEverscaleAddress,
} from '@/utils'


export type AddLiquidityFormStoreData = {
    amounts: ObservableMap<string, string>;
    pool?: StablePoolData;
}

export type AddLiquidityFormStoreState = {
    isCheckingDexAccount?: boolean;
    isConnectingDexAccount?: boolean;
    isConnectingPool?: boolean;
    isCreatingPool?: boolean;
    isDepositingLiquidity?: boolean;
    isInitializing?: boolean;
    isPreparing?: boolean;
    isSyncingPool?: boolean;
    isWithdrawingLiquidity?: boolean;
    tokensWhichAwaitsDepositing: ObservableMap<string, boolean>,
    tokensWhichDepositing: ObservableMap<string, boolean>,
    tokensWhichWithdrawing: ObservableMap<string, boolean>,
}


const staticRpc = useStaticRpc()


export class AddLiquidityFormStore extends BaseStore<AddLiquidityFormStoreData, AddLiquidityFormStoreState> {

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
            amounts: new ObservableMap(),
        }))

        this.setState(() => ({
            isPreparing: !wallet.isReady,
            tokensWhichAwaitsDepositing: new ObservableMap(),
            tokensWhichDepositing: new ObservableMap(),
            tokensWhichWithdrawing: new ObservableMap(),
        }))

        makeObservable<
            AddLiquidityFormStore,
            | 'handleTokensCacheReady'
            | 'handleWalletAccountChange'
        >(this, {
            currentSharePercent: computed,
            depositingTokens: computed,
            firstInvalidAmountToken: computed,
            handleTokensCacheReady: action.bound,
            handleWalletAccountChange: action.bound,
            isAmountsEmpty: computed,
            isAmountsValid: computed,
            isCheckingDexAccount: computed,
            isConnectingDexAccount: computed,
            isConnectingPool: computed,
            isDepositingLiquidity: computed,
            isDexAccountDataAvailable: computed,
            isPoolConnected: computed,
            isPoolDataAvailable: computed,
            isPoolEmpty: computed,
            isPreparing: computed,
            isSyncingPool: computed,
            isTokensDepositing: computed,
            isWithdrawingLiquidity: computed,
            isWithdrawLiquidityAvailable: computed,
            lastDepositingToken: computed,
            pool: computed,
            tokens: computed,
            tokensMap: computed,
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
        this.dexAccountDeployDisposer?.()
        this.tokensCacheDisposer?.()
        this.tokensChangeDisposer?.()
        this.walletAccountDisposer?.()
        await Promise.allSettled([
            this.dex.dispose(),
            this.unsubscribe(),
            Promise.allSettled(this.tokens.map(
                token => this.tokensCache.unwatch(token.address.toString(), 'liquidity-pool'),
            )),
        ])
        this.tokens.forEach(token => {
            if (this.tokensCache.isCustomToken(token.address.toString())) {
                this.tokensCache.remove({ root: token.address.toString() } as TokenCache)
            }
        })
    }

    public async connectDexAccount(): Promise<void> {
        if (this.wallet.address === undefined) {
            return
        }

        try {
            this.setState('isConnectingDexAccount', true)
            await this.dex.connectOrCreate()
        }
        catch (e) {
            error('Connect to DEX Account error', e)
            this.setState('isConnectingDexAccount', false)
        }
    }

    public async connectPool(callbacks?: LiquidityStablePoolConnectCallbacks): Promise<void> {
        if (
            this.dex.address === undefined
            || this.wallet.account?.address === undefined
            || this.pool === undefined
            || this.pool?.tokens.length === 0
        ) {
            return
        }

        try {
            this.setState('isConnectingPool', true)

            const onTransactionSuccess = async (
                result: TransactionSuccessResult<LiquidityStablePoolConnectSuccessResult>,
            ): Promise<void> => {
                await Promise.allSettled([
                    this.dex.syncBalances(true),
                    this.dex.syncWallets(true),
                ])
                this.setState('isConnectingPool', false)
                await callbacks?.onTransactionSuccess?.(result)
            }

            await LiquidityStablePoolUtils.connect({
                dexAccountAddress: this.dex.address,
                roots: this.pool.tokens.map(token => token.address),
                senderAddress: this.wallet.account.address,
                // eslint-disable-next-line sort-keys
                onSend: callbacks?.onSend,
                onTransactionFailure: callbacks?.onTransactionFailure,
                onTransactionSuccess,
            }, { from: this.wallet.account.address })
        }
        catch (e) {
            error('Connect to Stable pool error', e)
            this.setState('isConnectingPool', false)
        }
    }

    public async depositToken(address: Address | string, callbacks?: DepositTokenCallbacks): Promise<void> {
        const tokenAddress = address.toString()

        if (
            this.dex.address === undefined
            || this.wallet.account?.address === undefined
            || !this.isAmountValid(tokenAddress)
        ) {
            return
        }

        const recipientTokenWallet = this.dex.getAccountWallet(tokenAddress)

        if (recipientTokenWallet === undefined) {
            throw Error('Recipient Token Wallet not found')
        }

        const amount = this.getAmount(tokenAddress)
        const callId = getSafeProcessingId()
        const dexBalance = this.getDexBalance(tokenAddress)
        const token = this.tokensMap.get(tokenAddress)
        const delta = new BigNumber(amount || 0)
            .shiftedBy(token?.decimals ?? 0)
            .minus(dexBalance || 0)
            .dp(0, BigNumber.ROUND_UP)

        if (!isGoodBignumber(delta)) {
            return
        }

        try {
            this.setState(
                'tokensWhichAwaitsDepositing',
                new ObservableMap(this.state.tokensWhichAwaitsDepositing).set(tokenAddress, true),
            )

            const onSend: DexAccountDepositTokenCallbacks['onSend'] = async (message, params) => {
                this.setState(prevState => {
                    const tokensWhichAwaitsDepositing = new ObservableMap(this.state.tokensWhichAwaitsDepositing)
                    tokensWhichAwaitsDepositing.delete(tokenAddress)
                    const tokensWhichDepositing = new ObservableMap(this.state.tokensWhichDepositing)
                    return ({
                        ...prevState,
                        tokensWhichAwaitsDepositing,
                        tokensWhichDepositing: tokensWhichDepositing.set(tokenAddress, true),
                    })
                })
                RECEIPTS.set(callId, {
                    amount: delta.toFixed(),
                    receivedDecimals: token?.decimals,
                    receivedIcon: token?.icon,
                    receivedRoot: tokenAddress,
                    receivedSymbol: token?.symbol,
                })
                await callbacks?.onSend?.(message, params)
            }

            const onTransactionSuccess: DexAccountDepositTokenCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(action(async () => {
                    await this.dex.syncBalances(true)
                    this.setState(prevState => {
                        const tokensWhichAwaitsDepositing = new ObservableMap(this.state.tokensWhichAwaitsDepositing)
                        tokensWhichAwaitsDepositing.delete(tokenAddress)
                        const tokensWhichDepositing = new ObservableMap(this.state.tokensWhichDepositing)
                        tokensWhichDepositing.delete(tokenAddress)
                        return ({ ...prevState, tokensWhichAwaitsDepositing, tokensWhichDepositing })
                    })
                    const receipt = RECEIPTS.get(callId)
                    await callbacks?.onTransactionSuccess?.(result, {
                        ...receipt,
                        amount: result.input.amount ?? receipt?.amount,
                        hash: result.transaction.id.hash,
                    })
                    RECEIPTS.delete(callId)
                }), 30)
            }

            const onTransactionFailure: DexAccountDepositTokenCallbacks['onTransactionFailure'] = async reason => {
                this.setState(prevState => {
                    const tokensWhichAwaitsDepositing = new ObservableMap(this.state.tokensWhichAwaitsDepositing)
                    tokensWhichAwaitsDepositing.delete(tokenAddress)
                    const tokensWhichDepositing = new ObservableMap(this.state.tokensWhichDepositing)
                    tokensWhichDepositing.delete(tokenAddress)
                    return ({ ...prevState, tokensWhichAwaitsDepositing, tokensWhichDepositing })
                })
                await callbacks?.onTransactionFailure?.(reason)
                RECEIPTS.delete(callId)
            }

            await DexAccountUtils.depositToken(this.dex.address, {
                amount: delta.toFixed(),
                callId,
                lastLt: this.dex.accountState?.lastTransactionId?.lt,
                recipientTokenWallet,
                remainingGasTo: this.wallet.account.address,
                senderAddress: this.wallet.account.address,
                senderTokenWalletAddress: token?.userWalletAddress,
                tokenAddress,
                // eslint-disable-next-line sort-keys
                onSend,
                onTransactionFailure,
                onTransactionSuccess,
            })
        }
        catch (e) {
            this.setState(prevState => {
                const tokensWhichAwaitsDepositing = new ObservableMap(this.state.tokensWhichAwaitsDepositing)
                tokensWhichAwaitsDepositing.delete(tokenAddress)
                return ({ ...prevState, tokensWhichAwaitsDepositing })
            })
            RECEIPTS.delete(callId)
        }
    }

    public async supply(callbacks?: DepositLiquidityCallbacks): Promise<void> {
        if (
            this.wallet.address === undefined
            || this.dex.address === undefined
            || this.pool?.lp.address === undefined
        ) {
            return
        }

        const callId = getSafeProcessingId()

        try {
            this.setState('isDepositingLiquidity', true)

            const pool = { ...this.pool }
            const poolAddress = this.pool.address

            const onSend: LiquidityStablePoolDepositCallbacks['onSend'] = async (message, params) => {
                this.setData('amounts', this.tokens.reduce<ObservableMap<string, string>>(
                    (acc, token) => acc.set(token.address.toString(), ''),
                    new ObservableMap(),
                ))
                this.setState('isDepositingLiquidity', false)
                RECEIPTS.set(callId, {
                    poolAddress: this.pool?.address,
                    receivedDecimals: this.pool?.lp.decimals,
                    receivedIcon: this.pool?.lp.icon,
                    receivedRoot: this.pool?.lp.address.toString(),
                    receivedSymbol: this.pool?.lp.symbol,
                })
                await callbacks?.onSend?.(message, params)
            }

            const onTransactionSuccess: LiquidityStablePoolDepositCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    if (this.pool?.address.toString() === poolAddress.toString()) {
                        const balances = await StablePoolUtils.balances(poolAddress)
                        this.setData('pool', {
                            ...pool,
                            lp: {
                                ...pool.lp,
                                balance: balances.lpSupply,
                            },
                            tokens: pool.tokens.map(
                                (token, idx) => ({
                                    ...token,
                                    balance: balances.tokens[idx],
                                }),
                            ),
                        })
                    }
                    await Promise.allSettled([
                        this.syncUserLiquidity(),
                        this.dex.syncBalances(true),
                    ])
                    this.setState('isDepositingLiquidity', false)
                    const receipt = RECEIPTS.get(callId)
                    await callbacks?.onTransactionSuccess?.(result, {
                        ...receipt,
                        amount: result.input.result.lp_reward,
                        hash: result.transaction.id.hash,
                    })
                    RECEIPTS.delete(callId)
                }, 30)
            }

            const onTransactionFailure: LiquidityStablePoolDepositCallbacks['onTransactionFailure'] = async reason => {
                this.setState('isDepositingLiquidity', false)
                await callbacks?.onTransactionFailure?.(reason)
                RECEIPTS.delete(callId)
            }

            await LiquidityStablePoolUtils.depositLiquidity({
                dexAccountAddress: this.dex.address,
                expected: { root: this.pool.lp.address },
                operations: Array.from(this.data.amounts).map(([root, amount]) => {
                    const token = this.tokensMap.get(root)
                    return {
                        amount: isGoodBignumber(amount)
                            ? new BigNumber(amount).shiftedBy(token?.decimals ?? 0).toFixed()
                            : '0',
                        root,
                    }
                }),
                poolAddress: this.poolAddress,
                poolState: this.pool.state,
                referrer: resolveEverscaleAddress('0:0000000000000000000000000000000000000000000000000000000000000000'),
                senderAddress: this.wallet.address,
                // eslint-disable-next-line sort-keys
                onSend,
                onTransactionFailure,
                onTransactionSuccess,
            })
        }
        catch (e) {
            this.setState('isDepositingLiquidity', false)
            RECEIPTS.delete(callId)
        }
    }

    public async withdrawLiquidity(callbacks?: LiquidityStablePoolWithdrawCallbacks): Promise<void> {
        if (this.wallet.address === undefined || this.pool === undefined) {
            return
        }

        try {
            this.setState('isWithdrawingLiquidity', true)

            const onTransactionSuccess: LiquidityStablePoolWithdrawCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    await this.syncUserLiquidity()
                    this.setState('isWithdrawingLiquidity', false)
                    await callbacks?.onTransactionSuccess?.(result)
                }, 30)
            }

            const onTransactionFailure: LiquidityStablePoolWithdrawCallbacks['onTransactionFailure'] = async reason => {
                this.setState('isWithdrawingLiquidity', false)
                await callbacks?.onTransactionFailure?.(reason)
            }

            await LiquidityStablePoolUtils.withdrawLiquidity({
                amount: this.pool.lp.userBalance ?? '0',
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
                onSend: callbacks?.onSend,
                onTransactionFailure,
                onTransactionSuccess,
            })
        }
        catch (e) {
            this.setState('isWithdrawingLiquidity', false)
        }
    }

    public async withdrawToken(address: Address | string, callbacks?: WithdrawTokenCallbacks): Promise<void> {
        if (this.dex.address === undefined || this.wallet.account?.address === undefined) {
            return
        }

        const tokenAddress = address.toString()

        const amount = this.getDexBalance(tokenAddress)
        const callId = getSafeProcessingId()
        const token = this.tokensMap.get(tokenAddress)

        try {
            this.setState(
                'tokensWhichWithdrawing',
                new ObservableMap(this.state.tokensWhichWithdrawing).set(tokenAddress, true),
            )

            const onSend: DexAccountWithdrawTokenCallbacks['onSend'] = async (message, params) => {
                RECEIPTS.set(callId, {
                    amount,
                    receivedDecimals: token?.decimals,
                    receivedIcon: token?.icon,
                    receivedRoot: tokenAddress,
                    receivedSymbol: token?.symbol,
                })
                await callbacks?.onSend?.(message, params)
            }

            const onTransactionSuccess: DexAccountWithdrawTokenCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    await this.dex.syncBalances(true)
                    this.setState(prevState => {
                        const tokensWhichWithdrawing = new ObservableMap(this.state.tokensWhichWithdrawing)
                        tokensWhichWithdrawing.delete(tokenAddress)
                        return ({ ...prevState, tokensWhichWithdrawing })
                    })
                    const receipt = RECEIPTS.get(callId)
                    await callbacks?.onTransactionSuccess?.(result, {
                        ...receipt,
                        amount: result.input.amount ?? receipt?.amount,
                        hash: result.transaction.id.hash,
                    })
                    RECEIPTS.delete(callId)
                }, 30)
            }

            const onTransactionFailure: DexAccountWithdrawTokenCallbacks['onTransactionFailure'] = action(async reason => {
                this.setState(prevState => {
                    const tokensWhichWithdrawing = new ObservableMap(this.state.tokensWhichWithdrawing)
                    tokensWhichWithdrawing.delete(tokenAddress)
                    return ({ ...prevState, tokensWhichWithdrawing })
                })
                await callbacks?.onTransactionFailure?.(reason)
                RECEIPTS.delete(callId)
            })

            await DexAccountUtils.withdrawToken(this.dex.address, {
                amount,
                callId,
                lastLt: this.dex.accountState?.lastTransactionId?.lt,
                recipientAddress: this.wallet.account.address,
                sendGasTo: this.wallet.account.address,
                tokenAddress: address,
                // eslint-disable-next-line sort-keys
                onSend,
                onTransactionFailure,
                onTransactionSuccess,
            })
        }
        catch (e) {
            this.setState(prevState => {
                const tokensWhichWithdrawing = new ObservableMap(this.state.tokensWhichWithdrawing)
                tokensWhichWithdrawing.delete(tokenAddress)
                return ({ ...prevState, tokensWhichWithdrawing })
            })
            RECEIPTS.delete(callId)
        }
    }

    public changeAmount(address: string, value: string): void {
        if (this.isPoolEmpty) {
            const amounts = new ObservableMap(this.data.amounts)
            this.pool?.tokens.forEach(token => {
                amounts.set(token.address.toString(), value)
            })
            this.setData('amounts', amounts)
        }
        else {
            this.setData('amounts', new ObservableMap(this.data.amounts).set(address, value))
        }
    }

    public getAmount(address: string): string {
        return this.data.amounts.get(address) ?? ''
    }

    public getCombinedBalance(address: string): string {
        const dexBalance = this.getDexBalance(address)
        const tokenUserBalance = this.tokensMap.get(address)?.userBalance
        return new BigNumber(tokenUserBalance ?? 0).plus(dexBalance ?? 0).toFixed()
    }

    public getDexBalance(address: string): string {
        return this.dex.getBalance(address) ?? '0'
    }

    public isAmountValid(address: string): boolean {
        const amount = this.getAmount(address)
        const balance = this.getCombinedBalance(address)
        const token = this.tokensMap.get(address)
        return amount.length > 0
            ? new BigNumber(amount ?? 0).shiftedBy(token?.decimals ?? 0).lte(balance)
            : true
    }

    public isTokenAwaitingDeposit(address: string): boolean | undefined {
        return this.state.tokensWhichAwaitsDepositing.get(address)
    }

    public isTokenDepositing(address: string): boolean | undefined {
        return this.state.tokensWhichDepositing.get(address)
    }

    public isTokenWithdrawing(address: string): boolean | undefined {
        return this.state.tokensWhichWithdrawing.get(address)
    }

    public isEnoughDexBalance(address: string): boolean {
        const amount = this.getAmount(address)
        const dexBalance = this.getDexBalance(address)
        const token = this.tokensMap.get(address)
        return new BigNumber(amount || 0).shiftedBy(token?.decimals ?? 0).lte(dexBalance ?? 0)
    }

    public isTokenAvailableToDeposit(address: string): boolean {
        const amount = this.getAmount(address)
        return isGoodBignumber(amount) ? (!this.isEnoughDexBalance(address) && !this.isTokenDepositing(address)) : false
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
            pool.lp.icon = lpToken?.icon
            pool.lp.symbol = lpToken?.symbol ?? pool.lp.symbol

            this.setData({
                amounts: pool.tokens.reduce<ObservableMap<string, string>>(
                    (acc, token) => acc.set(token.address.toString(), ''),
                    new ObservableMap(),
                ),
                pool,
            })

            if (pool.lp.userWalletAddress === undefined) {
                await this.syncUserLiquidity()
            }

            debug('Liquidity pool successfully synced', pool)
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
            const userBalance = this.pool.lp.userWalletAddress
                ? await TokenWalletUtils.balance({
                    tokenWalletAddress: this.pool.lp.userWalletAddress,
                })
                : await TokenWalletUtils.balance({
                    tokenRootAddress: this.pool.lp.address,
                    walletOwnerAddress: this.wallet.address,
                })

            this.setData('pool', {
                ...this.pool,
                lp: {
                    ...this.pool.lp,
                    userBalance,
                },
            })
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

                const state = await getFullContractState(event.address)
                const balances = await StablePoolUtils.balances(event.address, state)

                await this.syncUserLiquidity()

                const tokens = this.pool.tokens.slice().map((token, idx) => ({
                    ...token,
                    balance: balances.tokens[idx],
                }))

                this.setData('pool', {
                    ...this.pool,
                    lp: {
                        ...this.pool.lp,
                        balance: balances.lpSupply,
                    },
                    state,
                    tokens,
                })
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

    public get pool(): AddLiquidityFormStoreData['pool'] {
        return this.data.pool
    }

    /*
     * Memoized store state values
     * ----------------------------------------------------------------------------------
     */

    public get currentSharePercent(): string {
        return new BigNumber(this.pool?.lp.userBalance || 0)
            .times(100)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(8, BigNumber.ROUND_DOWN)
            .toFixed()
    }

    public get isCheckingDexAccount(): AddLiquidityFormStoreState['isCheckingDexAccount'] {
        return this.state.isCheckingDexAccount
    }

    public get isConnectingDexAccount(): AddLiquidityFormStoreState['isConnectingDexAccount'] {
        return this.state.isConnectingDexAccount
    }

    public get isConnectingPool(): AddLiquidityFormStoreState['isConnectingPool'] {
        return this.state.isConnectingPool
    }

    public get isDepositingLiquidity(): AddLiquidityFormStoreState['isDepositingLiquidity'] {
        return this.state.isDepositingLiquidity
    }

    public get isPreparing(): AddLiquidityFormStoreState['isPreparing'] {
        return this.state.isPreparing
    }

    public get isSyncingPool(): AddLiquidityFormStoreState['isSyncingPool'] {
        return this.state.isSyncingPool
    }

    public get isWithdrawingLiquidity(): AddLiquidityFormStoreState['isWithdrawingLiquidity'] {
        return this.state.isWithdrawingLiquidity
    }

    /*
     * Computed states and values
     * ----------------------------------------------------------------------------------
     */

    public get depositingTokens(): LiquidityStablePoolTokenData[] {
        const addresses = Array.from(this.state.tokensWhichDepositing.keys())
        return addresses.map(address => this.tokensMap.get(address)).filter(Boolean) as LiquidityStablePoolTokenData[]
    }

    public get firstInvalidAmountToken(): LiquidityStablePoolTokenData | undefined {
        return (this.isAmountsEmpty || this.isAmountsValid)
            ? undefined
            : Array.from(this.data.amounts)
                .filter(([address]) => !this.isAmountValid(address))
                .map(([address]) => this.tokensMap.get(address))
                .filter(Boolean)
                .shift()
    }

    public get isAmountsEmpty(): boolean {
        return Array.from(this.data.amounts).every(([, value]) => !isGoodBignumber(value))
    }

    public get isAmountsValid(): boolean {
        return Array.from(this.data.amounts).every(([address]) => this.isAmountValid(address))
    }

    public get isPoolConnected(): boolean {
        return (
            this.pool?.lp.address !== undefined
            && this.dex.getAccountWallet(this.pool.lp.address) !== undefined
            && this.pool.tokens.every(token => this.dex.getAccountWallet(token.address) !== undefined)
        )
    }

    public get isPoolDataAvailable(): boolean {
        return this.wallet.isReady && this.dex.address !== undefined
    }

    public get isPoolEmpty(): boolean {
        return new BigNumber(this.pool?.lp.balance || 0).isZero()
    }

    public get isTokensDepositing(): boolean {
        return Array.from(this.state.tokensWhichDepositing).some((([, state]) => state))
    }

    public get isWithdrawLiquidityAvailable(): boolean {
        return isGoodBignumber(this.pool?.lp.userBalance ?? 0)
    }

    public get lastDepositingToken(): LiquidityStablePoolTokenData | undefined {
        const address = Array.from(this.state.tokensWhichDepositing.keys()).pop()
        if (address === undefined) {
            return undefined
        }
        return this.tokensMap.get(address)
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
     * Computed Dex states and values
     * ----------------------------------------------------------------------------------
     */

    public get isDexAccountDataAvailable(): boolean {
        if (this.isSyncingPool === false) {
            return this.wallet.isReady && this.dex.address !== undefined
        }
        return this.wallet.isReady && this.dex.address !== undefined
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
            { fireImmediately: true },
        )

        await this.syncPool()
    }

    protected async handleWalletAccountChange(address?: Address): Promise<void> {
        this.dexAccountDeployDisposer = reaction(() => this.dex.accountState, async contract => {
            if (this.wallet.address === undefined) {
                this.dexAccountDeployDisposer?.()
                return
            }

            if (contract?.isDeployed) {
                await Promise.all([
                    this.dex.syncBalances(),
                    this.dex.syncWallets(),
                ])
            }

            this.setState('isConnectingDexAccount', !contract?.isDeployed)

            this.dexAccountDeployDisposer?.()
        })

        if (address === undefined) {
            this.setState(() => ({
                isInitializing: false,
                isPreparing: false,
            }))
            this.dexAccountDeployDisposer?.()
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

    protected dexAccountDeployDisposer: IReactionDisposer | undefined

    protected tokensCacheDisposer: IReactionDisposer | undefined

    protected tokensChangeDisposer: IReactionDisposer | undefined

    protected walletAccountDisposer: IReactionDisposer | undefined

}
