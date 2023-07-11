import {
    Address, Contract, DecodedAbiFunctionOutputs, LT_COLLATOR,
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
import BigNumber from 'bignumber.js'

import {
    DEFAULT_LIMIT_ORDERS_FILTERS,
    DEFAULT_LIMIT_ORDERS_LIST,
    DEFAULT_LIMIT_ORDER_LIST_LOADING,
} from '@/modules/LimitOrders/constants'
import { P2PBaseStore } from '@/modules/LimitOrders/stores/P2PBaseStore'
import {
    BuySellSwitch,
    LimitOrderExchange,
    LimitOrderItem,
    LimitOrderRequest,
    LimitOrdersFilter,
    LimitOrdersPaginationResponse,
    LimitOrdersSort,
    OrderViewMode,
    P2PCtorOptions,
    P2POrderExpectedAmount,
    P2POrderListStoreData,
    P2POrderListStoreState,
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
    getSafeProcessingId,
    storage,
} from '@/utils'
import { OrderAbi } from '@/misc/abi/order.abi'
import { TokenAbi } from '@/misc'
import { LimitOrderApi, useP2pApi } from '@/modules/LimitOrders/hooks/useApi'
import { useRpc, useStaticRpc } from '@/hooks'

const staticRpc = useStaticRpc()
const rpc = useRpc()

export class P2POrderListStore extends P2PBaseStore<P2POrderListStoreData, P2POrderListStoreState> {

    protected readonly p2pApi: LimitOrderApi = useP2pApi()

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly options: P2PCtorOptions,
    ) {
        super(tokensCache)

        makeObservable<
            P2POrderListStore,
            | 'handleChangeTokens'
            | 'handleTokensCacheReady'
            | 'handleWalletAccountChange'
            | 'setLimitOrdersFilter'
            | 'toggleRateDirection'
        >(this, {
            changeLeftOrderAmount: action.bound,
            changeLimitOrderListData: action.bound,
            changeLimitOrderListLoadingState: action.bound,
            changeRightOrderAmount: action.bound,
            coinSide: computed,
            currentLimitOrderFee: computed,
            currentLimitOrderReceive: computed,
            currentLimitOrderSpent: computed,
            defaultLeftTokenRoot: computed,
            defaultRightTokenRoot: computed,
            formattedLeftBalance: override,
            formattedRightBalance: override,
            handleChangeTokens: action.bound,
            handleTokensCacheReady: action.bound,
            handleWalletAccountChange: action.bound,
            initialCurrentLimitOrderFee: computed,
            initialCurrentLimitOrderReceive: computed,
            initialCurrentLimitOrderSpent: computed,
            initialCurrentLimitOrderSpentMax: computed,
            isBusy: computed,
            isCancelConfirmationAwait: computed,
            isCloseConfirmationAwait: computed,
            isConfirmationAwait: computed,

            isFetching: computed,
            isLimitOrderCanceling: computed,
            isLimitOrderClosing: computed,
            isLimitOrderListLoading: computed,
            isLoading: computed,

            isPreparing: computed,

            isValidTokens: computed,
            leftBalanceNumber: override,
            limitOrdersData: computed,
            limitOrdersFilter: computed,

            loadInitialOrderAmounts: action.bound,
            loadLimitOrderList: action.bound,
            loadLimitOrderListByOrderViewMode: action.bound,

            rateDirection: computed,
            setLimitOrdersFilter: action.bound,
            toggleRateDirection: action.bound,
        })

        this.setData(() => ({
            leftAmount: '',
            limitOrderRoot: undefined,
            limitOrdersList: DEFAULT_LIMIT_ORDERS_LIST,
            rightAmount: '',
        }))
        const limitOrdersFilter = storage.get('limitOrdersFilters')
        this.setState(() => ({
            isLimitOrderListLoading: DEFAULT_LIMIT_ORDER_LIST_LOADING,
            isPreparing: false,
            limitOrdersFilter: limitOrdersFilter
                ? JSON.parse(limitOrdersFilter)
                : DEFAULT_LIMIT_ORDERS_FILTERS,
            rateDirection: SwapDirection.LTR,
        }))
    }

    /**
     * Manually initiate store.
     * Run all necessary subscribers.
     */
    public async init(): Promise<void> {
        debug('debug +++ init this.data P2POrderListStore', this.data)
        this.tokensCacheDisposer?.()
        this.tokensCacheDisposer = reaction(
            () => this.tokensCache.isReady,
            this.handleTokensCacheReady,
            { fireImmediately: true },
        )
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
    public get rateDirection(): P2POrderListStoreState['rateDirection'] {
        return this.state.rateDirection
    }

    /**
     *
     */
    public get limitOrdersFilter(): P2POrderListStoreState['limitOrdersFilter'] {
        return this.state.limitOrdersFilter
    }

    /**
     *
     */
    public get isLimitOrderListLoading(): P2POrderListStoreState['isLimitOrderListLoading'] {
        return this.state.isLimitOrderListLoading
    }

    /**
     *
     */
    public get limitOrdersData(): P2POrderListStoreData['limitOrdersList'] {
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
        debug('setLimitOrdersFilter', OrderViewMode[viewMode], limitOrdersFilter)
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
        debug('loadLimitOrderListByOrderViewMode', OrderViewMode[viewMode])
        const {
            skip, take, isBuyOrSell, onlyMyOrders,
        } = this.state.limitOrdersFilter[viewMode]

        if (!this.wallet.address && viewMode === OrderViewMode.MY_OPEN_ORDERS) {
            this.resetLimitOrdersData()
            this.changeLimitOrderListLoadingState(viewMode, false)
            return
        }

        const states = convertOrderViewFilterToStates(viewMode)
        const sortBy: LimitOrdersSort = viewMode === OrderViewMode.OPEN_ORDERS
            ? {
                rate: isBuyOrSell === BuySellSwitch.SELL ? SortOrder.ASC : SortOrder.DESC,
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
                bodyObj.ownerAddress = this.wallet.address
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
    public get isLimitOrderCanceling(): P2POrderListStoreState['isLimitOrderCanceling'] {
        return this.state.isLimitOrderCanceling
    }

    /**
     *
     */
    public get isLimitOrderClosing(): P2POrderListStoreState['isLimitOrderClosing'] {
        return this.state.isLimitOrderClosing
    }

    /**
     * Returns memoized native coin side value
     * @returns {P2POrderListStoreState['coinSide']}
     */
    public get coinSide(): P2POrderListStoreState['coinSide'] {
        return this.state.coinSide
    }

    /**
     *
     */
    public async getFeeParams(orderAddress: Address): Promise<DecodedAbiFunctionOutputs<typeof OrderAbi.Order, 'getFeeParams'>['params'] | undefined> {
        if (!this.wallet.address) {
            return undefined
        }
        return (await new staticRpc.Contract(OrderAbi.Order, orderAddress)
            .methods.getFeeParams({
                answerId: 0,
            }).call({})).params
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
     *
     */
    public async getExpectedSpentAmount(amount: string): Promise<P2POrderExpectedAmount | undefined> {
        if (!this.currentLimitOrderAddress) {
            return undefined
        }
        const response = await new staticRpc.Contract(OrderAbi.Order, new Address(this.currentLimitOrderAddress))
            .methods.getExpectedSpentAmount({
                amount,
                answerId: 0,
            }).call({})
        return {
            amount: response.value0,
            fee: response.value1,
        }
    }

    /**
     *
     */
    public async getExpectedReceiveAmount(amount: string): Promise<P2POrderExpectedAmount | undefined> {
        if (!this.currentLimitOrderAddress) {
            return undefined
        }
        const response = await new staticRpc.Contract(OrderAbi.Order, new Address(this.currentLimitOrderAddress))
            .methods.getExpectedReceiveAmount({
                amount,
                answerId: 0,
            }).call({})
        return {
            amount: response.value0,
            fee: response.value1,
        }
    }

    /**
     *
     */
    public async changeLeftOrderAmount(value: string): Promise<void> {
        this.setData({
            currentLimitOrderSpent: value,
        })
        if (!value || !this.currentLimitOrderAddress || !this.currentLimitOrder) {
            return
        }
        const spentToken = this.tokensCache.get(this.currentLimitOrder.receiveTokenRoot)
        const receiveToken = this.tokensCache.get(this.currentLimitOrder.spentTokenRoot)

        const spentAmount = new BigNumber(value ?? 0)
            .shiftedBy(spentToken?.decimals ?? 0)
        const orderReceiveResponse = await this.getExpectedReceiveAmount(spentAmount.toFixed())
        const orderReceiveAmount = new BigNumber(orderReceiveResponse?.amount ?? 0)
            .shiftedBy(-(receiveToken?.decimals || 0))
        const fee = new BigNumber(orderReceiveResponse?.fee ?? 0)
            .shiftedBy(-(spentToken?.decimals || 0))
        this.setData({
            currentLimitOrderFee: fee.toFixed(),
            currentLimitOrderReceive: orderReceiveAmount.toFixed(),
            // currentLimitOrderSpent: spentAmount.shiftedBy(-(spentToken?.decimals || 0)).toFixed(),
        })
        debug('+++changeLeftOrderAmount', {
            currentLimitOrderFee: fee.toFixed(),
            currentLimitOrderReceive: orderReceiveAmount.toFixed(),
            currentLimitOrderSpent: spentAmount.shiftedBy(-(spentToken?.decimals || 0)).toFixed(),
        })
    }

    /**
     *
     */
    public async changeRightOrderAmount(value: string): Promise<void> {
        this.setData({
            currentLimitOrderReceive: value,
        })
        if (!value || !this.currentLimitOrderAddress || !this.currentLimitOrder) {
            return
        }
        const spentToken = this.tokensCache.get(this.currentLimitOrder.receiveTokenRoot)
        const receiveToken = this.tokensCache.get(this.currentLimitOrder.spentTokenRoot)

        const receiveAmount = new BigNumber(value ?? 0)
            .shiftedBy(receiveToken?.decimals || 0)
        const orderSpentResponse = await this.getExpectedSpentAmount(receiveAmount.toFixed())
        const spentAmount = new BigNumber(orderSpentResponse?.amount ?? 0)
            .shiftedBy(-(spentToken?.decimals || 0))

        const fee = new BigNumber(orderSpentResponse?.fee ?? 0)
            .shiftedBy(-(spentToken?.decimals || 0))
        this.setData({
            currentLimitOrderFee: fee.toFixed(),
            // currentLimitOrderReceive: receiveAmount.toFixed(),
            currentLimitOrderSpent: spentAmount.toFixed(),
        })
        debug('+++changeRightOrderAmount', {
            currentLimitOrderFee: fee.toFixed(),
            currentLimitOrderReceive: receiveAmount.toFixed(),
            currentLimitOrderSpent: spentAmount.toFixed(),
        })
    }

    /**
     *
     */
    public async loadInitialOrderAmounts(): Promise<void> {
        if (!this.currentLimitOrderAddress || !this.currentLimitOrder) {
            return
        }
        const spentToken = this.tokensCache.get(this.currentLimitOrder.receiveTokenRoot)
        const receiveToken = this.tokensCache.get(this.currentLimitOrder.spentTokenRoot)
        const balanceBN = new BigNumber(spentToken?.balance ?? 0)
            .shiftedBy(-(spentToken?.decimals || 0))

        const orderSpentResponse = await this.getExpectedSpentAmount(this.currentLimitOrder.currentSpentAmount)
        const orderSpentAmount = new BigNumber(orderSpentResponse?.amount ?? 0)
            .shiftedBy(-(spentToken?.decimals || 0))
        const orderSpentAmountMax = new BigNumber(orderSpentResponse?.amount ?? 0)
            .shiftedBy(-(spentToken?.decimals || 0))
        const spentAmount = balanceBN.lt(orderSpentAmount) ? balanceBN : orderSpentAmount
        const orderReceiveResponse = await this.getExpectedReceiveAmount(
            spentAmount.shiftedBy(spentToken?.decimals ?? 0).toFixed(),
        )
        const orderReceiveAmount = new BigNumber(orderReceiveResponse?.amount ?? 0)
            .shiftedBy(-(receiveToken?.decimals || 0))
        const fee = new BigNumber(orderReceiveResponse?.fee ?? 0)
            .shiftedBy(-(spentToken?.decimals || 0))
        this.setData({
            currentLimitOrderFee: fee.toFixed(),
            currentLimitOrderReceive: orderReceiveAmount.toFixed(),
            currentLimitOrderSpent: spentAmount.toFixed(),
            initialCurrentLimitOrderFee: fee.toFixed(),
            initialCurrentLimitOrderReceive: orderReceiveAmount.toFixed(),
            initialCurrentLimitOrderSpent: spentAmount.toFixed(),
            initialCurrentLimitOrderSpentMax: orderSpentAmountMax.toFixed(),
        })
        debug('+++loadInitialOrderAmounts', {
            currentLimitOrderFee: fee.toFixed(),
            currentLimitOrderReceive: orderReceiveAmount.toFixed(),
            currentLimitOrderSpent: spentAmount.toFixed(),
            initialCurrentLimitOrderFee: fee.toFixed(),
            initialCurrentLimitOrderReceive: orderReceiveAmount.toFixed(),
            initialCurrentLimitOrderSpent: orderSpentAmount.toFixed(),
        })
    }

    /**
     * Close order 
     * @param {number} amount
     */
    public async acceptLimitOrder(
        amount: string = this.currentLimitOrder?.expectedReceiveAmount || '',
    ): Promise<void> {
        if (!this?.currentLimitOrder
            || !this.currentLimitOrder?.accountAddr
            || this.isLimitOrderClosing?.get(this?.currentLimitOrder?.accountAddr)
            || !this.currentLimitOrder?.receiveTokenRoot
            || !this.wallet.address
        ) {
            debug(
                '+++accept limit order early return',
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
                        // this.options?.onTransactionEnded?.({ callId })
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
                        // this.options?.onTransactionEnded?.({ callId })
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
                        // this.options?.onTransactionEnded?.({ callId })
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
                        deployWalletValue: 100000000,
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
                    deployWalletValue: '100000000',
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
                        methods: [
                            'onOrderStateCancelled',
                            'onOrderStateCancelledReject',
                        ],
                        transaction,
                    })
                    if (decodedTx?.method === 'onOrderStateCancelled' && decodedTx.input.id.toString() === callId) {
                        this.setAsyncState(accountAddr, 'isLimitOrderCanceling', false)
                        // this.options?.onTransactionEnded?.({ callId })
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

                    if (decodedTx?.method === 'onOrderStateCancelledReject' && decodedTx.input.id.toString() === callId) {
                        this.setAsyncState(accountAddr, 'isLimitOrderCanceling', false)
                        // this.options?.onTransactionEnded?.({ callId })
                        this.options?.onError?.({ callId })
                        debug('decodedTx onOrderStateCancelledReject', decodedTx)
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
                    amount: '1000000000',
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
    public get currentLimitOrder(): P2POrderListStoreData['currentLimitOrder'] {
        return this.data.currentLimitOrder
    }

    /**
     *
     */
    public get currentLimitOrderAddress(): string | undefined {
        return this.data.currentLimitOrder?.accountAddr
    }

    /**
     *
     */
    public get currentLimitOrderSpent(): P2POrderListStoreData['currentLimitOrderSpent'] {
        return this.data.currentLimitOrderSpent
    }

    /**
     *
     */
    public get currentLimitOrderReceive(): P2POrderListStoreData['currentLimitOrderReceive'] {
        return this.data.currentLimitOrderReceive
    }

    /**
     *
     */
    public get currentLimitOrderFee(): P2POrderListStoreData['currentLimitOrderReceive'] {
        return this.data.currentLimitOrderFee
    }

    /**
     *
     */
    public get initialCurrentLimitOrderSpent(): P2POrderListStoreData['initialCurrentLimitOrderSpent'] {
        return this.data.initialCurrentLimitOrderSpent
    }

    /**
     *
     */
    public get initialCurrentLimitOrderSpentMax(): P2POrderListStoreData['initialCurrentLimitOrderSpent'] {
        return this.data.initialCurrentLimitOrderSpentMax
    }

    /**
     *
     */
    public get initialCurrentLimitOrderReceive(): P2POrderListStoreData['initialCurrentLimitOrderReceive'] {
        return this.data.initialCurrentLimitOrderReceive
    }

    /**
     *
     */
    public get initialCurrentLimitOrderFee(): P2POrderListStoreData['initialCurrentLimitOrderReceive'] {
        return this.data.initialCurrentLimitOrderFee
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

    /**
     * Full reset P2P
     * instances to their default.
     * @protected
     */
    protected reset(): void {
        this.setData({
            currentLimitOrder: undefined,
            limitOrdersList: DEFAULT_LIMIT_ORDERS_LIST,
        })
    }


    /**
     * Use this method to change current limit order instead of direct change value via `setData`
     * @param {LimitOrderItem} limitOrder
     */
    public async setCurrentLimitOrder(limitOrder?: LimitOrderItem & LimitOrderExchange): Promise<void> {
        if (!limitOrder) {
            return
        }
        const feeParams = await this.getFeeParams(new Address(limitOrder.accountAddr))
        this.setData('currentLimitOrder', { ...limitOrder, feeParams })
        await this.loadInitialOrderAmounts()
    }

    /*
     * Memoized store data and state values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns memoized any confirmation await state value
     */
    public get isConfirmationAwait(): P2POrderListStoreState['isCancelConfirmationAwait'] {
        return this.state.isCancelConfirmationAwait
            || this.state.isCloseConfirmationAwait
    }

    /**
     * Returns memoized swap confirmation await state value
     * @returns {P2POrderListStoreState['isCancelConfirmationAwait']}
     */
    public get isCancelConfirmationAwait(): P2POrderListStoreState['isCancelConfirmationAwait'] {
        return this.state.isCancelConfirmationAwait
    }

    /**
     * Returns memoized swap confirmation await state value
     * @returns {P2POrderListStoreState['isCloseConfirmationAwait']}
     */
    public get isCloseConfirmationAwait(): P2POrderListStoreState['isCloseConfirmationAwait'] {
        return this.state.isCloseConfirmationAwait
    }

    /**
     * Returns memoized preparing state value
     * @returns {P2POrderListStoreState['isPreparing']}
     */
    public get isPreparing(): P2POrderListStoreState['isPreparing'] {
        return this.state.isPreparing
    }


    public get isFetching(): P2POrderListStoreState['isFetching'] {
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
     * Returns combined `isBusy` state 
     * @returns {boolean}
     */
    public get isBusy(): boolean {
        return this.isPreparing
            || this.isLoading
            || !this.tokensCache.isReady
    }

    /**
     * Returns combined `isValidTokens` state 
     * @returns {boolean}
     */
    public get isValidTokens(): P2POrderListStoreState['isValidTokens'] {
        return this.state.isValidTokens
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
        debug('+++ handleChangeTokens')

        if (!this.tokensCache.isReady) {
            return
        }
        await Promise.all([
            (prevLeftToken !== undefined && ![leftToken, rightToken].includes(prevLeftToken))
                ? this.tokensCache.unwatch(prevLeftToken, 'p2p-orderlist')
                : undefined,
            (prevRightToken !== undefined && ![leftToken, rightToken].includes(prevRightToken))
                ? this.tokensCache.unwatch(prevRightToken, 'p2p-orderlist')
                : undefined,
        ])
        this.setState('isValidTokens', this.leftToken !== undefined && this.rightToken !== undefined)
        this.loadLimitOrderList()
        if (this.wallet?.address !== undefined) {
            debug('handleChangeTokens loadLimitOrderList')

            await Promise.all([
                (leftToken !== undefined && ![prevLeftToken, prevRightToken, rightToken].includes(leftToken))
                    ? this.tokensCache.watch(this.leftToken?.root, 'p2p-orderlist')
                    : undefined,
                (rightToken !== undefined && ![prevLeftToken, prevRightToken, leftToken].includes(rightToken))
                    ? this.tokensCache.watch(this.rightToken?.root, 'p2p-orderlist')
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
        debug('tokensChangeDisposer')
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
                    (leftToken === prevLeftToken && rightToken === prevRightToken)
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
        this.setState('isPreparing', this.tokensCache.isFetching)
        this.loadLimitOrderList()
        await Promise.all([
            this.leftToken?.root && this.tokensCache.syncToken(this.leftToken.root, true),
            this.rightToken?.root && this.tokensCache.syncToken(this.rightToken.root, true),
        ])
        await Promise.all([
            this.leftToken?.root && this.tokensCache.watch(this.leftToken.root, 'p2p-orderlist'),
            this.rightToken?.root && this.tokensCache.watch(this.rightToken.root, 'p2p-orderlist'),
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

    protected tokensDisposer: IReactionDisposer | undefined

    protected walletAccountDisposer: IReactionDisposer | undefined

}
