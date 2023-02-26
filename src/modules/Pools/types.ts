import type {
    DexPairDepositLiquiditySuccessV2,
    LiquidityPoolDepositCallbacks,
    LiquidityStablePoolData,
    TransactionSuccessResult,
} from '@/misc'
import type { OhlcvData, Timeframe } from '@/modules/Charts/types'
import type { CommonTokenTransactionReceipt } from '@/modules/Liqudity/types'


export type StablePoolData = LiquidityStablePoolData

export enum PoolsOrdering {
    TvlAscending = 'tvlascending',
    TvlDescending = 'tvldescending',
    Volume24hAscending = 'volume24hascending',
    Volume24hDescending = 'volume24hdescending',
    Volume7dAscending = 'volume7dascending',
    Volume7dDescending = 'volume7ddescending',
}

export type PoolResponse = {
    fee24h: string;
    fee7d: string;
    feeAllTime: string;
    lpLocked: string;
    meta: PoolMeta;
    prices: string[];
    stableOneSwap: string[];
    tvl: string;
    tvlChange: string;
    volume24h: string;
    volume24hChange: string;
    volume7d: string;
    volumesLocked: string[];
}

export type PoolMeta = {
    beneficiaryAddress: string;
    currencies: string[];
    currencyAddresses: string[];
    fee: string
    feeBeneficiary: string;
    lpAddress: string;
    pairType: 'default' | 'stable';
    poolAddress: string;
}

export type PoolsRequest = {
    currencyAddress?: string | null;
    currencyAddresses?: string[] | null;
    favoritePools?: string[] | null;
    limit: number;
    offset: number;
    ordering?: PoolsOrdering | null;
    tvlAmountGe?: string | null;
    tvlAmountLe?: string | null;
    whiteListUri?: string | null;
}

export type PoolsResponse = {
    count: number;
    pools: PoolResponse[];
    offset: number;
    totalCount: number;
}

export type PoolsPagination = {
    currentPage: number;
    limit: number;
    totalCount?: number;
    totalPages: number;
}


export type PoolRelatedGaugesRequest = {
    lpAddress: string;
}

export type PoolGaugeItemPoolTokenInfo = {
    amount: string;
    tokenRoot: string;
    tokenSymbol: string;
}

export type PoolGaugeItemRewardTokenInfo = {
    lockedReward?: string;
    tokenRoot: string;
    tokenSymbol: string;
    unlockedReward?: string;
}

export type GaugeItem = {
    address: string;
    depositTokenRoot: string;
    endTime: number | null;
    isSyncing?: boolean
    maxApr: string;
    maxAprChange: string;
    minApr: string;
    minAprChange: string;
    poolTokens: PoolGaugeItemPoolTokenInfo[];
    rewardTokens: PoolGaugeItemRewardTokenInfo[];
    startTime: number | null;
    tvl: string;
    tvlChange: string;
    userLpLocked?: string;
    userShare?: string;
}

export type PoolRelatedGaugesResponse = {
    gauges: GaugeItem[];
}


export type OhlcvBar = {
    close: string;
    countTransactions: number;
    currencyVolumes: string[];
    high: string;
    low: string;
    open: string;
    timestamp: number;
    tvl: string;
    usdtVolume: string;
}

export type OhlcvBarData = OhlcvData & {
    currencyVolumes: string[];
    tvl: number;
    usdtVolume: string;
}

export enum OhlcvKind {
    Tvl = 'Tvl',
    Price = 'Price',
    Volume = 'Volume'
}

export type PoolGraphRequest = {
    firstCurrencyAddress?: string | null;
    from: number;
    ohlcvKind: OhlcvKind;
    poolAddress: string;
    secondCurrencyAddress?: string | null;
    timeframe: Timeframe;
    to: number;
}

export type PoolGraphResponse = OhlcvBar[]


export enum PoolTransactionEventType {
    Deposit = 'deposit',
    Swap = 'swap',
    Withdraw = 'withdraw',
}

export enum PoolTransactionsOrdering {
    BlockTimeAscending = 'blocktimeascending',
    BlockTimeDescending = 'blocktimedescending',
    FromExecAscending = 'fromexecascending',
    FromExecDescending = 'fromexecdescending',
    ToExecAscending = 'toexecascending',
    ToExecDescending = 'toexecdescending',
    TvAscending = 'tvascending',
    TvDescending = 'tvdescending',
}

export type PoolTransactionsRequest = {
    createdAtGe?: number | null;
    createdAtLe?: number | null;
    currencyAddress?: string | null;
    currencyAddresses?: string[] | null;
    displayTotalCount?: boolean | null;
    eventType?: PoolTransactionEventType[] | null;
    leftAmountGe?: string;
    leftAmountLe?: string;
    limit: number;
    offset: number;
    ordering?: PoolTransactionsOrdering | null;
    poolAddress?: string | null;
    rightAmountGe?: string;
    rightAmountLe?: string;
    timestampBlockGe?: number | null;
    timestampBlockLe?: number | null;
    tvGe?: number | null;
    tvLe?: number | null;
    userAddress?: string | null;
    whiteListUri?: string | null;
}

export type PoolTransactionResponse = {
    beneficiaryAddresses: string[];
    beneficiaryFeeUsdt: string;
    beneficiaryFees: string;
    currencies: string[];
    currencyAddresses: string[];
    eventType: PoolTransactionEventType;
    feeCurrencies: string[];
    feeCurrencyAddresses: string[];
    feeUsdt: string;
    fees: string;
    lp: string;
    lpAddress: string;
    lpVolume: string;
    messageHash: string;
    poolAddress: string;
    timestampBlock: number,
    transactionHash: string;
    tv: string;
    userAddress: string;
    volumes: string;
}

export type PoolTransactionsResponse = {
    count: number;
    offset: number;
    totalCount: number;
    transactions: PoolTransactionResponse[];
}


export type DepositLiquidityCallbacks = Pick<LiquidityPoolDepositCallbacks, 'onSend' | 'onTransactionFailure'> & {
    onTransactionSuccess?: (
        result: TransactionSuccessResult<DexPairDepositLiquiditySuccessV2>,
        receipt?: CommonTokenTransactionReceipt
    ) => Promise<void> | void;
}
