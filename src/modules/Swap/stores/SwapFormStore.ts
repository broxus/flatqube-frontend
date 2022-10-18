import BigNumber from 'bignumber.js'
import type { DelayedMessageExecution } from 'everscale-inpage-provider'
import { Address } from 'everscale-inpage-provider'
import type { IReactionDisposer } from 'mobx'
import {
    action,
    computed,
    makeObservable,
    override,
    reaction,
} from 'mobx'

import {
    DEFAULT_SLIPPAGE_VALUE,
    DEFAULT_SWAP_BILL, RECEIPTS,
} from '@/modules/Swap/constants'
import { BaseSwapStore } from '@/modules/Swap/stores/BaseSwapStore'
import { CoinSwapStore } from '@/modules/Swap/stores/CoinSwapStore'
import { ConversionStore } from '@/modules/Swap/stores/ConversionStore'
import { CrossPairSwapStore } from '@/modules/Swap/stores/CrossPairSwapStore'
import { DirectSwapStore } from '@/modules/Swap/stores/DirectSwapStore'
import { MultipleSwapStore } from '@/modules/Swap/stores/MultipleSwapStore'
import type {
    CoinSwapSuccessResult,
    ConversionTransactionFailureResult,
    ConversionTransactionSuccessResult,
    CrossPairSwapStoreData,
    CrossPairTransactionFailureResult,
    DirectTransactionFailureResult,
    DirectTransactionSuccessResult,
    SendMessageCallbackParams,
    SwapFormChangesShape,
    SwapFormCtorOptions,
    SwapFormStoreData,
    SwapFormStoreState,
} from '@/modules/Swap/types'
import { CoinSwapFailureResult, SwapDirection, SwapExchangeMode } from '@/modules/Swap/types'
import { getCrossExchangeSlippage, getSlippageMinExpectedAmount } from '@/modules/Swap/utils'
import { WalletService } from '@/stores/WalletService'
import { TokensCacheService } from '@/stores/TokensCacheService'
import {
    debounce,
    debug,
    formattedBalance,
    isGoodBignumber,
    storage,
} from '@/utils'


export class SwapFormStore extends BaseSwapStore<SwapFormStoreData, SwapFormStoreState> {

    public readonly conversion: ConversionStore

    public readonly coinSwap: CoinSwapStore

    public readonly crossPairSwap: CrossPairSwapStore

    public readonly directSwap: DirectSwapStore

    public readonly multipleSwap: MultipleSwapStore

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly options: SwapFormCtorOptions,
    ) {
        super(tokensCache)

        makeObservable<
            SwapFormStore,
            | 'handleChangeTokens'
            | 'handleCoinSwapFailure'
            | 'handleCoinSwapSuccess'
            | 'handleConversionFailure'
            | 'handleConversionSuccess'
            | 'handleFormChanges'
            | 'handleSend'
            | 'handleSwapFailure'
            | 'handleSwapSuccess'
            | 'handleTokensCacheReady'
            | 'handleWalletAccountChange'
        >(this, {
            coinSide: computed,
            defaultLeftTokenRoot: computed,
            defaultRightTokenRoot: computed,
            direction: computed,
            exchangeMode: computed,
            formattedLeftBalance: override,
            formattedRightBalance: override,
            handleChangeTokens: action.bound,
            handleCoinSwapFailure: action.bound,
            handleCoinSwapSuccess: action.bound,
            handleConversionFailure: action.bound,
            handleConversionSuccess: action.bound,
            handleFormChanges: action.bound,
            handleSend: action.bound,
            handleSwapFailure: action.bound,
            handleSwapSuccess: action.bound,
            handleTokensCacheReady: action.bound,
            handleWalletAccountChange: action.bound,
            isCalculating: override,
            isCoinBasedSwapMode: computed,
            isConfirmationAwait: computed,
            isConversionMode: computed,
            isCrossExchangeAvailable: computed,
            isCrossExchangeMode: computed,
            isCrossExchangeOnly: computed,
            isLeftAmountValid: override,
            isLoading: computed,
            isMultipleSwapMode: computed,
            isPreparing: computed,
            isUnwrapMode: computed,
            isWrapMode: computed,
            leftBalanceNumber: override,
            ltrPrice: override,
            maximizeLeftAmount: action.bound,
            multipleSwapTokenRoot: computed,
            priceDirection: computed,
            route: computed,
            rtlPrice: override,
            swap: computed,
            togglePriceDirection: action.bound,
            toggleSwapExchangeMode: action.bound,
        })

        this.setData(() => ({
            bill: DEFAULT_SWAP_BILL,
            leftAmount: '',
            rightAmount: '',
            slippage: DEFAULT_SLIPPAGE_VALUE,
        }))

        this.setState(() => ({
            direction: SwapDirection.LTR,
            exchangeMode: SwapExchangeMode.DIRECT_EXCHANGE,
            isPreparing: false,
            priceDirection: SwapDirection.LTR,
        }))

        this.conversion = new ConversionStore(wallet, tokensCache, {
            callbacks: {
                onSend: this.handleSend,
                onTransactionFailure: this.handleConversionFailure,
                onTransactionSuccess: this.handleConversionSuccess,
            },
            safeAmount: options.safeAmount,
            tokenAddress: options.multipleSwapTokenRoot,
            wrapGas: options?.wrapGas,
            wrappedCoinVaultAddress: options.wrappedCoinVaultAddress,
        })
        this.crossPairSwap = new CrossPairSwapStore(wallet, tokensCache, {
            leftAmount: this.data.leftAmount,
            leftToken: this.data.leftToken,
            rightAmount: this.data.rightAmount,
            rightToken: this.data.rightToken,
            slippage: this.data.slippage,
        }, {
            callbacks: {
                onCoinSwapTransactionFailure: this.handleCoinSwapFailure,
                onCoinSwapTransactionSuccess: this.handleCoinSwapSuccess,
                onSend: this.handleSend,
                onTransactionFailure: this.handleSwapFailure,
                onTransactionSuccess: this.handleSwapSuccess,
            },
            coinToTip3Address: options.coinToTip3Address,
            comboToTip3Address: options.comboToTip3Address,
            minTvlValue: options.minTvlValue,
            safeAmount: options.safeAmount,
            tip3ToCoinAddress: options.tip3ToCoinAddress,
            wrappedCoinVaultAddress: options.wrappedCoinVaultAddress,
        })
        this.directSwap = new DirectSwapStore(wallet, tokensCache, {
            leftAmount: this.data.leftAmount,
            leftToken: this.data.leftToken,
            rightAmount: this.data.rightAmount,
            rightToken: this.data.rightToken,
            slippage: this.data.slippage,
        }, {
            callbacks: {
                onSend: this.handleSend,
                onTransactionFailure: this.handleSwapFailure,
                onTransactionSuccess: this.handleSwapSuccess,
            },
        })
        this.multipleSwap = new MultipleSwapStore(wallet, tokensCache, {
            leftAmount: this.data.leftAmount,
            leftToken: this.data.leftToken,
            rightAmount: this.data.rightAmount,
            rightToken: this.data.rightToken,
            slippage: this.data.slippage,
        }, {
            callbacks: {
                onSend: this.handleSend,
                onTransactionFailure: this.handleSwapFailure,
                onTransactionSuccess: this.handleCoinSwapSuccess,
            },
            coinToTip3Address: options.coinToTip3Address,
            comboToTip3Address: options.comboToTip3Address,
            safeAmount: options.safeAmount,
            tip3ToCoinAddress: options.tip3ToCoinAddress,
            wrappedCoinVaultAddress: options.wrappedCoinVaultAddress,
        })
        this.coinSwap = new CoinSwapStore(wallet, tokensCache, {
            leftAmount: this.data.leftAmount,
            leftToken: this.data.leftToken,
            rightAmount: this.data.rightAmount,
            rightToken: this.data.rightToken,
            slippage: this.data.slippage,
        }, {
            callbacks: {
                onSend: this.handleSend,
                onTransactionFailure: this.handleSwapFailure,
                onTransactionSuccess: this.handleCoinSwapSuccess,
            },
            coinToTip3Address: options.coinToTip3Address,
            safeAmount: options?.safeAmount,
            tip3ToCoinAddress: options.tip3ToCoinAddress,
            wrappedCoinVaultAddress: options.wrappedCoinVaultAddress,
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

        this.formDataDisposer = reaction(
            () => ({
                bill: this.data.bill,
                leftAmount: this.data.leftAmount,
                leftToken: this.data.leftToken,
                pair: this.data.pair,
                rightAmount: this.data.rightAmount,
                rightToken: this.data.rightToken,
                slippage: this.data.slippage,
            }),
            this.handleFormChanges,
            { fireImmediately: true },
        )
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
        this.reset()
    }

    /**
     * Submit transaction dispatcher
     */
    public async submit(): Promise<void> {
        switch (true) {
            case this.isCrossExchangeMode:
                if (this.isCoinBasedSwapMode && this.coinSide === 'leftToken') {
                    await this.crossPairSwap.submit('fromCoinToTip3')
                }
                else if (this.isCoinBasedSwapMode && this.coinSide === 'rightToken') {
                    await this.crossPairSwap.submit('fromTip3ToCoin')
                }
                else if (this.isMultipleSwapMode && this.multipleSwap.isEnoughTokenBalance) {
                    await this.crossPairSwap.submit()
                }
                else if (this.isMultipleSwapMode && this.multipleSwap.isEnoughCoinBalance) {
                    await this.crossPairSwap.submit('fromCoinToTip3')
                }
                else if (this.isMultipleSwapMode && this.multipleSwap.isEnoughCombinedBalance) {
                    await this.crossPairSwap.submit('multiSwap')
                }
                else {
                    await this.crossPairSwap.submit()
                }
                break

            case this.isMultipleSwapMode && this.multipleSwap.isEnoughTokenBalance:
                await this.directSwap.submit()
                break

            case this.isMultipleSwapMode && this.multipleSwap.isEnoughCoinBalance:
                await this.coinSwap.submit('fromCoinToTip3')
                break

            case this.isMultipleSwapMode:
                await this.multipleSwap.submit()
                break

            case this.coinSide === 'leftToken':
                await this.coinSwap.submit('fromCoinToTip3')
                break

            case this.coinSide === 'rightToken':
                await this.coinSwap.submit('fromTip3ToCoin')
                break

            default:
                await this.directSwap.submit()
        }
    }

    /**
     * Full reset direct, cross-pair and multiple swap
     * instances to their default.
     * @protected
     */
    protected reset(): void {
        this.setData({
            bill: DEFAULT_SWAP_BILL,
            leftAmount: '',
            rightAmount: '',
        })
        this.setState(() => ({
            coinSide: this.coinSide,
            direction: SwapDirection.LTR,
            exchangeMode: this.isConversionMode ? this.exchangeMode : SwapExchangeMode.DIRECT_EXCHANGE,
            isConfirmationAwait: false,
            isMultiple: this.isMultipleSwapMode,
            priceDirection: SwapDirection.LTR,
        }))
        this.multipleSwap.reset()
        this.crossPairSwap.reset()
        this.coinSwap.reset()
        this.directSwap.reset()
    }

    /**
     * Maximizing the value of the left field depending on the form mode
     */
    public async maximizeLeftAmount(): Promise<void> {
        let balance = this.leftBalanceNumber

        if (this.isMultipleSwapMode || this.isWrapMode || this.coinSide === 'leftToken') {
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

        this.setState('isCalculating', true)

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

        this.forceInvalidate()

        if (value.length === 0) {
            this.setData('rightAmount', '')
            if (this.pair !== undefined && !this.isLowTvl) {
                this.setState('exchangeMode', SwapExchangeMode.DIRECT_EXCHANGE)
            }
        }

        await callback?.()

        if (!this.isConversionMode && !this.isEnoughLiquidity) {
            this.setData('rightAmount', '')
        }
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

        this.forceInvalidate()

        if (value.length === 0) {
            this.setData('leftAmount', '')
            if (this.pair !== undefined && !this.isLowTvl) {
                this.setState('exchangeMode', SwapExchangeMode.DIRECT_EXCHANGE)
            }
        }

        await callback?.()
    }

    /**
     * Use this method to change left token root value instead of direct change value via `setData`.
     * Pass the callback function as second argument, and it will be fires after all data and
     * states changes and before run recalculation.
     * @param {string} [root]
     * @param {() => void} [callback]
     */
    public async changeLeftToken(root?: string, callback?: () => (Promise<void> | void)): Promise<void> {
        if (root === undefined) {
            return
        }

        const isReverting = root === this.data.rightToken && !this.isConversionMode

        if (isReverting) {
            this.setData({
                leftToken: root,
                rightToken: this.data.leftToken,
            })
            this.setState('direction', SwapDirection.LTR)
        }
        else {
            this.setData({
                leftToken: root,
                ltrPrice: undefined,
                pair: undefined,
                rtlPrice: undefined,
            })
            this.crossPairSwap.setData('routes', [])
            if (this.direction === SwapDirection.LTR) {
                this.setData('rightAmount', '')
            }
            else if (this.direction === SwapDirection.RTL) {
                this.setData('leftAmount', '')
            }
        }

        this.forceInvalidate()

        await callback?.()

        if (this.data.leftToken === undefined || this.data.rightToken === undefined) {
            this.setData('pair', undefined)
            return
        }

        if (this.pair === undefined) {
            await this.prepare()
        }

        this.checkExchangeMode()

        await this.recalculate(!this.isCalculating)
    }

    /**
     * Use this method to change right token root value instead of direct change value via `setData`
     * Pass the callback function as second argument, and it will be fires after all data and
     * states changes and before run recalculation.
     * @param {string} [root]
     * @param {() => void} [callback]
     */
    public async changeRightToken(root?: string, callback?: () => (Promise<void> | void)): Promise<void> {
        if (root === undefined) {
            return
        }

        const isReverting = root === this.data.leftToken && !this.isConversionMode

        if (isReverting) {
            this.setData({
                leftToken: this.data.rightToken,
                rightToken: root,
            })
            this.setState('direction', SwapDirection.RTL)
        }
        else {
            this.setData({
                ltrPrice: undefined,
                pair: undefined,
                rightToken: root,
                rtlPrice: undefined,
            })
            this.crossPairSwap.setData('routes', [])
            if (this.direction === SwapDirection.LTR) {
                this.setData('rightAmount', '')
            }
            else if (this.direction === SwapDirection.RTL) {
                this.setData('leftAmount', '')
            }
        }

        this.forceInvalidate()

        await callback?.()

        if (this.leftToken === undefined || this.rightToken === undefined) {
            this.setData('pair', undefined)
            return
        }

        if (this.pair === undefined) {
            await this.prepare()
        }

        this.checkExchangeMode()

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

            if (this.isCrossExchangeMode) {
                this.crossPairSwap.setData('route', undefined)
                await this.recalculate(!this.isCalculating)
            }

            if (this.swap.expectedAmount !== undefined) {
                (this.swap as any).setData('bill', {
                    amount: this.swap.amount,
                    expectedAmount:  this.swap.expectedAmount,
                    fee:  this.swap.fee,
                    minExpectedAmount: getSlippageMinExpectedAmount(
                        new BigNumber(this.swap.expectedAmount || 0),
                        value,
                    ).toFixed(),
                    priceImpact: this.swap.priceImpact,
                })
            }
        }
    }

    /**
     * Manually toggle conversion direction.
     * Revert amounts, tokens, exchange mode and native coin side
     */
    public async toggleConversionDirection(): Promise<void> {
        if (this.isLoading || this.isSwapping) {
            return
        }

        this.setState({
            coinSide: this.coinSide && (this.coinSide === 'leftToken' ? 'rightToken' : 'leftToken'),
            direction: SwapDirection.LTR,
            exchangeMode: this.exchangeMode === SwapExchangeMode.WRAP_COIN
                ? SwapExchangeMode.UNWRAP_COIN
                : SwapExchangeMode.WRAP_COIN,
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
        if (this.isLoading || this.isSwapping) {
            return
        }

        this.setState({
            coinSide: this.isMultipleSwapMode
                ? undefined
                : (this.coinSide && (this.coinSide === 'leftToken' ? 'rightToken' : 'leftToken')),
            direction: this.direction === SwapDirection.RTL ? SwapDirection.LTR : SwapDirection.RTL,
            exchangeMode: this.isMultipleSwapMode ? SwapExchangeMode.DIRECT_EXCHANGE : this.exchangeMode,
            isMultiple: false,
        })

        this.setData({
            leftAmount: this.data.rightAmount,
            leftToken: this.data.rightToken,
            rightAmount: this.data.leftAmount,
            rightToken: this.data.leftToken,
        })

        this.forceInvalidate()

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
     * Manually toggle exchange mode.
     */
    public toggleSwapExchangeMode(): void {
        if (!this.isCrossExchangeMode && this.isCrossExchangeAvailable) {
            this.setState('exchangeMode', SwapExchangeMode.CROSS_PAIR_EXCHANGE)
            return
        }
        this.setState('exchangeMode', SwapExchangeMode.DIRECT_EXCHANGE)
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

        if (this.direction === SwapDirection.LTR && isGoodBignumber(this.leftAmountNumber)) {
            await Promise.allSettled([
                (this.pair?.address !== undefined && !this.isCrossExchangeOnly) && this.calculateLeftToRight(force),
                this.crossPairSwap.checkSuggestions(this.leftAmountNumber.toFixed(), 'expectedexchange'),
            ])

            await this.crossPairSwap.calculateLeftToRight(force)
        }
        else if (this.direction === SwapDirection.RTL && isGoodBignumber(this.rightAmountNumber)) {
            await Promise.allSettled([
                (this.pair?.address !== undefined && !this.isCrossExchangeOnly) && this.calculateRightToLeft(force),
                this.crossPairSwap.checkSuggestions(this.rightAmountNumber.toFixed(), 'expectedspendamount'),
            ])

            await this.crossPairSwap.calculateRightToLeft(force, this.isEnoughLiquidity)
        }
        else {
            await this.finalizeCalculation(this.direction)
        }

        this.setState('isCalculating', false)

        if (!this.isCrossExchangeOnly) {
            this.checkExchangeMode()
        }
    }


    /*
     * Memoized store data and state values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns memoized swap direction value
     * @returns {SwapFormStoreState['direction']}
     */
    public get direction(): SwapFormStoreState['direction'] {
        return this.state.direction
    }

    /**
     * Returns memoized exchange mode value
     * @returns {SwapFormStoreState['exchangeMode']}
     */
    public get exchangeMode(): SwapFormStoreState['exchangeMode'] {
        return this.state.exchangeMode
    }

    /**
     * Returns memoized native coin side value
     * @returns {SwapFormStoreState['coinSide']}
     */
    public get coinSide(): SwapFormStoreState['coinSide'] {
        return this.state.coinSide
    }

    /**
     * Price of right token per 1 left token
     * @returns {BaseSwapStoreData['ltrPrice']}
     */
    public get ltrPrice(): SwapFormStoreData['ltrPrice'] {
        return this.data.ltrPrice
    }

    /**
     * Returns memoized price direction value
     * @returns {SwapFormStoreState['priceDirection']}
     */
    public get priceDirection(): SwapFormStoreState['priceDirection'] {
        return this.state.priceDirection
    }

    /**
     * Price of left token per 1 right token
     * @returns {BaseSwapStoreData['rtlPrice']}
     */
    public get rtlPrice(): SwapFormStoreData['rtlPrice'] {
        return this.data.rtlPrice
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
     * @returns {SwapFormStoreState['isMultiple']}
     */
    public get isMultipleSwapMode(): SwapFormStoreState['isMultiple'] {
        return this.state.isMultiple
    }

    /**
     * Returns memoized preparing state value
     * @returns {SwapFormStoreState['isPreparing']}
     */
    public get isPreparing(): SwapFormStoreState['isPreparing'] {
        return this.state.isPreparing
    }


    /*
     * Computed values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns memoized multiple swap token root value
     * @returns {SwapFormCtorOptions['multipleSwapTokenRoot']}
     */
    public get multipleSwapTokenRoot(): SwapFormCtorOptions['multipleSwapTokenRoot'] {
        return this.options?.multipleSwapTokenRoot
    }

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
     *
     */
    public get isCalculating(): boolean {
        return this.state.isCalculating || this.swap.isCalculating
    }

    /**
     * Returns `true` if cross-pair exchange is available for current pair.
     * @returns {boolean}
     */
    public get isCrossExchangeAvailable(): boolean {
        return this.crossPairSwap.routes.length > 0
    }

    /**
     * Returns `true` if cross-pair swap exchange mode is enabled.
     * @returns {boolean}
     */
    public get isCrossExchangeMode(): boolean {
        return [
            SwapExchangeMode.CROSS_PAIR_EXCHANGE,
            SwapExchangeMode.CROSS_PAIR_EXCHANGE_ONLY,
        ].includes(this.exchangeMode)
    }

    /**
     * Returns `true` if only cross-exchange available, otherwise `false`.
     * @returns {boolean}
     */
    public get isCrossExchangeOnly(): boolean {
        return this.exchangeMode === SwapExchangeMode.CROSS_PAIR_EXCHANGE_ONLY
    }

    /**
     * Returns `true` if native coin is selected
     * @returns {boolean}
     */
    public get isConversionMode(): boolean {
        return [
            SwapExchangeMode.WRAP_COIN,
            SwapExchangeMode.UNWRAP_COIN,
        ].includes(this.exchangeMode)
    }

    /**
     *
     */
    public get isWrapMode(): boolean {
        return this.exchangeMode === SwapExchangeMode.WRAP_COIN
    }

    /**
     *
     */
    public get isUnwrapMode(): boolean {
        return this.exchangeMode === SwapExchangeMode.UNWRAP_COIN
    }

    /**
     *
     */
    public get isCoinBasedSwapMode(): boolean {
        return this.coinSide !== undefined
    }

    /**
     * Returns combined `isLoading` state from direct swap, cross-pair swap.
     * @returns {boolean}
     */
    public get isLoading(): boolean {
        return this.tokensCache.isFetching || this.isPairChecking
    }

    /**
     * Returns combined `isSwapping` state from direct swap, cross-pair swap.
     * @returns {boolean}
     */
    public get isSwapping(): boolean {
        return (
            this.coinSwap.isSwapping
            || this.conversion.isProcessing
            || this.crossPairSwap.isSwapping
            || this.directSwap.isSwapping
            || this.multipleSwap.isSwapping
        )
    }

    /**
     * Returns `true` if left amount value is valid, otherwise `false`.
     * NOTE: Use it only in UI for determining field validation and
     * DON'T USE it in internal calculations or validations
     * @returns {boolean}
     */
    public get isLeftAmountValid(): boolean {
        if (this.isCrossExchangeMode && this.direction === SwapDirection.RTL) {
            return this.crossPairSwap.isLeftAmountValid
        }

        if (this.isWrapMode) {
            return this.conversion.isWrapAmountValid
        }

        if (this.isUnwrapMode) {
            return this.conversion.isUnwrapAmountValid
        }

        if (this.isMultipleSwapMode) {
            return this.multipleSwap.isLeftAmountValid
        }

        if (this.leftAmount.length === 0) {
            return true
        }

        if (this.coinSide === 'leftToken') {
            return this.coinSwap.isEnoughCoinBalance
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
        if (
            this.swap.rightAmount.length > 0
            && !this.isCrossExchangeMode
            && !this.isConversionMode
        ) {
            return this.isEnoughLiquidity
        }
        return true
    }

    /**
     * Returns `true` if all data and bill is valid, otherwise `false`.
     * @returns {boolean}
     */
    public get isValid(): boolean {
        switch (true) {
            case this.isWrapMode:
                return this.conversion.isWrapValid

            case this.isUnwrapMode:
                return this.conversion.isWrapValid

            case this.isCrossExchangeMode:
                if (this.isCoinBasedSwapMode && this.coinSide === 'leftToken') {
                    return this.crossPairSwap.isValidCoinToTip3
                }
                if (this.isCoinBasedSwapMode && this.coinSide === 'rightToken') {
                    return this.crossPairSwap.isValidTip3ToCoin
                }
                if (this.isMultipleSwapMode) {
                    return this.crossPairSwap.isValidCombined
                }
                return this.crossPairSwap.isValid

            case this.isMultipleSwapMode:
                return this.multipleSwap.isValid

            case this.coinSide === 'leftToken':
                return this.coinSwap.isValidCoinToTip3

            case this.coinSide === 'rightToken':
                return this.coinSwap.isValidTip3ToCoin

            default:
                return (
                    this.isEnoughLiquidity
                    && this.wallet.account?.address !== undefined
                    && this.pair?.address !== undefined
                    && this.pair?.contract !== undefined
                    && this.leftToken?.wallet !== undefined
                    && this.leftTokenAddress !== undefined
                    && new BigNumber(this.amount || 0).gt(0)
                    && new BigNumber(this.expectedAmount || 0).gt(0)
                    && new BigNumber(this.minExpectedAmount || 0).gt(0)
                    && new BigNumber(this.leftToken.balance || 0).gte(this.amount || 0)
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

        if (this.isMultipleSwapMode) {
            return balance.plus(this.wallet.balanceNumber)
        }

        if (this.coinSide === 'leftToken') {
            return this.wallet.balanceNumber
        }

        return balance
    }

    /**
     * Returns memoized best priced route
     * Proxy to cross-pair swap store instance
     * @returns {CrossPairSwapStoreData['pair']}
     */
    public get route(): CrossPairSwapStoreData['route'] {
        return this.crossPairSwap.route
    }

    /**
     * Returns current swap way upon exchange mode
     * @requires {DirectSwapStore | MultipleSwapStore | CoinSwapStore | CrossPairSwapStore}
     */
    public get swap(): DirectSwapStore | MultipleSwapStore | CoinSwapStore | CrossPairSwapStore {
        switch (true) {
            case this.isCrossExchangeMode:
                return this.crossPairSwap

            case this.isCoinBasedSwapMode:
                return this.coinSwap

            case this.isMultipleSwapMode:
                return this.multipleSwap

            default:
                return this.directSwap
        }
    }


    /*
     * Internal and external utilities methods
     * ----------------------------------------------------------------------------------
     */

    /**
     * Invalidate partial data of the internal stores
     */
    public forceInvalidate(): void {
        this.setData('bill', DEFAULT_SWAP_BILL)
        this.multipleSwap.setData('bill', DEFAULT_SWAP_BILL)
        this.crossPairSwap.setData('route', undefined)
        this.directSwap.setData('bill', DEFAULT_SWAP_BILL)
    }

    /**
     * Checks if we should be toggled to cross-exchange mode.
     * Toggle to cross-exchange mode if:
     * - direct pair token doesn't exist or exists, but pool haven't enough liquidity
     * - cross-exchange is available - has 1 or more routes and has best route
     * @protected
     */
    protected checkExchangeMode(): void {
        switch (true) {
            case (this.pair === undefined || this.isLowTvl) && this.isCrossExchangeAvailable:
                this.setState('exchangeMode', SwapExchangeMode.CROSS_PAIR_EXCHANGE_ONLY)
                break

            case this.isMultipleSwapMode:
                this.setState('exchangeMode', SwapExchangeMode.DIRECT_EXCHANGE)
                break

            case this.coinSide === 'leftToken' && this.rightToken?.root === this.multipleSwapTokenRoot:
                this.setState('exchangeMode', SwapExchangeMode.WRAP_COIN)
                break

            case this.coinSide === 'rightToken' && this.leftToken?.root === this.multipleSwapTokenRoot:
                this.setState('exchangeMode', SwapExchangeMode.WRAP_COIN)
                break

            case (!this.isEnoughLiquidity || this.pair === undefined) && this.route !== undefined:
                this.setState('exchangeMode', SwapExchangeMode.CROSS_PAIR_EXCHANGE)
                break

            default:
                this.setState('exchangeMode', SwapExchangeMode.DIRECT_EXCHANGE)
        }
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

        debug('handleChangeTokens')

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

    protected async handleFormChanges(formData?: SwapFormChangesShape): Promise<void> {
        if (formData === undefined) {
            return
        }

        this.crossPairSwap.setData(formData)
        this.conversion.setData('amount', formData.leftAmount)
        this.coinSwap.setData(formData)
        this.directSwap.setData(formData)
        this.multipleSwap.setData(formData)
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

        if (this.data.leftToken !== undefined && this.data.rightToken !== undefined) {
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

            await this.prepare()
            await this.recalculate(true)
        }
        else if (this.data.leftToken === undefined && this.data.rightToken === undefined) {
            this.setData({
                leftToken: this.options.defaultLeftTokenAddress?.toString(),
                rightToken: this.options.defaultRightTokenAddress?.toString(),
            })

            this.setState('isMultiple', true)

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
     * @param {DelayedMessageExecution} message
     * @param {SendMessageCallbackParams} params
     * @protected
     */
    protected handleSend(message: DelayedMessageExecution, params: SendMessageCallbackParams): void {
        RECEIPTS.set(params.callId, {
            receivedDecimals: this.coinSide === 'rightToken' ? this.wallet.coin.decimals : this.rightTokenDecimals,
            receivedIcon: this.coinSide === 'rightToken' ? this.wallet.coin.icon : this.rightToken?.icon,
            receivedRoot: this.coinSide === 'rightToken' ? undefined : this.rightToken?.root,
            receivedSymbol: this.coinSide === 'rightToken' ? this.wallet.coin.symbol : this.rightToken?.symbol,
            slippage: this.isCrossExchangeMode ? this.crossPairSwap.slippage : this.data.slippage,
            spentDecimals: this.leftTokenDecimals,
            spentIcon: this.leftToken?.icon,
            spentRoot: this.leftToken?.root,
            spentSymbol: this.leftToken?.symbol,
        })
        this.reset()
        this.options.onSend?.(message, params)
    }

    /**
     * Success transaction callback handler
     * @param {DirectTransactionSuccessResult} result
     * @protected
     */
    protected handleSwapSuccess(result: DirectTransactionSuccessResult): void {
        const receipt = RECEIPTS.get(result.callId)

        if (receipt === undefined) {
            return
        }

        this.options.onSwapSuccess?.(result, {
            ...receipt,
            amount: result.input.result.received.toString(),
            hash: result.transaction.id.hash,
            spentFee: result.input.result.fee.toString(),
            success: true,
        })

        RECEIPTS.delete(result.callId)
    }

    /**
     * Failure transaction callback handler
     * @param {DirectTransactionFailureResult | CrossPairTransactionFailureResult} reason
     * @protected
     */
    protected handleSwapFailure(reason: DirectTransactionFailureResult | CrossPairTransactionFailureResult): void {
        if ('cancelStep' in reason || 'step' in reason || 'index' in reason) {
            const receipt = RECEIPTS.get(reason.callId)
            if (receipt === undefined) {
                return
            }

            const leftToken = this.tokensCache.get(reason.cancelStep?.step.spentAddress.toString())
            const rightToken = this.tokensCache.get(reason.cancelStep?.step.receiveAddress.toString())

            this.options.onSwapFailure?.(reason, {
                amount: reason.step?.amount,
                hash: reason.cancelStep?.transaction?.id.hash,
                isCrossExchangeCanceled: reason.step !== undefined,
                receivedDecimals: rightToken?.decimals,
                receivedRoot: rightToken?.root,
                receivedSymbol: rightToken?.symbol,
                slippage: reason.index !== undefined
                    ? getCrossExchangeSlippage(
                        receipt.slippage || this.crossPairSwap.slippage,
                        reason.index + 1,
                    )
                    : undefined,
                spentDecimals: leftToken?.decimals,
                spentIcon: leftToken?.icon,
                spentRoot: leftToken?.root,
                spentSymbol: leftToken?.symbol,
                success: false,
            })

            RECEIPTS.delete(reason.callId)

            return
        }

        this.options.onSwapFailure?.(reason, {})
    }

    /**
     * Fires when coin swap has been completed
     * @param {CoinSwapSuccessResult} result
     * @protected
     */
    protected handleCoinSwapSuccess(result: CoinSwapSuccessResult): void {
        const receipt = RECEIPTS.get(result.callId)

        if (receipt === undefined) {
            return
        }

        this.options.onCoinSwapSuccess?.(result, {
            ...receipt,
            amount: result.input.amount.toString(),
            hash: result.transaction.id.hash,
            success: true,
        })

        RECEIPTS.delete(result.callId)
    }

    /**
     * Fires when coin swap ends with failure
     * @param {CoinSwapFailureResult} reason
     * @protected
     */
    protected handleCoinSwapFailure(reason: CoinSwapFailureResult): void {
        if (reason.status === 'partial') {
            const leftToken = this.tokensCache.get(reason.cancelStep?.step.spentAddress.toString())
            const rightToken = this.tokensCache.get(reason.cancelStep?.step.receiveAddress.toString())

            this.options.onCoinSwapFailure?.(reason, {
                amount: reason.cancelStep?.amount,
                hash: reason.cancelStep?.transaction?.id.hash,
                isCrossExchangeCanceled: true,
                receivedDecimals: reason.isLastStep ? this.wallet.coin.decimals : rightToken?.decimals,
                receivedRoot: reason.isLastStep ? undefined : rightToken?.root,
                receivedSymbol: reason.isLastStep ? this.wallet.coin.symbol : rightToken?.symbol,
                slippage: reason.index !== undefined
                    ? getCrossExchangeSlippage(
                        this.crossPairSwap.slippage,
                        reason.index + 1,
                    )
                    : undefined,
                spentDecimals: leftToken?.decimals,
                spentIcon: leftToken?.icon,
                spentRoot: leftToken?.root,
                spentSymbol: leftToken?.symbol,
                success: false,
            })
        }
        else if (reason.status === 'cancel') {
            this.options.onCoinSwapFailure?.(reason, {
                amount: reason.input?.amount,
                hash: reason.input?.id,
                isCrossExchangeCanceled: false,
                receivedDecimals: this.wallet.coin.decimals,
                receivedIcon: this.wallet.coin.icon,
                receivedSymbol: this.wallet.coin.symbol,
                success: false,
            })
        }
    }

    /**
     * Fires when conversion has been completed
     * @param {ConversionTransactionSuccessResult} result
     * @protected
     */
    protected handleConversionSuccess(result: ConversionTransactionSuccessResult): void {
        this.options.onConversionSuccess?.(result)
    }

    /**
     * Fires when conversion ends with failure
     * @param {ConversionTransactionFailureResult} reason
     * @protected
     */
    protected handleConversionFailure(reason: ConversionTransactionFailureResult): void {
        this.options.onConversionFailure?.(reason)
    }


    /*
     * Internal reaction disposers
     * ----------------------------------------------------------------------------------
     */

    protected formDataDisposer: IReactionDisposer | undefined

    protected tokensChangeDisposer: IReactionDisposer | undefined

    protected tokensCacheDisposer: IReactionDisposer | undefined

    protected walletAccountDisposer: IReactionDisposer | undefined

}
