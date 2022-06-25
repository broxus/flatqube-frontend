import { Address, Contract } from 'everscale-inpage-provider'
import type {
    DecodedAbiFunctionInputs,
    FullContractState,
    Transaction,
} from 'everscale-inpage-provider'

import { DexAbi, PairType } from '@/misc'
import type { TokenSide } from '@/modules/TokensList'
import type { TokenCache } from '@/stores/TokensCacheService'
import { WalletNativeCoin } from '@/stores/WalletService'


export type SwapOptions = {
    multipleSwapFee?: string;
    multipleSwapTokenRoot?: string;
    useNativeCoinByDefault?: boolean;
    wrapGas?: string;
}

export type SwapBill = {
    /** As the left amount */
    amount?: string;
    /** As the right amount */
    expectedAmount?: string;
    fee?: string;
    /** As the minimum received */
    minExpectedAmount?: string;
    priceImpact?: string;
}

export type SwapPair = {
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
    amount: string;
    expectedAmount: string;
    fee: string;
    from?: string;
    minExpectedAmount: string;
    pair: SwapPair;
    receiveAddress: Address;
    spentAddress: Address;
    to?: string;
}

export type SwapRoute = {
    bill: SwapBill;
    leftAmount: string;
    pairs: SwapPair[];
    priceLeftToRight?: string;
    priceRightToLeft?: string;
    rightAmount: string;
    slippage: string;
    steps: SwapRouteStep[];
    tokens: TokenCache[];
}

export type SwapRouteResult = {
    amount?: string;
    input?: DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'dexPairExchangeSuccess'>,
    status?: 'success' | 'cancel';
    step: SwapRouteStep;
    transaction?: Transaction;
}

export enum SwapExchangeMode {
    CROSS_PAIR_EXCHANGE = 'crossPair',
    CROSS_PAIR_EXCHANGE_ONLY = 'crossPairOnly',
    DIRECT_EXCHANGE = 'direct',
    WRAP_EVER = 'wrapEver',
    UNWRAP_WEVER = 'unwrapWever',
}

export enum SwapDirection {
    LTR = 'ltr',
    RTL = 'rtl',
}

export interface TransactionCallbacks<T, U> {
    onTransactionSuccess?: (response: T) => Promise<void> | void;
    onTransactionFailure?: (reason: U) => Promise<void> | void;
}

export interface TransactionSuccessResult<T> {
    input: T;
    transaction: Transaction;
}

export interface TransactionFailureResult<T> {
    input?: T;
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
    success: boolean;
}


export interface BaseSwapStoreInitialData {
    leftAmount: string;
    leftToken?: string;
    rightAmount: string;
    rightToken?: string;
    slippage: string;
}

export interface BaseSwapStoreData extends BaseSwapStoreInitialData {
    bill: SwapBill;
    pair?: SwapPair;
    priceLeftToRight?: string;
    priceRightToLeft?: string;
    transaction?: SwapTransactionReceipt | undefined;
}

export interface BaseSwapStoreState {
    isCalculating: boolean;
    isLowTvl: boolean;
    isPairChecking: boolean;
    isSwapping: boolean;
}


export interface DirectSwapStoreInitialData extends BaseSwapStoreInitialData {
    coin: WalletNativeCoin;
}

export interface DirectSwapStoreData extends BaseSwapStoreData {
    coin: WalletNativeCoin;
}

export type DirectTransactionSuccessResult = TransactionSuccessResult<DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'dexPairExchangeSuccess'>>

export type DirectTransactionFailureResult = TransactionFailureResult<DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'dexPairOperationCancelled'>>

export type DirectTransactionCallbacks = TransactionCallbacks<
    DirectTransactionSuccessResult,
    DirectTransactionFailureResult
>


export interface CoinSwapStoreInitialData extends DirectSwapStoreInitialData {
    swapFee?: string;
}

export type CoinSwapSuccessResult =
    TransactionSuccessResult<DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'onSwapEverToTip3Success'>>
    | TransactionSuccessResult<DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'onSwapTip3ToEverSuccess'>>

export type CoinSwapPartialResult = {
    cancelStep?: SwapRouteResult;
    index?: number;
    isLastStep?: boolean;
    step?: SwapRouteResult;
}

export type CoinSwapFailureResult = (
    (TransactionFailureResult<DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'onSwapEverToTip3Cancel'>> & { type?: 'cancel' })
    | (TransactionFailureResult<DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'onSwapTip3ToEverCancel'>> & { type?: 'cancel' })
    | (CoinSwapPartialResult & { type?: 'partial' })
)

export type CoinSwapTransactionCallbacks = TransactionCallbacks<CoinSwapSuccessResult, CoinSwapFailureResult>


export interface CrossPairSwapStoreInitialData extends DirectSwapStoreInitialData {
    swapFee?: string;
}

export interface CrossPairSwapStoreData extends BaseSwapStoreData {
    bill: SwapBill;
    coin: WalletNativeCoin;
    crossPairs: SwapPair[];
    pair?: SwapPair;
    route?: SwapRoute;
    routes: SwapRoute[];
}

export interface CrossPairSwapStoreState extends BaseSwapStoreState {
    isPreparing: boolean;
}

export interface CrossPairSwapFailureResult extends DirectTransactionFailureResult {
    cancelStep?: SwapRouteResult;
    index?: number;
    step?: SwapRouteResult;
}

export type CrossPairSwapTransactionCallbacks = TransactionCallbacks<
    DirectTransactionSuccessResult,
    CrossPairSwapFailureResult
> & {
    onCoinSwapTransactionSuccess?: (response: CoinSwapSuccessResult) => Promise<void> | void;
    onCoinSwapTransactionFailure?: (reason: CoinSwapFailureResult) => Promise<void> | void;
}


export type ConversionStoreInitialData = {
    coin?: WalletNativeCoin;
    safeAmount?: string;
    token?: string;
    wrapGas?: string;
}

export interface ConversionStoreData extends Exclude<ConversionStoreInitialData, 'wrapFee'> {
    amount: string;
    wrappedAmount?: string;
    txHash?: string;
    unwrappedAmount?: string;
}

export type ConversionStoreState = {
    isProcessing: boolean;
}

export type ConversionTransactionResponse = {
    amount: string;
    txHash: string;
}

export type ConversionTransactionCallbacks = {
    onTransactionSuccess?: (response: ConversionTransactionResponse) => void;
    onTransactionFailure?: (reason: unknown) => void;
}


export interface SwapFormStoreData extends BaseSwapStoreData {
    pair?: SwapPair;
}

export interface SwapFormStoreState extends BaseSwapStoreState {
    direction: SwapDirection;
    exchangeMode: SwapExchangeMode;
    isConfirmationAwait: boolean;
    isMultiple: boolean;
    isPreparing: boolean;
    nativeCoinSide?: TokenSide;
    priceDirection: SwapDirection;
}
