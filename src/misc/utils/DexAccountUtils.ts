import type {
    Address,
    DecodedAbiFunctionOutputs,
    DecodedEvent,
    DelayedMessageExecution,
    FullContractState,
    SendInternalParams,
    Transaction,
} from 'everscale-inpage-provider'
import { LT_COLLATOR } from 'everscale-inpage-provider'

import { useRpc, useStaticRpc } from '@/hooks'
import { DexAbi } from '@/misc/abi'
import { dexAccountContract, getFullContractState } from '@/misc/contracts'
import type {
    SendMessageCallback,
    TransactionCallbacks,
    TransactionFailureReason,
    TransactionSuccessResult,
} from '@/misc/types'
import { DexUtils } from '@/misc/utils/DexUtils'
import { TokenWalletUtils } from '@/misc/utils/TokenWalletUtils'
import type { TokenWalletTransferToWalletParams } from '@/misc/utils/TokenWalletUtils'
import {
    addressesComparer,
    debug,
    getSafeProcessingId,
    resolveEverscaleAddress,
} from '@/utils'

export type DexAccountAddPairParams = {
    leftRootAddress: Address | string;
    rightRootAddress: Address | string;
}

export type DexAccountAddPoolParams = {
    roots: Address[];
}


export type DexAccountDepositLiquidityParams = {
    autoChange: boolean;
    callId: string;
    expectedLpAddress: Address | string;
    leftAmount: string;
    leftRootAddress: Address | string;
    rightAmount: string;
    rightRootAddress: Address | string;
    sendGasTo: Address | string;
}

export type DexAccountDepositLiquidityV2Params = {
    callId: string;
    expected: { amount: string; root: Address; };
    operations: { amount: string; root: Address; }[];
    referrer: Address | string;
    remainingGasTo: Address | string;
}


export type DexAccountDepositTokenSendCallbackParams = {
    amount?: string;
    tokenAddress?: Address;
}

export type DexAccountDepositTokenSuccessResult = {
    amount: string;
    balance: string;
    tokenAddress: Address;
}

export type DexAccountDepositTokenCallbacks = TransactionCallbacks<
    TransactionSuccessResult<DexAccountDepositTokenSuccessResult>,
    TransactionFailureReason
> & SendMessageCallback<DexAccountDepositTokenSendCallbackParams>

export type DexAccountDepositTokenParams = {
    callId?: string;
    lastLt?: string;
    senderAddress?: Address | string;
    senderTokenWalletAddress?: Address | string;
    tokenAddress?: Address | string;
} & DexAccountDepositTokenCallbacks & TokenWalletTransferToWalletParams


export type DexAccountWithdrawParams = {
    amount: string;
    callId: string;
    deployWalletGrams?: string;
    recipientAddress: Address | string;
    sendGasTo: Address | string;
    tokenAddress: Address | string;
}

export type DexAccountWithdrawTokenSendCallbackParams = {
    amount: string;
    tokenAddress: Address;
}

export type DexAccountWithdrawTokenSuccessResult = {
    amount: string;
    balance: string;
    tokenAddress: Address;
}

export type DexAccountWithdrawTokenCallbacks = TransactionCallbacks<
    TransactionSuccessResult<DexAccountWithdrawTokenSuccessResult>,
    TransactionFailureReason
> & SendMessageCallback<DexAccountWithdrawTokenSendCallbackParams>

export type DexAccountWithdrawTokenParams = {
    callId?: string;
    lastLt?: string;
} & DexAccountWithdrawTokenCallbacks & Omit<DexAccountWithdrawParams, 'callId'>


export type DexAccountWithdrawLiquidityParams = {
    amount: string;
    callId: string;
    leftRootAddress: Address | string;
    lpRootAddress: Address | string;
    rightRootAddress: Address | string;
    sendGasTo: Address | string;
}


const staticRpc = useStaticRpc()


export abstract class DexAccountUtils {

    /**
     * Sends a delayed message to add a pair to the Account
     * @param {Address | string} dexAccountAddress
     * @param {DexAccountAddPairParams} params
     * @param {Pick<SendInternalParams, 'from'> & Omit<Partial<SendInternalParams>, 'from'>} args
     */
    public static async addPair(
        dexAccountAddress: Address | string,
        params: DexAccountAddPairParams,
        args: Pick<SendInternalParams, 'from'> & Omit<Partial<SendInternalParams>, 'from'>,
    ): Promise<DelayedMessageExecution> {
        return dexAccountContract(dexAccountAddress, useRpc())
            .methods.addPair({
                left_root: resolveEverscaleAddress(params.leftRootAddress),
                right_root: resolveEverscaleAddress(params.rightRootAddress),
            })
            .sendDelayed({
                amount: '3000000000',
                bounce: false,
                ...args,
            })
    }

    /**
     * Sends a delayed message to add a pool to the Account
     * @param {Address | string} dexAccountAddress
     * @param {DexAccountAddPoolParams} params
     * @param {Pick<SendInternalParams, 'from'> & Omit<Partial<SendInternalParams>, 'from'>} args
     */
    public static async addPool(
        dexAccountAddress: Address | string,
        params: DexAccountAddPoolParams,
        args: Pick<SendInternalParams, 'from'> & Omit<Partial<SendInternalParams>, 'from'>,
    ): Promise<DelayedMessageExecution> {
        return dexAccountContract(dexAccountAddress, useRpc())
            .methods.addPool({
                _roots: params.roots,
            })
            .sendDelayed({
                amount: '3000000000',
                bounce: false,
                ...args,
            })
    }

    /**
     * Sends a delayed message to deposit liquidity into a pair via the Account
     * @param {Address | string} dexAccountAddress
     * @param {DexAccountDepositLiquidityParams} params
     * @param {Partial<SendInternalParams>} [args]
     */
    public static async depositLiquidity(
        dexAccountAddress: Address | string,
        params: DexAccountDepositLiquidityParams,
        args?: Partial<SendInternalParams>,
    ): Promise<DelayedMessageExecution> {
        return dexAccountContract(dexAccountAddress, useRpc())
            .methods.depositLiquidity({
                auto_change: params.autoChange,
                call_id: params.callId,
                expected_lp_root: resolveEverscaleAddress(params.expectedLpAddress),
                left_amount: params.leftAmount,
                left_root: resolveEverscaleAddress(params.leftRootAddress),
                right_amount: params.rightAmount,
                right_root: resolveEverscaleAddress(params.rightRootAddress),
                send_gas_to: resolveEverscaleAddress(params.sendGasTo),
            })
            .sendDelayed({
                amount: '2600000000',
                bounce: false,
                from: resolveEverscaleAddress(params.sendGasTo),
                ...args,
            })
    }

    /**
     * Sends a delayed message to deposit liquidity into a stable pool via the Account
     * @param {Address | string} dexAccountAddress
     * @param {DexAccountDepositLiquidityParams} params
     * @param {Partial<SendInternalParams>} [args]
     */
    public static async depositLiquidityV2(
        dexAccountAddress: Address | string,
        params: DexAccountDepositLiquidityV2Params,
        args?: Partial<SendInternalParams>,
    ): Promise<DelayedMessageExecution> {
        return dexAccountContract(dexAccountAddress, useRpc())
            .methods.depositLiquidityV2({
                _autoChange: true,
                _callId: params.callId,
                _expected: params.expected,
                _operations: params.operations,
                _referrer: resolveEverscaleAddress(params.referrer),
                _remainingGasTo: resolveEverscaleAddress(params.remainingGasTo),
            })
            .sendDelayed({
                amount: '2600000000',
                bounce: false,
                from: resolveEverscaleAddress(params.remainingGasTo),
                ...args,
            })
    }

    /**
     * Sends a delayed message to withdraw token from the Account
     * @param {Address | string} dexAccountAddress
     * @param {DexAccountWithdrawParams} params
     * @param {Partial<SendInternalParams>} [args]
     */
    public static async withdraw(
        dexAccountAddress: Address | string,
        params: DexAccountWithdrawParams,
        args?: Partial<SendInternalParams>,
    ): Promise<DelayedMessageExecution> {
        return dexAccountContract(dexAccountAddress, useRpc())
            .methods.withdraw({
                amount: params.amount,
                call_id: params.callId,
                deploy_wallet_grams: params.deployWalletGrams ?? '100000000',
                recipient_address: resolveEverscaleAddress(params.recipientAddress),
                send_gas_to: resolveEverscaleAddress(params.sendGasTo),
                token_root: resolveEverscaleAddress(params.tokenAddress),
            })
            .sendDelayed({
                amount: '2100000000',
                bounce: false,
                from: resolveEverscaleAddress(params.sendGasTo),
                ...args,
            })
    }

    /**
     * Sends a delayed message to withdraw liquidity (LP tokens) from the Account
     * @param {Address | string} dexAccountAddress
     * @param {DexAccountWithdrawLiquidityParams} params
     * @param {Partial<SendInternalParams>} [args]
     */
    public static async withdrawLiquidity(
        dexAccountAddress: Address | string,
        params: DexAccountWithdrawLiquidityParams,
        args?: Partial<SendInternalParams>,
    ): Promise<DelayedMessageExecution> {
        return dexAccountContract(dexAccountAddress, useRpc())
            .methods.withdrawLiquidity({
                call_id: params.callId,
                left_root: resolveEverscaleAddress(params.leftRootAddress),
                lp_amount: params.amount,
                lp_root: resolveEverscaleAddress(params.lpRootAddress),
                right_root: resolveEverscaleAddress(params.rightRootAddress),
                send_gas_to: resolveEverscaleAddress(params.sendGasTo),
            })
            .sendDelayed({
                amount: '2700000000',
                bounce: false,
                from: resolveEverscaleAddress(params.sendGasTo),
                ...args,
            })
    }

    /**
     * Stream-based token deposit
     * @param dexAccountAddress
     * @param params
     * @param args
     */
    public static async depositToken(
        dexAccountAddress: Address | string,
        params: DexAccountDepositTokenParams,
        args?: Partial<SendInternalParams>,
    ): Promise<Transaction | undefined> {
        const callId = params.callId ?? getSafeProcessingId()
        let transaction: Transaction | undefined
        const subscriber = new staticRpc.Subscriber()

        const senderTokenWalletAddress = params.senderTokenWalletAddress ?? (
            params.senderAddress !== undefined
            && params.tokenAddress !== undefined
                ? await TokenWalletUtils.walletAddress({
                    tokenRootAddress: params.tokenAddress,
                    walletOwnerAddress: params.senderAddress,
                })
                : undefined)

        if (senderTokenWalletAddress === undefined) {
            throw new Error('Sender Token Wallet Address not specified.')
        }

        try {
            const stream = await subscriber
                .transactions(resolveEverscaleAddress(dexAccountAddress))
                .flatMap(item => item.transactions)
                .filter(tx => !params.lastLt || LT_COLLATOR.compare(tx.id.lt, params.lastLt) > 0)
                .filterMap(async tx => {
                    const event = (await dexAccountContract(dexAccountAddress).decodeTransactionEvents({
                        transaction: tx,
                    })).find(e => e.event === 'TokensReceived')

                    if (event === undefined) {
                        return undefined
                    }

                    const { data } = (event as DecodedEvent<typeof DexAbi.Account, 'TokensReceived'>)

                    const isSameSender = senderTokenWalletAddress !== undefined && addressesComparer(
                        data.sender_wallet,
                        resolveEverscaleAddress(senderTokenWalletAddress),
                    )
                    const isSameToken = params.tokenAddress !== undefined && addressesComparer(
                        data.token_root,
                        resolveEverscaleAddress(params.tokenAddress),
                    )

                    if (isSameToken || isSameSender) {
                        debug('TokensReceived', event, params)

                        await params.onTransactionSuccess?.({
                            callId,
                            input: {
                                amount: data.tokens_amount,
                                balance: data.balance,
                                tokenAddress: data.token_root,
                            },
                            transaction: tx,
                        })

                        return event
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const message = await TokenWalletUtils.transferToWallet(senderTokenWalletAddress, {
                amount: params.amount,
                recipientTokenWallet: params.recipientTokenWallet,
                remainingGasTo: params.remainingGasTo,
            }, { amount: '1500000000', ...args })

            await params.onSend?.(message, {
                amount: params.amount,
                callId,
                tokenAddress: params.tokenAddress ? resolveEverscaleAddress(params.tokenAddress) : undefined,
            })

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
            throw e
        }
        finally {
            debug('Unsubscribe')
            await subscriber.unsubscribe()
        }
    }

    /**
     * Stream-based token withdraw
     * @param dexAccountAddress
     * @param params
     * @param args
     */
    public static async withdrawToken(
        dexAccountAddress: Address | string,
        params: DexAccountWithdrawTokenParams,
        args?: Partial<SendInternalParams>,
    ): Promise<Transaction | undefined> {
        const callId = params.callId ?? getSafeProcessingId()
        let transaction: Transaction | undefined
        const subscriber = new staticRpc.Subscriber()

        try {
            const stream = await subscriber
                .transactions(resolveEverscaleAddress(dexAccountAddress))
                .flatMap(item => item.transactions)
                .filter(tx => !params.lastLt || LT_COLLATOR.compare(tx.id.lt, params.lastLt) > 0)
                .filterMap(async tx => {
                    const event = (await dexAccountContract(dexAccountAddress).decodeTransactionEvents({
                        transaction: tx,
                    })).find(e => e.event === 'WithdrawTokens')

                    if (event === undefined) {
                        return undefined
                    }

                    const { data } = (event as DecodedEvent<typeof DexAbi.Account, 'WithdrawTokens'>)

                    if (addressesComparer(data.root, resolveEverscaleAddress(params.tokenAddress))) {
                        debug('WithdrawTokens', event)

                        await params.onTransactionSuccess?.({
                            callId,
                            input: {
                                amount: data.amount,
                                balance: data.balance,
                                tokenAddress: data.root,
                            },
                            transaction: tx,
                        })

                        return event
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const message = await DexAccountUtils.withdraw(dexAccountAddress, {
                amount: params.amount,
                callId,
                recipientAddress: params.recipientAddress,
                sendGasTo: params.sendGasTo,
                tokenAddress: params.tokenAddress,
            }, args)

            await params.onSend?.(message, {
                amount: params.amount,
                callId,
                tokenAddress: resolveEverscaleAddress(params.tokenAddress),
            })

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
            throw e
        }
        finally {
            debug('Unsubscribe')
            await subscriber.unsubscribe()
        }
    }

    public static async address(
        dexRootAddress: Address | string,
        dexAccountOwnerAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Root, 'getExpectedAccountAddress'>['value0'] | undefined> {
        const dexAccountAddress = await DexUtils.getExpectedAccountAddress(
            dexRootAddress,
            dexAccountOwnerAddress,
            cachedState,
        )

        if (!dexAccountAddress) {
            return undefined
        }

        const state = await getFullContractState(dexAccountAddress)

        if (!state?.isDeployed) {
            return undefined
        }

        try {
            await DexAccountUtils.version(dexAccountAddress, state)
            return dexAccountAddress
        }
        catch (e) {
            return undefined
        }
    }

    public static async balance(
        dexAccountAddress: Address | string,
        tokenAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Account, 'getWalletData'>['balance']> {
        return (await dexAccountContract(dexAccountAddress)
            .methods.getWalletData({
                answerId: 0,
                token_root: resolveEverscaleAddress(tokenAddress),
            })
            .call({ cachedState }))
            .balance
    }

    public static async balances(
        dexAccountAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<Map<string, string>> {
        return (await dexAccountContract(dexAccountAddress)
            .methods.getBalances({})
            .call({ cachedState }))
            .value0
            .reduce(
                (acc, [address, balance]) => acc.set(address.toString(), balance.toString()),
                new Map<string, string>(),
            )
    }

    public static async version(
        dexAccountAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Account, 'getVersion'>['value0']> {
        return (await dexAccountContract(dexAccountAddress)
            .methods.getVersion({ answerId: 0 })
            .call({ cachedState }))
            .value0
    }

    public static async wallets(
        dexAccountAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<Map<string, Address>> {
        return (await dexAccountContract(dexAccountAddress)
            .methods.getWallets({})
            .call({ cachedState }))
            .value0
            .reduce(
                (acc, wallet) => acc.set(wallet[0].toString().toLowerCase(), wallet[1]),
                new Map<string, Address>(),
            )
    }

}
