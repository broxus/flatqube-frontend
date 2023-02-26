import { LT_COLLATOR } from 'everscale-inpage-provider'
import type {
    Address,
    DecodedEvent,
    FullContractState,
    SendInternalParams,
    Transaction,
} from 'everscale-inpage-provider'

import { useStaticRpc } from '@/hooks'
import { DexAbi } from '@/misc/abi'
import {
    dexAccountContract,
    dexPairCallbacksContract,
    dexRootContract,
    getFullContractState,
} from '@/misc/contracts'
import type {
    SendMessageCallback,
    TransactionCallbacks,
    TransactionFailureReason,
    TransactionSuccessResult,
} from '@/misc/types'
import { DexAccountDepositLiquidityParams, DexAccountUtils } from '@/misc/utils/DexAccountUtils'
import type { DexAccountAddPairParams } from '@/misc/utils/DexAccountUtils'
import { DexUtils } from '@/misc/utils/DexUtils'
import type { DexDeployPairParams } from '@/misc/utils/DexUtils'
import {
    DexPairDepositLiquiditySuccess,
    DexPairDepositLiquiditySuccessV2,
    PairType,
    PairUtils,
} from '@/misc/utils/PairUtils'
import type {
    DexPairOperationCancelled,
    DexPairWithdrawSuccess,
    PairWithdrawLiquidityParams,
} from '@/misc/utils/PairUtils'
import { TokenWalletUtils } from '@/misc/utils/TokenWalletUtils'
import {
    addressesComparer,
    debug,
    error,
    getSafeProcessingId,
    resolveEverscaleAddress,
} from '@/utils'


export type LiquidityPoolTokenData = {
    address: Address;
    balance?: string;
    decimals?: number;
    icon?: string;
    state?: FullContractState;
    symbol?: string;
    walletAddress?: Address;
}


export type LiquidityPoolData = {
    address: Address;
    left: LiquidityPoolTokenData;
    lp: LiquidityPoolTokenData & {
        userBalance?: string;
        userWalletAddress?: Address;
    };
    right: LiquidityPoolTokenData;
    type?: PairType;
    state?: FullContractState;
}

// connect
export type LiquidityPoolConnectSuccessResult = {
    leftRootAddress: Address;
    pairAddress: Address;
    rightRootAddress: Address;
}

export type LiquidityPoolConnectCallbacks = SendMessageCallback & TransactionCallbacks<
    TransactionSuccessResult<LiquidityPoolConnectSuccessResult>,
    TransactionFailureReason
>

export type LiquidityPoolConnectParams = {
    callId?: string;
    dexAccountAddress: Address | string;
    lastLt?: string;
    senderAddress: Address | string;
} & LiquidityPoolConnectCallbacks & DexAccountAddPairParams

// create
export type LiquidityPoolCreateSuccessResult = {
    leftRootAddress: Address;
    pairAddress: Address;
    rightRootAddress: Address;
}

export type LiquidityPoolCreateCallbacks = SendMessageCallback & TransactionCallbacks<
    TransactionSuccessResult<LiquidityPoolCreateSuccessResult>,
    TransactionFailureReason
>

export type LiquidityPoolCreateParams = {
    callId?: string;
    dexRootAddress: Address | string;
    expectedAddress?: Address | string;
    lastLt?: string;
} & LiquidityPoolCreateCallbacks & DexDeployPairParams

// deposit
export type LiquidityPoolDepositSuccessResult = DexPairDepositLiquiditySuccess | DexPairDepositLiquiditySuccessV2

export type LiquidityPoolDepositCallbacks = SendMessageCallback & TransactionCallbacks<
    TransactionSuccessResult<LiquidityPoolDepositSuccessResult>,
    TransactionFailureReason<DexPairOperationCancelled>
>

export type LiquidityPoolDepositParams = {
    callId?: string
    dexAccountAddress: Address | string;
    lastLt?: string;
    senderAddress: Address | string;
    sendGasTo?: Address | string;
} & LiquidityPoolDepositCallbacks & Omit<DexAccountDepositLiquidityParams, 'callId' | 'sendGasTo'>

// withdraw
export type LiquidityPoolWithdrawCallbacks = SendMessageCallback & TransactionCallbacks<
    TransactionSuccessResult<DexPairWithdrawSuccess>,
    TransactionFailureReason<DexPairOperationCancelled>
>

export type LiquidityPoolWithdrawParams = {
    dexRootAddress: Address | string;
    lastLt?: string;
} & LiquidityPoolWithdrawCallbacks & PairWithdrawLiquidityParams


const staticRpc = useStaticRpc()


export abstract class LiquidityPoolUtils {

    /**
     * Stream-based method to connect pair with Account
     * @param params
     * @param args
     */
    public static async connect(
        params: LiquidityPoolConnectParams,
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
                            leftRootAddress: data.roots[0],
                            pairAddress: data.pair,
                            rightRootAddress: data.roots[1],
                        },
                        transaction: tx,
                    })

                    return event
                })
                .delayed(s => s.first())

            const message = await DexAccountUtils.addPair(params.dexAccountAddress, {
                leftRootAddress: params.leftRootAddress,
                rightRootAddress: params.rightRootAddress,
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
            error('Connecting to Pair has been finished with error: ', e)
            throw e
        }
        finally {
            debug('Unsubscribe from Pair connecting stream')
            await subscriber.unsubscribe()
        }
    }

    /**
     * Stream-based method to create a new one liquidity pool
     * @param {LiquidityPoolCreateParams} params
     * @param {Partial<SendInternalParams>} args
     */
    public static async create(
        params: LiquidityPoolCreateParams,
        args?: Partial<SendInternalParams>,
    ): Promise<Transaction | undefined> {
        const callId = params.callId ?? getSafeProcessingId()
        let transaction: Transaction | undefined
        const subscriber = new staticRpc.Subscriber()

        try {
            const stream = await subscriber
                .transactions(resolveEverscaleAddress(params.dexRootAddress))
                .flatMap(item => item.transactions)
                .filter(tx => !params.lastLt || LT_COLLATOR.compare(tx.id.lt, params.lastLt) > 0)
                .filterMap(async tx => {
                    const events = await dexRootContract(params.dexRootAddress).decodeTransactionEvents({
                        transaction: tx,
                    })

                    if (events.length === 0) {
                        return undefined
                    }

                    const event = events.find(e => e.event === 'NewPoolCreated')

                    if (event === undefined) {
                        return undefined
                    }

                    const { data } = (event as DecodedEvent<typeof DexAbi.Root, 'NewPoolCreated'>)

                    const address = await PairUtils.check(params.dexRootAddress, data.roots[0], data.roots[1])

                    if (
                        params.expectedAddress !== undefined
                        && address !== undefined
                        && addressesComparer(resolveEverscaleAddress(params.expectedAddress), address)
                    ) {
                        debug('NewPoolCreated', event)

                        await params.onTransactionSuccess?.({
                            callId,
                            input: {
                                leftRootAddress: data.roots[0],
                                pairAddress: address,
                                rightRootAddress: data.roots[1],
                            },
                            transaction: tx,
                        })

                        return event
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const message = await DexUtils.deployPair(params.dexRootAddress, {
                leftRootAddress: params.leftRootAddress,
                rightRootAddress: params.rightRootAddress,
                sendGasTo: params.sendGasTo,
            }, { bounce: true, ...args })

            await params.onSend?.(message, { callId })

            transaction = await message.transaction

            if (params.expectedAddress !== undefined) {
                await stream()
            }

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
            error('Creating Pair has been finished with error: ', e)
            throw e
        }
        finally {
            debug('Unsubscribe from Pair creating stream')
            await subscriber.unsubscribe()
        }
    }

    /**
     * Stream-based method to deposit pool liquidity
     * @param params
     * @param args
     */
    public static async depositLiquidity(
        params: LiquidityPoolDepositParams,
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
                        methods: [
                            'dexPairOperationCancelled',
                            'dexPairDepositLiquiditySuccess',
                            'dexPairDepositLiquiditySuccessV2',
                        ],
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

                    if (
                        decodedTx?.method === 'dexPairDepositLiquiditySuccess'
                        && isSameCallId
                        && decodedTx.input.via_account
                    ) {
                        const result: TransactionSuccessResult<DexPairDepositLiquiditySuccess> = {
                            callId,
                            input: { ...decodedTx.input, type: 'common' },
                            transaction: tx,
                        }
                        debug('dexPairDepositLiquiditySuccess', result)
                        await params.onTransactionSuccess?.(result)
                        return result
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const message = await DexAccountUtils.depositLiquidity(params.dexAccountAddress, {
                autoChange: params.autoChange,
                callId,
                expectedLpAddress: params.expectedLpAddress,
                leftAmount: params.leftAmount,
                leftRootAddress: params.leftRootAddress,
                rightAmount: params.rightAmount,
                rightRootAddress: params.rightRootAddress,
                sendGasTo: params.sendGasTo ?? params.senderAddress,
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
            error('Deposit liquidity to Pair has been finished with error: ', e)
            throw e
        }
        finally {
            debug('Unsubscribe from Pair deposit liquidity stream')
            await subscriber.unsubscribe()
        }
    }

    /**
     * Stream-based method to withdraw pool liquidity
     * @param {LiquidityPoolWithdrawParams} params
     * @param args
     */
    public static async withdrawLiquidity(
        params: LiquidityPoolWithdrawParams,
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
                        methods: ['dexPairOperationCancelled', 'dexPairWithdrawSuccess'],
                        transaction: tx,
                    })

                    if (decodedTx?.method === 'dexPairWithdrawSuccess' && decodedTx?.input.id.toString() === callId) {
                        const result: TransactionSuccessResult<DexPairWithdrawSuccess> = {
                            callId,
                            input: decodedTx.input,
                            transaction: tx,
                        }
                        debug('dexPairWithdrawSuccess', result)
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

            const message = await PairUtils.withdrawLiquidity(params.dexRootAddress, {
                amount: params.amount,
                callId,
                deployWalletGrams: params.deployWalletGrams,
                dexRootState: params.dexRootState,
                leftRootAddress: params.leftRootAddress,
                leftRootState: params.leftRootState,
                leftRootUserWalletAddress: params.leftRootUserWalletAddress,
                lpPairWalletAddress: params.lpPairWalletAddress,
                lpRootAddress: params.lpRootAddress,
                lpRootState: params.lpRootState,
                lpUserWalletAddress: params.lpUserWalletAddress,
                pairAddress: params.pairAddress,
                pairState: params.pairState,
                rightRootAddress: params.rightRootAddress,
                rightRootState: params.rightRootState,
                rightRootUserWalletAddress: params.rightRootUserWalletAddress,
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
            error('Withdraw liquidity from Pair has been finished with error: ', e)
            throw e
        }
        finally {
            debug('Unsubscribe from Pair withdraw liquidity stream')
            await subscriber.unsubscribe()
        }
    }

    public static async get(
        address: Address | string,
        walletOwnerAddress?: Address | string,
    ): Promise<LiquidityPoolData> {
        const details = await PairUtils.getDetails(address)
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
            details.roots?.left === undefined
            || details.roots.lp === undefined
            || details.roots.right === undefined
        ) {
            throw new Error('Some pair roots not defined')
        }

        return {
            address: resolveEverscaleAddress(address),
            left: {
                address: details.roots.left,
                balance: details.balances?.left,
                decimals: details.decimals?.left,
                symbol: details.symbols?.left,
                walletAddress: details.wallets?.left,
            },
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
            right: {
                address: details.roots.right,
                balance: details.balances?.right,
                decimals: details.decimals?.right,
                symbol: details.symbols?.right,
                walletAddress: details.wallets?.right,
            },
            state: details.state,
            type: details.type,
        }
    }

    public static async pools(
        addresses: (Address | string)[],
        walletOwnerAddress?: Address | string,
    ): Promise<(LiquidityPoolData | undefined)[]> {
        return Promise.allSettled(
            addresses.map(
                poolAddress => LiquidityPoolUtils.get(poolAddress, walletOwnerAddress),
            ),
        ).then(results => results.map(
            result => (result.status === 'fulfilled' ? result.value : undefined),
        ))
    }

}
