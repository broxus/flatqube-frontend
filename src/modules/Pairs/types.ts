import {
    OhlcvGraphModel,
    Timeframe,
    TvlGraphModel,
    VolumeGraphModel,
} from '@/modules/Chart/types'
import {
    EventType,
    TransactionsInfoResponse,
    TransactionsOrdering,
} from '@/modules/Transactions/types'

export type PairsOrdering =
    | 'tvlascending'
    | 'tvldescending'
    | 'volume24hascending'
    | 'volume24hdescending'
    | 'volume7dascending'
    | 'volume7ddescending'

export type PairInfo = {
    fee7d: string;
    fee24h: string;
    feeAllTime: string;
    leftLocked: string;
    leftPrice: string;
    lpLocked: string;
    meta: PairMeta;
    oneLeftToRight: string | null;
    oneRightToLeft: string | null;
    rightLocked: string;
    rightPrice: string;
    tvl: string;
    tvlChange: string;
    volume7d: string;
    volume24h: string;
    volumeChange24h: string;
}

export type PairMeta = {
    base: string,
    baseAddress: string;
    beneficiaryAddress: string;
    counter: string,
    counterAddress: string;
    fee: string
    feeBeneficiary: string;
    lpAddress: string;
    pairType: 'default' | 'stable';
    poolAddress: string;
}

export type PairsStoreData = {
    pairs: PairInfo[];
    totalCount: number;
}

export type PairsStoreState = {
    currentPage: number;
    isLoading: boolean;
    limit: number;
    ordering: PairsOrdering;
}

export type PairsRequest = {
    currencyAddresses?: string[];
    currencyAddress?: string;
    limit: number;
    offset: number;
    ordering?: PairsOrdering;
    whiteListUri?: string;
}

export type CrossChainKind = 'expectedexchange' | 'expectedspendamount'

export type NewCrossPairsRequest = {
    amount: string;
    deep: number;
    direction: CrossChainKind;
    fromCurrencyAddress: string;
    minTvl: string;
    toCurrencyAddress: string;
    whiteListCurrencies: string[];
    whiteListUri?: string;
}

export type CrossChainPairInfoResponse = {
    leftAddress: string;
    pairAddress: string;
    rightAddress: string;
}

export type NewCrossPairsResponse = {
    currencies: { [currencyAddress: string]: string }[];
    pairs: CrossChainPairInfoResponse[];
}

export type PairResponse = PairInfo

export type PairsResponse = {
    count: number;
    pairs: PairInfo[];
    offset: number;
    totalCount: number;
}

export type PairStoreGraphData = {
    ohlcv: OhlcvGraphModel[] | null;
    tvl: TvlGraphModel[] | null;
    volume: VolumeGraphModel[] | null;
}

export type PairStoreData = {
    graphData: PairStoreGraphData;
    pair: PairInfo | undefined;
    transactionsData: TransactionsInfoResponse;
}

export type PairStoreState = {
    graph: 'ohlcv' | 'ohlcv-inverse' | 'tvl' | 'volume'
    isLoading: boolean;
    isOhlcvGraphLoading: boolean;
    isTransactionsLoading: boolean;
    isTvlGraphLoading: boolean;
    isVolumeGraphLoading: boolean;
    timeframe: Timeframe;
    transactionsCurrentPage: number;
    transactionsEventsType: EventType[];
    transactionsLimit: number;
    transactionsOrdering?: TransactionsOrdering | undefined;
}

export type PairGraphRequest = {
    from: number;
    timeframe: Timeframe;
    to: number;
}
