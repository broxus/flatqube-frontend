import BigNumber from 'bignumber.js'
import type {
    Address, DelayedMessageExecution, Subscriber, Transaction,
} from 'everscale-inpage-provider'
import type { IReactionDisposer } from 'mobx'
import {
    action, comparer, computed, makeObservable, override, reaction, toJS,
} from 'mobx'

import { NPoolsList } from '@/config'
import { useRpc, useStaticRpc } from '@/hooks'
import type { LiquidityStablePoolData } from '@/misc'
import {
    getFullContractState,
    LiquidityStablePoolUtils,
    StablePoolUtils,
    TokenWalletUtils,
    wrappedCoinVaultContract,
} from '@/misc'
import { DEFAULT_SLIPPAGE_VALUE, RECEIPTS } from '@/modules/Swap/constants'
import { useSwapApi } from '@/modules/Swap/hooks/useApi'
import type { BaseSwapStoreData } from '@/modules/Swap/stores/BaseSwapStore'
import { BaseSwapStore } from '@/modules/Swap/stores/BaseSwapStore'
import type {
    ConversionTransactionCallbacks,
    CrossSwapRoutePayloadRequest,
    CrossSwapRouteRequest,
    CrossSwapStatusResponse,
    SwapRoute,
    SwapSendMessageCallbackParams,
    SwapTransactionCallbacks,
} from '@/modules/Swap/types'
import { SwapDirection } from '@/modules/Swap/types'
import { calcCrossExchangeSlippage } from '@/modules/Swap/utils'
import { TokenSide } from '@/modules/TokensList'
import type { TokenCache, TokensCacheService } from '@/stores/TokensCacheService'
import type { WalletService } from '@/stores/WalletService'
import {
    addressesComparer,
    debounce,
    debug,
    error,
    formattedBalance,
    getSafeProcessingId,
    isGoodBignumber,
    resolveEverscaleAddress,
    storage,
    throwException,
} from '@/utils'


export interface SwapFormStoreData extends BaseSwapStoreData {
    pool?: LiquidityStablePoolData;
    route?: SwapRoute;
    transfer?: {
        abi?: string;
        callId?: string;
        gas?: string;
        method: 'transfer' | 'wrap';
        payload?: string;
    };
}

export interface SwapFormStoreState {
    coinSide?: TokenSide;
    direction: SwapDirection;
    isCalculating?: boolean;
    isCombo?: boolean;
    isConfirmationAwait?: boolean;
    isSyncingPool?: boolean;
    isPreparing?: boolean;
    isProcessing?: boolean;
    priceDirection: SwapDirection;
}

export interface SwapFormCtorOptions {
    coinToTip3Address: Address;
    comboToTip3Address: Address;
    defaultLeftTokenAddress?: string;
    defaultRightTokenAddress?: string;
    minTvlValue?: string;
    referrer?: string;
    safeAmount?: string;
    tip3ToCoinAddress: Address;
    wrapGas?: string;
    wrappedCoinTokenAddress: Address;
    wrappedCoinVaultAddress: Address;
}

async function checkStatus(callId: string, recipient: string): Promise<CrossSwapStatusResponse> {
    const api = useSwapApi()
    return new Promise((resolve, reject) => {
        try {
            let attempts = 0
            const check = debounce(async () => {
                try {
                    const response = await api.poolCrossSwapStatus({}, { method: 'POST' }, {
                        id: Number(callId),
                        recipient,
                    })
                    if (response.status === 'Pending') {
                        if (attempts >= 30) {
                            reject(new Error('Timed out waiting'))
                            return
                        }
                        await check()
                        attempts += 1
                        return
                    }
                    resolve(response)
                }
                catch (e) {
                    if (attempts >= 50) {
                        reject(new Error('Timed out waiting'))
                        return
                    }
                    await check()
                }
            }, 3000)
            check()
        }
        catch (e) {
            reject(e)
        }
    })
}


export class SwapFormStore extends BaseSwapStore<SwapFormStoreData, SwapFormStoreState> {

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly options: SwapFormCtorOptions,
    ) {
        super(tokensCache)

        this.setData(() => ({
            bill: {},
            leftAmount: '',
            rightAmount: '',
            slippage: DEFAULT_SLIPPAGE_VALUE,
        }))

        this.setState(() => ({
            direction: SwapDirection.LTR,
            priceDirection: SwapDirection.LTR,
        }))

        makeObservable<
            SwapFormStore,
            | 'handleChangeTokens'
            | 'handleSend'
            | 'handleTokensCacheReady'
            | 'handleWalletAccountChange'
        >(this, {
            coinSide: computed,
            combinedBalanceNumber: computed,
            defaultLeftTokenRoot: computed,
            defaultRightTokenRoot: computed,
            direction: computed,
            formattedLeftBalance: override,
            formattedRightBalance: override,
            handleChangeTokens: action.bound,
            handleSend: action.bound,
            handleTokensCacheReady: action.bound,
            handleWalletAccountChange: action.bound,
            isCalculating: computed,
            isCoinBasedSwapMode: computed,
            isCoinToTip3Valid: computed,
            isComboSwapMode: computed,
            isComboSwapValid: computed,
            isConfirmationAwait: computed,
            isConversionMode: computed,
            isDepositOneCoinMode: computed,
            isEnoughCoinBalance: computed,
            isEnoughCombinedBalance: computed,
            isEnoughLiquidity: computed,
            isLeftAmountValid: override,
            isPreparing: computed,
            isRightAmountValid: override,
            isSyncingPool: computed,
            isTip3ToCoinValid: computed,
            isUnwrapMode: computed,
            isUnwrapValid: computed,
            isValid: computed,
            isWithdrawOneCoinMode: computed,
            isWithdrawOneCoinValid: computed,
            isWrapMode: computed,
            isWrapValid: computed,
            leftAmount: override,
            leftBalanceNumber: override,
            ltrPrice: override,
            maximizeLeftAmount: action.bound,
            pool: computed,
            poolAddress: computed,
            priceDirection: computed,
            rightAmount: override,
            route: computed,
            rtlPrice: override,
            togglePriceDirection: action.bound,
            wrappedCoinTokenAddress: computed,
        })
    }


    /*
     * Public actions. Useful in UI
     * ----------------------------------------------------------------------------------
     */

    /**
     * Manually initiate store.
     * Run all necessary subscribers.
     */
    public async init(): Promise<void> {
        this.tokensCacheDisposer = reaction(
            () => this.tokensCache.isReady,
            this.handleTokensCacheReady,
            { fireImmediately: true },
        )

        this.poolDisposer = reaction(() => this.pool?.address, async address => {
            await this.unwatchPool()
            if (address) {
                await this.watchPool()
            }
        }, { fireImmediately: true })
    }

    /**
     * Manually dispose all the internal subscribers.
     * Clean last transaction result, intervals
     * and reset all data to their defaults.
     */
    public async dispose(): Promise<void> {
        this.tokensChangeDisposer?.()
        this.tokensCacheDisposer?.()
        this.walletAccountDisposer?.()
        this.poolDisposer?.()
        this.reset()
        clearInterval(this.routeCheckRunnerInterval)
    }

    /**
     * Maximizing the value of the left field depending on the form mode
     */
    public async maximizeLeftAmount(): Promise<void> {
        this.setState('direction', SwapDirection.LTR)

        let balance = this.leftBalanceNumber

        if (this.isComboSwapMode || this.isWrapMode || this.coinSide === 'leftToken') {
            balance = balance.minus(
                new BigNumber(this.options?.safeAmount || 0).shiftedBy(-this.wallet.coin.decimals),
            )
        }

        if (!isGoodBignumber(balance)) {
            balance = new BigNumber(0)
        }

        if (balance.eq(this.leftAmountNumber.shiftedBy(-this.leftTokenDecimals))) {
            return
        }

        this.setState('isCalculating', !this.isConversionMode)

        await this.changeLeftAmount(balance.toFixed(), debounce(async () => {
            if (this.isConversionMode) {
                this.setData('rightAmount', this.leftAmount)
                this.setState('isCalculating', false)
                return
            }
            await this.recalculate(true)
        }, 400))
    }

    /**
     * Use this method to change left amount value instead of direct change value via `setData`
     * Pass the callback function as second argument (e.g. debounced `recalculate`) and
     * it will be fires after all data and states changes.
     * @param {string} value
     * @param {() => void} [callback]
     */
    public async changeLeftAmount(value: string, callback?: () => (Promise<void> | void)): Promise<void> {
        this.setState('direction', SwapDirection.LTR)
        this.setData('leftAmount', value)
        if (value.length === 0) {
            this.setData({
                bill: {},
                ltrPrice: undefined,
                rightAmount: '',
                route: undefined,
                rtlPrice: undefined,
            })
        }
        await callback?.()
    }

    /**
     * Use this method to change right amount value instead of direct change value via `setData`
     * Pass the callback function as second argument (e.g. debounced `recalculate`) and
     * it will be fires after all data and states changes.
     * @param {string} value
     * @param {() => void} [callback]
     */
    public async changeRightAmount(value: string, callback?: () => (Promise<void> | void)): Promise<void> {
        this.setState('direction', SwapDirection.RTL)
        this.setData('rightAmount', value)
        if (value.length === 0) {
            this.setData({
                bill: {},
                leftAmount: '',
                ltrPrice: undefined,
                route: undefined,
                rtlPrice: undefined,
            })
        }
        await callback?.()
        if (this.isWithdrawOneCoinValid && !this.isEnoughLiquidity) {
            this.setData({
                bill: {},
                leftAmount: '',
                ltrPrice: undefined,
                route: undefined,
                rtlPrice: undefined,
            })
        }
    }

    /**
     * Use this method to change left token root value instead of direct change value via `setData`.
     * Pass the callback function as second argument, and it will be fires after all data and
     * states changes and before run recalculation.
     * @param {string} [root]
     */
    public async changeLeftToken(root?: string): Promise<void> {
        if (root === undefined) {
            return
        }

        const isReverting = root === this.data.rightToken && !this.isConversionMode

        if (isReverting) {
            this.setData({
                bill: {},
                leftToken: root,
                rightToken: this.data.leftToken,
                route: undefined,
            })
            this.setState('direction', SwapDirection.LTR)
        }
        else {
            this.setData({
                bill: {},
                leftToken: root,
                ltrPrice: undefined,
                route: undefined,
                rtlPrice: undefined,
            })
            if (this.direction === SwapDirection.LTR) {
                this.setData('rightAmount', '')
            }
            else if (this.direction === SwapDirection.RTL) {
                this.setData('leftAmount', '')
            }
        }

        if (this.isDepositOneCoinMode || this.isWithdrawOneCoinMode) {
            await this.syncPool()
        }

        await this.recalculate(!this.isCalculating)
    }

    /**
     * Use this method to change right token root value instead of direct change value via `setData`
     * Pass the callback function as second argument, and it will be fires after all data and
     * states changes and before run recalculation.
     * @param {string} [root]
     */
    public async changeRightToken(root?: string): Promise<void> {

        if (root === undefined) {
            return
        }

        const isReverting = root === this.data.leftToken && !this.isConversionMode

        if (isReverting) {
            this.setData({
                bill: {},
                leftToken: this.data.rightToken,
                rightToken: root,
                route: undefined,
            })
            this.setState('direction', SwapDirection.RTL)
        }
        else {
            this.setData({
                bill: {},
                ltrPrice: undefined,
                rightToken: root,
                route: undefined,
                rtlPrice: undefined,
            })
            if (this.direction === SwapDirection.LTR) {
                this.setData('rightAmount', '')
            }
            else if (this.direction === SwapDirection.RTL) {
                this.setData('leftAmount', '')
            }
        }

        if (this.isDepositOneCoinMode || this.isWithdrawOneCoinMode) {
            await this.syncPool()
        }

        await this.recalculate(!this.isCalculating)
    }

    /**
     * Use this method to change slippage value instead of direct change value via `setData`
     * It will save value to localStorage and runs recalculation for cross-pair exchange if needed
     * @param {string} value
     */
    public async changeSlippage(value: string): Promise<void> {
        if (value !== this.slippage) {
            this.setData('slippage', value)
            storage.set('slippage', value)
        }
    }

    /**
     * Manually toggle conversion direction.
     * Revert amounts, tokens, exchange mode and native coin side
     */
    public async toggleConversionDirection(): Promise<void> {
        if (this.isProcessing) {
            return
        }

        this.setState({
            coinSide: this.coinSide && (this.coinSide === 'leftToken' ? 'rightToken' : 'leftToken'),
            direction: SwapDirection.LTR,
        })

        this.setData({
            leftToken: this.data.rightToken,
            rightToken: this.data.leftToken,
        })
    }

    /**
     * Manually toggle exchange direction.
     * Reset swap bill. Revert prices, amounts and tokens.
     */
    public async toggleDirection(): Promise<void> {
        if (this.isProcessing) {
            return
        }

        this.setState({
            coinSide: this.isComboSwapMode
                ? undefined
                : (this.coinSide && (this.coinSide === 'leftToken' ? 'rightToken' : 'leftToken')),
            direction: this.direction === SwapDirection.RTL ? SwapDirection.LTR : SwapDirection.RTL,
            isCombo: false,
        })

        this.setData({
            bill: {},
            leftAmount: this.data.rightAmount,
            leftToken: this.data.rightToken,
            rightAmount: this.data.leftAmount,
            rightToken: this.data.leftToken,
            route: undefined,
        })

        await this.recalculate(!this.isCalculating)
    }

    /**
     * Manually toggle price direction.
     */
    public togglePriceDirection(): void {
        this.setState(
            'priceDirection',
            this.priceDirection === SwapDirection.LTR
                ? SwapDirection.RTL
                : SwapDirection.LTR,
        )
    }

    /**
     * Manually recalculate exchange bill by current direction.
     * @param {boolean} [force]
     * @protected
     */
    public async recalculate(force: boolean = false): Promise<void> {
        if (!force && this.isCalculating) {
            return
        }

        this.setState('isCalculating', true)

        await this.routeCheckRunner()

        this.setState('isCalculating', false)
    }

    public async wrap(callbacks?: ConversionTransactionCallbacks): Promise<void> {
        const callId = getSafeProcessingId()
        let transaction: Transaction | undefined

        try {
            if (this.wallet.account?.address === undefined) {
                throwException('Account not connected')
            }

            this.setState('isProcessing', true)

            const wrappedAmount = new BigNumber(this.data.leftAmount ?? 0).shiftedBy(this.wallet.coin.decimals)
            const amount = wrappedAmount.plus(this.options.wrapGas ?? 0).toFixed()
            const input = {
                amount: wrappedAmount.toFixed(),
                receivedDecimals: this.rightToken?.decimals,
                receivedIcon: this.rightToken?.icon,
                receivedRoot: this.rightToken?.root,
                receivedSymbol: this.rightToken?.symbol,
            }

            const rpc = useRpc()
            const message = await rpc.sendMessageDelayed({
                amount,
                bounce: false,
                recipient: this.options.wrappedCoinVaultAddress,
                sender: this.wallet.account.address,
            })

            await callbacks?.onSend?.(message, { callId, mode: 'wrap' })

            this.reset()
            this.setState('isProcessing', false)

            transaction = await message.transaction

            await callbacks?.onTransactionSuccess?.({
                callId,
                direction: 'wrap',
                input,
                transaction,
            })
        }
        catch (e: any) {
            await callbacks?.onTransactionFailure?.({
                callId,
                direction: 'wrap',
                message: e.message,
                transaction,
            })
            throw e
        }
        finally {
            this.setState('isProcessing', false)
        }
    }

    public async unwrap(callbacks?: ConversionTransactionCallbacks): Promise<void> {
        const callId = getSafeProcessingId()
        let transaction: Transaction | undefined

        try {
            if (this.wallet.account?.address === undefined) {
                throwException('Account not connected')
            }
            if (this.leftToken?.wallet === undefined) {
                throwException('Left token wallet not specified')
            }

            const amount = this.leftAmountNumber.toFixed()
            const input = {
                amount,
                receivedDecimals: this.wallet.coin.decimals,
                receivedIcon: this.wallet.coin.icon,
                receivedSymbol: this.wallet.coin.symbol,
            }

            this.setState('isProcessing', true)

            const message = await TokenWalletUtils.transfer(this.leftToken.wallet, {
                amount,
                payload: '',
                recipient: this.options.wrappedCoinVaultAddress,
                remainingGasTo: this.wallet.account.address,
            }, {
                amount: '500000000',
                bounce: false,
            })

            await callbacks?.onSend?.(message, { callId, mode: 'unwrap' })

            this.reset()
            this.setState('isProcessing', false)

            transaction = await message.transaction

            await callbacks?.onTransactionSuccess?.({
                callId,
                direction: 'unwrap',
                input,
                transaction,
            })
        }
        catch (e: any) {
            error('Unwrap error', e)
            await callbacks?.onTransactionFailure?.({
                callId,
                direction: 'unwrap',
                message: e.message,
                transaction,
            })
            throw e
        }
        finally {
            this.setState('isProcessing', false)
        }
    }

    public async swap(callbacks?: SwapTransactionCallbacks): Promise<void> {
        if (!this.isValid) {
            this.setState('isProcessing', false)
            return
        }

        const callId = this.data.transfer?.callId || getSafeProcessingId()

        try {
            this.setState('isProcessing', true)

            const rpc = useStaticRpc()
            const data = await rpc.rawApi.decodeInput({
                abi: this.data.transfer?.abi as string,
                body: this.data.transfer?.payload as string,
                internal: true,
                method: (this.data.transfer?.method.toLowerCase()) as string,
            })

            debug('Transfer data', data)

            let message!: DelayedMessageExecution

            if (this.data.transfer?.method.toLowerCase() === 'transfer') {
                message = await TokenWalletUtils.transfer(this.leftToken?.wallet as unknown as Address, {
                    amount: data?.input.amount as string,
                    deployWalletValue: data?.input.deployWalletValue as string ?? '0',
                    payload: data?.input.payload as string,
                    recipient: resolveEverscaleAddress(data?.input.recipient as string),
                    remainingGasTo: this.wallet.account!.address,
                }, {
                    amount: this.data.transfer?.gas,
                })
            }
            else if (this.data.transfer?.method.toLowerCase() === 'wrap') {
                message = await wrappedCoinVaultContract(this.options.wrappedCoinVaultAddress)
                    .methods.wrap({
                        gas_back_address: this.wallet.account?.address as Address,
                        owner_address: resolveEverscaleAddress(data?.input.owner_address as string),
                        payload: data?.input.payload as string,
                        tokens: (data?.input.tokens as string) ?? this.leftAmountNumber.toFixed(),
                    })
                    .sendDelayed({
                        amount: this.data.transfer?.gas ?? this.leftAmountNumber.plus(5000000000).toFixed(),
                        bounce: true,
                        from: this.wallet.account!.address,
                    })
            }

            RECEIPTS.set(callId.toString(), {
                amount: data?.input.amount as string,
                receivedDecimals: this.coinSide === 'rightToken' ? this.wallet.coin.decimals : this.rightTokenDecimals,
                receivedIcon: this.coinSide === 'rightToken' ? this.wallet.coin.icon : this.rightToken?.icon,
                receivedRoot: this.coinSide === 'rightToken' ? undefined : this.rightToken?.root,
                receivedSymbol: this.coinSide === 'rightToken' ? this.wallet.coin.symbol : this.rightToken?.symbol,
                spentAmount: data?.input.amount as string,
                spentDecimals: this.leftTokenDecimals,
                spentIcon: this.leftToken?.icon,
                spentRoot: this.leftToken?.root,
                spentSymbol: this.leftToken?.symbol,
            })

            this.reset()
            this.setState('isProcessing', false)

            await callbacks?.onSend?.(message, { callId: callId.toString(), mode: 'swap' })

            const transaction = await message.transaction

            clearInterval(this.routeCheckRunnerInterval)
            this.routeCheckRunnerInterval = undefined

            try {
                const status = await checkStatus(callId, this.wallet.address!)

                if (status.status === 'Succeed') {
                    const receipt = RECEIPTS.get(callId)
                    this.setState('isProcessing', false)
                    await callbacks?.onTransactionSuccess?.({
                        callId,
                        transaction,
                    }, {
                        ...receipt,
                        amount: status.amount.pop(),
                        hash: transaction.id.hash,
                    })
                    RECEIPTS.delete(callId)
                }
                else if (status.status === 'Cancelled') {
                    const receipt = RECEIPTS.get(callId)
                    const cancelledIndex = status.amount.findIndex(amount => amount === '0')
                    const amount = cancelledIndex > 0
                        ? status.amount[cancelledIndex - 1]
                        : receipt?.amount
                    const receivedRoot = cancelledIndex > 0
                        ? status.tokenRoot[cancelledIndex]
                        : receipt?.receivedRoot
                    const spentRoot = cancelledIndex > 0
                        ? status.tokenRoot[cancelledIndex - 1]
                        : receipt?.spentRoot
                    this.setState('isProcessing', false)
                    const spentToken = this.tokensCache.get(spentRoot)
                    const receivedToken = this.tokensCache.get(receivedRoot)
                    await callbacks?.onTransactionFailure?.({ callId, transaction }, {
                        ...receipt,
                        amount,
                        hash: transaction.id.hash,
                        isCrossExchangeCanceled: cancelledIndex > 0 && status.tokenRoot.length > 1,
                        receivedDecimals: receivedToken?.decimals,
                        receivedIcon: receivedToken?.icon,
                        receivedRoot,
                        receivedSymbol: receivedToken?.symbol,
                        spentDecimals: spentToken?.decimals,
                        spentIcon: spentToken?.icon,
                        spentRoot,
                        spentSymbol: spentToken?.symbol,
                    })
                    RECEIPTS.delete(callId)
                }
            }
            catch (e) {
                this.setState('isProcessing', false)
                await callbacks?.onTransactionFailure?.({ callId, transaction }, {})
                RECEIPTS.delete(callId)
            }
        }
        catch (e: any) {
            error('Swap finished with error: ', e)
            await callbacks?.onTransactionFailure?.({ callId, message: e.message }, {})
            throw e
        }
        finally {
            this.setState('isProcessing', false)
        }
    }

    protected async syncPool(): Promise<void> {
        if (
            this.data.leftToken === undefined
            || this.data.rightToken === undefined
            || this.poolAddress === undefined
            || this.isSyncingPool
        ) {
            return
        }

        this.setState('isSyncingPool', true)

        try {
            const pool = await LiquidityStablePoolUtils.get(this.poolAddress, this.wallet.address)

            if (!pool.state?.isDeployed || !(await StablePoolUtils.isActive(this.poolAddress, pool.state))) {
                this.setData('pool', undefined)
                return
            }

            debug('Stable Pool has been synced successfully', pool)

            this.setData('pool', pool)
        }
        catch (e) {
            error('Check pool error', e)
            this.setData('pool', undefined)
        }
        finally {
            await this.recalculate(true)
            this.setState('isSyncingPool', false)
        }
    }

    protected async syncPoolState(): Promise<void> {
        if (this.pool?.address === undefined) {
            return
        }
        const state = await getFullContractState(this.pool.address)
        this.setData('pool', { ...this.pool, state })
    }

    protected async syncPoolBalances(): Promise<void> {
        if (this.pool?.address === undefined) {
            return
        }
        const balances = await StablePoolUtils.balances(this.pool.address, toJS(this.pool.state))

        this.setData('pool', {
            ...this.pool,
            lp: {
                ...this.pool.lp,
                balance: balances.lpSupply,
            },
            tokens: this.pool.tokens.map((token, idx) => ({
                ...token,
                balance: balances.tokens[idx],
            })),
        })
    }

    protected async watchPool(): Promise<Subscriber> {
        try {
            if (this.pool?.address === undefined) {
                throwException('Pool address not defined')
            }

            this.poolContractSubscriber = new (useStaticRpc()).Subscriber()
            await this.poolContractSubscriber.states(this.pool.address).delayed(stream => stream.on(
                debounce(
                    async event => {
                        if (addressesComparer(event.address, this.pool?.address)) {
                            await this.syncPoolState()
                            await this.syncPoolBalances()
                            await this.recalculate(true)
                            return
                        }

                        await this.unwatchPool()
                    },
                    3000,
                ),
            ))
            return this.poolContractSubscriber
        }
        catch (e) {
            await this.unwatchPool()
            throw e
        }
    }

    protected async unwatchPool(): Promise<void> {
        try {
            await this.poolContractSubscriber?.unsubscribe()
            this.poolContractSubscriber = undefined
        }
        catch (e) {
            error('Cannot unsubscribe from Pool contract subscriber', e)
        }
    }

    /**
     * Full reset direct, cross-pair and multiple swap
     * instances to their default.
     * @protected
     */
    protected reset(): void {
        this.setData({
            bill: {},
            leftAmount: '',
            ltrPrice: undefined,
            rightAmount: '',
            route: undefined,
            rtlPrice: undefined,
            transfer: undefined,
        })
        this.setState(() => ({
            coinSide: this.coinSide,
            direction: SwapDirection.LTR,
            isCombo: this.state.isCombo,
            priceDirection: SwapDirection.LTR,
        }))
    }

    protected async fetchRoute(): Promise<void> {
        if (this.data.leftToken === undefined || this.data.rightToken === undefined) {
            return
        }

        if (this.direction === SwapDirection.LTR && !isGoodBignumber(this.leftAmountNumber)) {
            return
        }

        if (this.direction === SwapDirection.RTL && !isGoodBignumber(this.rightAmountNumber)) {
            return
        }

        const api = useSwapApi()
        const callId = getSafeProcessingId()
        const selectedTokens = [this.data.leftToken, this.data.rightToken].filter(Boolean) as string[]
        const whiteListCurrencies = this.tokensCache.roots
        selectedTokens.forEach(root => {
            if (!whiteListCurrencies.includes(root)) {
                whiteListCurrencies.push(root)
            }
        })

        const crossPairInput: CrossSwapRouteRequest = {
            amount: this.leftAmountNumber.toFixed(),
            deep: 3,
            direction: 'expectedexchange',
            fromCurrencyAddress: this.data.leftToken,
            minTvl: this.options.minTvlValue ?? '50000',
            slippage: new BigNumber(this.data.slippage).div(100).toFixed(),
            toCurrencyAddress: this.data.rightToken,
            whiteListCurrencies,
        }

        if (this.wallet.address === undefined) {
            const response = await api.poolCrossSwapRoute(
                {},
                { method: 'POST' },
                crossPairInput,
            )

            const steps = response.steps.slice()
            const firstStep = steps.slice().shift()
            const lastStep = steps.slice().pop()
            const spentAmount = firstStep?.spentAmount
            const expectedAmount = lastStep?.expectedReceiveAmount
            const leftAmount = new BigNumber(spentAmount ?? 0).shiftedBy(-this.leftTokenDecimals)
            const rightAmount = new BigNumber(expectedAmount ?? 0).shiftedBy(-this.rightTokenDecimals)

            if (this.direction === SwapDirection.LTR) {
                if (isGoodBignumber(rightAmount ?? 0)) {
                    this.setData({
                        bill: {
                            amount: this.data.leftAmount,
                            expectedAmount,
                            fee: response.globalFee,
                            minExpectedAmount: lastStep?.minimumReceiveAmount,
                            priceImpact: new BigNumber(response.globalPriceImpact).times(100).toFixed(),
                        },
                        ltrPrice: new BigNumber(this.data.leftAmount)
                            .div(rightAmount)
                            .dp(this.rightTokenDecimals, BigNumber.ROUND_DOWN)
                            .toFixed(),
                        rightAmount: rightAmount.toFixed(),
                        route: {
                            leftAmount: this.data.leftAmount,
                            rightAmount: rightAmount.toFixed(),
                            slippage: calcCrossExchangeSlippage(this.data.slippage, steps.length),
                            steps: response.steps.map(step => ({
                                actionType: step.actionType,
                                amount: step.spentAmount,
                                expectedAmount: step.expectedReceiveAmount,
                                fee: step.fee,
                                minExpectedAmount: step.minimumReceiveAmount,
                                poolAddress: resolveEverscaleAddress(step.poolAddress),
                                poolType: step.poolType,
                                priceImpact: step.priceImpact,
                                receiveToken: this.tokensCache.get(step.receiveCurrencyAddress) as TokenCache,
                                spentToken: this.tokensCache.get(step.spentCurrencyAddress) as TokenCache,
                            })),
                        },
                        rtlPrice: rightAmount
                            .div(this.data.leftAmount)
                            .dp(this.leftTokenDecimals, BigNumber.ROUND_DOWN)
                            .toFixed(),
                    })
                }
                else {
                    this.setData({
                        bill: {},
                        leftAmount: '',
                        ltrPrice: undefined,
                        rightAmount: '',
                        route: undefined,
                        rtlPrice: undefined,
                        transfer: undefined,
                    })
                    this.setState('isConfirmationAwait', false)
                }
            }
            else if (this.direction === SwapDirection.RTL) {
                if (isGoodBignumber(leftAmount ?? 0)) {
                    this.setData({
                        bill: {
                            amount: leftAmount.toFixed(),
                            expectedAmount: this.data.rightAmount,
                            fee: response.globalFee,
                            minExpectedAmount: lastStep?.minimumReceiveAmount,
                            priceImpact: new BigNumber(response.globalPriceImpact).times(100).toFixed(),
                        },
                        leftAmount: leftAmount.toFixed(),
                        ltrPrice: leftAmount
                            .div(this.data.rightAmount)
                            .dp(this.rightTokenDecimals, BigNumber.ROUND_DOWN)
                            .toFixed(),
                        route: {
                            leftAmount: leftAmount.toFixed(),
                            rightAmount: this.data.rightAmount,
                            slippage: calcCrossExchangeSlippage(this.data.slippage, steps.length),
                            steps: response.steps.map(step => ({
                                actionType: step.actionType,
                                amount: step.spentAmount,
                                expectedAmount: step.expectedReceiveAmount,
                                fee: step.fee,
                                minExpectedAmount: step.minimumReceiveAmount,
                                poolAddress: resolveEverscaleAddress(step.poolAddress),
                                poolType: step.poolType,
                                priceImpact: step.priceImpact,
                                receiveToken: this.tokensCache.get(step.receiveCurrencyAddress) as TokenCache,
                                spentToken: this.tokensCache.get(step.spentCurrencyAddress) as TokenCache,
                            })),
                        },
                        rtlPrice: new BigNumber(this.data.rightAmount)
                            .div(leftAmount)
                            .dp(this.leftTokenDecimals, BigNumber.ROUND_DOWN)
                            .toFixed(),
                    })
                }
                else {
                    this.setData({
                        bill: {},
                        leftAmount: '',
                        ltrPrice: undefined,
                        rightAmount: '',
                        route: undefined,
                        rtlPrice: undefined,
                        transfer: undefined,
                    })
                    this.setState('isConfirmationAwait', false)
                }
            }
        }
        else {
            const payloadRequest: CrossSwapRoutePayloadRequest = {
                crossPairInput,
                id: Number(callId),
                nativeBalance: this.wallet.balance,
                recipient: this.wallet.address,
                referrer: this.options.referrer,
                tokenBalance: this.leftToken?.balance || '0',
            }

            if (this.coinSide === 'leftToken') {
                payloadRequest.nativeInfo = 'spendonlynative'
            }
            else if (this.coinSide === 'rightToken') {
                payloadRequest.nativeInfo = 'receivenative'
            }
            else if (this.isComboSwapMode) {
                if (this.direction === SwapDirection.RTL) {
                    payloadRequest.nativeInfo = 'spendnativeandwrappednative'
                }
                else if (!this.isEnoughTokenBalance && this.isEnoughCoinBalance) {
                    payloadRequest.nativeInfo = 'spendonlynative'
                }
                else if (!this.isEnoughTokenBalance && !this.isEnoughCoinBalance && this.isEnoughCombinedBalance) {
                    payloadRequest.nativeInfo = 'spendnativeandwrappednative'
                }
            }

            if (this.direction === SwapDirection.RTL) {
                crossPairInput.amount = this.rightAmountNumber.toFixed()
                crossPairInput.fromCurrencyAddress = this.data.rightToken
                crossPairInput.direction = 'expectedspendamount'
                crossPairInput.toCurrencyAddress = this.data.leftToken
            }

            try {
                const response = await api.poolCrossSwapRoutePayload(
                    {},
                    { method: 'POST' },
                    payloadRequest,
                )

                const steps = response.route.steps.slice()
                const firstStep = steps.slice().shift()
                const lastStep = steps.slice().pop()
                const spentAmount = firstStep?.spentAmount
                const expectedAmount = lastStep?.expectedReceiveAmount
                const leftAmount = new BigNumber(spentAmount ?? 0).shiftedBy(-this.leftTokenDecimals)
                const rightAmount = new BigNumber(expectedAmount ?? 0).shiftedBy(-this.rightTokenDecimals)

                if (this.direction === SwapDirection.LTR) {
                    if (isGoodBignumber(rightAmount ?? 0)) {
                        this.setData({
                            bill: {
                                amount: this.data.leftAmount,
                                expectedAmount,
                                fee: response.route.globalFee,
                                minExpectedAmount: lastStep?.minimumReceiveAmount,
                                priceImpact: new BigNumber(response.route.globalPriceImpact).times(100).toFixed(),
                            },
                            ltrPrice: new BigNumber(this.data.leftAmount)
                                .div(rightAmount)
                                .dp(this.rightTokenDecimals, BigNumber.ROUND_DOWN)
                                .toFixed(),
                            rightAmount: rightAmount.toFixed(),
                            route: {
                                leftAmount: this.data.leftAmount,
                                recipientWalletAddress: resolveEverscaleAddress(response.walletOfDestination),
                                rightAmount: rightAmount.toFixed(),
                                slippage: calcCrossExchangeSlippage(this.data.slippage, steps.length),
                                steps: response.route.steps.map(step => ({
                                    actionType: step.actionType,
                                    amount: step.spentAmount,
                                    expectedAmount: step.expectedReceiveAmount,
                                    fee: step.fee,
                                    minExpectedAmount: step.minimumReceiveAmount,
                                    poolAddress: resolveEverscaleAddress(step.poolAddress),
                                    poolType: step.poolType,
                                    priceImpact: step.priceImpact,
                                    receiveToken: this.tokensCache.get(step.receiveCurrencyAddress) as TokenCache,
                                    spentToken: this.tokensCache.get(step.spentCurrencyAddress) as TokenCache,
                                })),
                            },
                            rtlPrice: rightAmount
                                .div(this.data.leftAmount)
                                .dp(this.leftTokenDecimals, BigNumber.ROUND_DOWN)
                                .toFixed(),
                            transfer: {
                                abi: response.abi,
                                callId,
                                gas: response.gas,
                                method: response.abiFunction,
                                payload: response.payload,
                            },
                        })
                    }
                    else {
                        this.setData({
                            bill: {},
                            leftAmount: '',
                            ltrPrice: undefined,
                            rightAmount: '',
                            route: undefined,
                            rtlPrice: undefined,
                            transfer: undefined,
                        })
                        this.setState('isConfirmationAwait', false)
                    }
                }
                else if (this.direction === SwapDirection.RTL) {
                    if (isGoodBignumber(leftAmount ?? 0)) {
                        this.setData({
                            bill: {
                                amount: leftAmount.toFixed(),
                                expectedAmount: this.data.rightAmount,
                                fee: response.route.globalFee,
                                minExpectedAmount: lastStep?.minimumReceiveAmount,
                                priceImpact: new BigNumber(response.route.globalPriceImpact).times(100).toFixed(),
                            },
                            leftAmount: leftAmount.toFixed(),
                            ltrPrice: leftAmount
                                .div(this.data.rightAmount)
                                .dp(this.rightTokenDecimals, BigNumber.ROUND_DOWN)
                                .toFixed(),
                            route: {
                                leftAmount: leftAmount.toFixed(),
                                recipientWalletAddress: resolveEverscaleAddress(response.walletOfDestination),
                                rightAmount: this.data.rightAmount,
                                slippage: calcCrossExchangeSlippage(this.data.slippage, steps.length),
                                steps: response.route.steps.map(step => ({
                                    actionType: step.actionType,
                                    amount: step.spentAmount,
                                    expectedAmount: step.expectedReceiveAmount,
                                    fee: step.fee,
                                    minExpectedAmount: step.minimumReceiveAmount,
                                    poolAddress: resolveEverscaleAddress(step.poolAddress),
                                    poolType: step.poolType,
                                    priceImpact: step.priceImpact,
                                    receiveToken: this.tokensCache.get(step.receiveCurrencyAddress) as TokenCache,
                                    spentToken: this.tokensCache.get(step.spentCurrencyAddress) as TokenCache,
                                })),
                            },
                            rtlPrice: new BigNumber(this.data.rightAmount)
                                .div(leftAmount)
                                .dp(this.leftTokenDecimals, BigNumber.ROUND_DOWN)
                                .toFixed(),
                            transfer: {
                                abi: response.abi,
                                callId,
                                gas: response.gas,
                                method: response.abiFunction,
                                payload: response.payload,
                            },
                        })
                    }
                    else {
                        this.setData({
                            bill: {},
                            leftAmount: '',
                            ltrPrice: undefined,
                            rightAmount: '',
                            route: undefined,
                            rtlPrice: undefined,
                            transfer: undefined,
                        })
                        this.setState('isConfirmationAwait', false)
                    }
                }
            }
            catch (e) {
                this.setData({
                    bill: {},
                    ltrPrice: undefined,
                    rightAmount: this.direction === SwapDirection.RTL ? this.data.rightAmount : '',
                    route: undefined,
                    rtlPrice: undefined,
                    transfer: undefined,
                })
            }
        }
    }

    protected async routeCheckRunner(): Promise<void> {
        if (
            (this.direction === SwapDirection.LTR && !isGoodBignumber(this.leftAmountNumber))
            || (this.direction === SwapDirection.RTL && !isGoodBignumber(this.rightAmountNumber))
        ) {
            clearInterval(this.routeCheckRunnerInterval)
            this.routeCheckRunnerInterval = undefined
            return
        }
        clearInterval(this.routeCheckRunnerInterval)
        this.routeCheckRunnerInterval = undefined
        debug('routeCheckRunner')
        this.routeCheckRunnerInterval = setInterval(async () => {
            if (this.isProcessing) {
                debug('Skip route check during processing')
                return
            }
            if (
                (this.direction === SwapDirection.LTR && isGoodBignumber(this.leftAmountNumber))
                || (this.direction === SwapDirection.RTL && isGoodBignumber(this.rightAmountNumber))
            ) {
                debug('Run background route check')
                await this.fetchRoute()
            }
        }, 15000)
        await this.fetchRoute()
    }


    /*
     * Memoized store data, state and options values
     * ----------------------------------------------------------------------------------
     */

    public get pool(): SwapFormStoreData['pool'] {
        return this.data.pool
    }

    /**
     * Returns memoized best priced route
     * @returns {SwapFormStoreData['route']}
     */
    public get route(): SwapFormStoreData['route'] {
        return this.data.route
    }

    /**
     * Returns memoized swap direction value
     * @returns {SwapFormStoreState['direction']}
     */
    public get direction(): SwapFormStoreState['direction'] {
        return this.state.direction
    }

    /**
     * Returns memoized native coin side value
     * @returns {SwapFormStoreState['coinSide']}
     */
    public get coinSide(): SwapFormStoreState['coinSide'] {
        return this.state.coinSide
    }

    /**
     * Returns memoized price direction value
     * @returns {SwapFormStoreState['priceDirection']}
     */
    public get priceDirection(): SwapFormStoreState['priceDirection'] {
        return this.state.priceDirection
    }

    /**
     * Returns memoized calculation state value
     * @returns {SwapFormStoreState['isCalculating']}
     */
    public get isCalculating(): SwapFormStoreState['isCalculating'] {
        return this.state.isCalculating
    }

    /**
     * Returns memoized swap confirmation await state value
     * @returns {SwapFormStoreState['isConfirmationAwait']}
     */
    public get isConfirmationAwait(): SwapFormStoreState['isConfirmationAwait'] {
        return this.state.isConfirmationAwait
    }

    /**
     * Returns memoized multiple swap mode state value
     * @returns {SwapFormStoreState['isCombo']}
     */
    public get isComboSwapMode(): SwapFormStoreState['isCombo'] {
        return this.state.isCombo
    }

    public get isSyncingPool(): SwapFormStoreState['isSyncingPool'] {
        return this.state.isSyncingPool
    }

    /**
     * Returns memoized preparing state value
     * @returns {SwapFormStoreState['isPreparing']}
     */
    public get isPreparing(): SwapFormStoreState['isPreparing'] {
        return this.state.isPreparing
    }

    /**
     * Returns memoized default left token root address
     * @returns {string}
     */
    public get defaultLeftTokenRoot(): SwapFormCtorOptions['defaultLeftTokenAddress'] {
        return this.options.defaultLeftTokenAddress?.toString()
    }

    /**
     * Returns memoized default right token root address
     * @returns {string}
     */
    public get defaultRightTokenRoot(): SwapFormCtorOptions['defaultRightTokenAddress'] {
        return this.options.defaultRightTokenAddress?.toString()
    }

    /**
     * Returns memoized wrapped coin token root value
     * @returns {SwapFormCtorOptions['wrappedCoinTokenAddress']}
     */
    public get wrappedCoinTokenAddress(): SwapFormCtorOptions['wrappedCoinTokenAddress'] {
        return this.options.wrappedCoinTokenAddress
    }


    /*
     * Computed values and states
     * ----------------------------------------------------------------------------------
     */

    public get combinedBalanceNumber(): BigNumber {
        const tokenBalance = new BigNumber(this.leftToken?.balance ?? 0).shiftedBy(-this.leftTokenDecimals)
        const coinBalance = new BigNumber(this.wallet.coin.balance ?? 0).shiftedBy(-this.wallet.coin.decimals)
        return tokenBalance.plus(coinBalance).dp(Math.min(this.leftTokenDecimals, this.wallet.coin.decimals))
    }

    public get isCoinBasedSwapMode(): boolean {
        return (
            (this.coinSide === 'leftToken' && !this.isWrapMode)
            || (this.coinSide === 'rightToken' && !this.isUnwrapMode)
        )
    }

    public get isConversionMode(): boolean {
        return this.isUnwrapMode || this.isWrapMode
    }

    public get isDepositOneCoinMode(): boolean {
        if (this.data.leftToken === undefined || this.data.rightToken === undefined) {
            return false
        }
        const lpDetails = NPoolsList.get(this.data.rightToken)
        if (lpDetails === undefined) {
            return false
        }
        return lpDetails.roots.some(
            token => token.address.toString().toLowerCase() === this.data.leftToken?.toLowerCase(),
        )
    }

    public get isWithdrawOneCoinMode(): boolean {
        if (this.data.leftToken === undefined || this.data.rightToken === undefined) {
            return false
        }
        const lpDetails = NPoolsList.get(this.data.leftToken)
        if (lpDetails === undefined) {
            return false
        }
        return lpDetails.roots.some(
            token => token.address.toString().toLowerCase() === this.data.rightToken?.toLowerCase(),
        )
    }

    public get isWrapMode(): boolean {
        return this.coinSide === 'leftToken' && this.data.rightToken === this.wrappedCoinTokenAddress.toString()
    }

    public get isUnwrapMode(): boolean {
        return this.coinSide === 'rightToken' && this.data.leftToken === this.wrappedCoinTokenAddress.toString()
    }

    /**
     * Returns `true` if left amount value is valid, otherwise `false`.
     * NOTE: Use it only in UI for determining field validation and
     * DON'T USE it in internal calculations or validations
     * @returns {boolean}
     */
    public get isLeftAmountValid(): boolean {
        if (this.data.leftAmount.length === 0) {
            return true
        }

        if (this.isWrapMode) {
            return isGoodBignumber(this.leftAmountNumber) && this.isEnoughCoinBalance
        }

        if (this.isUnwrapMode) {
            return isGoodBignumber(this.leftAmountNumber) && this.isEnoughTokenBalance
        }

        if (this.isComboSwapMode) {
            return isGoodBignumber(this.leftAmountNumber) && this.isEnoughCombinedBalance
        }

        if (this.coinSide === 'leftToken') {
            return this.isEnoughCoinBalance
        }

        return (
            isGoodBignumber(this.leftAmountNumber, false)
            && this.leftBalanceNumber.gte(this.leftAmountNumber.shiftedBy(-this.leftTokenDecimals))
        )
    }

    /**
     * Returns `true` if right amount value is valid, otherwise `false`.
     * NOTE: Use it only in UI for determining field validation and
     * DON'T USE it in internal calculations or validations
     * @returns {boolean}
     */
    public get isRightAmountValid(): boolean {
        if (this.data.rightAmount.length === 0) {
            return true
        }

        if (this.isConversionMode || this.isDepositOneCoinMode) {
            return true
        }

        if (this.isWithdrawOneCoinMode) {
            return this.isEnoughLiquidity
        }

        return this.data.rightToken !== undefined && this.data.route !== undefined
    }

    /**
     *
     */
    public get isEnoughCoinBalance(): boolean {
        const balance = new BigNumber(this.wallet.coin.balance ?? 0).shiftedBy(-this.wallet.coin.decimals)
        const safeAmount = new BigNumber(this.options?.safeAmount ?? 0).shiftedBy(-this.wallet.coin.decimals)
        return (
            isGoodBignumber(this.leftAmountNumber)
            && this.leftAmountNumber.shiftedBy(-this.leftTokenDecimals).lte(balance.minus(safeAmount))
        )
    }

    public get isEnoughCombinedBalance(): boolean {
        const safeAmount = new BigNumber(this.options?.safeAmount ?? 0).shiftedBy(-this.wallet.coin.decimals)
        return (
            isGoodBignumber(this.leftAmountNumber)
            && this.leftAmountNumber
                .shiftedBy(-this.leftTokenDecimals)
                .lte(this.combinedBalanceNumber.minus(safeAmount))
        )
    }

    public get isEnoughLiquidity(): boolean {
        const rightToken = this.pool?.tokens.find(
            token => token.address.toString().toLowerCase() === this.data.rightToken?.toLowerCase(),
        )
        return !rightToken || this.rightAmountNumber.lt(rightToken.balance ?? 0)
    }

    public get isWrapValid(): boolean {
        return this.wallet.address !== undefined && this.isEnoughCoinBalance
    }

    public get isUnwrapValid(): boolean {
        return this.wallet.address !== undefined && this.leftToken?.wallet !== undefined && this.isEnoughTokenBalance
    }

    public get isDepositOneCoinValid(): boolean {
        return (
            this.isEnoughTokenBalance
            && this.wallet.account?.address !== undefined
            && this.leftToken?.wallet !== undefined
            && this.leftTokenAddress !== undefined
            && this.pool?.address !== undefined
            && new BigNumber(this.bill.amount || 0).gt(0)
            && new BigNumber(this.bill.expectedAmount || 0).gt(0)
            && new BigNumber(this.bill.minExpectedAmount || 0).gt(0)
        )
    }

    public get isWithdrawOneCoinValid(): boolean {
        return (
            this.isEnoughTokenBalance
            && this.isEnoughLiquidity
            && this.wallet.account?.address !== undefined
            && this.leftToken?.wallet !== undefined
            && this.leftTokenAddress !== undefined
            && new BigNumber(this.bill.amount || 0).gt(0)
            && new BigNumber(this.bill.expectedAmount || 0).gt(0)
            && new BigNumber(this.bill.minExpectedAmount || 0).gt(0)
        )
    }

    public get isComboSwapValid(): boolean {
        return (
            this.isEnoughLiquidity
            && (this.isEnoughTokenBalance || this.isEnoughCoinBalance || this.isEnoughCombinedBalance)
            && this.leftTokenAddress !== undefined
            && this.leftToken?.wallet !== undefined
            && this.route !== undefined
            && this.route.steps.length > 0
            && this.data.transfer?.abi !== undefined
            && this.data.transfer.payload !== undefined
            && isGoodBignumber(this.bill.amount || 0)
            && isGoodBignumber(this.bill.expectedAmount || 0)
            && isGoodBignumber(this.bill.minExpectedAmount || 0)
            && this.options?.coinToTip3Address !== undefined
            && this.options.comboToTip3Address !== undefined
        )
    }

    public get isCoinToTip3Valid(): boolean {
        return (
            this.isEnoughCoinBalance
            && this.wallet.account?.address !== undefined
            && new BigNumber(this.bill.amount || 0).gt(0)
            && new BigNumber(this.bill.expectedAmount || 0).gt(0)
            && new BigNumber(this.bill.minExpectedAmount || 0).gt(0)
            && this.options?.coinToTip3Address !== undefined
            && this.options.wrappedCoinVaultAddress !== undefined
        )
    }

    public get isTip3ToCoinValid(): boolean {
        return (
            this.isEnoughTokenBalance
            && this.wallet.account?.address !== undefined
            && this.leftToken?.wallet !== undefined
            && this.leftTokenAddress !== undefined
            && new BigNumber(this.bill.amount || 0).gt(0)
            && new BigNumber(this.bill.expectedAmount || 0).gt(0)
            && new BigNumber(this.bill.minExpectedAmount || 0).gt(0)
            && this.options?.tip3ToCoinAddress !== undefined
            && this.options.wrappedCoinVaultAddress !== undefined
        )
    }

    /**
     * Returns `true` if all data and bill is valid, otherwise `false`.
     * @returns {boolean}
     */
    public get isValid(): boolean {
        switch (true) {
            case this.isDepositOneCoinMode:
                return this.isDepositOneCoinValid

            case this.isWithdrawOneCoinMode:
                return this.isWithdrawOneCoinValid

            case this.isWrapMode:
                return this.isWrapValid

            case this.isUnwrapMode:
                return this.isWrapValid

            case this.isCoinBasedSwapMode && this.coinSide === 'leftToken':
                return this.isCoinToTip3Valid

            case this.isCoinBasedSwapMode && this.coinSide === 'rightToken':
                return this.isTip3ToCoinValid

            case this.isComboSwapMode:
                return this.isComboSwapValid

            default:
                return (
                    this.wallet.account?.address !== undefined
                    && this.leftTokenAddress !== undefined
                    && this.leftToken?.wallet !== undefined
                    && this.route !== undefined
                    && this.route.steps.length > 0
                    && this.data.transfer?.abi !== undefined
                    && this.data.transfer.payload !== undefined
                    && new BigNumber(this.bill.amount || 0).gt(0)
                    && new BigNumber(this.bill.expectedAmount || 0).gt(0)
                    && new BigNumber(this.bill.minExpectedAmount || 0).gt(0)
                    && new BigNumber(this.leftToken.balance || 0).gte(this.bill.amount || 0)
                )
        }
    }

    /**
     *
     */
    public get formattedLeftBalance(): string {
        return formattedBalance(this.leftBalanceNumber.toFixed())
    }

    /**
     *
     */
    public get formattedRightBalance(): string {
        if (this.coinSide === 'rightToken') {
            return formattedBalance(this.wallet.coin.balance, this.wallet.coin.decimals)
        }

        return formattedBalance(this.rightToken?.balance, this.rightTokenDecimals)
    }

    /**
     *
     */
    public get leftBalanceNumber(): BigNumber {
        const balance = new BigNumber(this.leftToken?.balance || 0).shiftedBy(-this.leftTokenDecimals)

        if (this.isComboSwapMode) {
            return balance.plus(this.wallet.balanceNumber)
        }

        if (this.coinSide === 'leftToken') {
            return this.wallet.balanceNumber
        }

        return balance
    }

    public get poolAddress(): Address | undefined {
        if (this.isDepositOneCoinMode) {
            return NPoolsList.get(this.data.rightToken!)?.poolAddress
        }
        if (this.isWithdrawOneCoinMode) {
            return NPoolsList.get(this.data.leftToken!)?.poolAddress
        }
        return undefined
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
        if (this.wallet.address === undefined || !this.tokensCache.isReady) {
            return
        }

        await Promise.all([
            (prevLeftToken !== undefined && ![leftToken, rightToken].includes(prevLeftToken))
                ? this.tokensCache.unwatch(prevLeftToken, 'swap')
                : undefined,
            (prevRightToken !== undefined && ![leftToken, rightToken].includes(prevRightToken))
                ? this.tokensCache.unwatch(prevRightToken, 'swap')
                : undefined,
        ])

        if (this.wallet?.address !== undefined) {
            await Promise.all([
                (leftToken !== undefined && ![prevLeftToken, prevRightToken, rightToken].includes(leftToken))
                    ? this.tokensCache.watch(this.leftToken?.root, 'swap')
                    : undefined,
                (rightToken !== undefined && ![prevLeftToken, prevRightToken, leftToken].includes(rightToken))
                    ? this.tokensCache.watch(this.rightToken?.root, 'swap')
                    : undefined,
            ])
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
        storage.remove('amounts')

        this.setState('isPreparing', this.wallet.isInitializing || this.wallet.isConnecting)

        this.walletAccountDisposer = reaction(
            () => this.wallet.account?.address,
            this.handleWalletAccountChange,
            {
                equals: addressesComparer,
                fireImmediately: true,
            },
        )

        if (this.data.leftToken !== undefined && this.data.rightToken !== undefined) {
            await this.recalculate(true)
        }
        else if (this.data.leftToken === undefined && this.data.rightToken === undefined) {
            this.setData({
                leftToken: this.options.defaultLeftTokenAddress?.toString(),
                rightToken: this.options.defaultRightTokenAddress?.toString(),
            })

            this.setState('isCombo', true)
        }

        if (this.isDepositOneCoinMode || this.isWithdrawOneCoinMode) {
            await this.syncPool()
        }
    }

    /**
     * Handle wallet account change.
     * @param {Address} [address]
     * @protected
     */
    protected async handleWalletAccountChange(address?: Address): Promise<void> {
        this.tokensChangeDisposer = reaction(
            () => [this.data.leftToken, this.data.rightToken],
            this.handleChangeTokens,
            {
                equals: comparer.structural,
                fireImmediately: true,
            },
        )

        if (address === undefined) {
            this.tokensCache.tokens.forEach(token => {
                this.tokensCache.update(token.root, 'balance', undefined)
                this.tokensCache.update(token.root, 'wallet', undefined)
            })
            return
        }
        this.setState('isPreparing', this.tokensCache.isFetching)
        await Promise.all([
            this.leftToken?.root && this.tokensCache.syncToken(this.leftToken.root, true),
            this.rightToken?.root && this.tokensCache.syncToken(this.rightToken.root, true),
        ])
        await Promise.all([
            this.leftToken?.root && this.tokensCache.watch(this.leftToken.root, 'swap'),
            this.rightToken?.root && this.tokensCache.watch(this.rightToken.root, 'swap'),
        ])
    }


    /*
     * Internal swap processing results handlers
     * ----------------------------------------------------------------------------------
     */

    /**
     * Fires when user press Send message in extension
     * @param {DelayedMessageExecution} _
     * @param {SwapSendMessageCallbackParams} params
     * @protected
     */
    protected handleSend(_: DelayedMessageExecution, params: SwapSendMessageCallbackParams): void {
        RECEIPTS.set(params.callId, {
            receivedDecimals: this.coinSide === 'rightToken' ? this.wallet.coin.decimals : this.rightTokenDecimals,
            receivedIcon: this.coinSide === 'rightToken' ? this.wallet.coin.icon : this.rightToken?.icon,
            receivedRoot: this.coinSide === 'rightToken' ? undefined : this.rightToken?.root,
            receivedSymbol: this.coinSide === 'rightToken' ? this.wallet.coin.symbol : this.rightToken?.symbol,
            slippage: this.data.slippage,
            spentDecimals: this.leftTokenDecimals,
            spentIcon: this.leftToken?.icon,
            spentRoot: this.leftToken?.root,
            spentSymbol: this.leftToken?.symbol,
        })
        this.reset()
    }


    /*
     * Internal reaction disposers
     * ----------------------------------------------------------------------------------
     */

    protected routeCheckRunnerInterval: ReturnType<typeof setInterval> | undefined

    protected tokensChangeDisposer: IReactionDisposer | undefined

    protected tokensCacheDisposer: IReactionDisposer | undefined

    protected walletAccountDisposer: IReactionDisposer | undefined

    protected poolDisposer: IReactionDisposer | undefined

    protected poolContractSubscriber?: Subscriber

}
