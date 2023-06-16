import BigNumber from 'bignumber.js'
import {
    Address, Contract, DelayedMessageExecution, LT_COLLATOR,
} from 'everscale-inpage-provider'
import {
    action,
    computed,
    IReactionDisposer,
    makeObservable,
    ObservableMap,
    override,
    reaction,
} from 'mobx'

import { backPK, LimitOrderFactoryRoot } from '@/config'
import {
    DEFAULT_LIMIT_ORDERS_FILTERS,
    DEFAULT_LIMIT_ORDERS_LIST,
    DEFAULT_LIMIT_ORDER_LIST_LOADING,
} from '@/modules/LimitOrders/constants'
import {
    DEFAULT_SLIPPAGE_VALUE,
    RECEIPTS,
} from '@/modules/Swap/constants'
import { BaseSwapStore } from '@/modules/Swap/stores/BaseSwapStore'
import {
    BuySellSwitch,
    CurrencyPrices,
    LimitOrderExchange,
    LimitOrderItem,
    LimitOrderRequest,
    LimitOrdersFilter,
    LimitOrdersPaginationResponse,
    LimitOrdersSort,
    OrderViewMode,
    P2PCtorOptions,
    P2PStoreData,
    P2PStoreState,
    Side,
    SortOrder,
} from '@/modules/LimitOrders/types'
import { SwapDirection } from '@/modules/Swap/types'
import {
    convertOrderViewFilterToStates, createTransactionSubscriber, unsubscribeTransactionSubscriber,
} from '@/modules/LimitOrders/utils'
import { WalletService } from '@/stores/WalletService'
import { TokensCacheService } from '@/stores/TokensCacheService'
import {
    debug,
    error,
    // formattedAmount,
    formattedBalance,
    getSafeProcessingId,
    isGoodBignumber,
    storage,
} from '@/utils'
import { OrderAbi } from '@/misc/abi/order.abi'
import { SendMessageCallbackParams, Token, TokenAbi } from '@/misc'
import { LimitOrderApi, useP2pApi } from '@/modules/LimitOrders/hooks/useApi'
import { useRpc, useStaticRpc } from '@/hooks'
import { useCurrenciesApi } from '@/modules/Currencies/hooks/useApi'

const staticRpc = useStaticRpc()
const rpc = useRpc()

const roundAmount = (val: string | number, decimals?: number): string => new BigNumber(val)
    .dp(decimals ?? 0).toFixed()
export class P2PStore extends BaseSwapStore<P2PStoreData, P2PStoreState> {

    protected readonly p2pApi: LimitOrderApi = useP2pApi()

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly options: P2PCtorOptions,
    ) {
        super(tokensCache)

        makeObservable<
            P2PStore,
            | 'handleChangeTokens'
            | 'handleFormChanges'
            | 'handleSend'
            | 'handleTokensCacheReady'
            | 'handleWalletAccountChange'
            | 'makeLimitOrder'
            | 'getLimitOrderRoot'
            | 'setLimitOrdersFilter'
            | 'toggleRateDirection'
            | 'maximizeLeftAmount'
        >(this, {
            changeLimitOrderListData: action.bound,
            changeLimitOrderListLoadingState: action.bound,
            // changeTokens: action.bound,
            coinSide: computed,
            defaultLeftTokenRoot: computed,
            defaultRightTokenRoot: computed,
            fetchCurrencies: action.bound,
            formattedLeftBalance: override,
            formattedRightBalance: override,
            getLimitOrderRoot: action.bound,
            handleChangeTokens: action.bound,
            handleFormChanges: action.bound,
            handleSend: action.bound,
            handleTokensCacheReady: action.bound,
            handleWalletAccountChange: action.bound,
            isBusy: computed,
            isCancelConfirmationAwait: computed,
            isChangingTokens: computed,
            isCloseConfirmationAwait: computed,
            isConfirmationAwait: computed,
            isCreateConfirmationAwait: computed,
            isCurrencyAvailable: computed,
            isDeployConfirmationAwait: computed,
            isFetching: computed,
            isLimitOrderCanceling: computed,
            isLimitOrderClosing: computed,
            isLimitOrderCreating: computed,
            isLimitOrderListLoading: computed,
            isLimitOrderRootDeployed: computed,
            isLimitOrderRootDeploying: computed,
            isLimitOrderRootLoading: computed,
            isLoading: computed,

            isPreparing: computed,
            isRightAmountLteTotalSupply: computed,

            isValidTokens: computed,
            lastAmountChangeSide: computed,
            leftBalanceNumber: override,
            limitOrdersData: computed,
            limitOrdersFilter: computed,

            loadLimitOrderList: action.bound,
            loadLimitOrderListByOrderViewMode: action.bound,

            ltrMarketPrice: computed,
            ltrPrice: override,
            makeLimitOrder: action.bound,
            maximizeLeftAmount: action.bound,

            priceLock: computed,
            rateDirection: computed,
            rtlMarketPrice: computed,
            rtlPrice: override,
            setLimitOrdersFilter: action.bound,
            toggleDirection: action.bound,
            toggleRateDirection: action.bound,
        })

        this.setData(() => ({
            // graphData: DEFAULT_GRAPH_DATA,
            leftAmount: '',
            limitOrderRoot: undefined,
            limitOrdersList: DEFAULT_LIMIT_ORDERS_LIST,
            rightAmount: '',
            slippage: DEFAULT_SLIPPAGE_VALUE, // 0.5
        }))
        // const devMode = false // process.env.NODE_ENV === 'development'
        const limitOrdersFilter = storage.get('limitOrdersFilters')
        this.setState(() => ({
            // graph: 'depth',
            // timeframe: 'H1',
            isLimitOrderListLoading: DEFAULT_LIMIT_ORDER_LIST_LOADING,
            isPreparing: false,
            lastAmountChangeSide: Side.LEFT,
            limitOrdersFilter: limitOrdersFilter
                ? JSON.parse(limitOrdersFilter)
                : DEFAULT_LIMIT_ORDERS_FILTERS,
            rateDirection: SwapDirection.LTR,
        }))
        // this.tokensDisposer = reaction(
        // () => [this.leftToken, this.rightToken],
        //     (
        //         [leftTokenAddress, rightTokenAddress]: (string | undefined)[],
        //     ) => {
        //         debug('leftTokenAddress, rightTokenAddress', leftTokenAddress, rightTokenAddress)
        //         if (leftTokenAddress && rightTokenAddress) {
        //             this.loadOhlcvGraph()
        //         }
        //     },
        // )
    }

    /**
     * Manually initiate store.
     * Run all necessary subscribers.
     */
    public async init(): Promise<void> {
        debug('debug +++ init this.data', this.data)
        this.tokensCacheDisposer?.()
        this.tokensCacheDisposer = reaction(
            () => this.tokensCache.isReady,
            this.handleTokensCacheReady,
            { fireImmediately: true },
        )
        this.fetchCurrencies()
        this.tokensDisposer?.()
        this.tokensDisposer = reaction(
            () => [this.leftToken, this.rightToken],
            async (
                curr?: (Token | undefined)[],
                prev?: (Token | undefined)[],
            ) => {
                if (!curr || !prev) return
                const [leftToken, rightToken] = curr
                const [prevLeftToken, prevRightToken] = prev
                if (!leftToken || !rightToken) return
                if (leftToken?.root !== prevLeftToken?.root || rightToken?.root !== prevRightToken?.root) {
                    debug('tokensDisposer loadLimitOrderList', leftToken?.root !== prevLeftToken?.root, rightToken?.root !== prevRightToken?.root)
                    await Promise.allSettled([
                        this.loadLimitOrderList(),
                        this.fetchCurrencies(),
                    ])
                }
            },
            {
                // delay: 50,
                fireImmediately: true,
            },
        )
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
            leftAmount: this.data.rightAmount,
            leftToken: this.data.rightToken,
            rightAmount: this.data.leftAmount,
            rightToken: this.data.leftToken,
        })
        this.setState(
            'lastAmountChangeSide',
            this.lastAmountChangeSide === Side.LEFT ? Side.RIGHT : Side.LEFT,
        )

    }

    /**
     * 
     */
    // public changeAmounts(
    //     leftAmount: string,
    //     rightAmount: string,
    //     prevLeftAmount: string,
    //     prevRightAmount: string,
    // ): void {
    //     const newData: {
    //         leftAmount?: string,
    //         rightAmount?: string
    //     } = {}
    //     if (leftAmount !== prevLeftAmount) {
    //         newData.leftAmount = leftAmount
    //     }
    //     if (rightAmount !== prevRightAmount) {
    //         newData.rightAmount = rightAmount
    //     }
    //     this.setData(state => ({
    //         leftAmount: state.leftAmount,
    //         rightAmount: state.rightAmount,
    //         ...newData,
    //     }))
    //     // this.reset()
    // }

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
            const ltrPrice = roundAmount(
                new BigNumber(value)
                    .dividedBy(this.rightAmount)
                    .toFixed(),
                this.leftToken?.decimals,
            )
            const rtlPrice = roundAmount(
                new BigNumber(this.rightAmount)
                    .dividedBy(value)
                    .toFixed(),
                this.rightToken?.decimals,
            )
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
            const ltrPrice = roundAmount(
                new BigNumber(this.leftAmount)
                    .dividedBy(value)
                    .toFixed(),
                this.leftToken?.decimals,
            )
            const rtlPrice = roundAmount(
                new BigNumber(value)
                    .dividedBy(this.leftAmount)
                    .toFixed(),
                this.rightToken?.decimals,
            )
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
    public setAsyncState(key: string, stateName: 'isLimitOrderClosing' | 'isLimitOrderCanceling', stateValue: boolean): void {
        this.setState(stateName, new ObservableMap(this[stateName]).set(key, stateValue))
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
    public get rateDirection(): P2PStoreState['rateDirection'] {
        return this.state.rateDirection
    }

    /**
     * 
     */
    public get priceLock(): P2PStoreState['priceLock'] {
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
                    currencyPrices.ltrMarketPrice = roundAmount(
                        currencyPrices.rightPrice
                            .dividedBy(currencyPrices.leftPrice)
                            .toFixed(),
                        this.leftToken.decimals,
                    )
                    currencyPrices.rtlMarketPrice = roundAmount(
                        currencyPrices.leftPrice
                            .dividedBy(currencyPrices.rightPrice)
                            .toFixed(),
                        this.rightToken.decimals,
                    )
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
        if (this.rateDirection === SwapDirection.LTR) {
            data.ltrPrice = price
            data.rtlPrice = new BigNumber(price).eq(0) ? price : roundAmount(1 / +price, this.rightToken?.decimals)
        }
        else {
            data.ltrPrice = new BigNumber(price).eq(0) ? price : roundAmount(1 / +price, this.leftToken?.decimals)
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
     *
     */
    public get limitOrdersFilter(): P2PStoreState['limitOrdersFilter'] {
        return this.state.limitOrdersFilter
    }

    /**
     *
     */
    public get isLimitOrderListLoading(): P2PStoreState['isLimitOrderListLoading'] {
        return this.state.isLimitOrderListLoading
    }

    /**
     *
     */
    public get limitOrdersData(): P2PStoreData['limitOrdersList'] {
        return this.data.limitOrdersList
    }

    /**
     *
     */
    public resetLimitOrdersData(): void {
        this.setData('limitOrdersList', DEFAULT_LIMIT_ORDERS_LIST)
    }

    /**
     *
     */
    public setLimitOrdersFilter(
        viewMode: OrderViewMode,
        limitOrdersFilter: LimitOrdersFilter,
    ): void {
        // debug('setLimitOrdersFilter', OrderViewMode[viewMode], limitOrdersFilter)
        this.setState(state => {
            const newState = {
                ...state,
                limitOrdersFilter: {
                    ...state.limitOrdersFilter,
                    [viewMode]: limitOrdersFilter,
                },
            }
            storage.set(
                'limitOrdersFilters',
                JSON.stringify(newState.limitOrdersFilter),
            )
            return newState
        })
        if (this.isLimitOrderListLoading !== undefined) this.loadLimitOrderListByOrderViewMode(viewMode)
    }

    /**
     *
     */
    public async loadLimitOrderList(): Promise<void> {
        await Promise.allSettled([
            this.loadLimitOrderListByOrderViewMode(OrderViewMode.OPEN_ORDERS),
            this.loadLimitOrderListByOrderViewMode(OrderViewMode.MY_OPEN_ORDERS),
            this.loadLimitOrderListByOrderViewMode(OrderViewMode.ORDERS_HISTORY),
        ])
    }

    /**
     *
     */
    public async loadLimitOrderListByOrderViewMode(viewMode: OrderViewMode): Promise<void> {
        if (this.isLimitOrderListLoading[viewMode]
            || !this.leftToken
            || !this.rightToken
            || !this.state.limitOrdersFilter?.[viewMode]
        ) {
            return
        }
        const {
            skip, take, isBuyOrSell, onlyMyOrders,
        } = this.state.limitOrdersFilter[viewMode]

        if (!this.wallet.account?.address?.toString() && viewMode === OrderViewMode.MY_OPEN_ORDERS) {
            this.resetLimitOrdersData()
            this.changeLimitOrderListLoadingState(viewMode, false)
            return
        }

        const states = convertOrderViewFilterToStates(viewMode)
        const sortBy: LimitOrdersSort = viewMode === OrderViewMode.OPEN_ORDERS
            ? {
                rate: isBuyOrSell === BuySellSwitch.SELL ? SortOrder.DESC : SortOrder.ASC,
            }
            : {
                createdAt: SortOrder.DESC,
            }
        try {
            this.changeLimitOrderListLoadingState(viewMode, true)
            const bodyObj: LimitOrderRequest = {
                leftTokenRoot: this.leftToken?.root,
                rightTokenRoot: this.rightToken?.root,
                skip,
                sortBy,
                states,
                take,
            }
            if (onlyMyOrders || viewMode === OrderViewMode.MY_OPEN_ORDERS) {
                bodyObj.ownerAddress = this.wallet.account?.address.toString()
            }
            if (isBuyOrSell !== BuySellSwitch.ALL && viewMode !== OrderViewMode.MY_OPEN_ORDERS) {
                bodyObj.receiveTokenRoot = isBuyOrSell === BuySellSwitch.BUY
                    ? this.leftToken?.root
                    : this.rightToken?.root
                bodyObj.spentTokenRoot = isBuyOrSell === BuySellSwitch.BUY
                    ? this.rightToken?.root
                    : this.leftToken?.root
            }
            const body = JSON.stringify(bodyObj)
            this.changeLimitOrderListData(viewMode, viewMode === OrderViewMode.ORDERS_HISTORY
                ? await this.p2pApi.limitOrderHistoryList({}, { body })
                : await this.p2pApi.limitOrderList({}, { body }))
        }
        catch (e) {
            this.resetLimitOrdersData()
        }
        finally {
            this.changeLimitOrderListLoadingState(viewMode, false)
        }
    }

    /**
     *
     */
    public changeLimitOrderListData(viewMode: OrderViewMode, data: LimitOrdersPaginationResponse): void {
        this.setData(state => ({
            ...state,
            limitOrdersList: {
                ...state.limitOrdersList,
                [viewMode]: data,
            },
        }))
    }

    /**
     *
     */
    public changeLimitOrderListLoadingState(viewMode: OrderViewMode, isLoading: boolean): void {
        this.setState(state => ({
            ...state,
            isLimitOrderListLoading: {
                ...state.isLimitOrderListLoading,
                [viewMode]: isLoading,
            },
        }))
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
    public get isLimitOrderCreating(): P2PStoreState['isLimitOrderCreating'] {
        return this.state.isLimitOrderCreating
    }

    /**
     *
     */
    public get isLimitOrderCanceling(): P2PStoreState['isLimitOrderCanceling'] {
        return this.state.isLimitOrderCanceling
    }

    /**
     *
     */
    public get isLimitOrderClosing(): P2PStoreState['isLimitOrderClosing'] {
        return this.state.isLimitOrderClosing
    }

    /**
     *
     */
    public get isLimitOrderRootLoading(): P2PStoreState['isLimitOrderRootLoading'] {
        return this.state.isLimitOrderRootLoading
    }

    /**
     *
     */
    public get isLimitOrderRootDeployed(): P2PStoreState['isLimitOrderRootDeployed'] {
        return this.state.isLimitOrderRootDeployed
    }

    /**
     *
     */
    public get isLimitOrderRootDeploying(): P2PStoreState['isLimitOrderRootDeploying'] {
        return this.state.isLimitOrderRootDeploying
    }

    /**
     * Returns memoized native coin side value
     * @returns {P2PStoreState['coinSide']}
     */
    public get coinSide(): P2PStoreState['coinSide'] {
        return this.state.coinSide
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
            debug('+++ startLt', startLt)
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
                        this.options?.onTransactionEnded?.({ callId })
                        this.options?.onOrderCreateOrderReject?.({ callId, input: decodedTx.input })
                        debug('decodedTx onOrderCreateOrderReject', decodedTx)
                        return { input: decodedTx.input }
                    }

                    if (decodedTx?.method === 'onOrderCreateOrderSuccess' && decodedTx.input.id.toString() === callId) {
                        this.setState('isLimitOrderCreating', false)
                        this.options?.onTransactionEnded?.({ callId })
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
                backPK, // constant = '106925417688891724647234995036862332928925618442306815431062595410491768176622',
                callbackId: callId,
                cancelPayload: null,
                // deployWalletValue: 100000000, 
                expectedTokenAmount: buyAmountBN.toFixed(),
                tokenReceive: new Address(this.rightToken.root),
                user: new Address('0:0000000000000000000000000000000000000000000000000000000000000000'),
            }

            debug('+++ 3 before Promise.all')

            const payload = await new staticRpc.Contract(OrderAbi.Root, this.data.limitOrderRoot)
                .methods.buildPayload(buildPayloadArg).call({})
            debug('+++ 3 between Promise.all')
            const [remainingGasTo] = await Promise.all([

                (await new staticRpc.Contract(TokenAbi.Root, new Address(this.leftToken.root))
                    .methods.walletOf({
                        answerId: 0,
                        walletOwner: new Address(this.wallet.address),
                    }).call({})).value0,
            ])

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
            this.refresh()
        }
    }

    /**
     *
     */
    public async getLimitOrderRoot(): Promise<void> {
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
                        this.options?.onTransactionEnded?.({ callId })
                        this.options?.onOrderRootCreateReject?.({ callId })
                        debug('decodedTx onOrderRootCreateReject', decodedTx)
                        return { input: decodedTx.input, transaction }
                    }

                    if (decodedTx?.method === 'onOrderRootCreateSuccess' && decodedTx.input.id.toString() === callId) {
                        this.setState('isLimitOrderRootDeploying', false)
                        this.options?.onTransactionEnded?.({ callId })
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
            // const subscriber = new rpc.Subscriber()
            // await subscriber.trace(transaction)
            //     .tap((tx: any) => {
            //         debug(`+++ deployLimitOrderRoot Account ${tx.account.toString()}: found tx ${tx.id.hash}`)
            //     })
            //     .finished()

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

    /**
     * Close order 
     * @param {number} amount
     */
    public async closeLimitOrder(
        amount: string = this.currentLimitOrder?.expectedReceiveAmount || '',
    ): Promise<void> {
        if (!this?.currentLimitOrder
            || !this.currentLimitOrder?.accountAddr
            || this.isLimitOrderClosing?.get(this?.currentLimitOrder?.accountAddr)
            || !this.currentLimitOrder?.receiveTokenRoot
            || !this.wallet.address
        ) {
            debug(
                '!!!! CLOSELIMITORDER RETURN',
                this.isLimitOrderClosing,
                !this.wallet.address,
                !this.currentLimitOrder?.accountAddr,
                !this.currentLimitOrder?.receiveTokenRoot,
            )
            return
        }
        const callId = getSafeProcessingId()
        const { accountAddr } = this.currentLimitOrder
        await unsubscribeTransactionSubscriber(callId)
        const subscriber = createTransactionSubscriber(callId)

        this.setAsyncState(accountAddr, 'isLimitOrderClosing', true)
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
                        methods: [
                            'onOrderPartExchangeSuccess',
                            'onOrderStateFilled',
                            'onOrderReject',
                        ],
                        transaction,
                    })
                    debug('decodedTx', decodedTx, transaction)
                    if (decodedTx?.method === 'onOrderPartExchangeSuccess' && decodedTx.input.id.toString() === callId) {
                        debug('decodedTx onOrderPartExchangeSuccess', decodedTx)
                        this.setAsyncState(accountAddr, 'isLimitOrderClosing', false)
                        this.options?.onTransactionEnded?.({ callId })
                        this.options?.onOrderCloseSuccess?.({
                            callId,
                            result: {
                                ...decodedTx.input.result,
                                fee: decodedTx.input.fee,
                                receiveToken: this.tokensCache.get(decodedTx.input.result.receiveToken.toString()),
                                spentToken: this.tokensCache.get(decodedTx.input.result.spentToken.toString()),
                            },
                            transaction,
                        })
                        return { input: decodedTx.input }
                    }

                    if (decodedTx?.method === 'onOrderStateFilled' && decodedTx.input.id.toString() === callId) {
                        this.setAsyncState(accountAddr, 'isLimitOrderClosing', false)
                        this.options?.onTransactionEnded?.({ callId })
                        this.options?.onOrderCloseSuccess?.({
                            callId,
                            result: {
                                fee: decodedTx.input.fee,
                                ...decodedTx.input.result,
                                receiveToken: this.tokensCache.get(decodedTx.input.result.receiveToken.toString()),
                                spentToken: this.tokensCache.get(decodedTx.input.result.spentToken.toString()),
                            },
                            transaction,
                        })
                        debug('decodedTx onOrderStateFilled', decodedTx)
                        return { input: decodedTx.input }
                    }

                    if (decodedTx?.method === 'onOrderReject' && decodedTx.input.id.toString() === callId) {
                        this.setAsyncState(accountAddr, 'isLimitOrderClosing', false)
                        this.options?.onTransactionEnded?.({ callId })
                        this.options?.onOrderExchangeFail?.({ callId })
                        debug('decodedTx onOrderReject', decodedTx)
                        return { input: decodedTx.input }
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const [remainingGasTo, payload] = await Promise.all([
                this.getWalletOf(new Address(this.currentLimitOrder.receiveTokenRoot)),
                (await new staticRpc.Contract(OrderAbi.Order, new Address(this.currentLimitOrder.accountAddr))
                    .methods.buildPayload({
                        callbackId: callId,
                        cancelPayload: null,
                        deployWalletValue: 100000000, // TODO may be need to change value
                        recipient: new Address(this.wallet.address),
                        successPayload: null,
                    }).call()).value0,
            ])
            if (!remainingGasTo) {
                return
            }
            debug('+++ 1 closeLimitOrder walletOf, payload, currentLimitOrder.accountAddr', remainingGasTo, payload, new Address(this.currentLimitOrder.accountAddr))
            debug('this.currentLimitOrder', this.currentLimitOrder)
            const message = await new rpc.Contract(TokenAbi.Wallet, remainingGasTo)
                .methods.transfer({
                    amount,
                    deployWalletValue: '100000000', // TODO may be need to change value
                    notify: true,
                    payload,
                    recipient: new Address(accountAddr),
                    remainingGasTo,
                }).sendDelayed({
                    amount: '6000000000',
                    bounce: true,
                    from: new Address(this.wallet.address),
                })
            debug('+++ 2 closeLimitOrder transaction')

            await message.transaction

            debug('await stream')
            await stream()
            debug('finish stream')

            await subscriber.unsubscribe()
            debug('+++ 5 closeLimitOrder finished')
        }
        catch (reason: any) {
            this.setAsyncState(accountAddr, 'isLimitOrderClosing', false)
            debug('Closing order failure', reason)
            if (reason?.code !== 3) {
                error('Closing order failure', reason)
                this.options?.onError?.({ callId })
            }
        }
        finally {
            this.setAsyncState(accountAddr, 'isLimitOrderClosing', false)
            this.options?.onTransactionEnded?.({ callId })
            await unsubscribeTransactionSubscriber(callId)
            this.refresh()
        }
        // this.setState('isLimitOrderClosing', false)
    }

    /**
     *
     */
    public async cancelLimitOrder(): Promise<void> {
        if (!this?.currentLimitOrder
            || !this.wallet.address
            || this.isLimitOrderCanceling?.get(this?.currentLimitOrder?.accountAddr)
        ) {
            return
        }

        const callId = getSafeProcessingId()
        const { accountAddr } = this.currentLimitOrder
        await unsubscribeTransactionSubscriber(callId)
        const subscriber = createTransactionSubscriber(callId)
        this.setAsyncState(accountAddr, 'isLimitOrderCanceling', true)
        this.options.onTransactionWait({ callId })
        try {
            const startLt = this.wallet.contract?.lastTransactionId?.lt
            const stream = await subscriber
                .transactions(this.wallet.account!.address)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || LT_COLLATOR.compare(tx.id.lt, startLt) > 0)
                .filterMap(async transaction => {
                    const decodedTx = await this.orderContractCallbacks?.decodeTransaction({
                        methods: ['onOrderStateCancelled'],
                        transaction,
                    })
                    if (decodedTx?.method === 'onOrderStateCancelled' && decodedTx.input.id.toString() === callId) {
                        this.setAsyncState(accountAddr, 'isLimitOrderCanceling', false)
                        this.options?.onTransactionEnded?.({ callId })
                        this.options?.onOrderStateCancelled?.({
                            callId,
                            result: {
                                ...decodedTx.input.result,
                                spentToken: this.tokensCache.get(decodedTx.input.result.spentToken.toString()),
                            },
                            transaction,
                        })
                        return { input: decodedTx.input, transaction }
                    }

                    return undefined
                })
                .delayed(s => s.first())


            const message = await new rpc
                .Contract(OrderAbi.Order, new Address(accountAddr))
                .methods
                .cancel({
                    callbackId: callId,
                }).sendDelayed({
                    amount: '1000000000', // 1 ever
                    bounce: true,
                    from: new Address(this.wallet.address),
                })
            await message.transaction
            await stream()
            await subscriber.unsubscribe()
            debug('+++ 5 closeLimitOrder finished')
        }
        catch (reason: any) {
            this.setAsyncState(accountAddr, 'isLimitOrderCanceling', false)
            if (reason?.code !== 3) {
                error('Limit order canceling failure', reason)
                this.options?.onError?.({ callId, reason })
            }
        }
        finally {
            this.setAsyncState(accountAddr, 'isLimitOrderCanceling', false)
            this.options?.onTransactionEnded?.({ callId })
            await unsubscribeTransactionSubscriber(callId)
            this.refresh()
        }
    }

    /**
     *
     */
    public get currentLimitOrder(): P2PStoreData['currentLimitOrder'] {
        return this.data.currentLimitOrder
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
        this.tokensDisposer?.()
        this.walletAccountDisposer?.()
        this.reset()
    }

    /**
     * Full refresh limit page
     * @protected
     */
    protected async refresh(): Promise<void> {
        debug('refresh loadLimitOrderList')
        this.loadLimitOrderList()
    }

    // TODO may be need to add some data to reset
    /**
     * Full reset P2P
     * instances to their default.
     * @protected
     */
    protected reset(): void {
        this.setData({
            currentLimitOrder: undefined,
            leftAmount: '',
            limitOrdersList: DEFAULT_LIMIT_ORDERS_LIST,
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
     * Use this method to change current limit order instead of direct change value via `setData`
     * @param {LimitOrderItem} limitOrder
     */
    public setCurrentLimitOrder(limitOrder?: LimitOrderItem & LimitOrderExchange): void {
        if (!limitOrder) {
            return
        }
        this.setData('currentLimitOrder', limitOrder)
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

    // TODO if necessary for P2P
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

    /*
     * Memoized store data and state values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns memoized swap confirmation await state value
     * @returns {P2PStoreState['isCreateConfirmationAwait']}
     */
    public get isCreateConfirmationAwait(): P2PStoreState['isCreateConfirmationAwait'] {
        return this.state.isCreateConfirmationAwait
    }

    /**
     * Returns memoized state of changing tokens
     * @returns {P2PStoreState['isChangingTokens']}
     */
    public get isChangingTokens(): P2PStoreState['isChangingTokens'] {
        return this.state.isChangingTokens
    }

    /**
     * Returns memoized any confirmation await state value
     */
    public get isConfirmationAwait(): P2PStoreState['isCancelConfirmationAwait'] {
        return this.state.isCancelConfirmationAwait
            || this.state.isCloseConfirmationAwait
            || this.state.isCreateConfirmationAwait
            || this.state.isDeployConfirmationAwait
    }

    /**
     * Returns memoized swap confirmation await state value
     * @returns {P2PStoreState['isCancelConfirmationAwait']}
     */
    public get isCancelConfirmationAwait(): P2PStoreState['isCancelConfirmationAwait'] {
        return this.state.isCancelConfirmationAwait
    }

    /**
     * Returns memoized swap confirmation await state value
     * @returns {P2PStoreState['isCloseConfirmationAwait']}
     */
    public get isCloseConfirmationAwait(): P2PStoreState['isCloseConfirmationAwait'] {
        return this.state.isCloseConfirmationAwait
    }

    /**
     * Returns memoized swap confirmation await state value
     * @returns {P2PStoreState['isDeployConfirmationAwait']}
     */
    public get isDeployConfirmationAwait(): P2PStoreState['isDeployConfirmationAwait'] {
        return this.state.isDeployConfirmationAwait
    }

    /**
     * Returns memoized preparing state value
     * @returns {P2PStoreState['isPreparing']}
     */
    public get isPreparing(): P2PStoreState['isPreparing'] {
        return this.state.isPreparing
    }


    public get isFetching(): P2PStoreState['isFetching'] {
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

    // TODO need to refactor
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
        // this.setData('limitOrdersList', DEFAULT_LIMIT_ORDERS)
        this.resetLimitOrdersData()
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
                ? this.tokensCache.unwatch(prevLeftToken, 'p2p')
                : undefined,
            (prevRightToken !== undefined && ![leftToken, rightToken].includes(prevRightToken))
                ? this.tokensCache.unwatch(prevRightToken, 'p2p')
                : undefined,
        ])
        Promise.all([
            this.loadLimitOrderList(),
        ])
        if (this.wallet?.address !== undefined) {
            debug('handleChangeTokens loadLimitOrderList')

            await Promise.all([
                (leftToken !== undefined && ![prevLeftToken, prevRightToken, rightToken].includes(leftToken))
                    ? this.tokensCache.watch(this.leftToken?.root, 'p2p')
                    : undefined,
                (rightToken !== undefined && ![prevLeftToken, prevRightToken, leftToken].includes(rightToken))
                    ? this.tokensCache.watch(this.rightToken?.root, 'p2p')
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
        this.setState('isPreparing', this.wallet.isInitializing || this.wallet.isConnecting)
        this.setState('isValidTokens', this.leftToken !== undefined && this.rightToken !== undefined)

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

            // this.setState('isMultiple', true)
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
        this.loadLimitOrderList()
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
            this.leftToken?.root && this.tokensCache.watch(this.leftToken.root, 'p2p'), // TODO swap -> limit
            this.rightToken?.root && this.tokensCache.watch(this.rightToken.root, 'p2p'), // TODO swap -> limit
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
            // receivedDecimals: this.coinSide === 'rightToken' ? this.wallet.coin.decimals : this.rightTokenDecimals,
            // receivedIcon: this.coinSide === 'rightToken' ? this.wallet.coin.icon : this.rightToken?.icon,
            // receivedRoot: this.coinSide === 'rightToken' ? undefined : this.rightToken?.root,
            // receivedSymbol: this.coinSide === 'rightToken' ? this.wallet.coin.symbol : this.rightToken?.symbol,
            // slippage: this.isCrossExchangeMode ? this.crossPairSwap.slippage : this.data.slippage,
            spentDecimals: this.leftTokenDecimals,
            spentIcon: this.leftToken?.icon,
            spentRoot: this.leftToken?.root,
            spentSymbol: this.leftToken?.symbol,
        })
        this.reset()
        debug('onSend', message, params)
        // this.options.onSend?.(message, params)
    }

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

    protected tokensDisposer: IReactionDisposer | undefined

    protected walletAccountDisposer: IReactionDisposer | undefined

}
