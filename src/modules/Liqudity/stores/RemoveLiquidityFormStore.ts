import BigNumber from 'bignumber.js'
import type { Address, Subscription } from 'everscale-inpage-provider'
import {
    action,
    comparer,
    computed,
    makeObservable,
    reaction,
    toJS,
} from 'mobx'
import type { IReactionDisposer } from 'mobx'

import { DexGasValuesAddress } from '@/config'
import { useStaticRpc } from '@/hooks'
import {
    dexGasValuesContract,
    DexUtils,
    getFullContractState,
    LiquidityPoolUtils,
    PairType,
    PairUtils,
    TokenWalletUtils,
} from '@/misc'
import type { LiquidityPoolWithdrawCallbacks } from '@/misc'
import type { PoolData } from '@/modules/Liqudity/types'
import { BaseStore } from '@/stores/BaseStore'
import type { DexAccountService } from '@/stores/DexAccountService'
import type { TokenCache, TokensCacheService } from '@/stores/TokensCacheService'
import type { WalletService } from '@/stores/WalletService'
import {
    addressesComparer,
    calcGas,
    debug,
    error,
    isGoodBignumber,
} from '@/utils'


export type RemoveLiquidityFormStoreData = {
    amount: string;
    leftToken?: string
    pool?: PoolData;
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

    constructor(
        public readonly wallet: WalletService,
        public readonly dex: DexAccountService,
        public readonly tokensCache: TokensCacheService,
    ) {
        super()

        this.setData(() => ({
            amount: '',
        }))

        this.setState(() => ({
            isPreparing: !wallet.isReady,
        }))

        makeObservable<RemoveLiquidityFormStore,
            | 'handleTokensCacheReady'
            | 'handleTokensChange'
            | 'handleWalletAccountChange'
        >(this, {
            amount: computed,
            currentShareLeft: computed,
            currentSharePercent: computed,
            currentShareRight: computed,
            handleTokensCacheReady: action.bound,
            handleTokensChange: action.bound,
            handleWalletAccountChange: action.bound,
            hasCustomToken: computed,
            isAmountValid: computed,
            isAwaitingConfirmation: computed,
            isCheckingDexAccount: computed,
            isInverted: computed,
            isPoolConnected: computed,
            isPoolDataAvailable: computed,
            isPoolEmpty: computed,
            isPreparing: computed,
            isReverted: computed,
            isSoloLiquidityProvider: computed,
            isStablePool: computed,
            isSyncingPool: computed,
            isWithdrawingLiquidity: computed,
            isWithdrawLiquidityAvailable: computed,
            leftDecimals: computed,
            leftToken: computed,
            pool: computed,
            receiveLeft: computed,
            receiveRight: computed,
            resultingLpUserBalance: computed,
            resultingShareLeft: computed,
            resultingSharePercent: computed,
            resultingShareRight: computed,
            rightDecimals: computed,
            rightToken: computed,
        })
    }

    public async init(): Promise<void> {
        if (this.state.isInitializing) {
            return
        }

        this.setState('isInitializing', true)

        if (this.data.leftToken === undefined || this.data.rightToken === undefined) {
            this.setState('isSyncingPool', false)
        }

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

    public async changeAmount(value: string): Promise<void> {
        this.setData('amount', value)

        if (this.isPoolEmpty) {
            // await this.syncPoolShare()

        }
    }

    public async withdrawLiquidity(callbacks?: LiquidityPoolWithdrawCallbacks): Promise<void> {
        if (this.wallet.address === undefined || this.pool === undefined) {
            return
        }

        try {
            this.setState('isAwaitingConfirmation', true)

            const onSend: LiquidityPoolWithdrawCallbacks['onSend'] = async (message, params) => {
                this.setState({
                    isAwaitingConfirmation: false,
                    isWithdrawingLiquidity: true,
                })
                await callbacks?.onSend?.(message, params)
            }

            const onTransactionSuccess: LiquidityPoolWithdrawCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    await this.syncUserLiquidity()
                    this.setState({
                        isAwaitingConfirmation: false,
                        isWithdrawingLiquidity: false,
                    })
                    await callbacks?.onTransactionSuccess?.(result)
                }, 30)
            }

            const onTransactionFailure: LiquidityPoolWithdrawCallbacks['onTransactionFailure'] = async reason => {
                this.setState({
                    isAwaitingConfirmation: false,
                    isWithdrawingLiquidity: false,
                })
                await callbacks?.onTransactionFailure?.(reason)
            }

            const [leftWalletState, rightWalletState] = await Promise.all([
                this.leftToken?.wallet ? getFullContractState(this.leftToken.wallet) : undefined,
                this.rightToken?.wallet ? getFullContractState(this.rightToken.wallet) : undefined,
            ]).catch(() => [undefined, undefined])

            const deployWalletValue = (
                !leftWalletState?.isDeployed || !rightWalletState?.isDeployed
            ) ? '100000000' : '0'

            const { dynamicGas, fixedValue } = (await dexGasValuesContract(DexGasValuesAddress)
                .methods.getPoolDirectNoFeeWithdrawGas({
                    deployWalletValue,
                    N: 2,
                })
                .call())
                .value0

            await LiquidityPoolUtils.withdrawLiquidity({
                amount: new BigNumber(this.amount || 0)
                    .dp(this.pool.lp.decimals ?? 0, BigNumber.ROUND_DOWN)
                    .shiftedBy(this.pool.lp.decimals ?? 0)
                    .toFixed(),
                deployWalletGrams: deployWalletValue,
                dexRootAddress: this.dex.dexRootAddress,
                dexRootState: toJS(this.dex.dexState),
                leftRootAddress: this.pool.left.address,
                leftRootUserWalletAddress: this.leftToken?.wallet,
                lpPairWalletAddress: this.pool.lp.walletAddress,
                lpRootAddress: this.pool.lp.address,
                lpRootState: this.pool.lp.state,
                lpUserWalletAddress: this.pool.lp.userWalletAddress,
                pairAddress: this.pool.address,
                pairState: toJS(this.pool.state),
                rightRootAddress: this.pool.right.address,
                rightRootUserWalletAddress: this.rightToken?.wallet,
                userAddress: this.wallet.address,
                // eslint-disable-next-line sort-keys
                onSend,
                onTransactionFailure,
                onTransactionSuccess,
            }, { amount: calcGas(fixedValue, dynamicGas) })
        }
        catch (e) {
            error(e)
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

        if (this.data.leftToken === undefined || this.data.rightToken === undefined) {
            this.setState('isSyncingPool', false)
            return
        }

        try {
            this.setState('isSyncingPool', true)

            const address = await PairUtils.check(
                this.dex.dexRootAddress,
                this.data.leftToken,
                this.data.rightToken,
                toJS(this.dex.dexState),
            )

            if (address === undefined) {
                this.setState('isSyncingPool', false)
                return
            }

            const pool = await LiquidityPoolUtils.get(address, this.wallet.address)

            this.setData('pool', pool)

            debug('Liquidity pool successfully synced', pool)
        }
        catch (e) {
            debug(e)
        }
        finally {
            this.setState('isSyncingPool', false)
        }
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
        if (
            this.dex.address === undefined
            || this.data.leftToken === undefined
            || this.data.rightToken === undefined
        ) {
            return
        }

        const address = this.pool?.address || await DexUtils.getExpectedPairAddress(
            this.dex.address,
            this.data.leftToken,
            this.data.rightToken,
        )

        if (address === undefined) {
            return
        }

        try {
            this.contractSubscriber = await staticRpc.subscribe(
                'contractStateChanged',
                { address },
            )
            debug('Subscribe to the Pair contract changes', address.toString())

            this.contractSubscriber.on('data', action(async event => {
                debug(
                    '%cRPC%c The Pair `contractStateChanged` event was captured',
                    'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 3px 6.5px',
                    'color: #c5e4f3',
                    event,
                )

                if (this.pool === undefined) {
                    return
                }

                const pool = { ...toJS(this.pool) }
                pool.state = await getFullContractState(event.address)
                const balances = await PairUtils.balances(event.address, pool.state)

                pool.left.balance = balances.left
                pool.lp.balance = balances.lpSupply
                pool.right.balance = balances.right

                this.setData('pool', pool)

                // await this.syncUserLiquidity()
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
                debug('Unsubscribe from the Pair Contract changes')
                await this.contractSubscriber.unsubscribe()
            }
            catch (e) {
                error('The Pair contract unsubscribe error', e)
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

    public get currentShareLeft(): string {
        const decimals = (
            this.isInverted ? this.rightToken?.decimals : this.leftToken?.decimals
        ) ?? this.pool?.left.decimals

        return new BigNumber(this.pool?.lp.userBalance || 0)
            .times(this.pool?.left.balance || 0)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(0, BigNumber.ROUND_DOWN)
            .shiftedBy(-(decimals ?? 0))
            .toFixed()
    }

    public get currentSharePercent(): string {
        return new BigNumber(this.pool?.lp.userBalance || 0)
            .times(100)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(8, BigNumber.ROUND_DOWN)
            .toFixed()
    }

    public get currentShareRight(): string {
        const decimals = (
            this.isInverted ? this.leftToken?.decimals : this.rightToken?.decimals
        ) ?? this.pool?.right.decimals

        return new BigNumber(this.pool?.lp.userBalance || 0)
            .times(this.pool?.right.balance || 0)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(0, BigNumber.ROUND_DOWN)
            .shiftedBy(-(decimals ?? 0))
            .toFixed()
    }

    public get isAmountValid(): boolean {
        return this.amount.length > 0
            ? new BigNumber(this.amount)
                .shiftedBy(this.pool?.lp.decimals ?? 0)
                .lte(this.pool?.lp.userBalance ?? 0)
            : true
    }

    public get isInverted(): boolean {
        if (this.pool?.left.address !== undefined && this.leftToken?.root !== undefined) {
            return this.pool.left.address.toString().toLowerCase() !== this.leftToken.root.toLowerCase()
        }
        return false
    }

    public get isPoolConnected(): boolean {
        return (
            this.leftToken?.root !== undefined
            && this.rightToken?.root !== undefined
            && this.pool?.lp.address !== undefined
            && this.dex.getAccountWallet(this.leftToken.root) !== undefined
            && this.dex.getAccountWallet(this.rightToken.root) !== undefined
            && this.dex.getAccountWallet(this.pool.lp.address) !== undefined
        )
    }

    public get isPoolDataAvailable(): boolean {
        if (this.isSyncingPool === false) {
            return (
                this.wallet.isReady
                && this.pool?.address !== undefined
                && this.leftToken !== undefined
                && this.rightToken !== undefined
            )
        }
        return (
            this.wallet.isReady
            && this.leftToken !== undefined
            && this.rightToken !== undefined
        )
    }

    public get isPoolEmpty(): boolean {
        return new BigNumber(this.pool?.lp.balance || 0).isZero()
    }

    public get isReverted(): boolean {
        return this.pool?.left.address.toString().toLowerCase() !== this.data.leftToken?.toLowerCase()
    }

    public get isSoloLiquidityProvider(): boolean {
        return this.isPoolEmpty || new BigNumber(this.pool?.lp.balance ?? 0).eq(this.pool?.lp.userBalance ?? 0)
    }

    public get isStablePool(): boolean {
        return this.pool?.type === PairType.STABLESWAP
    }

    public get isWithdrawLiquidityAvailable(): boolean {
        return isGoodBignumber(this.pool?.lp.userBalance ?? 0) && isGoodBignumber(this.amount)
    }

    public get leftDecimals(): number | undefined {
        return this.leftToken?.decimals ?? (this.isInverted ? this.pool?.right.decimals : this.pool?.left.decimals)
    }

    public get leftToken(): TokenCache | undefined {
        return this.tokensCache.get(this.data.leftToken)
    }

    public get receiveLeft(): string {
        const decimals = (
            this.isInverted ? this.rightToken?.decimals : this.leftToken?.decimals
        ) ?? this.pool?.left.decimals

        return new BigNumber(new BigNumber(this.amount || 0).shiftedBy(this.pool?.lp.decimals ?? 0))
            .times(this.pool?.left.balance || 0)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(0, BigNumber.ROUND_DOWN)
            .shiftedBy(-(decimals ?? 0))
            .toFixed()
    }

    public get receiveRight(): string {
        const decimals = (
            this.isInverted ? this.leftToken?.decimals : this.rightToken?.decimals
        ) ?? this.pool?.right.decimals

        return new BigNumber(new BigNumber(this.amount || 0).shiftedBy(this.pool?.lp.decimals ?? 0))
            .times(this.pool?.right.balance || 0)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(0, BigNumber.ROUND_DOWN)
            .shiftedBy(-(decimals ?? 0))
            .toFixed()
    }

    public get resultingLpUserBalance(): string {
        return new BigNumber(this.pool?.lp.userBalance || 0)
            .minus(new BigNumber(this.amount || 0).shiftedBy(this.pool?.lp.decimals ?? 0))
            .toFixed()
    }

    public get resultingShareLeft(): string | undefined {
        if (!isGoodBignumber(this.amount)) {
            return undefined
        }

        const decimals = (
            this.isInverted ? this.rightToken?.decimals : this.leftToken?.decimals
        ) ?? this.pool?.left.decimals

        return new BigNumber(this.resultingLpUserBalance)
            .times(this.pool?.left.balance || 0)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(0, BigNumber.ROUND_DOWN)
            .shiftedBy(-(decimals ?? 0))
            .toFixed()
    }

    public get resultingSharePercent(): string | undefined {
        if (!isGoodBignumber(this.amount)) {
            return undefined
        }

        if (
            this.isSoloLiquidityProvider
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

    public get resultingShareRight(): string | undefined {
        if (!isGoodBignumber(this.amount)) {
            return undefined
        }

        const decimals = (
            this.isInverted ? this.leftToken?.decimals : this.rightToken?.decimals
        ) ?? this.pool?.right.decimals

        return new BigNumber(this.resultingLpUserBalance)
            .times(this.pool?.right.balance || 0)
            .div(isGoodBignumber(this.pool?.lp.balance ?? 0) ? this.pool?.lp.balance ?? 0 : 1)
            .dp(0, BigNumber.ROUND_DOWN)
            .shiftedBy(-(decimals ?? 0))
            .toFixed()
    }

    public get rightDecimals(): number | undefined {
        return this.rightToken?.decimals ?? (this.isInverted ? this.pool?.left.decimals : this.pool?.right.decimals)
    }

    public get rightToken(): TokenCache | undefined {
        return this.tokensCache.get(this.data.rightToken)
    }

    public get hasCustomToken(): boolean {
        if (!this.tokensCache.isReady) {
            return false
        }

        return (
            (this.data.leftToken ? this.tokensCache.isCustomToken(this.data.leftToken) : undefined)
            || (this.data.rightToken ? this.tokensCache.isCustomToken(this.data.rightToken) : undefined)
        ) ?? true
    }

    /*
     * Reactions handlers
     * ----------------------------------------------------------------------------------
     */

    protected async handleTokensChange(
        roots: (string | undefined)[] = [],
        prevRoots: (string | undefined)[] = [],
    ): Promise<void> {
        const [leftRoot, rightRoot] = roots
        const [prevLeftRoot, prevRightRoot] = prevRoots

        this.setData({
            amount: '',
            pool: undefined,
        })

        await this.unsubscribe()

        if (leftRoot && rightRoot) {
            await this.syncPool()
            await this.subscribe()
        }

        await Promise.allSettled([
            (prevLeftRoot !== undefined && ![leftRoot, rightRoot].includes(prevLeftRoot))
                ? this.tokensCache.unwatch(prevLeftRoot, 'liquidity-add')
                : undefined,
            (prevRightRoot !== undefined && ![leftRoot, rightRoot].includes(prevRightRoot))
                ? this.tokensCache.unwatch(prevRightRoot, 'liquidity-add')
                : undefined,
        ])
    }

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
    }

    protected async handleWalletAccountChange(address?: Address): Promise<void> {
        this.tokensChangeDisposer = reaction(
            () => [this.data.leftToken, this.data.rightToken],
            this.handleTokensChange,
            {
                equals: comparer.structural,
                fireImmediately: true,
            },
        )

        if (address === undefined) {
            this.setData('pool', undefined)
            this.setState(() => ({
                isInitializing: false,
                isPreparing: false,
            }))
            this.tokensCache.tokens.forEach(token => {
                this.tokensCache.update(token.root, 'balance', undefined)
                this.tokensCache.update(token.root, 'wallet', undefined)
            })
            return
        }

        await this.checkDexAccount()
    }

    protected contractSubscriber: Subscription<'contractStateChanged'> | undefined

    protected tokensCacheDisposer: IReactionDisposer | undefined

    protected tokensChangeDisposer: IReactionDisposer | undefined

    protected walletAccountDisposer: IReactionDisposer | undefined

}
