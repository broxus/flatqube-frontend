import BigNumber from 'bignumber.js'
import {
    Address, Contract, LT_COLLATOR,
} from 'everscale-inpage-provider'
import {
    action,
    computed,
    IReactionDisposer,
    makeObservable,
    override,
    reaction,
} from 'mobx'
import { DateTime } from 'luxon'

import { backPK, LimitOrderFactoryRoot } from '@/config'
import {
    CurrencyPrices,
    P2PFormOptions,
    P2PFormStoreData,
    P2PFormStoreState,
    Side,
} from '@/modules/LimitOrders/types'
import { SwapDirection } from '@/modules/Swap/types'
import {
    createTransactionSubscriber, unsubscribeTransactionSubscriber,
} from '@/modules/LimitOrders/utils'
import { WalletService } from '@/stores/WalletService'
import { TokensCacheService } from '@/stores/TokensCacheService'
import {
    debug,
    error,
    formattedBalance,
    getSafeProcessingId,
    isGoodBignumber,
    storage,
} from '@/utils'
import { OrderAbi } from '@/misc/abi/order.abi'
import { TokenAbi } from '@/misc'
import { LimitOrderApi, useP2pApi } from '@/modules/LimitOrders/hooks/useApi'
import { useRpc, useStaticRpc } from '@/hooks'
import { useCurrenciesApi } from '@/modules/Currencies/hooks/useApi'
import { P2PBaseStore } from '@/modules/LimitOrders/stores/P2PBaseStore'

const staticRpc = useStaticRpc()
const rpc = useRpc()

const roundAmount = (val: string | number, decimals?: number): string => new BigNumber(val)
    .dp(decimals ?? 0).toFixed()

export class P2PFormStore extends P2PBaseStore<P2PFormStoreData, P2PFormStoreState> {

    protected readonly p2pApi: LimitOrderApi = useP2pApi()

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly options: P2PFormOptions,
    ) {
        super(tokensCache)

        makeObservable<
            P2PFormStore,
            | 'handleChangeTokens'
            | 'handleTokensCacheReady'
            | 'handleWalletAccountChange'
            | 'makeLimitOrder'
            | 'getLimitOrderRoot'
            | 'toggleRateDirection'
            | 'maximizeLeftAmount'
        >(this, {
            changeLeftAmount: action.bound,
            defaultLeftTokenRoot: computed,
            defaultRightTokenRoot: computed,
            fetchCurrencies: action.bound,
            formattedLeftBalance: override,
            formattedRightBalance: override,
            getLimitOrderRoot: action.bound,
            handleChangeTokens: action.bound,
            handleTokensCacheReady: action.bound,
            handleWalletAccountChange: action.bound,
            hasCustomToken: computed,
            isBusy: computed,
            isChangingTokens: computed,
            isConfirmationAwait: computed,
            isCreateConfirmationAwait: computed,
            isCurrencyAvailable: computed,
            isDeployConfirmationAwait: computed,
            isFetching: computed,
            isInitialized: computed,
            isLimitOrderCreating: computed,
            isLimitOrderRootDeployed: computed,
            isLimitOrderRootDeploying: computed,
            isLimitOrderRootLoading: computed,
            isLoading: computed,
            isPreparing: computed,
            isRightAmountLteTotalSupply: computed,
            isShowChartModal: computed,

            isValidTokens: computed,
            lastAmountChangeSide: computed,
            lastUpdate: computed,
            leftBalanceNumber: override,

            ltrMarketPrice: computed,
            makeLimitOrder: action.bound,
            maximizeLeftAmount: action.bound,

            priceLock: computed,
            rateDirection: computed,
            rtlMarketPrice: computed,
            rtlPrice: override,
            toggleDirection: action.bound,
            toggleRateDirection: action.bound,
        })

        this.setData(() => ({
            leftAmount: '',
            limitOrderRoot: undefined,
            rightAmount: '',
        }))
        this.setState(() => ({
            isPreparing: false,
            lastAmountChangeSide: Side.LEFT,
            rateDirection: SwapDirection.LTR,
        }))
    }

    /**
     * Manually initiate store.
     * Run all necessary subscribers.
     */
    public async init(): Promise<void> {
        debug('debug +++ init this.data P2PFormStore', this.data)
        this.tokensCacheDisposer?.()
        this.tokensCacheDisposer = reaction(
            () => this.tokensCache.isReady,
            this.handleTokensCacheReady,
            { fireImmediately: true },
        )
        this.fetchCurrencies()
    }

    /**
     * Manually toggle exchange direction.
     * Revert amounts and tokens.
     */
    public async toggleDirection(): Promise<void> {
        if (this.isProcessing) {
            return
        }

        this.setData({
            currencyPrices: {
                leftPrice: this.data.currencyPrices.rightPrice,
                ltrMarketPrice: this.data.currencyPrices.rtlMarketPrice,
                rightPrice: this.data.currencyPrices.leftPrice,
                rtlMarketPrice: this.data.currencyPrices.ltrMarketPrice,
            },
            leftAmount: this.data.rightAmount,
            leftToken: this.data.rightToken,
            ltrPrice: this.data.rtlPrice,
            rightAmount: this.data.leftAmount,
            rightToken: this.data.leftToken,
            rtlPrice: this.data.ltrPrice,
        })
        this.setState(
            'lastAmountChangeSide',
            this.lastAmountChangeSide === Side.LEFT ? Side.RIGHT : Side.LEFT,
        )
        this.getLimitOrderRoot()
    }

    /**
     * Use this method to change left amount value instead of direct change value via `setData`
     * @param {string} value
     */
    public async changeLeftAmount(value: string): Promise<void> {
        storage.remove('amounts')
        this.setData('leftAmount', value)
        this.setState('lastAmountChangeSide', Side.LEFT)
        if (value === '') {
            this.setData('rightAmount', value)
            return
        }
        if (value
            && (this.priceLock || this.priceLock === undefined)
        ) {
            if (this.rateDirection === SwapDirection.LTR && this.ltrPrice) {
                this.setData('rightAmount', new BigNumber(this?.ltrPrice).eq(0)
                    ? '0'
                    : roundAmount(
                        new BigNumber(value).dividedBy(this.ltrPrice).toFixed(),
                        this.rightToken?.decimals,
                    ))
            }
            else if (this.rateDirection === SwapDirection.RTL && this.rtlPrice) {
                this.setData('rightAmount', roundAmount(
                    new BigNumber(value).multipliedBy(this.rtlPrice).toFixed(),
                    this.rightToken?.decimals,
                ))
            }
        }
        else if (value && !!this.rightAmount && +this.leftAmount !== 0) {
            const ltrPrice = new BigNumber(value)
                .dividedBy(this.rightAmount)
                .dp(this.leftToken?.decimals ?? 0)
                .toFixed()
            const rtlPrice = new BigNumber(this.rightAmount)
                .dividedBy(value)
                .dp(this.rightToken?.decimals ?? 0)
                .toFixed()
            this.setData({
                ltrPrice,
                rtlPrice,
            })
        }
    }

    /**
     * Use this method to change right amount value instead of direct change value via `setData`
     * @param {string} value
     */
    public async changeRightAmount(value: string): Promise<void> {
        storage.remove('amounts')
        this.setData('rightAmount', value)
        this.setState('lastAmountChangeSide', Side.RIGHT)
        if (value === '') {
            this.setData('leftAmount', value)
            return
        }
        if (value
            && (this.priceLock || this.priceLock === undefined)
        ) {
            if (this.rateDirection === SwapDirection.LTR && this.ltrPrice) {
                this.setData('leftAmount', roundAmount(
                    new BigNumber(value).multipliedBy(this.ltrPrice).toFixed(),
                    this.leftToken?.decimals,
                ))
            }
            else if (this.rateDirection === SwapDirection.RTL && this.rtlPrice) {
                this.setData('leftAmount', new BigNumber(this?.rtlPrice).eq(0)
                    ? '0'
                    : roundAmount(
                        new BigNumber(value).dividedBy(this.rtlPrice).toFixed(),
                        this.leftToken?.decimals,
                    ))
            }
        }
        else if (value && !!this.leftAmount && +this.rightAmount !== 0) {
            const ltrPrice = new BigNumber(this.leftAmount)
                .dp(this.leftToken?.decimals ?? 0)
                .dividedBy(value)
                .toFixed()
            const rtlPrice = new BigNumber(value)
                .dividedBy(this.leftAmount)
                .dp(this.rightToken?.decimals ?? 0)
                .toFixed()
            this.setData({
                ltrPrice,
                rtlPrice,
            })
        }
    }

    /**
     *
     */
    public toggleRateDirection(): void {
        this.setState('rateDirection', this.state.rateDirection === SwapDirection.LTR
            ? SwapDirection.RTL
            : SwapDirection.LTR)
    }

    /**
     *
     */
    public togglePriceLock(): void {
        if (this.ltrPrice
            && this.rtlPrice
            && this.ltrPrice !== '0'
            && this.rtlPrice !== '0'
        ) {
            this.setState('priceLock', this.priceLock === undefined ? false : !this.priceLock)
        }
        else {
            this.setState('priceLock', false)
        }
    }

    /**
     * 
     */
    public get ltrMarketPrice(): string | undefined {
        return this.data.currencyPrices?.ltrMarketPrice
    }

    /**
     * 
     */
    public get rtlMarketPrice(): string | undefined {
        return this.data.currencyPrices?.rtlMarketPrice
    }

    /**
     * 
     */
    public get rateDirection(): P2PFormStoreState['rateDirection'] {
        return this.state.rateDirection
    }

    /**
     * 
     */
    public get priceLock(): P2PFormStoreState['priceLock'] {
        return this.state.priceLock
    }

    /*
     * Chart state
     * ----------------------------------------------------------------------------------
     */

    public async fetchCurrencies(force?: boolean): Promise<void> {
        if (!force && this.isFetching) {
            return
        }
        if (!this?.leftToken?.root || !this?.rightToken?.root) return

        try {
            this.setState('isFetching', true)
            const currenciesApi = useCurrenciesApi()
            const response = await currenciesApi.currencies({}, {}, {
                currencyAddresses: [this.leftToken?.root, this.rightToken?.root],
                limit: 2,
                offset: 0,
            })
            const left = response.currencies.find(curr => curr.address === this.leftToken?.root)
            const right = response.currencies.find(curr => curr.address === this.rightToken?.root)
            if (left && right) {
                const currencyPrices: CurrencyPrices = {
                    leftPrice: left ? new BigNumber(left.price) : undefined,
                    rightPrice: right ? new BigNumber(right.price) : undefined,
                }
                if (currencyPrices.leftPrice && currencyPrices.rightPrice) {
                    currencyPrices.ltrMarketPrice = currencyPrices.rightPrice
                        .dividedBy(currencyPrices.leftPrice)
                        .dp(this.leftToken.decimals)
                        .toFixed()
                    currencyPrices.rtlMarketPrice = currencyPrices.leftPrice
                        .dividedBy(currencyPrices.rightPrice)
                        .dp(this.rightToken.decimals)
                        .toFixed()
                    this.setData({
                        ltrPrice: currencyPrices.ltrMarketPrice,
                        rtlPrice: currencyPrices.rtlMarketPrice,
                    })
                }
                this.setData(state => ({
                    ...state,
                    currencyPrices,
                }))
                if (this.priceLock === undefined) this.setState('priceLock', true)
            }
            else {
                this.setState('priceLock', false)
                this.setData('currencyPrices', {})
            }
        }
        catch (e) { error(e) }
        finally {
            this.setState('isFetching', false)
        }
    }

    /**
     *
     */
    public async changePriceAmount(price: string): Promise<void> {
        if (price === '') {
            this.setState('priceLock', false)
            this.setData({
                ltrPrice: '',
                rtlPrice: '',
            })
            return
        }
        const data = {
            leftAmount: this.leftAmount,
            rightAmount: this.rightAmount,
        } as {
            ltrPrice?: string;
            rtlPrice?: string;
            leftAmount: string;
            rightAmount: string;
        }
        const priceBN = new BigNumber(price)
        const invertedPriceBN = priceBN.eq(0)
            ? price
            : new BigNumber(1).dividedBy(priceBN).toFixed()
        if (this.rateDirection === SwapDirection.LTR) {
            data.ltrPrice = price
            data.rtlPrice = invertedPriceBN
        }
        else {
            data.ltrPrice = invertedPriceBN
            data.rtlPrice = price
        }
        if (this.lastAmountChangeSide === Side.LEFT && this.leftAmount) {
            if (this.rateDirection === SwapDirection.LTR && data.ltrPrice) {
                data.rightAmount = new BigNumber(data?.ltrPrice).eq(0)
                    ? data?.ltrPrice
                    : roundAmount(
                        new BigNumber(this.leftAmount).dividedBy(data.ltrPrice).toFixed(),
                        this.rightToken?.decimals,
                    )
            }
            else if (this.rateDirection === SwapDirection.RTL && data.rtlPrice) {
                data.rightAmount = roundAmount(
                    new BigNumber(this.leftAmount).multipliedBy(data.rtlPrice).toFixed(),
                    this.rightToken?.decimals,
                )
            }
        }
        else if (this.lastAmountChangeSide === Side.RIGHT && this.rightAmount) {
            if (this.rateDirection === SwapDirection.LTR && data.ltrPrice) {
                data.leftAmount = roundAmount(
                    new BigNumber(this.rightAmount).multipliedBy(data.ltrPrice).toFixed(),
                    this.leftToken?.decimals,
                )
            }
            else if (this.rateDirection === SwapDirection.RTL && data?.rtlPrice) {
                data.leftAmount = new BigNumber(data?.rtlPrice).eq(0)
                    ? data?.rtlPrice
                    : roundAmount(
                        new BigNumber(this.leftAmount).dividedBy(data.rtlPrice).toFixed(),
                        this.leftToken?.decimals,
                    )
            }
        }
        this.setData({ ...data })

    }

    /**
     */
    public get isCurrencyAvailable(): boolean {
        return !!this.data.currencyPrices?.leftPrice && !!this.data.currencyPrices?.rightPrice
    }

    /**
     * Returns `true` if right amount value is valid, and lower then Total Supply of right token.
     * @returns {boolean}
     */
    public get isRightAmountLteTotalSupply(): boolean {
        if (this.rightAmount.length === 0) {
            return true
        }
        if (!(this.rightAmount.length > 0) || !isGoodBignumber(this.rightAmountNumber)) return false
        const totalSupply = this.rightToken?.totalSupply
            ? new BigNumber(this.rightToken?.totalSupply).shiftedBy(-this.rightToken.decimals ?? 0)
            : undefined
        if (!totalSupply) return true
        return new BigNumber(this.rightAmount).lte(totalSupply)
    }

    /**
     *
     */
    public get isLimitOrderCreating(): P2PFormStoreState['isLimitOrderCreating'] {
        return this.state.isLimitOrderCreating
    }

    /**
     *
     */
    public get lastUpdate(): P2PFormStoreState['lastUpdate'] {
        return this.state.lastUpdate
    }

    /**
     *
     */
    public get isLimitOrderRootLoading(): P2PFormStoreState['isLimitOrderRootLoading'] {
        return this.state.isLimitOrderRootLoading
    }

    /**
     *
     */
    public get isLimitOrderRootDeployed(): P2PFormStoreState['isLimitOrderRootDeployed'] {
        return this.state.isLimitOrderRootDeployed
    }

    /**
     *
     */
    public get isLimitOrderRootDeploying(): P2PFormStoreState['isLimitOrderRootDeploying'] {
        return this.state.isLimitOrderRootDeploying
    }

    /**
     *
     */
    public get hasCustomToken(): boolean {
        if (
            !this.tokensCache.isReady
            || this.data.leftToken === undefined
            || this.data.rightToken === undefined
        ) {
            return false
        }
        debug(
            '+++hasCustomToken',
            this.data.leftToken,
            this.tokensCache.isCustomToken(this.data.leftToken),
            this.data.rightToken,
            this.tokensCache.isCustomToken(this.data.rightToken),
        )
        return this.tokensCache.isCustomToken(this.data.leftToken)
            || this.tokensCache.isCustomToken(this.data.rightToken)
    }

    /**
     *
     */
    public async makeLimitOrder(): Promise<void> {
        if (
            this.isLimitOrderCreating
            || !this.wallet.address
            || !this.leftToken
            || !this.rightToken
            || !this.data.limitOrderRoot
        ) {
            return
        }
        const callId = getSafeProcessingId()
        debug('callId, limitOrderRoot', callId, this.data.limitOrderRoot)

        await unsubscribeTransactionSubscriber(callId)
        const subscriber = createTransactionSubscriber(callId)

        this.setState('isLimitOrderCreating', true)
        this.options.onTransactionWait({ callId })

        try {
            const startLt = this.wallet.contract?.lastTransactionId?.lt
            const stream = await subscriber
                .transactions(this.wallet.account!.address)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || LT_COLLATOR.compare(tx.id.lt, startLt) > 0)
                .filterMap(async transaction => {
                    debug('before decodedTx', transaction)
                    const decodedTx = await this.orderContractCallbacks?.decodeTransaction({
                        methods: ['onOrderCreateOrderSuccess', 'onOrderCreateOrderReject'],
                        transaction,
                    })
                    debug('decodedTx', decodedTx)
                    if (decodedTx?.method === 'onOrderCreateOrderReject' && decodedTx.input.id.toString() === callId) {
                        this.setState('isLimitOrderCreating', false)
                        // this.options?.onTransactionEnded?.({ callId })
                        this.options?.onOrderCreateOrderReject?.({ callId, input: decodedTx.input })
                        debug('decodedTx onOrderCreateOrderReject', decodedTx)
                        return { input: decodedTx.input }
                    }

                    if (decodedTx?.method === 'onOrderCreateOrderSuccess' && decodedTx.input.id.toString() === callId) {
                        this.setState('isLimitOrderCreating', false)
                        // this.options?.onTransactionEnded?.({ callId })
                        this.options?.onOrderCreateOrderSuccess?.({ callId, input: decodedTx.input, transaction })
                        debug('decodedTx onOrderCreateOrderSuccess', decodedTx)
                        return { input: decodedTx.input, transaction }
                    }

                    return undefined
                })
                .delayed(s => s.first())
            debug('+++ 2 after stream')

            const sellAmountBN = new BigNumber(this.leftAmount)
                .shiftedBy(this.leftToken.decimals)
                .decimalPlaces(0)
            const buyAmountBN = new BigNumber(this.rightAmount)
                .shiftedBy(this.rightToken.decimals)
                .decimalPlaces(0)
            const buildPayloadArg = {
                backMatchingPK: backPK,
                backPK,
                callbackId: callId,
                cancelPayload: null,
                expectedTokenAmount: buyAmountBN.toFixed(),
                tokenReceive: new Address(this.rightToken.root),
                user: this.wallet.account!.address,
            }

            debug('+++ 3 before Promise.all')

            const payload = await new staticRpc.Contract(OrderAbi.Root, this.data.limitOrderRoot)
                .methods.buildPayload(buildPayloadArg).call({})
            debug('+++ 3 between Promise.all')
            const remainingGasTo = (await new staticRpc.Contract(TokenAbi.Root, new Address(this.leftToken.root))
                .methods.walletOf({
                    answerId: 0,
                    walletOwner: new Address(this.wallet.address),
                }).call({})).value0
            debug('+++ 4 makeLimitOrder payload, walletOf', payload, remainingGasTo, this.rightToken.root)


            const message = await new rpc.Contract(TokenAbi.Wallet, remainingGasTo)
                .methods.transfer({
                    amount: sellAmountBN.toFixed(),
                    deployWalletValue: '500000000',
                    notify: true,
                    payload: payload.value0,
                    recipient: this.data.limitOrderRoot,
                    remainingGasTo,

                }).sendDelayed({
                    amount: '6000000000',
                    bounce: true,
                    from: new Address(this.wallet.address),
                })
            debug('+++ 5 makeLimitOrder message', message)

            await message.transaction

            await stream()

            await subscriber.unsubscribe()
            debug('+++ 6 makeLimitOrder finished')
            this.setState('lastUpdate', DateTime.now())
            this.resetAmount()
        }
        catch (reason: any) {
            if (reason?.code !== 3) {
                error('Limit order creation failure', reason)
                this.options?.onOrderCreateOrderReject({ callId, reason })
            }
        }
        finally {
            this.options?.onTransactionEnded?.({ callId })
            this.setState('isLimitOrderCreating', false)
            await unsubscribeTransactionSubscriber(callId)
        }
    }

    /**
     *
     */
    public async getLimitOrderRoot(): Promise<void> {
        debug('+++ getLimitOrderRoot')
        if (this.isLimitOrderRootLoading || !this?.leftToken?.root) {
            return
        }
        this.setState('isLimitOrderRootLoading', true)
        try {
            const limitOrderRoot = (await new staticRpc.Contract(OrderAbi.Factory, LimitOrderFactoryRoot)
                .methods.getExpectedAddressOrderRoot({
                    answerId: 0,
                    token: new Address(this.leftToken.root),
                }).call({}))?.value0
            const fullContractState = (await staticRpc.getFullContractState({ address: limitOrderRoot }))?.state
            if (fullContractState) {
                this.setState('isLimitOrderRootDeployed', true)
                this.setData('limitOrderRoot', limitOrderRoot)
            }
            else {
                this.setState('isLimitOrderRootDeployed', false)
                this.setData('limitOrderRoot', undefined)
            }

        }
        catch (reason) {
            error('+++ getLimitOrderRoot', reason)
            this.setState('isLimitOrderRootDeployed', false)
        }
        finally {
            this.setState('isLimitOrderRootLoading', false)
        }
    }

    /**
     *
     */
    public async deployLimitOrderRoot(): Promise<void> {
        if (this.isLimitOrderRootDeploying || !this?.leftToken?.root || !this.wallet.address) {
            return
        }

        const callId = getSafeProcessingId()
        debug('callId', callId)
        await unsubscribeTransactionSubscriber(callId)
        const subscriber = createTransactionSubscriber(callId)

        this.setState('isLimitOrderRootDeploying', true)
        this.options.onTransactionWait({ callId })
        try {
            const startLt = this.wallet.contract?.lastTransactionId?.lt
            debug('+++ startLt', startLt)
            const stream = await subscriber
                .transactions(this.wallet.account!.address)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || LT_COLLATOR.compare(tx.id.lt, startLt) > 0)
                .filterMap(async transaction => {
                    const decodedTx = await this.orderContractCallbacks?.decodeTransaction({
                        methods: ['onOrderRootCreateSuccess', 'onOrderRootCreateReject'],
                        transaction,
                    })
                    debug(
                        'decodedTx %ctransaction',
                        'color:red;font-family:system-ui;font-size:1rem;font-weight:bold',
                        decodedTx,
                        transaction,
                    )

                    if (decodedTx?.method === 'onOrderRootCreateReject' && decodedTx.input.id.toString() === callId) {
                        this.setState('isLimitOrderRootDeploying', false)
                        // this.options?.onTransactionEnded?.({ callId })
                        this.options?.onOrderRootCreateReject?.({ callId })
                        debug('decodedTx onOrderRootCreateReject', decodedTx)
                        return { input: decodedTx.input, transaction }
                    }

                    if (decodedTx?.method === 'onOrderRootCreateSuccess' && decodedTx.input.id.toString() === callId) {
                        this.setState('isLimitOrderRootDeploying', false)
                        // this.options?.onTransactionEnded?.({ callId })
                        this.options?.onOrderRootCreateSuccess?.({ callId, input: decodedTx.input, transaction })
                        debug('decodedTx onOrderCreateOrderSuccess', decodedTx)
                        return { input: decodedTx.input, transaction }
                    }

                    return undefined
                })
                .delayed(s => s.first())


            const message = await new rpc.Contract(OrderAbi.Factory, LimitOrderFactoryRoot)
                .methods.createOrderRoot({
                    callbackId: callId,
                    token: new Address(this.leftToken.root),
                }).sendDelayed({
                    amount: '5000000000',
                    from: new Address(this.wallet.address),
                })

            debug('await message.transaction')
            await message.transaction

            debug('await stream')
            await stream()
            debug('finish stream')

            await subscriber.unsubscribe()

            this.getLimitOrderRoot()
        }
        catch (reason: any) {
            this.setState('isLimitOrderRootDeploying', false)
            debug('Deploying order root failure', reason)
            if (reason?.code !== 3) {
                error('Deploying order root failure', reason)
                this.options.onOrderRootCreateReject?.({ callId })
            }
        }
        finally {
            this.options?.onTransactionEnded?.({ callId })
            this.setState('isLimitOrderRootDeploying', false)
            await unsubscribeTransactionSubscriber(callId)
        }
    }

    /**
     *
     */
    public async getWalletOf(tokenRoot: Address): Promise<Address | undefined> {
        if (!this.wallet.address) {
            return undefined
        }
        return (await new staticRpc.Contract(TokenAbi.Root, tokenRoot)
            .methods.walletOf({
                answerId: 0,
                walletOwner: new Address(this.wallet.address),
            }).call({})).value0
    }

    /*
     * Public actions. Useful in UI
     * ----------------------------------------------------------------------------------
     */

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
     * Full reset P2P
     * instances to their default.
     * @protected
     */
    protected reset(): void {
        this.setData({
            leftAmount: '',
            rightAmount: '',
        })
    }

    /**
     * Reset amount
     * instances to their default.
     * @protected
     */
    protected resetAmount(): void {
        this.changeLeftAmount('')
        this.changeRightAmount('')
    }

    /**
     * Maximizing the value of the left field depending on the form mode
     */
    public maximizeLeftAmount(): void {
        let balance = this?.leftBalanceNumber.shiftedBy(-this.leftTokenDecimals)
        if (!isGoodBignumber(balance)) {
            balance = new BigNumber(0)
        }
        this.changeLeftAmount(
            balance.toFixed(),
        )
    }

    /*
     * Memoized store data and state values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns memoized swap confirmation await state value
     * @returns {P2PFormStoreState['isCreateConfirmationAwait']}
     */
    public get isCreateConfirmationAwait(): P2PFormStoreState['isCreateConfirmationAwait'] {
        return this.state.isCreateConfirmationAwait
    }

    /**
     * Returns memoized state of changing tokens
     * @returns {P2PFormStoreState['isChangingTokens']}
     */
    public get isChangingTokens(): P2PFormStoreState['isChangingTokens'] {
        return this.state.isChangingTokens
    }

    /**
     * Returns memoized any confirmation await state value
     */
    public get isConfirmationAwait(): boolean {
        return this.state.isCreateConfirmationAwait
            || this.state.isDeployConfirmationAwait
    }

    /**
     * Returns memoized swap confirmation await state value
     * @returns {P2PFormStoreState['isDeployConfirmationAwait']}
     */
    public get isDeployConfirmationAwait(): P2PFormStoreState['isDeployConfirmationAwait'] {
        return this.state.isDeployConfirmationAwait
    }

    /**
     * Returns memoized preparing state value
     * @returns {P2PFormStoreState['isPreparing']}
     */
    public get isPreparing(): P2PFormStoreState['isPreparing'] {
        return this.state.isPreparing
    }


    public get isFetching(): P2PFormStoreState['isFetching'] {
        return this.state.isFetching
    }

    /*
     * Computed values
     * ----------------------------------------------------------------------------------
     */

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
     * Returns combined `isLoading` state from direct swap, cross-pair swap.
     * @returns {boolean}
     */
    public get isLoading(): boolean {
        return this.tokensCache.isFetching
    }

    /**
     * Returns combined `isLoading` state from direct swap, cross-pair swap.
     * @returns {boolean}
     */
    public get lastAmountChangeSide(): Side | undefined {
        return this.state.lastAmountChangeSide
    }

    public get isInitialized(): boolean {
        return this.state.isInitialized
    }

    /**
     * Returns combined `isBusy` state 
     * @returns {boolean}
     */
    public get isBusy(): boolean {
        return this.isPreparing
            || this.isLoading
            || !this.tokensCache.isReady
            || this.isLimitOrderCreating
            || this.isLimitOrderRootDeploying
    }

    /**
     * Returns combined `isValidTokens` state 
     * @returns {boolean}
     */
    public get isValidTokens(): boolean {
        return this.state.isValidTokens
    }

    /**
     * Returns combined `isValidTokens` state 
     * @returns {boolean}
     */
    public get isShowChartModal(): boolean {
        return this.state.isShowChartModal
    }

    /**
     *
     */
    public get formattedLeftBalance(): string {
        return formattedBalance(this.leftToken?.balance, this.leftTokenDecimals)
    }

    /**
     *
     */
    public get formattedRightBalance(): string {
        return formattedBalance(this.rightToken?.balance, this.rightTokenDecimals)
    }

    /*
     * Internal and external utilities methods
     * ----------------------------------------------------------------------------------
     */

    /**
     * Invalidate partial data of the internal stores
     */
    public forceInvalidate(): void {
        debug('+++ forceInvalidate')
        this.reset()
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
        if (!this.tokensCache.isReady) {
            return
        }
        await Promise.all([
            (prevLeftToken !== undefined && ![leftToken, rightToken].includes(prevLeftToken))
                ? this.tokensCache.unwatch(prevLeftToken, 'p2p-form')
                : undefined,
            (prevRightToken !== undefined && ![leftToken, rightToken].includes(prevRightToken))
                ? this.tokensCache.unwatch(prevRightToken, 'p2p-form')
                : undefined,
        ])
        debug('handleChangeTokens loadLimitOrderList')
        this.setState('lastUpdate', DateTime.now())
        if (this.wallet?.address !== undefined) {

            await Promise.all([
                (leftToken !== undefined && ![prevLeftToken, prevRightToken, rightToken].includes(leftToken))
                    ? this.tokensCache.watch(this.leftToken?.root, 'p2p-form')
                    : undefined,
                (rightToken !== undefined && ![prevLeftToken, prevRightToken, leftToken].includes(rightToken))
                    ? this.tokensCache.watch(this.rightToken?.root, 'p2p-form')
                    : undefined,
            ])
            await this.getLimitOrderRoot()
            await this.fetchCurrencies()
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
        this.setState('isPreparing', this.wallet.isInitializing || this.wallet.isConnecting)
        this.setState('isValidTokens', this.leftToken !== undefined && this.rightToken !== undefined)
        this.setState('isInitialized', true)
        if (this.data.leftToken !== undefined && this.data.rightToken !== undefined) {
            this.walletAccountDisposer?.()
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
        else if (this.data.leftToken === undefined && this.data.rightToken === undefined) {
            this.setData({
                leftToken: this.options.defaultLeftTokenAddress?.toString(),
                rightToken: this.options.defaultRightTokenAddress?.toString(),
            })

            this.walletAccountDisposer?.()
            this.walletAccountDisposer = reaction(
                () => this.wallet.account?.address,
                this.handleWalletAccountChange,
                {
                    delay: 50,
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
        this.setState('lastUpdate', DateTime.now())
        if (address === undefined) {
            this.tokensCache.tokens.forEach(token => {
                this.tokensCache.update(token.root, 'balance', undefined)
                this.tokensCache.update(token.root, 'wallet', undefined)
            })
            return
        }
        this.setState('isPreparing', this.tokensCache.isFetching)
        this.getLimitOrderRoot()
        await Promise.all([
            this.leftToken?.root && this.tokensCache.syncToken(this.leftToken.root, true),
            this.rightToken?.root && this.tokensCache.syncToken(this.rightToken.root, true),
        ])
        await Promise.all([
            this.leftToken?.root && this.tokensCache.watch(this.leftToken.root, 'p2p-form'),
            this.rightToken?.root && this.tokensCache.watch(this.rightToken.root, 'p2p-form'),
        ])
    }


    /*
     * Internal swap processing results handlers
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns computed Order Callbacks ABI Contract.
     * @returns {Contract<typeof OrderCallbacks.Callbacks> | undefined}
     */
    public get orderContractCallbacks(): Contract<typeof OrderAbi.Callbacks> | undefined {
        return this.wallet.address
            ? new staticRpc.Contract(OrderAbi.Callbacks, new Address(this.wallet.address))
            : undefined
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
