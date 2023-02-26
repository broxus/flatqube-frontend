import {
    OhlcvGraphModel,
    Timeframe,
    TvlGraphModel,
    VolumeGraphModel,
} from '@/modules/Charts/types'


export enum CurrenciesOrdering {
    TvlAscending= 'tvlascending',
    TvlDescending = 'tvldescending',
}

export type CurrenciesPagination = {
    currentPage: number;
    limit: number;
    totalCount?: number;
    totalPages: number;
}

export type CurrenciesRequest = {
    currencyAddresses?: string[] | null;
    limit: number;
    offset: number;
    ordering?: CurrenciesOrdering;
    whiteListUri?: string;
}

export type CurrencyResponse = {
    address: string;
    currency: string;
    fee24h: string;
    price: string;
    priceChange: string;
    transactionsCount24h: number;
    tvl: string;
    tvlChange: string;
    volume24h: string;
    volume7d: string;
    volumeChange24h: string;
    volumeChange7d: string;
}

export type CurrenciesResponse = {
    count: number;
    currencies: CurrencyResponse[];
    offset: number;
    totalCount: number;
}

export type CurrencyStoreGraphs = {
    prices: OhlcvGraphModel[] | null;
    tvl: TvlGraphModel[] | null;
    volume: VolumeGraphModel[] | null;
}

export type CurrencyGraphRequest = {
    from: number;
    timeframe: Timeframe;
    to: number;
}


export enum CurrencyTransactionEventType {
    Deposit = 'deposit',
    Swap = 'swap',
    Withdraw = 'withdraw',
}

export enum CurrencyTransactionsOrdering {
    BlockTimeAscending = 'blocktimeascending',
    BlockTimeDescending = 'blocktimedescending',
    FromExecAscending = 'fromexecascending',
    FromExecDescending = 'fromexecdescending',
    ToExecAscending = 'toexecascending',
    ToExecDescending = 'toexecdescending',
    TvAscending = 'tvascending',
    TvDescending = 'tvdescending',
}

export type CurrencyTransactionsRequest = {
    createdAtGe?: number | null;
    createdAtLe?: number | null;
    currencyAddress?: string | null;
    currencyAddresses?: string[] | null;
    displayTotalCount?: boolean | null;
    eventType?: CurrencyTransactionEventType[] | null;
    leftAmountGe?: string;
    leftAmountLe?: string;
    limit: number;
    offset: number;
    ordering?: CurrencyTransactionsOrdering | null;
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

export type CurrencyTransactionResponse = {
    beneficiaryAddresses: string[];
    beneficiaryFeeUsdt: string;
    beneficiaryFees: string;
    currencies: string[];
    currencyAddresses: string[];
    eventType: CurrencyTransactionEventType;
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

export type CurrencyTransactionsResponse = {
    count: number;
    offset: number;
    totalCount: number;
    transactions: CurrencyTransactionResponse[];
}
