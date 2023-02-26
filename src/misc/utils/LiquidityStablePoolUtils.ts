import type {
    Address,
    DecodedEvent,
    FullContractState,
    SendInternalParams,
    Transaction,
} from 'everscale-inpage-provider'
import { LT_COLLATOR } from 'everscale-inpage-provider'

import { useStaticRpc } from '@/hooks'
import { DexAbi } from '@/misc/abi'
import { dexAccountContract, dexPairCallbacksContract, getFullContractState } from '@/misc/contracts'
import { DexAccountUtils } from '@/misc/utils/DexAccountUtils'
import {
    StablePoolDepositLiquidityOneCoinParams,
    StablePoolUtils,
    StablePoolWithdrawLiquidityOneCoinParams,
} from '@/misc/utils/StablePoolUtils'
import { TokenWalletUtils } from '@/misc/utils/TokenWalletUtils'
import type {
    DexAccountAddPoolParams,
    DexPairDepositLiquiditySuccessV2,
    DexPairOperationCancelled,
    DexPairWithdrawSuccessV2,
    LiquidityPoolTokenData,
    SendMessageCallback,
    StablePoolWithdrawLiquidityParams,
    TransactionCallbacks,
    TransactionFailureReason,
    TransactionSuccessResult,
} from '@/misc'
import {
    debug,
    error,
    getSafeProcessingId,
    resolveEverscaleAddress,
} from '@/utils'


export type LiquidityStablePoolTokenData = LiquidityPoolTokenData & {
    icon?: string;
    userBalance?: string;
    userWalletAddress?: Address;
}


export type LiquidityStablePoolData = {
    address: Address;
    tokens: LiquidityStablePoolTokenData[]
    lp: LiquidityPoolTokenData & {
        userBalance?: string;
        userWalletAddress?: Address;
    };
    state?: FullContractState;
}

// connect
export type LiquidityStablePoolConnectSuccessResult = {
    pairAddress: Address;
    roots: Address[];
}

export type LiquidityStablePoolConnectCallbacks = SendMessageCallback & TransactionCallbacks<
    TransactionSuccessResult<LiquidityStablePoolConnectSuccessResult>,
    TransactionFailureReason
>

export type LiquidityStablePoolConnectParams = {
    callId?: string;
    dexAccountAddress: Address | string;
    lastLt?: string;
    senderAddress: Address | string;
} & LiquidityStablePoolConnectCallbacks & DexAccountAddPoolParams

// deposit
export type LiquidityStablePoolDepositCallbacks = SendMessageCallback & TransactionCallbacks<
    TransactionSuccessResult<DexPairDepositLiquiditySuccessV2>,
    TransactionFailureReason<DexPairOperationCancelled>
>

export type LiquidityStablePoolDepositParams = {
    callId?: string
    dexAccountAddress: Address | string;
    expected: { amount?: string; root: Address | string; };
    lastLt?: string;
    operations: { amount: string; root: Address | string; }[];
    poolAddress: Address | string;
    poolState?: FullContractState;
    senderAddress: Address | string;
    referrer: Address | string;
    remainingGasTo?: Address | string;
} & LiquidityStablePoolDepositCallbacks

export type LiquidityStablePoolDepositOneCoinParams = {
    lastLt?: string;
} & LiquidityStablePoolDepositCallbacks & StablePoolDepositLiquidityOneCoinParams

// withdraw
export type LiquidityStablePoolWithdrawCallbacks = SendMessageCallback & TransactionCallbacks<
    TransactionSuccessResult<DexPairWithdrawSuccessV2>,
    TransactionFailureReason<DexPairOperationCancelled>
>

export type LiquidityStablePoolWithdrawParams = {
    lastLt?: string;
} & LiquidityStablePoolWithdrawCallbacks & StablePoolWithdrawLiquidityParams

export type LiquidityStablePoolWithdrawOneCoinParams = StablePoolWithdrawLiquidityOneCoinParams
    & LiquidityStablePoolWithdrawParams


const staticRpc = useStaticRpc()


export abstract class LiquidityStablePoolUtils {

    /**
     * Stream-based ...
     * @param params
     * @param args
     */
    public static async connect(
        params: LiquidityStablePoolConnectParams,
        args: Pick<SendInternalParams, 'from'> & Omit<Partial<SendInternalParams>, 'from'>,
    ): Promise<Transaction | undefined> {
        const callId = params.callId ?? getSafeProcessingId()
        const subscriber = new staticRpc.Subscriber()
        let transaction: Transaction | undefined

        try {
            const stream = await subscriber
                .transactions(resolveEverscaleAddress(params.dexAccountAddress))
                .flatMap(item => item.transactions)
                .filter(tx => !params.lastLt || tx.id.lt > params.lastLt)
                .filterMap(async tx => {
                    const event = (await dexAccountContract(params.dexAccountAddress).decodeTransactionEvents({
                        transaction: tx,
                    })).find(e => e.event === 'AddPool')

                    if (event === undefined) {
                        return undefined
                    }

                    const { data } = (event as DecodedEvent<typeof DexAbi.Account, 'AddPool'>)

                    await params.onTransactionSuccess?.({
                        callId,
                        input: {
                            pairAddress: data.pair,
                            roots: data.roots,
                        },
                        transaction: tx,
                    })

                    return event
                })
                .delayed(s => s.first())

            const message = await DexAccountUtils.addPool(params.dexAccountAddress, {
                roots: params.roots,
            }, args)

            await params.onSend?.(message, { callId })

            transaction = await message.transaction

            await stream()

            return transaction
        }
        catch (e: any) {
            if (e.code !== 3) {
                params.onTransactionFailure?.({
                    callId,
                    message: e.message,
                    transaction,
                })
            }
            error('Connecting to Stable Pool has been finished with error: ', e)
            throw e
        }
        finally {
            debug('Unsubscribe from Stable Pool connecting stream')
            await subscriber.unsubscribe()
        }
    }

    public static async depositLiquidity(
        params: LiquidityStablePoolDepositParams,
        args?: Partial<SendInternalParams>,
    ): Promise<Transaction | undefined> {
        const callId = params.callId ?? getSafeProcessingId()
        const subscriber = new staticRpc.Subscriber()
        let transaction: Transaction | undefined

        try {
            const senderAddress = resolveEverscaleAddress(params.senderAddress)

            const stream = await subscriber
                .transactions(resolveEverscaleAddress(senderAddress))
                .flatMap(item => item.transactions)
                .filter(tx => !params.lastLt || LT_COLLATOR.compare(tx.id.lt, params.lastLt) > 0)
                .filterMap(async tx => {
                    const decodedTx = await dexPairCallbacksContract(senderAddress).decodeTransaction({
                        methods: ['dexPairOperationCancelled', 'dexPairDepositLiquiditySuccessV2'],
                        transaction: tx,
                    })

                    const isSameCallId = decodedTx?.input.id.toString() === callId

                    if (decodedTx?.method === 'dexPairOperationCancelled' && isSameCallId) {
                        const reason: TransactionFailureReason<DexPairOperationCancelled> = {
                            callId,
                            input: decodedTx.input,
                            transaction: tx,
                        }
                        debug('dexPairOperationCancelled', reason)
                        await params.onTransactionFailure?.(reason)
                        return reason
                    }

                    if (
                        decodedTx?.method === 'dexPairDepositLiquiditySuccessV2'
                        && isSameCallId
                        && decodedTx.input.via_account
                    ) {
                        const result: TransactionSuccessResult<DexPairDepositLiquiditySuccessV2> = {
                            callId,
                            input: { ...decodedTx.input, type: 'stable' },
                            transaction: tx,
                        }
                        debug('dexPairDepositLiquiditySuccessV2', result)
                        await params.onTransactionSuccess?.(result)
                        return result
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const expectedAmount = params.expected.amount || (await StablePoolUtils.expectedDepositLiquidity(
                params.poolAddress,
                { amounts: params.operations.map(operation => operation.amount) },
                params.poolState,
            )).lp_reward

            const message = await DexAccountUtils.depositLiquidityV2(params.dexAccountAddress, {
                callId,
                expected: { amount: expectedAmount, root: resolveEverscaleAddress(params.expected.root) },
                operations: params.operations.map(operation => ({
                    ...operation,
                    root: resolveEverscaleAddress(operation.root),
                })),
                referrer: params.referrer,
                remainingGasTo: params.remainingGasTo ?? params.senderAddress,
            }, args)

            await params.onSend?.(message, { callId })

            transaction = await message.transaction

            await stream()

            return transaction
        }
        catch (e: any) {
            if (e.code !== 3) {
                params.onTransactionFailure?.({
                    callId,
                    message: e.message,
                    transaction,
                })
            }
            error('Deposit liquidity to Stable Pool has been finished with error: ', e)
            throw e
        }
        finally {
            debug('Unsubscribe from Stable Pool deposit liquidity stream')
            await subscriber.unsubscribe()
        }
    }

    public static async depositLiquidityOneCoin(
        params: LiquidityStablePoolDepositOneCoinParams,
        args?: Partial<SendInternalParams>,
    ): Promise<Transaction | undefined> {
        const callId = params.callId ?? getSafeProcessingId()
        const subscriber = new staticRpc.Subscriber()
        let transaction: Transaction | undefined

        try {
            const stream = await subscriber
                .transactions(resolveEverscaleAddress(params.userAddress))
                .flatMap(item => item.transactions)
                .filter(tx => !params.lastLt || LT_COLLATOR.compare(tx.id.lt, params.lastLt) > 0)
                .filterMap(async tx => {
                    const decodedTx = await dexPairCallbacksContract(params.userAddress).decodeTransaction({
                        methods: ['dexPairOperationCancelled', 'dexPairDepositLiquiditySuccessV2'],
                        transaction: tx,
                    })

                    if (decodedTx?.method === 'dexPairDepositLiquiditySuccessV2' && decodedTx?.input.id.toString() === callId) {
                        const result: TransactionSuccessResult<DexPairDepositLiquiditySuccessV2> = {
                            callId,
                            input: { ...decodedTx.input, type: 'stable' },
                            transaction: tx,
                        }
                        debug('dexPairWithdrawSuccessV2', result)
                        await params.onTransactionSuccess?.(result)
                        return result
                    }

                    if (decodedTx?.method === 'dexPairOperationCancelled' && decodedTx?.input.id.toString() === callId) {
                        const reason: TransactionFailureReason<DexPairOperationCancelled> = {
                            callId,
                            input: decodedTx.input,
                        }
                        debug('dexPairOperationCancelled', reason)
                        await params.onTransactionFailure?.(reason)
                        return reason
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const message = await StablePoolUtils.depositLiquidityOneCoin({
                amount: params.amount,
                callId,
                deployWalletGrams: params.deployWalletGrams,
                lpRootAddress: params.lpRootAddress,
                lpRootState: params.lpRootState,
                lpUserWalletAddress: params.lpUserWalletAddress,
                poolAddress: params.poolAddress,
                poolState: params.poolState,
                referrer: params.referrer,
                roots: params.roots,
                spentTokenAddress: params.spentTokenAddress,
                spentTokenPoolWalletAddress: params.spentTokenPoolWalletAddress,
                spentTokenState: params.spentTokenState,
                spentTokenUserWalletAddress: params.spentTokenUserWalletAddress,
                userAddress: params.userAddress,
            }, args)

            await params.onSend?.(message, { callId })

            transaction = await message.transaction

            await stream()

            return transaction
        }
        catch (e: any) {
            if (e.code !== 3) {
                params.onTransactionFailure?.({
                    callId,
                    message: e.message,
                    transaction,
                })
            }
            error('Withdraw liquidity from Stable Pool has been finished with error: ', e)
            throw e
        }
        finally {
            debug('Unsubscribe from Stable Pool withdraw liquidity stream')
            await subscriber.unsubscribe()
        }
    }

    /**
     * Stream-based method to withdraw pool liquidity
     * @param {LiquidityPoolWithdrawParams} params
     * @param args
     */
    public static async withdrawLiquidity(
        params: LiquidityStablePoolWithdrawParams,
        args?: Partial<SendInternalParams>,
    ): Promise<Transaction | undefined> {
        const callId = params.callId ?? getSafeProcessingId()
        const subscriber = new staticRpc.Subscriber()
        let transaction: Transaction | undefined

        try {
            const stream = await subscriber
                .transactions(resolveEverscaleAddress(params.userAddress))
                .flatMap(item => item.transactions)
                .filter(tx => !params.lastLt || LT_COLLATOR.compare(tx.id.lt, params.lastLt) > 0)
                .filterMap(async tx => {
                    const decodedTx = await dexPairCallbacksContract(params.userAddress).decodeTransaction({
                        methods: ['dexPairOperationCancelled', 'dexPairWithdrawSuccessV2'],
                        transaction: tx,
                    })

                    if (decodedTx?.method === 'dexPairWithdrawSuccessV2' && decodedTx?.input.id.toString() === callId) {
                        const result: TransactionSuccessResult<DexPairWithdrawSuccessV2> = {
                            callId,
                            input: decodedTx.input,
                            transaction: tx,
                        }
                        debug('dexPairWithdrawSuccessV2', result)
                        await params.onTransactionSuccess?.(result)
                        return result
                    }

                    if (decodedTx?.method === 'dexPairOperationCancelled' && decodedTx?.input.id.toString() === callId) {
                        const reason: TransactionFailureReason<DexPairOperationCancelled> = {
                            callId,
                            input: decodedTx.input,
                        }
                        debug('dexPairOperationCancelled', reason)
                        await params.onTransactionFailure?.(reason)
                        return reason
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const message = await StablePoolUtils.withdrawLiquidity({
                amount: params.amount,
                callId,
                deployWalletGrams: params.deployWalletGrams,
                lpPoolWalletAddress: params.lpPoolWalletAddress,
                lpRootAddress: params.lpRootAddress,
                lpRootState: params.lpRootState,
                lpUserWalletAddress: params.lpUserWalletAddress,
                poolAddress: params.poolAddress,
                poolState: params.poolState,
                referrer: params.referrer,
                roots: params.roots,
                userAddress: params.userAddress,
            }, args)

            await params.onSend?.(message, { callId })

            transaction = await message.transaction

            await stream()

            return transaction
        }
        catch (e: any) {
            if (e.code !== 3) {
                params.onTransactionFailure?.({
                    callId,
                    message: e.message,
                    transaction,
                })
            }
            error('Withdraw liquidity from Stable Pool has been finished with error: ', e)
            throw e
        }
        finally {
            debug('Unsubscribe from Stable Pool withdraw liquidity stream')
            await subscriber.unsubscribe()
        }
    }

    /**
     * Stream-based method to withdraw pool liquidity
     * @param {LiquidityPoolWithdrawParams} params
     * @param args
     */
    public static async withdrawLiquidityOneCoin(
        params: LiquidityStablePoolWithdrawOneCoinParams,
        args?: Partial<SendInternalParams>,
    ): Promise<Transaction | undefined> {
        const callId = params.callId ?? getSafeProcessingId()
        const subscriber = new staticRpc.Subscriber()
        let transaction: Transaction | undefined

        try {
            const stream = await subscriber
                .transactions(resolveEverscaleAddress(params.userAddress))
                .flatMap(item => item.transactions)
                .filter(tx => !params.lastLt || LT_COLLATOR.compare(tx.id.lt, params.lastLt) > 0)
                .filterMap(async tx => {
                    const decodedTx = await dexPairCallbacksContract(params.userAddress).decodeTransaction({
                        methods: ['dexPairOperationCancelled', 'dexPairWithdrawSuccessV2'],
                        transaction: tx,
                    })

                    if (decodedTx?.method === 'dexPairWithdrawSuccessV2' && decodedTx?.input.id.toString() === callId) {
                        const result: TransactionSuccessResult<DexPairWithdrawSuccessV2> = {
                            callId,
                            input: decodedTx.input,
                            transaction: tx,
                        }
                        debug('dexPairWithdrawSuccessV2', result)
                        await params.onTransactionSuccess?.(result)
                        return result
                    }

                    if (decodedTx?.method === 'dexPairOperationCancelled' && decodedTx?.input.id.toString() === callId) {
                        const reason: TransactionFailureReason<DexPairOperationCancelled> = {
                            callId,
                            input: decodedTx.input,
                        }
                        debug('dexPairOperationCancelled', reason)
                        await params.onTransactionFailure?.(reason)
                        return reason
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const message = await StablePoolUtils.withdrawLiquidityOneCoin({
                amount: params.amount,
                callId,
                deployWalletGrams: params.deployWalletGrams,
                lpPoolWalletAddress: params.lpPoolWalletAddress,
                lpRootAddress: params.lpRootAddress,
                lpRootState: params.lpRootState,
                lpUserWalletAddress: params.lpUserWalletAddress,
                outcoming: params.outcoming,
                poolAddress: params.poolAddress,
                poolState: params.poolState,
                referrer: params.referrer,
                roots: params.roots,
                userAddress: params.userAddress,
            }, args)

            await params.onSend?.(message, { callId })

            transaction = await message.transaction

            await stream()

            return transaction
        }
        catch (e: any) {
            params.onTransactionFailure?.({
                callId,
                message: e.message,
                transaction,
            })
            error('Withdraw liquidity from Stable Pool has been finished with error: ', e)
            throw e
        }
        finally {
            debug('Unsubscribe from Stable Pool withdraw liquidity stream')
            await subscriber.unsubscribe()
        }
    }

    public static async get(
        address: Address | string,
        walletOwnerAddress?: Address | string,
    ): Promise<LiquidityStablePoolData> {
        const details = await StablePoolUtils.getDetails(address)
        const lpState = details.lpState ?? (
            details.roots?.lp ? await getFullContractState(details.roots.lp) : undefined
        )
        let userWalletAddress: Address | undefined,
            userBalance: string | undefined

        if (details.roots?.lp !== undefined) {
            if (walletOwnerAddress) {
                try {
                    userWalletAddress = await TokenWalletUtils.walletAddress({
                        tokenRootAddress: details.roots.lp,
                        walletOwnerAddress,
                    }, lpState)
                    userBalance = await TokenWalletUtils.balance({
                        tokenWalletAddress: userWalletAddress,
                    })
                }
                catch (e) {
                    //
                }
            }
        }

        if (
            details.roots?.lp === undefined
            || details.roots?.tokens.some(value => value === undefined) === undefined
        ) {
            throw new Error('Some pool roots are not defined')
        }

        const tokens: LiquidityPoolTokenData[] = details.roots.tokens.map((root, idx) => ({
            address: root,
            balance: details.balances?.tokens[idx],
            decimals: details.decimals?.tokens[idx],
            symbol: details.symbols?.tokens[idx],
        }))

        return {
            address: resolveEverscaleAddress(address),
            lp: {
                address: details.roots.lp,
                balance: details.balances?.lpSupply,
                decimals: details.decimals?.lp,
                state: lpState,
                symbol: details.symbols?.lp,
                userBalance,
                userWalletAddress,
                walletAddress: details.wallets?.lp,
            },
            state: details.state,
            tokens,
        }
    }

    public static async pools(
        poolAddresses: (Address | string)[],
        walletOwnerAddress?: Address | string,
    ): Promise<(LiquidityStablePoolData | undefined)[]> {
        return Promise.allSettled(
            poolAddresses.map(
                poolAddress => LiquidityStablePoolUtils.get(poolAddress, walletOwnerAddress),
            ),
        ).then(results => results.map(
            result => (result.status === 'fulfilled' ? result.value : undefined),
        ))
    }

}
