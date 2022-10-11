import type { DelayedMessageExecution, Transaction } from 'everscale-inpage-provider'

export type CallId = {
    callId: string;
}

export type SendMessageCallbackParams<P = {}> = CallId & P

export type SendMessageCallbackHandler<P = {}> = (message: DelayedMessageExecution, params: SendMessageCallbackParams<P>) => Promise<void> | void;

export type SendMessageCallback<P = {}> = {
    onSend?: SendMessageCallbackHandler<P>;
}

export type TransactionCallbacks<T = any, U = any> = {
    onTransactionFailure?: (reason: U) => Promise<void> | void;
    onTransactionSuccess?: (result: T) => Promise<void> | void;
}

export type TransactionSuccessResult<T = any> = CallId & {
    input: T;
    transaction: Transaction;
}

export type TransactionFailureReason<T = any> = CallId & {
    input?: T;
    message?: string;
    transaction?: Transaction;
}


export type AverageLockTimeUnits = {
    days: number;
    hours: number;
    minutes: number;
    months: number;
    years: number;
}

export type Direction = 'ASC' | 'DESC'

export type QubeDaoPagination = {
    currentPage: number;
    limit: number;
    totalCount: number;
    totalPages: number;
}


export type QubeDaoMainPageResponse = {
    averageLockTime: number;
    totalAmount: string;
    totalVeAmount: string;
}


export type QubeDaoBalanceColumn = 'createdAt'

export type QubeDaoBalanceOrdering = {
    column: QubeDaoBalanceColumn;
    direction: Direction;
}

export type QubeDaoBalancesRequest = {
    amountGe?: string | null;
    amountLe?: string | null;
    limit: number;
    offset: number;
    ordering?: QubeDaoBalanceOrdering | null;
    userAddress?: string | null;
    veAmountGe?: string | null;
    veAmountLe?: string | null;
}

export type QubeDaoBalanceResponse = {
    amount: string;
    createdAt: number;
    updatedAt: number;
    userAddress: string;
    veAmount: string;
}

export type QubeDaoBalancesResponse = {
    balances: QubeDaoBalanceResponse[];
    totalCount: number;
}


export type QubeDaoBalancesStatsColumn = 'day'

export type QubeDaoBalancesStatsOrdering = {
    column: QubeDaoBalancesStatsColumn;
    direction: Direction;
}

export type QubeDaoBalancesStatsRequest = {
    dayGe?: number | null;
    dayLe?: number | null;
    limit: number;
    offset: number;
    ordering?: QubeDaoBalancesStatsOrdering | null;
}

export type QubeDaoBalanceStatResponse = {
    amount: string;
    day: number;
    veAmount: string;
}

export type QubeDaoBalancesStatsResponse = {
    balances: QubeDaoBalanceStatResponse[];
    totalCount: number;
}


export type QubeDaoDepositColumn = 'createdAt' | 'lockTime' | 'amount' | 'veAmount'

export type QubeDaoDepositsOrdering = {
    column: QubeDaoDepositColumn;
    direction: Direction;
}

export type QubeDaoDepositsRequest = {
    isLocked?: boolean | null;
    key?: number | null;
    limit: number;
    offset: number;
    ordering?: QubeDaoDepositsOrdering | null;
    user?: string | null;
}

export type QubeDaoDepositResponse = {
    amount: string;
    callId: number;
    createdAt: number;
    isLocked: boolean;
    key: number;
    lockTime: number;
    transactionHash: string;
    transactionTime: number;
    user: string;
    veAmount: string;
}

export type QubeDaoDepositsResponse = {
    deposits: QubeDaoDepositResponse[];
    totalCount: number
}


export type QubeDaoDepositsStatsColumn = 'day'

export type QubeDaoDepositsStatsOrdering = {
    column: QubeDaoDepositsStatsColumn;
    direction: Direction;
}

export type QubeDaoDepositsStatsRequest = {
    dayGe?: number | null;
    dayLe?: number | null;
    limit: number;
    offset: number;
    ordering?: QubeDaoDepositsStatsOrdering | null;
}

export type QubeDaoDepositStatResponse = {
    averageLockTime: number;
    day: number;
}

export type QubeDaoDepositsStatsResponse = {
    deposits: QubeDaoDepositStatResponse[];
    totalCount: number;
}


export type QubeDaoEpochColumn = 'createdAt'

export type QubeDaoEpochsOrdering = {
    column: QubeDaoEpochColumn;
    direction: Direction;
}

export type QubeDaoEpochsRequest = {
    epochNum?: number | null;
    epochStartGe?: number | null;
    epochStartLe?: number | null;
    limit: number;
    offset: number;
    ordering?: QubeDaoEpochsOrdering | null;
}

export type QubeDaoEpochResponse = {
    createdAt: number;
    epochEnd: number;
    epochNum: number;
    epochStart: number;
    totalDistribution: string;
    totalVeAmount: string;
    transactionTime: number;
    updatedAt: number;
    voteEnd: number | null;
    voteStart: number | null;
}

export type QubeDaoEpochsResponse = {
    epochs: QubeDaoEpochResponse[];
    totalCount: number;
}


export type QubeDaoEpochDistributionColumn = 'createdAt'

export type QubeDaoEpochDistributionsOrdering = {
    column: QubeDaoEpochDistributionColumn;
    direction: Direction;
}

export type QubeDaoEpochDistributionsRequest = {
    epochNum?: number | null;
    gauge?: string | null;
    ordering?: QubeDaoEpochDistributionsOrdering | null;
}

export type QubeDaoEpochDistributionResponse = {
    amount: string;
    createdAt: number;
    epochNum: number;
    gauge: string;
}

export type QubeDaoEpochDistributionsResponse = {
    epochDistributions: QubeDaoEpochDistributionResponse[];
    totalCount: number;
}


export type QubeDaoEpochVoteColumn = 'createdAt'

export type QubeDaoEpochVotesOrdering = {
    column: QubeDaoEpochVoteColumn;
    direction: Direction;
}

export type QubeDaoEpochVotesRequest = {
    epochNum?: number | null;
    gauge?: string | null;
    limit: number;
    offset: number;
    ordering?: QubeDaoEpochVotesOrdering | null;
    userAddress?: string | null;
}

export type QubeDaoEpochVoteResponse = {
    createdAt: number;
    epochNum: number;
    gauge: string;
    transactionTime: number;
    userAddress: string;
    veAmount: string;
}

export type QubeDaoEpochVotesResponse = {
    epochVotes: QubeDaoEpochVoteResponse[];
    totalCount: number;
}

export type QubeDaoEpochVotesSumResponse = {
    gauge: string;
    totalAmount: string;
}


export type QubeDaoGaugeColumn = 'createdAt'

export type QubeDaoGaugesOrdering = {
    column: QubeDaoGaugeColumn;
    direction: Direction;
}

export type QubeDaoGaugesRequest = {
    gaugeAddress?: string | null;
    isActive?: boolean | null;
    limit: number;
    offset: number;
    ordering?: QubeDaoGaugesOrdering | null;
}

export type QubeDaoGaugeResponse = {
    amount: string;
    createdAt: number;
    epochNum: number;
    gauge: string;
}

export type QubeDaoGaugesResponse = {
    gauges: QubeDaoGaugeResponse[];
    totalCount: number;
}

export type GaugeItemPoolTokenInfo = {
    amount: string;
    tokenRoot: string;
    tokenSymbol: string;
}

export type GaugeItemRewardTokenInfo = {
    tokenRoot: string;
    tokenSymbol: string;
}

export type GaugeItem = {
    address: string;
    depositTokenRoot: string;
    endTime: number;
    maxApr: string;
    maxAprChange: string;
    minApr: string;
    minAprChange: string;
    poolTokens: GaugeItemPoolTokenInfo[];
    rewardTokens: GaugeItemRewardTokenInfo[];
    startTime: number;
    tvl: string;
    tvlChange: string;
}

export type QubeDaoGaugeBatchRequest = {
    gauges: string[];
}

export type GaugeBatchResponse = {
    gauges: GaugeItem[];
}


export type QubeDaoTransactionColumn = 'createdAt' | 'amount' | 'veAmount'

export type QubeDaoTransactionKind = 'Lock' | 'Unlock' | 'Burn'

export type QubeDaoTransactionsOrdering = {
    column: QubeDaoTransactionColumn;
    direction: Direction;
}

export type QubeDaoTransactionsRequest = {
    kind?: QubeDaoTransactionKind | null;
    limit: number;
    offset: number;
    ordering?: QubeDaoTransactionsOrdering | null;
    transactionTimeGe?: number | null;
    transactionTimeLe?: number | null;
    userAddress?: string;
}

export type QubeDaoTransactionResponse = {
    amount: string;
    createdAt: number;
    kind: QubeDaoTransactionKind | null;
    transactionHash: string;
    transactionTime: number;
    userAddress: string;
    veAmount: string;
}

export type QubeDaoTransactionsResponse = {
    totalCount: number;
    transactions: QubeDaoTransactionResponse[];
}
