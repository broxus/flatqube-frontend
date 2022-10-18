import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'
import { computed, makeObservable, toJS } from 'mobx'

import { useStaticRpc } from '@/hooks/useStaticRpc'
import { checkPair, DexAbi, PairType } from '@/misc'
import { DEFAULT_DECIMALS, DEFAULT_SLIPPAGE_VALUE, DEFAULT_SWAP_BILL } from '@/modules/Swap/constants'
import { useSwapApi } from '@/modules/Swap/hooks/useApi'
import type {
    BaseSwapStoreCtorOptions,
    BaseSwapStoreData,
    BaseSwapStoreInitialData,
    BaseSwapStoreState,
} from '@/modules/Swap/types'
import { SwapDirection } from '@/modules/Swap/types'
import {
    getDefaultPricesRates,
    getDirectExchangePriceImpact,
    getExchangePricesRates,
    getExpectedExchange,
    getExpectedSpendAmount,
    getSlippageMinExpectedAmount,
} from '@/modules/Swap/utils'
import { BaseStore } from '@/stores/BaseStore'
import type { TokenCache } from '@/stores/TokensCacheService'
import { TokensCacheService } from '@/stores/TokensCacheService'
import {
    debug,
    error,
    formattedTokenAmount,
    isGoodBignumber,
} from '@/utils'


const staticRpc = useStaticRpc()


export abstract class BaseSwapStore<
    T extends BaseSwapStoreData | Record<string, any> = BaseSwapStoreData,
    U extends BaseSwapStoreState | Record<string, any> = BaseSwapStoreState
> extends BaseStore<T, U> {

    protected constructor(
        public readonly tokensCache: TokensCacheService,
        protected readonly initialData?: BaseSwapStoreInitialData,
        protected readonly options?: BaseSwapStoreCtorOptions,
    ) {
        super()

        this.setData(() => ({
            bill: DEFAULT_SWAP_BILL,
            leftAmount: initialData?.leftAmount ?? '',
            leftToken: initialData?.leftToken,
            pair: undefined,
            rightAmount: initialData?.rightAmount ?? '',
            rightToken: initialData?.rightToken,
            slippage: initialData?.slippage ?? DEFAULT_SLIPPAGE_VALUE,
        }))

        this.setState(() => ({
            isCalculating: false,
            isLowTvl: false,
            isPairChecking: false,
            isSwapping: false,
        }))

        makeObservable<
            BaseSwapStore<T, U>,
            | 'leftTokenAddress'
            | 'rightTokenAddress'
        >(this, {
            amount: computed,
            expectedAmount: computed,
            fee: computed,
            formattedLeftBalance: computed,
            formattedRightBalance: computed,
            isCalculating: computed,
            isEnoughLiquidity: computed,
            isLeftAmountValid: computed,
            isLowTvl: computed,
            isPairChecking: computed,
            isPairInverted: computed,
            isRightAmountValid: computed,
            isSwapping: computed,
            leftAmount: computed,
            leftAmountNumber: computed,
            leftBalanceNumber: computed,
            leftToken: computed,
            leftTokenAddress: computed,
            leftTokenDecimals: computed,
            ltrPrice: computed,
            minExpectedAmount: computed,
            pair: computed,
            pairLeftBalanceNumber: computed,
            pairRightBalanceNumber: computed,
            priceImpact: computed,
            rightAmount: computed,
            rightAmountNumber: computed,
            rightBalanceNumber: computed,
            rightToken: computed,
            rightTokenAddress: computed,
            rightTokenDecimals: computed,
            rtlPrice: computed,
            slippage: computed,
        })
    }


    /*
     * Memoized store data and state values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns bill amount value
     * @returns {BaseSwapStoreData['bill']['amount']}
     */
    public get amount(): BaseSwapStoreData['bill']['amount'] {
        return this.data.bill.amount
    }

    /**
     * Returns bill expected amount value
     * @returns {BaseSwapStoreData['bill']['amount']}
     */
    public get expectedAmount(): BaseSwapStoreData['bill']['expectedAmount'] {
        return this.data.bill.expectedAmount
    }

    /**
     * Returns bill fee value
     * @returns {BaseSwapStoreData['bill']['fee']}
     */
    public get fee(): BaseSwapStoreData['bill']['fee'] {
        return this.data.bill.fee
    }

    /**
     * Returns bill min expected amount value
     * @returns {BaseSwapStoreData['bill']['minExpectedAmount']}
     */
    public get minExpectedAmount(): BaseSwapStoreData['bill']['minExpectedAmount'] {
        return this.data.bill.minExpectedAmount
    }

    /**
     * Returns memoized left amount value
     * @returns {BaseSwapStoreData['leftAmount']}
     */
    public get leftAmount(): BaseSwapStoreData['leftAmount'] {
        return this.data.leftAmount
    }

    /**
     * Returns memoized current direct pair
     * Proxy to direct swap store instance
     * @returns {BaseSwapStoreData['pair']}
     */
    public get pair(): BaseSwapStoreData['pair'] {
        return this.data.pair
    }

    /**
     * Returns bill price impact value
     * @returns {BaseSwapStoreData['bill']['priceImpact']}
     */
    public get priceImpact(): BaseSwapStoreData['bill']['priceImpact'] {
        return this.data.bill.priceImpact
    }

    /**
     * Price of right token per 1 left token
     * @returns {BaseSwapStoreData['ltrPrice']}
     */
    public get ltrPrice(): BaseSwapStoreData['ltrPrice'] {
        return this.data.ltrPrice
    }

    /**
     * Price of left token per 1 right token
     * @returns {BaseSwapStoreData['rtlPrice']}
     */
    public get rtlPrice(): BaseSwapStoreData['rtlPrice'] {
        return this.data.rtlPrice
    }

    /**
     * Returns memoized right amount value
     * @returns {BaseSwapStoreData['rightAmount']}
     */
    public get rightAmount(): BaseSwapStoreData['rightAmount'] {
        return this.data.rightAmount
    }

    /**
     * Returns memoized slippage tolerance value
     * @returns {BaseSwapStoreData['slippage']}
     */
    public get slippage(): BaseSwapStoreData['slippage'] {
        return this.data.slippage
    }

    /**
     * Returns `true` if data is calculating. Otherwise, `false`
     * @returns {BaseSwapStoreState['isCalculating']}
     */
    public get isCalculating(): BaseSwapStoreState['isCalculating'] {
        return this.state.isCalculating
    }

    /**
     * Returns `true` if pair current TVL is low. Otherwise, `false`
     * @returns {BaseSwapStoreState['isLowTvl']}
     */
    public get isLowTvl(): BaseSwapStoreState['isLowTvl'] {
        return this.state.isLowTvl
    }

    /**
     *
     * @returns {BaseSwapStoreState['isPairChecking']}
     */
    public get isPairChecking(): BaseSwapStoreState['isPairChecking'] {
        return this.state.isPairChecking
    }

    /**
     * Returns `true` if swap process is running. Otherwise, `false`
     * @returns {BaseSwapStoreState['isSwapping']}
     */
    public get isSwapping(): BaseSwapStoreState['isSwapping'] {
        return this.state.isSwapping
    }


    /*
     * Computed values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns `true` if pair has enough liquidity. Otherwise, `false`
     * @returns {boolean}
     */
    public get isEnoughLiquidity(): boolean {
        if (isGoodBignumber(this.rightAmountNumber)) {
            const pairRightBalanceNumber = this.isPairInverted
                ? this.pairLeftBalanceNumber
                : this.pairRightBalanceNumber
            return this.rightAmountNumber.lt(pairRightBalanceNumber)
        }

        return !this.pairLeftBalanceNumber.isZero() && !this.pairRightBalanceNumber.isZero()
    }

    /**
     * Returns `true` if left amount value is valid, otherwise `false`.
     * NOTE: Use it only in UI for determining field validation and
     * DON'T USE it in internal calculations or validations
     * @returns {boolean}
     */
    public get isLeftAmountValid(): boolean {
        if (this.leftAmount.length === 0) {
            return true
        }
        return isGoodBignumber(this.leftAmountNumber, false) && this.leftBalanceNumber.gte(this.leftAmountNumber)
    }

    /**
     * Returns `true` if selected tokens is inverted to the exists pair.
     * @returns {boolean}
     */
    public get isPairInverted(): boolean {
        return this.pair?.roots?.left.toString() !== this.leftToken?.root
    }

    /**
     * Returns `true` if right amount value is valid, otherwise `false`.
     * NOTE: Use it only in UI for determining field validation and
     * DON'T USE it in internal calculations or validations
     * @returns {boolean}
     */
    public get isRightAmountValid(): boolean {
        if (this.rightAmount.length === 0) {
            return true
        }
        return this.rightAmount.length > 0 && isGoodBignumber(this.rightAmountNumber)
    }

    /**
     * Returns BigNumber of the left amount value whose shifted by left token decimals
     * @returns {BigNumber}
     */
    public get leftAmountNumber(): BigNumber {
        return new BigNumber(this.data.leftAmount)
            .shiftedBy(this.leftTokenDecimals)
            .dp(0, BigNumber.ROUND_DOWN)
    }

    /**
     * Returns BigNumber of the left token balance
     * @returns {BigNumber}
     */
    public get leftBalanceNumber(): BigNumber {
        return new BigNumber(this.leftToken?.balance || 0)
    }

    /**
     * Returns memoized left selected token
     * @returns {TokenCache | undefined}
     */
    public get leftToken(): TokenCache | undefined {
        return this.tokensCache.get(this.data.leftToken)
    }

    /**
     * Returns left token `Address` instance if left token is selected, otherwise returns `undefined`.
     * @returns {Address | undefined}
     * @protected
     */
    protected get leftTokenAddress(): Address | undefined {
        return this.leftToken?.root !== undefined ? new Address(this.leftToken.root) : undefined
    }

    /**
     * Returns memoized left token decimals or global default decimals - 18.
     * @returns {number}
     */
    public get leftTokenDecimals(): number {
        return this.leftToken?.decimals ?? DEFAULT_DECIMALS
    }

    /**
     * Returns BigNumber of the pair left balance value
     * @returns {BigNumber}
     */
    public get pairLeftBalanceNumber(): BigNumber {
        return new BigNumber(this.pair?.balances?.left || 0)
    }

    /**
     * Returns BigNumber of the pair right balance value
     * @returns {BigNumber}
     */
    public get pairRightBalanceNumber(): BigNumber {
        return new BigNumber(this.pair?.balances?.right || 0)
    }

    /**
     * Returns BigNumber of the right amount value whose shifted by right token decimals
     * @returns {BigNumber}
     */
    public get rightAmountNumber(): BigNumber {
        return new BigNumber(this.data.rightAmount)
            .shiftedBy(this.rightTokenDecimals)
            .dp(0, BigNumber.ROUND_DOWN)
    }


    /**
     * Returns BigNumber of the right token balance
     * @returns {BigNumber}
     */
    public get rightBalanceNumber(): BigNumber {
        return new BigNumber(this.rightToken?.balance || 0)
    }

    /**
     * Returns memoized right selected token
     * @returns {TokenCache | undefined}
     */
    public get rightToken(): TokenCache | undefined {
        return this.tokensCache.get(this.data.rightToken)
    }

    /**
     * Returns right token `Address` instance if right token is selected, otherwise returns `undefined`.
     * @returns {Address | undefined}
     * @protected
     */
    protected get rightTokenAddress(): Address | undefined {
        return this.rightToken?.root !== undefined ? new Address(this.rightToken.root) : undefined
    }

    /**
     * Returns memoized right token decimals or global default decimals - 18.
     * @returns {number}
     */
    public get rightTokenDecimals(): number {
        return this.rightToken?.decimals ?? DEFAULT_DECIMALS
    }

    /**
     * Returns formatted balance of the selected left token
     * @returns {string}
     */
    public get formattedLeftBalance(): string {
        return formattedTokenAmount(this.leftToken?.balance, this.leftTokenDecimals)
    }

    /**
     * Returns formatted balance of the selected right token
     * @returns {string}
     */
    public get formattedRightBalance(): string {
        return formattedTokenAmount(this.rightToken?.balance, this.rightTokenDecimals)
    }


    /*
     * Internal and external utilities methods
     * ----------------------------------------------------------------------------------
     */

    /**
     * Prepare information of a selected pair. Check pair address, check TVL value.
     * Sync pair state, balances, base pair data. Finalize calculation for prices.
     */
    protected async prepare(): Promise<void> {
        if (this.data.leftToken === undefined || this.data.rightToken === undefined || this.isPairChecking) {
            return
        }

        this.setState('isPairChecking', true)

        try {
            const address = await checkPair(this.data.leftToken, this.data.rightToken)
            this.setData('pair', address !== undefined ? {
                address,
                contract: new staticRpc.Contract(DexAbi.Pair, address),
            } : undefined)
        }
        catch (e) {
            error('Check pair error', e)
            this.setData('pair', undefined)
        }

        if (this.pair?.address === undefined) {
            this.setState('isPairChecking', false)
            return
        }

        const isPredefinedTokens = this.tokensCache.verifiedBroxusTokens.filter(
            token => [this.data.leftToken, this.data.rightToken].includes(token.root),
        ).length === 2

        if (isPredefinedTokens) {
            try {
                const api = useSwapApi()
                const { tvl } = await api.pair({
                    address: this.pair.address.toString(),
                })
                this.setState('isLowTvl', new BigNumber(tvl || 0).lt(this.options?.minTvlValue ?? 5e4))
                debug('TVL is less than 50k?', this.state.isLowTvl)
            }
            catch (e) {
                error('Check Tvl error', e)
            }
        }

        try {
            await this.syncPairState()

            await Promise.all([
                this.syncPairBalances(),
                this.syncPairData(),
            ])

            await this.finalizeCalculation(SwapDirection.LTR)
        }
        catch (e) {
            error('Sync pair data error', e)
        }

        this.setState('isPairChecking', false)
    }

    /**
     * Calculate bill by the changes in the left amount field.
     * @param {boolean} [force] - pass `true` to calculate in background without loadings
     * @protected
     */
    protected async calculateLeftToRight(force: boolean = false): Promise<void> {
        if (!force && (
            this.isCalculating
            || this.leftToken === undefined
            || this.rightToken === undefined
        )) {
            debug(
                '#calculateByLeftAmount reset before start',
                toJS(this.data),
                toJS(this.state),
            )
            return
        }

        this.setState('isCalculating', true)

        debug(
            'DirectSwap@calculateLeftToRight start',
            toJS(this.data),
            toJS(this.state),
        )

        if (
            this.isEnoughLiquidity
            && isGoodBignumber(this.leftAmountNumber)
            && this.leftTokenAddress !== undefined
            && this.pair?.address !== undefined
            && this.pair?.contract !== undefined
        ) {
            try {
                const {
                    expected_amount: expectedAmount,
                    expected_fee: fee,
                } = await getExpectedExchange(
                    this.pair.contract,
                    this.leftAmountNumber.toFixed() || '0',
                    this.leftTokenAddress,
                    toJS(this.pair.state),
                )

                const expectedAmountBN = new BigNumber(expectedAmount || 0)
                this.setData({
                    bill: {
                        amount: this.leftAmountNumber.toFixed(),
                        expectedAmount: expectedAmountBN.toFixed(),
                        fee,
                        minExpectedAmount: getSlippageMinExpectedAmount(
                            expectedAmountBN,
                            // Note: Use slippage from the data directly instead of using it from memoized property
                            this.data.slippage,
                        ).toFixed(),
                    },
                    rightAmount: isGoodBignumber(expectedAmountBN)
                        ? expectedAmountBN.shiftedBy(-this.rightTokenDecimals).toFixed()
                        : '',
                })
            }
            catch (e) {
                error('Calculate left to right', e)
            }
        }

        this.setState('isCalculating', false)

        await this.finalizeCalculation(SwapDirection.LTR)

        debug(
            'DirectSwap@calculateLeftToRight done',
            toJS(this.data),
            toJS(this.state),
        )
    }

    /**
     * Calculate bill by the changes in the right amount field.
     * @param {boolean} [force] - pass `true` to calculate in background without loadings
     * @protected
     */
    protected async calculateRightToLeft(force?: boolean): Promise<void> {
        if (!force && (
            this.isCalculating
            || this.leftToken === undefined
            || this.rightToken === undefined
        )) {
            debug(
                '#calculateByRightAmount reset before start',
                toJS(this.data),
                toJS(this.state),
            )
            return
        }

        this.setState('isCalculating', true)

        debug(
            'DirectSwap@calculateRightToLeft start',
            toJS(this.data),
            toJS(this.state),
        )

        if (!this.isEnoughLiquidity) {
            this.setData('leftAmount', '')
        }

        if (
            this.isEnoughLiquidity
            && isGoodBignumber(this.rightAmountNumber)
            && this.rightTokenAddress !== undefined
            && this.pair?.address !== undefined
            && this.pair?.contract !== undefined
        ) {
            try {
                const {
                    expected_amount: expectedAmount,
                    expected_fee: fee,
                } = await getExpectedSpendAmount(
                    this.pair.contract,
                    this.rightAmountNumber.toFixed(),
                    this.rightTokenAddress,
                    toJS(this.pair.state),
                )

                const expectedAmountBN = new BigNumber(expectedAmount || 0)

                if (isGoodBignumber(expectedAmountBN)) {
                    this.setData({
                        bill: {
                            amount: expectedAmountBN.toFixed(),
                            expectedAmount: this.rightAmountNumber.toFixed(),
                            fee,
                            minExpectedAmount: getSlippageMinExpectedAmount(
                                this.rightAmountNumber,
                                this.data.slippage,
                            ).toFixed(),
                        },
                        leftAmount: expectedAmountBN.shiftedBy(-this.leftTokenDecimals).toFixed(),
                    })
                }
                else {
                    this.setData({
                        leftAmount: '',
                        rightAmount: '',
                    })
                }
            }
            catch (e) {
                error('Calculate right to left', e)
            }
        }

        this.setState('isCalculating', false)

        await this.finalizeCalculation(SwapDirection.RTL)

        debug(
            'DirectSwap@calculateRightToLeft done',
            toJS(this.data),
            toJS(this.state),
        )
    }

    /**
     * Finalize amount change.
     * Calculate price impact and prices side by side.
     * @protected
     */
    protected async finalizeCalculation(direction?: SwapDirection): Promise<void> {
        if (
            !this.isEnoughLiquidity
            || this.leftTokenAddress === undefined
            || this.rightTokenAddress === undefined
            || this.pair?.address === undefined
        ) {
            this.setData({
                ltrPrice: undefined,
                rtlPrice: undefined,
            })
            return
        }

        const pairLeftBalanceNumber = this.isPairInverted ? this.pairRightBalanceNumber : this.pairLeftBalanceNumber
        const pairRightBalanceNumber = this.isPairInverted ? this.pairLeftBalanceNumber : this.pairRightBalanceNumber

        let ltrPrice = getDefaultPricesRates(
                pairLeftBalanceNumber.shiftedBy(-this.leftTokenDecimals),
                pairRightBalanceNumber.shiftedBy(-this.rightTokenDecimals),
                this.leftTokenDecimals,
            ).toFixed(),
            rtlPrice = getDefaultPricesRates(
                pairRightBalanceNumber.shiftedBy(-this.rightTokenDecimals),
                pairLeftBalanceNumber.shiftedBy(-this.leftTokenDecimals),
                this.rightTokenDecimals,
            ).toFixed()

        const contract = new staticRpc.Contract(DexAbi.StablePair, this.pair.address)
        const isLeftEmpty = direction === SwapDirection.LTR && !isGoodBignumber(this.leftAmount)
        const isRightEmpty = direction === SwapDirection.RTL && !isGoodBignumber(this.rightAmount)

        if ((isLeftEmpty || isRightEmpty) && this.pair.type === PairType.STABLESWAP) {
            try {
                const [ltrExpectedPrice, rtlExpectedPrice] = await Promise.all([
                    (await contract.methods.expectedExchange({
                        amount: new BigNumber(1).shiftedBy(this.leftTokenDecimals).toFixed(),
                        answerId: 0,
                        spent_token_root: this.leftTokenAddress,
                    }).call({ cachedState: toJS(this.pair.state) })).expected_amount,
                    (await contract.methods.expectedExchange({
                        amount: new BigNumber(1).shiftedBy(this.rightTokenDecimals).toFixed(),
                        answerId: 0,
                        spent_token_root: this.rightTokenAddress,
                    }).call({ cachedState: toJS(this.pair.state) })).expected_amount,
                ])

                rtlPrice = new BigNumber(ltrExpectedPrice).shiftedBy(-this.rightTokenDecimals).toFixed()
                ltrPrice = new BigNumber(rtlExpectedPrice).shiftedBy(-this.leftTokenDecimals).toFixed()

                this.setData({ ltrPrice, rtlPrice })

                debug('Virtual prices fetched')
            }
            catch (e) {
                error('Fetch virtual prices error', e)
            }

            return
        }

        if (
            !isGoodBignumber(this.rightAmountNumber)
            || this.amount === undefined
            || this.expectedAmount === undefined
            || this.pair?.contract === undefined
            || this.pair.feeParams?.denominator === undefined
            || this.pair.feeParams?.numerator === undefined
        ) {
            if (isGoodBignumber(ltrPrice)) {
                this.setData('ltrPrice', ltrPrice)
            }

            if (isGoodBignumber(rtlPrice)) {
                this.setData('rtlPrice', rtlPrice)
            }

            debug('Prices calculated')

            return
        }

        let amountNumber = new BigNumber(this.amount || 0)
        const expectedAmountNumber = new BigNumber(this.expectedAmount || 0)

        ltrPrice = getExchangePricesRates(
            amountNumber,
            expectedAmountNumber,
            this.rightTokenDecimals,
        ).shiftedBy(-this.leftTokenDecimals).toFixed()

        rtlPrice = getExchangePricesRates(
            expectedAmountNumber,
            amountNumber,
            this.leftTokenDecimals,
        ).shiftedBy(-this.rightTokenDecimals).toFixed()

        if (this.pair?.type === PairType.STABLESWAP) {
            try {
                const currentValue = (await contract.methods.getPriceImpact({
                    amount: this.amount,
                    // todo do something with this => root is key
                    price_amount: new BigNumber(1).shiftedBy(this.leftTokenDecimals).toFixed(),
                    spent_token_root: this.leftTokenAddress as Address,
                }).call({ cachedState: toJS(this.pair.state) })).value0

                this.setData('bill', {
                    ...this.data.bill,
                    priceImpact: new BigNumber(currentValue ?? 0)
                        .shiftedBy(-18)
                        .dp(2, BigNumber.ROUND_DOWN)
                        .toFixed(),
                })

                debug('Price impact fetched')
            }
            catch (e) {
                error('Fetch price impact error', e)
            }
        }
        else if (
            this.pair?.type === PairType.CONSTANT_PRODUCT
            && this.pair.feeParams?.beneficiaryNumerator !== undefined
            && this.pair.feeParams.denominator !== undefined
            && this.pair.feeParams.numerator !== undefined
        ) {
            amountNumber = amountNumber
                .times(new BigNumber(this.pair.feeParams.denominator).minus(this.pair.feeParams.numerator))
                .div(this.pair.feeParams.denominator)

            const expectedLeftPairBalanceNumber = pairLeftBalanceNumber.plus(
                amountNumber.minus(
                    new BigNumber(this.data.bill?.fee ?? 0)
                        .times(this.data.pair.feeParams.beneficiaryNumerator || 0)
                        .div(
                            new BigNumber(this.pair.feeParams.numerator || 0)
                                .plus(this.pair.feeParams.beneficiaryNumerator || 0),
                        ),
                ),
            )
            const expectedRightPairBalanceNumber = pairRightBalanceNumber.minus(expectedAmountNumber)

            this.setData('bill', {
                ...this.data.bill,
                priceImpact: getDirectExchangePriceImpact(
                    pairRightBalanceNumber.div(pairLeftBalanceNumber),
                    expectedRightPairBalanceNumber.div(expectedLeftPairBalanceNumber),
                ).toFixed(),
            })

            debug('Price impact calculated')
        }

        if (isGoodBignumber(ltrPrice)) {
            this.setData('ltrPrice', ltrPrice)
        }

        if (isGoodBignumber(rtlPrice)) {
            this.setData('rtlPrice', rtlPrice)
        }
    }

    /**
     * Sync and update direct pair token.
     * Fetch pair token roots, denominator and numerator.
     * @returns {Promise<void>}
     * @protected
     */
    protected async syncPairData(): Promise<void> {
        if (this.pair?.contract === undefined) {
            return
        }

        const [
            { left, right },
            {
                denominator,
                pool_numerator: numerator,
                beneficiary_numerator: beneficiaryNumerator,
            },
            type,
        ] = await Promise.all([
            this.pair.contract.methods.getTokenRoots({
                answerId: 0,
            }).call({
                cachedState: toJS(this.pair.state),
            }),
            (await this.pair.contract.methods.getFeeParams({
                answerId: 0,
            }).call({
                cachedState: toJS(this.pair.state),
            })).value0,
            (await this.pair.contract.methods.getPoolType({ answerId: 0 }).call({
                cachedState: toJS(this.pair.state),
            })).value0,
        ])

        this.setData('pair', {
            ...this.pair,
            feeParams: {
                beneficiaryNumerator,
                denominator,
                numerator,
            },
            roots: { left, right },
            type,
        })
    }

    /**
     * Sync and update direct pair token left and right balances.
     * @protected
     */
    protected async syncPairBalances(): Promise<void> {
        if (this.pair?.contract === undefined) {
            return
        }

        try {
            const {
                left_balance: left,
                right_balance: right,
            } = (await this.pair.contract.methods.getBalances({ answerId: 0 }).call({
                cachedState: toJS(this.pair.state),
            })).value0

            this.setData('pair', {
                ...this.pair,
                balances: { left, right },
            })
        }
        catch (e) {
            error('Sync pai balances error', e)
        }
    }

    /**
     * Sync and update direct pair token full contract state.
     * @protected
     */
    public async syncPairState(): Promise<void> {
        if (this.pair?.address === undefined) {
            return
        }

        const { state } = await staticRpc.getFullContractState({
            address: this.pair.address,
        })

        this.setData('pair', { ...this.pair, state })
    }

}
