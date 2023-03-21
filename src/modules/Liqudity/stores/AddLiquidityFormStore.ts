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

import { DexGasValuesAddress, SwapReferrerAddress } from '@/config'
import { useStaticRpc } from '@/hooks'
import {
    DexAccountUtils, dexGasValuesContract,
    DexUtils,
    getFullContractState,
    LiquidityPoolUtils,
    PairType,
    PairUtils,
    TokenWalletUtils,
} from '@/misc'
import type {
    DexAccountDepositTokenCallbacks,
    DexAccountDepositTokenParams,
    DexAccountWithdrawTokenCallbacks,
    DexAccountWithdrawTokenParams,
    LiquidityPoolConnectCallbacks,
    LiquidityPoolCreateCallbacks,
    LiquidityPoolDepositCallbacks,
    LiquidityPoolWithdrawCallbacks,
} from '@/misc'
import { RECEIPTS } from '@/modules/Liqudity/constants'
import type {
    DepositLiquidityCallbacks,
    DepositTokenCallbacks,
    PoolData,
    WithdrawTokenCallbacks,
} from '@/modules/Liqudity/types'
import { BaseStore } from '@/stores/BaseStore'
import type { WalletService } from '@/stores/WalletService'
import type { DexAccountService } from '@/stores/DexAccountService'
import type { TokenCache, TokensCacheService } from '@/stores/TokensCacheService'
import {
    addressesComparer,
    calcGas,
    debug,
    error,
    getSafeProcessingId,
    isGoodBignumber,
    throttle,
} from '@/utils'


export type AddLiquidityFormStoreData = {
    leftAmount: string;
    leftToken?: string;
    pool?: PoolData;
    rightAmount: string;
    rightToken?: string;
}

export type AddLiquidityFormStoreState = {
    isAutoExchangeEnabled?: boolean;
    isAwaitingLeftDeposit?: boolean;
    isAwaitingRightDeposit?: boolean;
    isCheckingDexAccount?: boolean;
    isConnectingDexAccount?: boolean;
    isConnectingPool?: boolean;
    isCreatingPool?: boolean;
    isDepositingLeft?: boolean;
    isDepositingLiquidity?: boolean;
    isDepositingRight?: boolean;
    isInitializing?: boolean;
    isPreparing?: boolean;
    isSyncingPool?: boolean;
    isWithdrawingLeftToken?: boolean;
    isWithdrawingLiquidity?: boolean;
    isWithdrawingRightToken?: boolean;
    side: 'left' | 'right';
}

type InternalDepositTokenParams = Pick<
    DexAccountDepositTokenParams,
    | 'amount'
    | 'callId'
    | 'tokenAddress'
    | 'senderTokenWalletAddress'
> & DexAccountDepositTokenCallbacks

type InternalWithdrawTokenParams = Pick<
    DexAccountWithdrawTokenParams,
    | 'amount'
    | 'callId'
    | 'tokenAddress'
> & DexAccountWithdrawTokenCallbacks


const staticRpc = useStaticRpc()


export class AddLiquidityFormStore extends BaseStore<AddLiquidityFormStoreData, AddLiquidityFormStoreState> {

    constructor(
        public readonly wallet: WalletService,
        public readonly dex: DexAccountService,
        public readonly tokensCache: TokensCacheService,
    ) {
        super()

        this.setData(() => ({
            leftAmount: '',
            rightAmount: '',
        }))

        this.setState(() => ({
            isPreparing: !wallet.isReady,
            side: 'left',
        }))

        makeObservable<
            AddLiquidityFormStore,
            | 'handleChangeTokens'
            | 'handleTokensCacheReady'
            | 'handleWalletAccountChange'
        >(this, {
            currentShareLeft: computed,
            currentSharePercent: computed,
            currentShareRight: computed,
            dexLeftBalance: computed,
            dexRightBalance: computed,
            handleChangeTokens: action.bound,
            handleTokensCacheReady: action.bound,
            handleWalletAccountChange: action.bound,
            hasCustomToken: computed,
            isAutoExchangeAvailable: computed,
            isAutoExchangeEnabled: computed,
            isAwaitingLeftDeposit: computed,
            isAwaitingRightDeposit: computed,
            isCheckingDexAccount: computed,
            isConnectingDexAccount: computed,
            isConnectingPool: computed,
            isCreatingPool: computed,
            isDepositingLeft: computed,
            isDepositingLiquidity: computed,
            isDepositingRight: computed,
            isDexAccountDataAvailable: computed,
            isEnoughDexLeftBalance: computed,
            isEnoughDexRightBalance: computed,
            isInsufficientLeftBalance: computed,
            isInsufficientRightBalance: computed,
            isInverted: computed,
            isLeftAmountValid: computed,
            isPoolConnected: computed,
            isPoolDataAvailable: computed,
            isPoolEmpty: computed,
            isPreparing: computed,
            isRightAmountValid: computed,
            isStablePool: computed,
            isSupplyReady: computed,
            isSyncingPool: computed,
            isWithdrawingLeftToken: computed,
            isWithdrawingLiquidity: computed,
            isWithdrawingRightToken: computed,
            isWithdrawLiquidityAvailable: computed,
            leftAmount: computed,
            leftBalance: computed,
            leftDecimals: computed,
            leftPrice: computed,
            leftToken: computed,
            pool: computed,
            rightAmount: computed,
            rightBalance: computed,
            rightDecimals: computed,
            rightPrice: computed,
            rightToken: computed,
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
        ])
    }

    public async changeLeftAmount(value: string): Promise<void> {
        this.setState('side', 'left')
        this.setData('leftAmount', value)

        if (this.isPoolEmpty || this.isAutoExchangeEnabled) {
            // await this.syncPoolShare()
            return
        }

        if (isGoodBignumber(value) && this.rightToken !== undefined) {
            const rightAmount = new BigNumber(this.rightPrice ?? 0)
                .times(value)
                .dp(this.rightDecimals ?? 0, BigNumber.ROUND_DOWN)

            this.setData('rightAmount', isGoodBignumber(rightAmount) ? rightAmount.toFixed() : '')
        }
        else {
            this.setData('rightAmount', '')
        }
    }

    public async changeRightAmount(value: string): Promise<void> {
        this.setState('side', 'right')
        this.setData('rightAmount', value)

        if (this.isPoolEmpty || this.isAutoExchangeEnabled) {
            // await this.syncPoolShare()
            return
        }

        if (isGoodBignumber(value) && this.leftToken !== undefined) {
            const leftAmount = new BigNumber(this.leftPrice ?? 0)
                .times(value)
                .dp(this.leftDecimals ?? 0, BigNumber.ROUND_DOWN)

            this.setData('leftAmount', isGoodBignumber(leftAmount) ? leftAmount.toFixed() : '')
        }
        else {
            this.setData('leftAmount', '')
        }
    }

    public async changeLeftToken(root?: string): Promise<void> {
        if (root === undefined) {
            return
        }

        const isReverting = root === this.data.rightToken

        if (isReverting) {
            this.setData({
                leftToken: root,
                rightToken: this.data.leftToken,
            })
        }
        else {
            await this.unsubscribe()

            this.setData({
                leftAmount: '',
                leftToken: root,
                pool: undefined,
                rightAmount: '',
            })
            this.setState('isAutoExchangeEnabled', undefined)
        }

        if (this.data.leftToken === undefined || this.data.rightToken === undefined) {
            this.setData('pool', undefined)
            return
        }

        if (!isReverting) {
            await this.syncPool()
            await this.subscribe()
        }
    }

    public async changeRightToken(root?: string): Promise<void> {
        if (root === undefined) {
            return
        }

        const isReverting = root === this.data.leftToken

        if (isReverting) {
            this.setData({
                leftToken: this.data.rightToken,
                rightToken: root,
            })
        }
        else {
            await this.unsubscribe()

            this.setData({
                leftAmount: '',
                pool: undefined,
                rightAmount: '',
                rightToken: root,
            })
            this.setState('isAutoExchangeEnabled', undefined)
        }

        if (this.data.leftToken === undefined || this.data.rightToken === undefined) {
            this.setData('pool', undefined)
            return
        }

        if (!isReverting) {
            await this.syncPool()
            await this.subscribe()
        }
    }

    public async toggleAutoExchange(): Promise<void> {
        this.setState('isAutoExchangeEnabled', !this.isAutoExchangeEnabled)

        if (!this.isAutoExchangeEnabled) {
            await this.syncAmounts()
        }
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
            this.setState('isConnectingDexAccount', false)
        }
    }

    public async connectPool(callbacks?: LiquidityPoolConnectCallbacks): Promise<void> {
        if (
            this.dex.address === undefined
            || this.wallet.account?.address === undefined
            || this.data.leftToken === undefined
            || this.data.rightToken === undefined
        ) {
            return
        }

        try {
            this.setState('isConnectingPool', true)

            const onTransactionSuccess: LiquidityPoolConnectCallbacks['onTransactionSuccess'] = async result => {
                await Promise.allSettled([
                    this.dex.syncBalances(true),
                    this.dex.syncWallets(true),
                ])
                this.setState('isConnectingPool', false)
                await callbacks?.onTransactionSuccess?.(result)
            }

            const { dynamicGas, fixedValue } = (await dexGasValuesContract(DexGasValuesAddress)
                .methods.getAddPoolGas({ N: 2 })
                .call())
                .value0

            await LiquidityPoolUtils.connect({
                dexAccountAddress: this.dex.address,
                leftRootAddress: this.data.leftToken,
                rightRootAddress: this.data.rightToken,
                senderAddress: this.wallet.account.address,
                // eslint-disable-next-line sort-keys
                onSend: callbacks?.onSend,
                onTransactionFailure: callbacks?.onTransactionFailure,
                onTransactionSuccess,
            }, {
                amount: calcGas(fixedValue, dynamicGas),
                from: this.wallet.account.address,
            })
        }
        catch (e) {
            this.setState('isConnectingPool', false)
        }
    }

    public async createPool(callbacks?: LiquidityPoolCreateCallbacks): Promise<void> {
        if (
            this.wallet.account?.address === undefined
            || this.data.leftToken === undefined
            || this.data.rightToken === undefined
        ) {
            return
        }

        try {
            this.setState('isCreatingPool', true)

            const onTransactionSuccess: LiquidityPoolCreateCallbacks['onTransactionSuccess'] = async result => {
                await Promise.allSettled([
                    this.dex.syncBalances(true),
                    this.dex.syncWallets(true),
                ])
                this.setState('isCreatingPool', false)
                await Promise.allSettled([
                    callbacks?.onTransactionSuccess?.(result),
                    this.syncPool(),
                ])
            }

            const expectedAddress = this.pool?.address ?? await DexUtils.getExpectedPairAddress(
                this.dex.dexRootAddress,
                this.data.leftToken,
                this.data.rightToken,
                toJS(this.dex.dexState),
            )

            const { dynamicGas, fixedValue } = (await dexGasValuesContract(DexGasValuesAddress)
                .methods.getDeployPoolGas({ N: 2 })
                .call())
                .value0

            await LiquidityPoolUtils.create({
                dexRootAddress: this.dex.dexRootAddress,
                expectedAddress,
                leftRootAddress: this.data.leftToken,
                rightRootAddress: this.data.rightToken,
                sendGasTo:  this.wallet.account.address,
                // eslint-disable-next-line sort-keys
                onSend: callbacks?.onSend,
                onTransactionFailure: callbacks?.onTransactionFailure,
                onTransactionSuccess,
            }, {
                amount: calcGas(fixedValue, dynamicGas),
                from:  this.wallet.account.address,
            })
        }
        catch (e) {
            this.setState('isCreatingPool', false)
        }
    }

    public async depositLeftToken(callbacks?: DepositTokenCallbacks): Promise<void> {
        if (
            this.dex.address === undefined
            || this.wallet.account?.address === undefined
            || this.leftToken?.root === undefined
            || !this.isLeftAmountValid
        ) {
            return
        }

        const callId = getSafeProcessingId()
        const delta = new BigNumber(this.leftAmount || 0)
            .shiftedBy(this.leftDecimals ?? 0)
            .minus(this.dexLeftBalance || 0)
            .dp(0, BigNumber.ROUND_UP)

        if (!isGoodBignumber(delta)) {
            return
        }

        try {
            this.setState('isAwaitingLeftDeposit', true)

            const onSend: DexAccountDepositTokenCallbacks['onSend'] = async (message, params) => {
                this.setState({
                    isAwaitingLeftDeposit: false,
                    isDepositingLeft: true,
                })
                RECEIPTS.set(callId, {
                    amount: delta.toFixed(),
                    receivedDecimals: this.leftDecimals,
                    receivedIcon: this.leftToken?.icon,
                    receivedRoot: this.leftToken?.root,
                    receivedSymbol: this.leftToken?.symbol,
                })
                await callbacks?.onSend?.(message, params)
            }

            const onTransactionSuccess: DexAccountDepositTokenCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    await this.dex.syncBalances(true)
                    this.setState({
                        isAwaitingLeftDeposit: false,
                        isDepositingLeft: false,
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

            const onTransactionFailure: DexAccountDepositTokenCallbacks['onTransactionFailure'] = async reason => {
                this.setState({
                    isAwaitingLeftDeposit: false,
                    isDepositingLeft: false,
                })
                await callbacks?.onTransactionFailure?.(reason)
                RECEIPTS.delete(callId)
            }

            await this.depositToken({
                amount: delta.toFixed(),
                callId,
                senderTokenWalletAddress: this.leftToken.wallet,
                tokenAddress: this.leftToken.root,
                // eslint-disable-next-line sort-keys
                onSend,
                onTransactionFailure,
                onTransactionSuccess,
            })
        }
        catch (e) {
            this.setState('isAwaitingLeftDeposit', false)
            RECEIPTS.delete(callId)
        }
    }

    public async depositRightToken(callbacks?: DepositTokenCallbacks): Promise<void> {
        if (
            this.dex.address === undefined
            || this.wallet.account?.address === undefined
            || this.rightToken?.root === undefined
            || !this.isRightAmountValid
        ) {
            return
        }

        const callId = getSafeProcessingId()
        const delta = new BigNumber(this.rightAmount || 0)
            .shiftedBy(this.rightDecimals ?? 0)
            .minus(this.dexRightBalance || 0)
            .dp(0, BigNumber.ROUND_UP)

        if (!isGoodBignumber(delta)) {
            return
        }

        try {
            this.setState('isAwaitingRightDeposit', true)

            const onSend: DexAccountDepositTokenCallbacks['onSend'] = async (message, params) => {
                this.setState({
                    isAwaitingRightDeposit: false,
                    isDepositingRight: true,
                })
                RECEIPTS.set(callId, {
                    amount: delta.toFixed(),
                    receivedDecimals: this.rightDecimals,
                    receivedIcon: this.rightToken?.icon,
                    receivedRoot: this.rightToken?.root,
                    receivedSymbol: this.rightToken?.symbol,
                })
                await callbacks?.onSend?.(message, params)
            }

            const onTransactionSuccess: DexAccountDepositTokenCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    await this.dex.syncBalances(true)
                    this.setState({
                        isAwaitingRightDeposit: false,
                        isDepositingRight: false,
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

            const onTransactionFailure: DexAccountDepositTokenCallbacks['onTransactionFailure'] = async reason => {
                this.setState({
                    isAwaitingRightDeposit: false,
                    isDepositingRight: false,
                })
                await callbacks?.onTransactionFailure?.(reason)
                RECEIPTS.delete(callId)
            }

            await this.depositToken({
                amount: delta.toFixed(),
                callId,
                senderTokenWalletAddress: this.rightToken.wallet,
                tokenAddress: this.rightToken.root,
                // eslint-disable-next-line sort-keys
                onSend,
                onTransactionFailure,
                onTransactionSuccess,
            })
        }
        catch (e) {
            this.setState('isAwaitingRightDeposit', false)
            RECEIPTS.delete(callId)
        }
    }

    public async supply(callbacks?: DepositLiquidityCallbacks): Promise<void> {
        if (
            this.wallet.address === undefined
            || this.dex.address === undefined
            || this.pool?.address === undefined
            || this.pool.lp.address === undefined
            || this.data.leftToken === undefined
            || this.data.rightToken === undefined
        ) {
            return
        }

        const callId = getSafeProcessingId()

        try {
            this.setState('isDepositingLiquidity', true)

            const pool = { ...this.pool }
            const poolAddress = this.pool.address

            const onSend: LiquidityPoolDepositCallbacks['onSend'] = async (message, params) => {
                this.setData({
                    leftAmount: '',
                    rightAmount: '',
                })
                this.setState('isDepositingLiquidity', false)
                RECEIPTS.set(callId, {
                    poolAddress: this.pool?.address,
                    receivedDecimals: this.pool?.lp.decimals,
                    receivedIcon: this.pool?.lp.icon,
                    receivedRoot: this.pool?.lp.address.toString(),
                    receivedSymbol: 'LP', // this.pool?.lp.symbol,
                })
                await callbacks?.onSend?.(message, params)
            }

            const onTransactionSuccess: LiquidityPoolDepositCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    if (this.pool?.address.toString() === poolAddress.toString()) {
                        const balances = await PairUtils.balances(poolAddress)
                        this.setData('pool', {
                            ...pool,
                            left: {
                                ...pool.left,
                                balance: balances.left,
                            },
                            lp: {
                                ...pool.lp,
                                balance: balances.lpSupply,
                            },
                            right: {
                                ...pool.right,
                                balance: balances.right,
                            },
                        })
                    }
                    await Promise.allSettled([
                        this.syncUserLiquidity(),
                        this.dex.syncBalances(true),
                    ])
                    this.setState('isDepositingLiquidity', false)
                    const receipt = RECEIPTS.get(callId)
                    let { amount = '0' } = { ...receipt }
                    if (result.input.type === 'common') {
                        amount = new BigNumber(result.input.result.step_1_lp_reward)
                            .plus(result.input.result.step_3_lp_reward)
                            .toFixed()
                    }
                    else if (result.input.type === 'stable') {
                        amount = result.input.result.lp_reward
                    }
                    await callbacks?.onTransactionSuccess?.(result, {
                        ...receipt,
                        amount,
                        hash: result.transaction.id.hash,
                    })
                    RECEIPTS.delete(callId)
                }, 30)
            }

            const onTransactionFailure: LiquidityPoolDepositCallbacks['onTransactionFailure'] = async reason => {
                this.setState('isDepositingLiquidity', false)
                await callbacks?.onTransactionFailure?.(reason)
                RECEIPTS.delete(callId)
            }

            const { dynamicGas, fixedValue } = (await dexGasValuesContract(DexGasValuesAddress)
                .methods.getAccountDepositGas({ N: 2, referrer: SwapReferrerAddress })
                .call())
                .value0

            await LiquidityPoolUtils.depositLiquidity({
                autoChange: !!this.isAutoExchangeEnabled,
                callId,
                dexAccountAddress: this.dex.address,
                expectedLpAddress: this.pool.lp.address,
                leftAmount: new BigNumber(this.leftAmount || 0).shiftedBy(this.leftDecimals ?? 0).dp(0).toFixed(),
                leftRootAddress: this.data.leftToken,
                rightAmount: new BigNumber(this.rightAmount || 0).shiftedBy(this.rightDecimals ?? 0).dp(0).toFixed(),
                rightRootAddress: this.data.rightToken,
                senderAddress: this.wallet.address,
                // eslint-disable-next-line sort-keys
                onSend,
                onTransactionFailure,
                onTransactionSuccess,
            }, { amount: calcGas(fixedValue, dynamicGas) })
        }
        catch (e) {
            this.setState('isDepositingLiquidity', false)
            RECEIPTS.delete(callId)
        }
    }

    public async withdrawLeftToken(callbacks?: WithdrawTokenCallbacks): Promise<void> {
        if (this.wallet.account?.address === undefined || this.leftToken?.root === undefined) {
            return
        }

        const callId = getSafeProcessingId()

        try {
            this.setState('isWithdrawingLeftToken', true)

            const onSend: DexAccountWithdrawTokenCallbacks['onSend'] = async (message, params) => {
                RECEIPTS.set(callId, {
                    amount: this.dexLeftBalance || '0',
                    receivedDecimals: this.leftDecimals,
                    receivedIcon: this.leftToken?.icon,
                    receivedRoot: this.leftToken?.root,
                    receivedSymbol: this.leftToken?.symbol,
                })
                await callbacks?.onSend?.(message, params)
            }

            const onTransactionSuccess: DexAccountWithdrawTokenCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    await this.dex.syncBalances(true)
                    this.setState('isWithdrawingLeftToken', false)
                    const receipt = RECEIPTS.get(callId)
                    await callbacks?.onTransactionSuccess?.(result, {
                        ...receipt,
                        amount: result.input.amount ?? receipt?.amount,
                        hash: result.transaction.id.hash,
                    })
                    RECEIPTS.delete(callId)
                }, 30)
            }

            const onTransactionFailure: DexAccountWithdrawTokenCallbacks['onTransactionFailure'] = async reason => {
                this.setState('isWithdrawingLeftToken', false)
                await callbacks?.onTransactionFailure?.(reason)
                RECEIPTS.delete(callId)
            }

            await this.withdrawToken({
                amount: this.dexLeftBalance || '0',
                callId,
                tokenAddress: this.leftToken.root,
                // eslint-disable-next-line sort-keys
                onSend,
                onTransactionFailure,
                onTransactionSuccess,
            })
        }
        catch (e) {
            this.setState('isWithdrawingLeftToken', false)
            RECEIPTS.delete(callId)
        }
    }

    public async withdrawLiquidity(callbacks?: LiquidityPoolWithdrawCallbacks): Promise<void> {
        if (this.wallet.address === undefined || this.pool === undefined) {
            return
        }

        try {
            this.setState('isWithdrawingLiquidity', true)

            const onTransactionSuccess: LiquidityPoolWithdrawCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    await this.syncUserLiquidity()
                    this.setState('isWithdrawingLiquidity', false)
                    await callbacks?.onTransactionSuccess?.(result)
                }, 30)
            }

            const onTransactionFailure: LiquidityPoolWithdrawCallbacks['onTransactionFailure'] = async reason => {
                this.setState('isWithdrawingLiquidity', false)
                await callbacks?.onTransactionFailure?.(reason)
            }

            const deployWalletValue = (
                this.pool.left.walletAddress == null || this.pool.right.walletAddress == null
            ) ? '100000000' : '0'

            const { dynamicGas, fixedValue } = (await dexGasValuesContract(DexGasValuesAddress)
                .methods.getPoolDirectNoFeeWithdrawGas({
                    deployWalletValue,
                    N: 2,
                })
                .call())
                .value0

            await LiquidityPoolUtils.withdrawLiquidity({
                amount: this.pool.lp.userBalance ?? '0',
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
                onSend: callbacks?.onSend,
                onTransactionFailure,
                onTransactionSuccess,
            }, { amount: calcGas(fixedValue, dynamicGas) })
        }
        catch (e) {
            this.setState('isWithdrawingLiquidity', false)
        }
    }

    public async withdrawRightToken(callbacks?: WithdrawTokenCallbacks): Promise<void> {
        if (this.wallet.account?.address === undefined || this.rightToken?.root === undefined) {
            return
        }

        const callId = getSafeProcessingId()

        try {
            this.setState('isWithdrawingRightToken', true)

            const onSend: DexAccountWithdrawTokenCallbacks['onSend'] = async (message, params) => {
                RECEIPTS.set(callId, {
                    amount: this.dexRightBalance || '0',
                    receivedDecimals: this.rightDecimals,
                    receivedIcon: this.rightToken?.icon,
                    receivedRoot: this.rightToken?.root,
                    receivedSymbol: this.rightToken?.symbol,
                })
                await callbacks?.onSend?.(message, params)
            }

            const onTransactionSuccess: DexAccountWithdrawTokenCallbacks['onTransactionSuccess'] = async result => {
                setTimeout(async () => {
                    await this.dex.syncBalances(true)
                    this.setState('isWithdrawingRightToken', false)
                    const receipt = RECEIPTS.get(callId)
                    await callbacks?.onTransactionSuccess?.(result, {
                        ...receipt,
                        amount: result.input.amount ?? receipt?.amount,
                        hash: result.transaction.id.hash,
                    })
                    RECEIPTS.delete(callId)
                }, 30)
            }

            const onTransactionFailure: DexAccountWithdrawTokenCallbacks['onTransactionFailure'] = async reason => {
                this.setState('isWithdrawingRightToken', false)
                await callbacks?.onTransactionFailure?.(reason)
                RECEIPTS.delete(callId)
            }

            await this.withdrawToken({
                amount: this.dexRightBalance || '0',
                callId,
                tokenAddress: this.rightToken.root,
                // eslint-disable-next-line sort-keys
                onSend,
                onTransactionFailure,
                onTransactionSuccess,
            })
        }
        catch (e) {
            this.setState('isWithdrawingRightToken', false)
            RECEIPTS.delete(callId)
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

    protected async depositToken(params: InternalDepositTokenParams): Promise<void> {
        if (this.dex.address === undefined || this.wallet.account?.address === undefined) {
            return
        }

        const recipientTokenWallet = params.tokenAddress ? this.dex.getAccountWallet(params.tokenAddress) : undefined

        if (recipientTokenWallet === undefined) {
            throw Error('Recipient Token Wallet not found')
        }

        const { dynamicGas, fixedValue } = (await dexGasValuesContract(DexGasValuesAddress)
            .methods.getDepositToAccountGas({})
            .call())
            .value0

        await DexAccountUtils.depositToken(this.dex.address, {
            amount: params.amount,
            callId: params.callId,
            lastLt: this.dex.accountState?.lastTransactionId?.lt,
            recipientTokenWallet,
            remainingGasTo: this.wallet.account.address,
            senderAddress: this.wallet.account.address,
            senderTokenWalletAddress: params.senderTokenWalletAddress,
            tokenAddress: params.tokenAddress,
            // eslint-disable-next-line sort-keys
            onSend: params?.onSend,
            onTransactionFailure: params?.onTransactionFailure,
            onTransactionSuccess: params?.onTransactionSuccess,
        }, {
            amount: calcGas(fixedValue, dynamicGas),
        })
    }

    protected async syncAmounts(): Promise<void> {
        switch (this.state.side) {
            case 'right':
                if (this.isRightAmountValid) {
                    await this.changeRightAmount(this.rightAmount)
                }
                break

            case 'left':
            default:
                if (this.isLeftAmountValid) {
                    await this.changeLeftAmount(this.leftAmount)
                }
        }
    }

    protected async syncPool(): Promise<void> {
        if (this.isSyncingPool) {
            return
        }

        if (this.data.leftToken === undefined || this.data.rightToken === undefined) {
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

            pool.lp.icon = this.tokensCache.get(pool.lp.address.toString())?.icon

            this.setData('pool', pool)

            if (this.isStablePool) {
                this.setState('isAutoExchangeEnabled', true)
            }

            debug('Liquidity pool successfully synced', pool)
        }
        catch (e) {
            error('Sync pool error', e)
        }
        finally {
            this.setState('isSyncingPool', false)
        }

        await this.syncAmounts()
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

    protected async withdrawToken(params: InternalWithdrawTokenParams): Promise<void> {
        if (this.dex.address === undefined || this.wallet.account?.address === undefined) {
            return
        }

        const isTokenWalletDeployed = await TokenWalletUtils.isTokenWalletDeployed({
            tokenRootAddress: params.tokenAddress,
            walletOwnerAddress: this.wallet.account.address,
        })
        const deployWalletGrams = isTokenWalletDeployed ? '0' : '100000000'

        const { dynamicGas, fixedValue } = (await dexGasValuesContract(DexGasValuesAddress)
            .methods.getAccountWithdrawGas({ deployWalletValue: deployWalletGrams })
            .call())
            .value0

        await DexAccountUtils.withdrawToken(this.dex.address, {
            amount: params.amount,
            deployWalletGrams,
            lastLt: this.dex.accountState?.lastTransactionId?.lt,
            recipientAddress: this.wallet.account.address,
            sendGasTo: this.wallet.account.address,
            tokenAddress: params.tokenAddress,
            deployWalletGrams,
            // eslint-disable-next-line sort-keys
            onSend: params?.onSend,
            onTransactionFailure: params?.onTransactionFailure,
            onTransactionSuccess: params?.onTransactionSuccess,
        }, { amount: calcGas(fixedValue, dynamicGas) })
    }

    protected async subscribe(): Promise<void> {
        if (this.dex.address === undefined || this.data.leftToken === undefined || this.data.rightToken === undefined) {
            return
        }

        const address = this.pool?.address || await DexUtils.getExpectedPairAddress(
            this.dex.address,
            this.data.leftToken,
            this.data.rightToken,
            toJS(this.dex.dexState),
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

            this.contractSubscriber.on('data', throttle(action(async event => {
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

                await this.syncUserLiquidity()

                pool.left.balance = balances.left
                pool.lp.balance = balances.lpSupply
                pool.right.balance = balances.right

                this.setData('pool', pool)
            }), 1000))
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

    public get leftAmount(): AddLiquidityFormStoreData['leftAmount'] {
        return this.data.leftAmount
    }

    public get pool(): AddLiquidityFormStoreData['pool'] {
        return this.data.pool
    }

    public get rightAmount(): AddLiquidityFormStoreData['rightAmount'] {
        return this.data.rightAmount
    }

    /*
     * Memoized store state values
     * ----------------------------------------------------------------------------------
     */

    public get isAutoExchangeEnabled(): AddLiquidityFormStoreState['isAutoExchangeEnabled'] {
        return this.state.isAutoExchangeEnabled
    }

    public get isAwaitingLeftDeposit(): AddLiquidityFormStoreState['isAwaitingLeftDeposit'] {
        return this.state.isAwaitingLeftDeposit
    }

    public get isAwaitingRightDeposit(): AddLiquidityFormStoreState['isAwaitingRightDeposit'] {
        return this.state.isAwaitingRightDeposit
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

    public get isCreatingPool(): AddLiquidityFormStoreState['isCreatingPool'] {
        return this.state.isCreatingPool
    }

    public get isDepositingLeft(): AddLiquidityFormStoreState['isDepositingLeft'] {
        return this.state.isDepositingLeft
    }

    public get isDepositingLiquidity(): AddLiquidityFormStoreState['isDepositingLiquidity'] {
        return this.state.isDepositingLiquidity
    }

    public get isDepositingRight(): AddLiquidityFormStoreState['isDepositingRight'] {
        return this.state.isDepositingRight
    }

    public get isPreparing(): AddLiquidityFormStoreState['isPreparing'] {
        return this.state.isPreparing
    }

    public get isSyncingPool(): AddLiquidityFormStoreState['isSyncingPool'] {
        return this.state.isSyncingPool
    }

    public get isWithdrawingLeftToken(): AddLiquidityFormStoreState['isWithdrawingLeftToken'] {
        return this.state.isWithdrawingLeftToken
    }

    public get isWithdrawingLiquidity(): AddLiquidityFormStoreState['isWithdrawingLiquidity'] {
        return this.state.isWithdrawingLiquidity
    }

    public get isWithdrawingRightToken(): AddLiquidityFormStoreState['isWithdrawingRightToken'] {
        return this.state.isWithdrawingRightToken
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

    public get isAutoExchangeAvailable(): boolean {
        return (
            this.wallet.isReady
            && this.isPoolConnected
            && !this.isStablePool
            && !this.isPoolEmpty
            && this.leftToken !== undefined
            && this.rightToken !== undefined
        )
    }

    public get isInsufficientLeftBalance(): boolean {
        return this.leftAmount.length > 0
            ? new BigNumber(this.leftAmount || 0).shiftedBy(this.leftDecimals ?? 0).gt(this.leftBalance)
            : false
    }

    public get isInsufficientRightBalance(): boolean {
        return this.rightAmount.length > 0
            ? new BigNumber(this.rightAmount || 0).shiftedBy(this.rightDecimals ?? 0).gt(this.rightBalance)
            : false
    }

    public get isInverted(): boolean {
        if (this.pool?.left.address !== undefined && this.leftToken?.root !== undefined) {
            return this.pool.left.address.toString().toLowerCase() !== this.leftToken.root.toLowerCase()
        }
        return false
    }

    public get isLeftAmountValid(): boolean {
        return this.leftAmount.length > 0 ? !this.isInsufficientLeftBalance : true
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
                && this.dex.address !== undefined
                && this.pool?.address !== undefined
                && this.leftToken !== undefined
                && this.rightToken !== undefined
            )
        }
        return (
            this.wallet.isReady
            && this.dex.address !== undefined
            && this.leftToken !== undefined
            && this.rightToken !== undefined
        )
    }

    public get isPoolEmpty(): boolean {
        return new BigNumber(this.pool?.lp.balance || 0).isZero()
    }

    public get isRightAmountValid(): boolean {
        return this.rightAmount.length > 0 ? !this.isInsufficientRightBalance : true
    }

    public get isStablePool(): boolean {
        return this.pool?.type === PairType.STABLESWAP
    }

    public get isSupplyReady(): boolean {
        const isBalancesValid = (
            this.leftAmount.length > 0
            && this.isLeftAmountValid
            && this.isRightAmountValid
            && this.rightAmount.length > 0
            && this.isEnoughDexLeftBalance
            && this.isEnoughDexRightBalance
        )
        if (this.isAutoExchangeEnabled) {
            return (
                (this.leftAmount.length > 0 && this.isLeftAmountValid && this.isEnoughDexLeftBalance)
                || (this.rightAmount.length > 0 && this.isRightAmountValid && this.isEnoughDexRightBalance)
                || isBalancesValid
            )
        }
        return isBalancesValid
    }

    public get isWithdrawLiquidityAvailable(): boolean {
        return isGoodBignumber(this.pool?.lp.userBalance ?? 0)
    }

    public get leftBalance(): string {
        return new BigNumber(this.leftToken?.balance ?? 0).plus(this.dexLeftBalance || 0).toFixed()
    }

    public get leftDecimals(): number | undefined {
        return this.leftToken?.decimals ?? (this.isInverted ? this.pool?.right.decimals : this.pool?.left.decimals)
    }

    public get leftToken(): TokenCache | undefined {
        return this.tokensCache.get(this.data.leftToken)
    }

    public get leftPrice(): string {
        if (this.leftDecimals === undefined || this.rightDecimals === undefined) {
            return '0'
        }

        const leftNumber = new BigNumber(this.pool?.left.balance || 0).shiftedBy(-this.leftDecimals)
        const rightNumber = new BigNumber(this.pool?.right.balance || 0).shiftedBy(-this.rightDecimals)

        return this.isInverted
            ? rightNumber.div(leftNumber).dp(this.rightDecimals, BigNumber.ROUND_DOWN).toFixed()
            : leftNumber.div(rightNumber).dp(this.leftDecimals, BigNumber.ROUND_DOWN).toFixed()
    }

    public get rightBalance(): string {
        return new BigNumber(this.rightToken?.balance ?? 0).plus(this.dexRightBalance || 0).toFixed()
    }

    public get rightDecimals(): number | undefined {
        return this.rightToken?.decimals ?? (this.isInverted ? this.pool?.left.decimals : this.pool?.right.decimals)
    }

    public get rightToken(): TokenCache | undefined {
        return this.tokensCache.get(this.data.rightToken)
    }

    public get rightPrice(): string {
        if (this.leftDecimals === undefined || this.rightDecimals === undefined) {
            return '0'
        }

        const leftNumber = new BigNumber(this.pool?.left.balance || 0).shiftedBy(-this.leftDecimals)
        const rightNumber = new BigNumber(this.pool?.right.balance || 0).shiftedBy(-this.rightDecimals)

        return this.isInverted
            ? leftNumber.div(rightNumber).dp(this.leftDecimals, BigNumber.ROUND_DOWN).toFixed()
            : rightNumber.div(leftNumber).dp(this.rightDecimals, BigNumber.ROUND_DOWN).toFixed()
    }

    /*
     * Computed Dex states and values
     * ----------------------------------------------------------------------------------
     */

    public get dexLeftBalance(): string | undefined {
        return this.data.leftToken && this.dex.balances?.get(this.data.leftToken)
    }

    public get dexRightBalance(): string | undefined {
        return this.data.rightToken && this.dex.balances?.get(this.data.rightToken)
    }

    public get isDexAccountDataAvailable(): boolean {
        if (this.isSyncingPool === false) {
            return (
                this.pool?.address !== undefined
                && this.wallet.isReady
                && this.dex.address !== undefined
            )
        }
        return (
            this.wallet.isReady
            && this.dex.address !== undefined
            && (this.leftToken !== undefined || this.rightToken !== undefined)
        )
    }

    public get isEnoughDexLeftBalance(): boolean {
        if (!isGoodBignumber(this.dexLeftBalance ?? 0)) {
            return false
        }
        return new BigNumber(this.leftAmount || 0).shiftedBy(this.leftDecimals ?? 0).lte(this.dexLeftBalance ?? 0)
    }

    public get isEnoughDexRightBalance(): boolean {
        if (!isGoodBignumber(this.dexRightBalance ?? 0)) {
            return false
        }
        return new BigNumber(this.rightAmount || 0).shiftedBy(this.rightDecimals ?? 0).lte(this.dexRightBalance ?? 0)
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

    protected async handleChangeTokens(
        [leftToken, rightToken]: (string | undefined)[] = [],
        [prevLeftToken, prevRightToken]: (string | undefined)[] = [],
    ): Promise<void> {
        if (this.wallet.address === undefined || !this.tokensCache.isReady) {
            return
        }

        await Promise.allSettled([
            (prevLeftToken !== undefined && ![leftToken, rightToken].includes(prevLeftToken))
                ? this.tokensCache.unwatch(prevLeftToken, 'liquidity-add')
                : undefined,
            (prevRightToken !== undefined && ![leftToken, rightToken].includes(prevRightToken))
                ? this.tokensCache.unwatch(prevRightToken, 'liquidity-add')
                : undefined,
        ])

        if (this.wallet?.address !== undefined) {
            await Promise.allSettled([
                (leftToken !== undefined && ![prevLeftToken, prevRightToken, rightToken].includes(leftToken))
                    ? this.tokensCache.watch(this.leftToken?.root, 'liquidity-add')
                    : undefined,
                (rightToken !== undefined && ![prevLeftToken, prevRightToken, leftToken].includes(rightToken))
                    ? this.tokensCache.watch(this.rightToken?.root, 'liquidity-add')
                    : undefined,
            ])
        }
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
        if (this.data.leftToken !== undefined && this.data.rightToken !== undefined) {
            await this.syncPool()
            await this.subscribe()
        }
    }

    protected async handleWalletAccountChange(address?: Address): Promise<void> {
        this.dexAccountDeployDisposer?.()
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

        this.tokensChangeDisposer = reaction(
            () => [this.data.leftToken, this.data.rightToken],
            this.handleChangeTokens,
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
            this.dexAccountDeployDisposer?.()
            this.tokensCache.tokens.forEach(token => {
                this.tokensCache.update(token.root, 'balance', undefined)
                this.tokensCache.update(token.root, 'wallet', undefined)
            })
            return
        }

        await this.checkDexAccount()

        await Promise.allSettled([
            this.leftToken?.root && this.tokensCache.watch(this.leftToken.root, 'liquidity-add'),
            this.rightToken?.root && this.tokensCache.watch(this.rightToken.root, 'liquidity-add'),
        ])
    }

    protected contractSubscriber: Subscription<'contractStateChanged'> | undefined

    protected dexAccountDeployDisposer: IReactionDisposer | undefined

    protected tokensCacheDisposer: IReactionDisposer | undefined

    protected tokensChangeDisposer: IReactionDisposer | undefined

    protected walletAccountDisposer: IReactionDisposer | undefined

}
