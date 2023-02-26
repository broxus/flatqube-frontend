import type {
    Address,
    DecodedAbiFunctionInputs,
    FullContractState,
    Transaction,
} from 'everscale-inpage-provider'

import {
    CallId,
    DexAbi,
    DexPairOperationCancelled,
    PairType,
    SendMessageCallback,
    TransactionCallbacks,
    TransactionFailureReason,
    TransactionSuccessResult,
} from '@/misc'
import type { TokenCache } from '@/stores/TokensCacheService'


/* Swap Basic types */
export type SwapBill = {
    /** As the left amount */
    amount?: string;
    /** As the right amount */
    expectedAmount?: string;
    fee?: string;
    /** As the minimum received */
    minExpectedAmount?: string | null;
    priceImpact?: string | null;
}

export type SwapPair = {
    address: Address;
    balances?: {
        left: string;
        right: string;
    };
    decimals?: {
        left: number;
        right: number;
    };
    feeParams?: {
        beneficiaryNumerator?: string;
        denominator?: string;
        numerator?: string;
    },
    roots?: {
        left: Address;
        right: Address;
    };
    state?: FullContractState;
    symbols?: {
        left: string;
        right: string;
    };
    type?: PairType;
}

export type SwapRouteStep = {
    actionType: 'Deposit' | 'Swap' | 'Withdraw';
    amount: string;
    expectedAmount: string;
    fee: string;
    minExpectedAmount: string;
    poolAddress: Address;
    poolType: PairType;
    priceImpact: string;
    spentToken: TokenCache;
    receiveToken: TokenCache;
}

export type SwapRoute = {
    leftAmount: string;
    recipientWalletAddress?: Address;
    rightAmount: string;
    slippage: string;
    steps: SwapRouteStep[];
}

export type SwapRouteResult = {
    amount?: string;
    input?: DecodedAbiFunctionInputs<typeof DexAbi.DexPairCallbacks, 'dexPairExchangeSuccess'>,
    status?: 'success' | 'cancel';
    step: SwapRouteStep;
    transaction?: Transaction;
}

export enum SwapDirection {
    LTR = 'ltr',
    RTL = 'rtl',
}

export type SwapSendMessageCallbackParams = CallId & {
    mode: 'swap' | 'wrap' | 'unwrap';
}

export type SwapTransactionReceipt = {
    amount?: string;
    hash?: string;
    isCrossExchangeCanceled?: boolean;
    receivedDecimals?: number;
    receivedIcon?: string;
    receivedRoot?: string;
    receivedSymbol?: string;
    slippage?: string;
    spentAmount?: string;
    spentDecimals?: number;
    spentIcon?: string;
    spentFee?: string;
    spentRoot?: string;
    spentSymbol?: string;
    success?: boolean;
}

export type SwapTransactionSuccessResult<AdditionalParams = {}> = AdditionalParams & CallId & {
    transaction: Transaction;
}

export type SwapTransactionFailureReason = TransactionFailureReason<DexPairOperationCancelled>

export type SwapTransactionCallbacks = SendMessageCallback<SwapSendMessageCallbackParams>
    & TransactionCallbacks<SwapTransactionSuccessResult, SwapTransactionFailureReason | CrossPairTransactionFailureReason>

export type SwapEverToTip3Cancel = DecodedAbiFunctionInputs<typeof DexAbi.SwapCallbacks, 'onSwapEverToTip3Cancel'>

export type SwapEverToTip3Success = DecodedAbiFunctionInputs<typeof DexAbi.SwapCallbacks, 'onSwapEverToTip3Success'>


/* Cross-pair Swap */
export interface CrossPairTransactionFailureReason extends SwapTransactionFailureReason {
    cancelStep?: SwapRouteResult;
    index?: number;
    step?: SwapRouteResult;
}

export type CrossSwapStepResponse = {
    actionType: 'Deposit' | 'Swap' | 'Withdraw';
    currencyAddresses: string[];
    expectedReceiveAmount: string;
    fee: string;
    minimumReceiveAmount: string;
    poolAddress: string;
    poolType: PairType;
    priceImpact: string;
    receiveCurrencyAddress: string;
    spentAmount: string;
    spentCurrencyAddress: string;
}

export type CrossSwapDirection = 'expectedexchange' | 'expectedspendamount'

export type CrossSwapRouteRequest = {
    amount: string;
    deep: number;
    direction: CrossSwapDirection;
    fromCurrencyAddress: string;
    minTvl: string;
    slippage: string;
    toCurrencyAddress: string;
    whiteListCurrencies: string[];
    whiteListUri?: string | null;
}

export type CrossSwapRouteResponse = {
    globalFee: string;
    globalPriceImpact: string;
    steps: CrossSwapStepResponse[];
}

export type NativeInfoType = 'spendonlynative' | 'spendnativeandwrappednative' | 'receivenative'

export type CrossSwapRoutePayloadRequest = {
    crossPairInput: CrossSwapRouteRequest;
    id?: number | null;
    nativeBalance: string;
    nativeInfo?: NativeInfoType | null;
    recipient: string;
    referrer?: string | null;
    tokenBalance: string;
}

export type CrossSwapRoutePayloadResponse = {
    abi: string;
    abiFunction: 'transfer' | 'wrap';
    gas: string;
    id: number;
    payload: string;
    route: CrossSwapRouteResponse;
    walletOfDestination: string;
}

export type CrossSwapStatusRequest = {
    id: number;
    recipient: string;
}

export type CrossSwapStatusResponse = {
    amount: string[];
    status: 'Succeed' | 'Pending' | 'Cancelled';
    tokenRoot: string[];
}


/* Conversion */
export type ConversionTransactionSuccessResult = TransactionSuccessResult<{
    amount: string;
    receivedDecimals?: number;
    receivedIcon?: string;
    receivedRoot?: string;
    receivedSymbol?: string;
}, {
    direction: 'wrap' | 'unwrap';
}>

export type ConversionTransactionFailureResult = TransactionFailureReason<never, {
    direction: 'wrap' | 'unwrap';
}>

export type ConversionTransactionCallbacks = SendMessageCallback<SwapSendMessageCallbackParams>
    & TransactionCallbacks<ConversionTransactionSuccessResult, ConversionTransactionFailureResult>
