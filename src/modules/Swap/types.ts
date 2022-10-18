import { Address, Contract, DelayedMessageExecution } from 'everscale-inpage-provider'
import type {
    DecodedAbiFunctionInputs,
    FullContractState,
    Transaction,
} from 'everscale-inpage-provider'

import { DexAbi, PairType } from '@/misc'
import type { TokenSide } from '@/modules/TokensList'
import type { TokenCache } from '@/stores/TokensCacheService'


/* todo: move to global typings */
export type CallId = {
    callId: string;
}

export type SendMessageCallbackParams = CallId & {
    mode: 'swap' | 'wrap' | 'unwrap';
}

export type SendMessageCallback = {
    onSend?: (message: DelayedMessageExecution, params: SendMessageCallbackParams) => Promise<void> | void;
}

export type TransactionCallbacks<T = any, U = any> = SendMessageCallback & {
    onTransactionFailure?: (reason: U) => Promise<void> | void;
    onTransactionSuccess?: (result: T) => Promise<void> | void;
}

export type TransactionSuccessResult<T> = CallId & {
    input: T;
    transaction: Transaction;
}

export type TransactionFailureResult<T> = CallId & {
    input?: T;
    message?: string;
}

export type DexPairExchangeSuccess = DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'dexPairExchangeSuccess'>

export type DexPairOperationCancelled = DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'dexPairOperationCancelled'>


/* Swap Basic types */
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
    ltrPrice?: string;
    pairs: SwapPair[];
    rightAmount: string;
    rtlPrice?: string;
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
    WRAP_COIN = 'wrapCoin',
    UNWRAP_COIN = 'unwrapCoin',
}

export enum SwapDirection {
    LTR = 'ltr',
    RTL = 'rtl',
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

export type SwapEverToTip3Cancel = DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'onSwapEverToTip3Cancel'>

export type SwapEverToTip3Success = DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'onSwapEverToTip3Success'>

export type SwapTip3ToEverCancel = DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'onSwapTip3ToEverCancel'>

export type SwapTip3ToEverSuccess = DecodedAbiFunctionInputs<typeof DexAbi.Callbacks, 'onSwapTip3ToEverSuccess'>


/* Base Swap */
export interface BaseSwapStoreInitialData {
    leftAmount: string;
    leftToken?: string;
    rightAmount: string;
    rightToken?: string;
    slippage: string;
}

export interface BaseSwapStoreData extends BaseSwapStoreInitialData {
    bill: SwapBill;
    ltrPrice?: string;
    pair?: SwapPair;
    rtlPrice?: string;
}

export interface BaseSwapStoreState {
    isCalculating: boolean;
    isLowTvl: boolean;
    isPairChecking: boolean;
    isSwapping: boolean;
}

export type BaseSwapStoreCtorOptions = {
    minTvlValue?: string;
}


/* Direct Swap */
export type DirectSwapStoreInitialData = BaseSwapStoreInitialData

export type DirectSwapStoreData = BaseSwapStoreData

export type DirectTransactionSuccessResult = TransactionSuccessResult<DexPairExchangeSuccess>

export type DirectTransactionFailureResult = TransactionFailureResult<DexPairOperationCancelled>

export type DirectTransactionCallbacks = TransactionCallbacks<DirectTransactionSuccessResult, DirectTransactionFailureResult>

export interface DirectSwapStoreCtorOptions extends BaseSwapStoreCtorOptions {
    callbacks?: DirectTransactionCallbacks;
}


/* Coin Swap */
export type CoinSwapStoreInitialData = DirectSwapStoreInitialData

export type CoinSwapSuccessResult = TransactionSuccessResult<SwapEverToTip3Success | SwapTip3ToEverSuccess>

export type CoinSwapPartialResult = CallId & {
    cancelStep?: SwapRouteResult;
    message?: string;
    index?: number;
    isLastStep?: boolean;
    status: 'partial';
    step?: SwapRouteResult;
}

export type CoinSwapFailureResult = (
    TransactionFailureResult<SwapEverToTip3Cancel | SwapTip3ToEverCancel>
    & { status: 'cancel' }
) | CoinSwapPartialResult


export type CoinSwapTransactionCallbacks = TransactionCallbacks<CoinSwapSuccessResult, CoinSwapFailureResult>

export interface CoinSwapStoreCtorOptions extends BaseSwapStoreCtorOptions {
    callbacks?: CoinSwapTransactionCallbacks;
    coinToTip3Address: Address;
    safeAmount?: string;
    tip3ToCoinAddress: Address;
    wrappedCoinVaultAddress: Address;
}


/* Multi Swap */
export interface MultipleSwapStoreCtorOptions extends CoinSwapStoreCtorOptions {
    comboToTip3Address: Address;
}


/* Cross-pair Swap */
export type CrossPairSwapStoreInitialData = BaseSwapStoreInitialData

export interface CrossPairSwapStoreData extends BaseSwapStoreData {
    bill: SwapBill;
    crossPairs: SwapPair[];
    pair?: SwapPair;
    route?: SwapRoute;
    routes: SwapRoute[];
}

export interface CrossPairSwapStoreState extends BaseSwapStoreState {
    isPreparing: boolean;
}

export interface CrossPairTransactionFailureResult extends DirectTransactionFailureResult {
    cancelStep?: SwapRouteResult;
    index?: number;
    step?: SwapRouteResult;
}

export type CrossPairSwapTransactionCallbacks = TransactionCallbacks<DirectTransactionSuccessResult, CrossPairTransactionFailureResult> & {
    onCoinSwapTransactionSuccess?: (response: CoinSwapSuccessResult) => Promise<void> | void;
    onCoinSwapTransactionFailure?: (reason: CoinSwapFailureResult) => Promise<void> | void;
}

export interface CrossPairSwapCtorOptions extends BaseSwapStoreCtorOptions {
    callbacks?: CrossPairSwapTransactionCallbacks;
    coinToTip3Address: Address;
    comboToTip3Address: Address;
    safeAmount?: string;
    tip3ToCoinAddress: Address;
    wrappedCoinVaultAddress: Address;
}


/* Conversion */
export interface ConversionStoreData {
    amount: string;
    txHash?: string;
    unwrappedAmount?: string;
    wrappedAmount?: string;
}

export type ConversionStoreState = {
    isProcessing: boolean;
}

export type ConversionTransactionSuccessResult = CallId & {
    amount: string;
    direction: 'wrap' | 'unwrap';
    receivedDecimals?: number;
    receivedIcon?: string;
    receivedRoot?: string;
    receivedSymbol?: string;
    txHash: string;
}

export type ConversionTransactionFailureResult = CallId & {
    direction: 'wrap' | 'unwrap';
    message?: string;
}

export type ConversionTransactionCallbacks = SendMessageCallback & {
    onTransactionSuccess?: (response: ConversionTransactionSuccessResult) => void;
    onTransactionFailure?: (reason: ConversionTransactionFailureResult) => void;
}

export interface ConversionStoreCtorOptions extends BaseSwapStoreCtorOptions {
    callbacks?: ConversionTransactionCallbacks;
    safeAmount?: string;
    tokenAddress?: string;
    wrapGas?: string;
    wrappedCoinVaultAddress: Address;
}


/* Form */
export interface SwapFormStoreData extends BaseSwapStoreData {
    pair?: SwapPair;
}

export interface SwapFormStoreState extends BaseSwapStoreState {
    coinSide?: TokenSide;
    direction: SwapDirection;
    exchangeMode: SwapExchangeMode;
    isConfirmationAwait: boolean;
    isMultiple: boolean;
    isPreparing: boolean;
    priceDirection: SwapDirection;
}

export type SwapFormCtorOptions = SendMessageCallback & BaseSwapStoreCtorOptions & {
    coinToTip3Address: Address;
    comboToTip3Address: Address;
    defaultLeftTokenAddress?: string;
    defaultRightTokenAddress?: string;
    multipleSwapTokenRoot?: string;
    safeAmount?: string;
    tip3ToCoinAddress: Address;
    wrapGas?: string;
    wrappedCoinVaultAddress: Address;
    onConversionFailure?: (reason: ConversionTransactionFailureResult) => Promise<void> | void;
    onConversionSuccess?: (result: ConversionTransactionSuccessResult) => Promise<void> | void;
    onCoinSwapFailure?: (reason: CoinSwapFailureResult, receipt: SwapTransactionReceipt) => Promise<void> | void;
    onCoinSwapSuccess?: (result: CoinSwapSuccessResult, receipt: SwapTransactionReceipt) => Promise<void> | void;
    onSwapFailure?: (reason: DirectTransactionFailureResult | CrossPairTransactionFailureResult, receipt: SwapTransactionReceipt) => Promise<void> | void;
    onSwapSuccess?: (result: DirectTransactionSuccessResult, receipt: SwapTransactionReceipt) => Promise<void> | void;
}

export type SwapFormChangesShape = {
    bill: SwapBill;
    leftAmount: string;
    leftToken?: string;
    pair?: SwapPair;
    rightAmount: string;
    rightToken?: string;
    slippage: string;
}
