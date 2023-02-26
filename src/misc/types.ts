import type { Address, DelayedMessageExecution, Transaction } from 'everscale-inpage-provider'

export type EverscaleTokenData = {
    decimals: number;
    name?: string;
    root: string;
    rootOwnerAddress?: Address;
    symbol: string;
    totalSupply?: string;
    wallet?: string;
}

export type CallId = {
    callId: string;
}

export type SendMessageCallbackParams<AdditionalParams = {}> = AdditionalParams & CallId

export interface SendMessageCallback<AdditionalParams = {}> {
    onSend?: (message: DelayedMessageExecution, params: SendMessageCallbackParams<AdditionalParams>) => Promise<void> | void;
}

export interface TransactionCallbacks<Result = any, Reason = any> {
    onTransactionFailure?: (reason: Reason, ...args: any[]) => Promise<void> | void;
    onTransactionSuccess?: (result: Result, ...args: any[]) => Promise<void> | void;
}

export type TransactionSuccessResult<Input = any, AdditionalParams = {}> = AdditionalParams & CallId & {
    input: Input;
    transaction: Transaction;
}

export type TransactionFailureReason<Input = any, AdditionalParams = {}> = AdditionalParams & CallId & {
    input?: Input;
    message?: string;
    transaction?: Transaction;
}
