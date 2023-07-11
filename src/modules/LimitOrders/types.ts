import {
    Address, Contract, DecodedAbiFunctionOutputs, Transaction,
} from 'everscale-inpage-provider'
import BigNumber from 'bignumber.js'
import { ObservableMap } from 'mobx'
import { DateTime } from 'luxon'

import { DexAbi, PairType, Token } from '@/misc'
import type { TokenSide } from '@/modules/TokensList'
import { OhlcvGraphModel, Timeframe } from '@/modules/Chart/types'
import { SwapDirection } from '@/modules/Swap/types'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { WalletService } from '@/stores/WalletService'
import { BaseSwapStoreData } from '@/modules/Swap/stores/BaseSwapStore'
import { OrderAbi } from '@/misc/abi/order.abi'

export type LimitOrderRequest = {
    accountAddr?: string;
    createdGt?: number;
    createdLt?: number;
    currentReceiveAmountGt?: number;
    currentReceiveAmountLt?: number;
    currentSpentAmountGt?: number;
    currentSpentAmountLt?: number;
    expectedReceiveAmountGt?: number;
    expectedReceiveAmountLt?: number;
    expectedSpentAmountGt?: number;
    expectedSpentAmountLt?: number;
    leftTokenRoot?: string;
    limitOrderRoot?: string;
    ownerAddress?: string;
    receiveTokenRoot?: string;
    rightTokenRoot?: string;
    skip: number
    sortBy?: LimitOrdersSort;
    spentTokenRoot?: string;
    states?: LimitOrderState[];
    take: number;
}

export enum Side {
    LEFT,
    RIGHT
}


export enum LimitOrderState {
    INITIALIZE = 'Initialize',
    AWAITTOKENS = 'AwaitTokens',
    ACTIVE = 'Active',
    FILLED = 'Filled',
    SWAPINPROGRESS = 'SwapInProgress',
    CANCELLED = 'Cancelled',
    UNKNOWN = 'Unknown',
}

export type LimitOrdersSort = {
    createdAt?: SortOrder;
    currentAmount?: SortOrder;
    rate?: SortOrder;
}

export enum SortOrder {
    DESC = 'desc',
    ASC = 'asc',
}

export type LimitOrdersPaginationResponse = {
    items: (LimitOrderItem & LimitOrderExchangeItem)[];
    skip: number;
    total: number;
}

export type LimitOrderItem = {
    accountAddr: string;
    createdAt: number;
    createdAtUtc: string;
    currentReceiveAmount: string;
    currentSpentAmount: string;
    dexPair: string;
    dexRoot: string;
    exchanges: LimitOrderExchange[];
    expectedReceiveAmount: string;
    initialSpentAmount: string;
    limitOrderRoot: string;
    ownerAddress: string;
    receiveTokenRoot: string;
    receiveWallet: string;
    spentTokenRoot: string;
    spentWallet: string;
    state: LimitOrderState;
    swapAttempt: number;
    updatedAt: number;
    updatedAtUtc: string;
    feeParams?: DecodedAbiFunctionOutputs<typeof OrderAbi.Order, 'getFeeParams'>['params'];
}

export type LimitOrderExchangeItem = {
    accountAddr: string,
    createdAt: number,
    createdAtUtc: string,
    currentReceiveTokenAmount: string,
    currentSpentTokenAmount: string,
    receiveAmount: string,
    receiveTokenRoot: string,
    spentAmount: string,
    spentTokenRoot: string
}

export type LimitOrderExchange = {
    accountAddr: string;
    createdAt: number;
    createdAtUtc: string;
    currentReceiveTokenAmount: string;
    currentSpentTokenAmount: string;
    receiveAmount: string;
    receiveTokenRoot: string;
    spentAmount: string;
    spentTokenRoot: string;
}

export type LimitOrderGraphRequest = {
    fromTs: number,
    toTs: number
    leftTokenRoot: string,
    rightTokenRoot: string,
    step: number,
}

export type LimitOrderOrderBookRequest = {
    leftTokenRoot: string,
    rightTokenRoot: string,
    dexPiar?: string,
    state?: LimitOrderState[],
}

export type LimitOrderGraphItem = {
    high: string,
    low: string,
    open: string,
    close: string,
    timestamp: number,
    change?: string,
    base: string;

    closeTimestamp: number;
    counter: string;
    openTimestamp: number;
    volume: string;
}

export type LimitOrderBookItem = {
    dexPair: string,
    rate: string,
    receiveTokenRoot: string,
    spentTokenRoot: string,
    state: LimitOrderState,
    sumCurrentReceiveAmount: string,
    sumCurrentSpentAmount: string
}

export type OrderBookData = {
    askSize?: string | number,
    askCost?: string | number,
    askSpentSymbol: string;
    askReceiveSymbol: string;
    bidSpentSymbol: string;
    bidReceiveSymbol: string;
    bidCost?: string | number,
    bidSize?: string | number,
    rate: string | number,
}

export type P2PPairStoreGraphData = {
    ohlcv: OhlcvGraphModel[] | LimitOrderGraphItem[] | null;
    depth: OrderBookData[] | null;
}

export enum OrderViewMode {
    OPEN_ORDERS = 0,
    MY_OPEN_ORDERS = 1,
    ORDERS_HISTORY = 2,
}

export enum BuySellSwitch {
    BUY,
    SELL,
    ALL,
}

export type P2PPair = {
    address?: Address;
    balances?: {
        left: string;
        right: string;
    };
    contract?: Contract<typeof DexAbi.Pair>;
    decimals?: {
        left: number;
        right: number;
    };
    roots?: {
        left: Address;
        right: Address;
    };
    symbols?: {
        left: string;
        right: string;
    };
    type?: PairType;
}

export interface CurrencyPrices {
    leftPrice?: BigNumber;
    rightPrice?: BigNumber;
    ltrMarketPrice?: string;
    rtlMarketPrice?: string;
}


export interface P2PBaseStoreData {
    leftAmount: string;
    leftToken?: string;
    ltrPrice?: string;
    rightAmount: string;
    rightToken?: string;
    rtlPrice?: string;
}

export interface P2PBaseStoreState {
    isProcessing?: boolean;
}

export interface P2PStoreData extends BaseSwapStoreData {
    limitOrdersList: Record<OrderViewMode, LimitOrdersPaginationResponse>;
    limitOrderRoot?: Address;
    currentLimitOrder?: LimitOrderItem;
    currencyPrices: CurrencyPrices;
}

export interface P2PStoreState {
    coinSide?: TokenSide;
    rateDirection?: SwapDirection;

    limitOrdersFilter: Record<OrderViewMode, LimitOrdersFilter>;
    lastAmountChangeSide?: Side;
    priceLock: boolean;
    isValidTokens: boolean;

    // async states
    isChangingTokens: boolean;
    isPreparing: boolean;
    isLimitOrderListLoading: Record<OrderViewMode, boolean | undefined>;
    isLimitOrderCreating: boolean;
    isLimitOrderCanceling: ObservableMap<string, boolean>;
    isLimitOrderClosing: ObservableMap<string, boolean>;
    isLimitOrderRootLoading: boolean;
    isLimitOrderRootDeploying: boolean;
    isLimitOrderRootDeployed: boolean;
    isFetching: boolean;

    // confirmation popups state
    isCreateConfirmationAwait: boolean;
    isCloseConfirmationAwait: boolean;
    isCancelConfirmationAwait: boolean;
    isDeployConfirmationAwait: boolean;
}
export interface P2PFormStoreData extends P2PBaseStoreData {
    limitOrderRoot?: Address;
    currencyPrices: CurrencyPrices;
}

export interface P2PFormStoreState {
    rateDirection?: SwapDirection;

    lastAmountChangeSide?: Side;
    priceLock: boolean;
    isValidTokens: boolean;
    isShowChartModal: boolean;

    // async states
    lastUpdate: DateTime;
    isInitialized: boolean;
    isChangingTokens: boolean;
    isPreparing: boolean;
    isLimitOrderCreating: boolean;
    isLimitOrderRootLoading: boolean;
    isLimitOrderRootDeploying: boolean;
    isLimitOrderRootDeployed: boolean;
    isFetching: boolean;

    // confirmation popups state
    isCreateConfirmationAwait: boolean;
    isDeployConfirmationAwait: boolean;
}

export interface P2PGraphStoreData extends P2PBaseStoreData {
    graphData: P2PPairStoreGraphData;
}

export interface P2PGraphStoreState {
    coinSide?: TokenSide;
    rateDirection?: SwapDirection;
    graph: 'ohlcv' | 'ohlcv-inverse' | 'tvl' | 'volume' | 'depth'
    timeframe: Timeframe;
    isValidTokens: boolean;

    // async states
    isChangingTokens: boolean;
    isOhlcvGraphLoading: boolean;
    isDepthGraphLoading: boolean;
    isPreparing: boolean;
    isFetching: boolean;

    // confirmation popups state
    isShowChartModal: boolean;
}

export interface P2POrderListStoreData extends P2PBaseStoreData {
    limitOrdersList: Record<OrderViewMode, LimitOrdersPaginationResponse>;
    limitOrderRoot?: Address;
    currentLimitOrder?: LimitOrderItem;
    currentLimitOrderFee: string;
    currentLimitOrderSpent: string;
    currentLimitOrderReceive: string;
    initialCurrentLimitOrderFee: string;
    initialCurrentLimitOrderSpent: string;
    initialCurrentLimitOrderSpentMax: string;
    initialCurrentLimitOrderReceive: string;
}

export interface P2POrderListStoreState {
    coinSide?: TokenSide;
    rateDirection?: SwapDirection;

    limitOrdersFilter: Record<OrderViewMode, LimitOrdersFilter>;
    isPreparing: boolean;
    isLimitOrderListLoading: Record<OrderViewMode, boolean | undefined>;
    isLimitOrderCanceling: ObservableMap<string, boolean>;
    isLimitOrderClosing: ObservableMap<string, boolean>;
    isFetching: boolean;
    isValidTokens: boolean;

    // confirmation popups state
    isCloseConfirmationAwait: boolean;
    isCancelConfirmationAwait: boolean;
}

export type LimitOrdersFilter = {
    skip: number;
    take: number;
    onlyMyOrders: boolean;
    isBuyOrSell: BuySellSwitch;
}

export type P2PStoreProviderProps = React.PropsWithChildren<{
    tokensCache: TokensCacheService;
    wallet: WalletService;
} & P2PCtorOptions>

export type LimitOrderCancelCallbackResult = {
    spentToken?: Token,
    currentSpentTokenAmount: string,
}

export type LimitOrderExchangeSuccessCallbackResult = {
    spentToken?: Token,
    spentAmount: string,
    receiveToken?: Token,
    receiveAmount: string,
    currentSpentTokenAmount?: string,
    currentReceiveTokenAmount?: string,
    fee?: string,
}

export type NotifyCallback = ({ callId, result, transaction }: {
    callId: string,
    result: LimitOrderExchangeSuccessCallbackResult,
    transaction?: Transaction<Address>,
}) => void

export type NotifyCallbacks = {
    onTransactionWait: ({ callId }: {callId: string}) => void;
    onTransactionEnded: ({ callId }: {callId: string}) => void;
    onOrderRootCreateSuccess: (...args: any[]) => void;
    onOrderRootCreateReject: ({ callId }: {callId: string}) => void;
    onOrderCreateOrderReject: ({ callId, input, reason }: {callId: string, input?: any, reason?: any}) => void;
    onError: ({ callId, reason }: {callId: string, reason?: any}) => void;
    onOrderCreateOrderSuccess: ({
        callId,
        input,
        transaction,
    }: {
        callId: string,
        input: any,
        transaction?: Transaction<Address>,
    }) => void;
    onOrderCloseSuccess: NotifyCallback;
    onOrderPartExchangeSuccess: NotifyCallback;
    onOrderExchangeFail: ({ callId }: {callId: string}) => void;
    onOrderStateFilled: NotifyCallback;
    onOrderStateCancelled: ({
        callId,
        result,
        transaction,
    }: {
        callId: string,
        result: LimitOrderCancelCallbackResult,
        transaction?: Transaction<Address>,
    }) => void;
}

export type P2PCtorOptions = NotifyCallbacks & {
    defaultLeftTokenAddress?: string;
    defaultRightTokenAddress?: string;
}

export type P2PNotifyStoreData = {
    lastNotifyTransactionId?: string;
}

export type P2PNotifyStoreState = {}

export type PairGraphRequest = {
    from: number;
    timeframe: Timeframe;
    to: number;
}

export type P2PGraphOptions = {
    defaultLeftTokenAddress?: string;
    defaultRightTokenAddress?: string;
}

export type P2PFormOptions = NotifyCallbacks & {
    defaultLeftTokenAddress?: string;
    defaultRightTokenAddress?: string;
}

export type P2POrderListOptions = NotifyCallbacks & {
    defaultLeftTokenAddress?: string;
    defaultRightTokenAddress?: string;
}

export type P2POrderExpectedAmount = {
    amount?: string;
    fee?: string;
}
