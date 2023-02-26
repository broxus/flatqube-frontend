import type {
    Address,
    DecodedAbiFunctionInputs,
    DecodedAbiFunctionOutputs,
    DelayedMessageExecution,
    FullContractState,
    SendInternalParams,
} from 'everscale-inpage-provider'

import { DexAbi } from '@/misc/abi'
import { dexPairContract, getFullContractState } from '@/misc/contracts'
import { DexUtils } from '@/misc/utils/DexUtils'
import { TokenUtils } from '@/misc/utils/TokenUtils'
import { TokenWalletUtils } from '@/misc/utils/TokenWalletUtils'
import {
    debug,
    error,
    getSafeProcessingId,
    resolveEverscaleAddress,
    sliceAddress,
} from '@/utils'


export type DexPairDepositLiquiditySuccess = DecodedAbiFunctionInputs<typeof DexAbi.DexPairCallbacks, 'dexPairDepositLiquiditySuccess'> & {
    type: 'common';
}

export type DexPairDepositLiquiditySuccessV2 = DecodedAbiFunctionInputs<typeof DexAbi.DexPairCallbacks, 'dexPairDepositLiquiditySuccessV2'> & {
    type: 'stable';
}

export type DexPairExchangeSuccess = DecodedAbiFunctionInputs<typeof DexAbi.DexPairCallbacks, 'dexPairExchangeSuccess'>

export type DexPairExchangeSuccessV2 = DecodedAbiFunctionInputs<typeof DexAbi.DexPairCallbacks, 'dexPairExchangeSuccessV2'>

export type DexPairOperationCancelled = DecodedAbiFunctionInputs<typeof DexAbi.DexPairCallbacks, 'dexPairOperationCancelled'>

export type DexPairWithdrawSuccess = DecodedAbiFunctionInputs<typeof DexAbi.DexPairCallbacks, 'dexPairWithdrawSuccess'>

export type DexPairWithdrawSuccessV2 = DecodedAbiFunctionInputs<typeof DexAbi.DexPairCallbacks, 'dexPairWithdrawSuccessV2'>

export type BuildCrossPairExchangePayloadParams = {
    callId?: string | number;
    deployWalletGrams?: string | number;
    expectedAmount: string | number;
    steps: { amount: string | number; root: Address }[];
}

export type BuildExchangePayloadParams = {
    callId?: string | number;
    deployWalletGrams?: string | number;
    expectedAmount: string | number;
}

export type BuildWithdrawLiquidityPayloadParams = {
    callId?: string | number;
    deployWalletGrams?: string | number;
}

export type BuildDepositLiquidityPayloadParams = {
    callId?: string | number;
    deployWalletGrams?: string | number;
}

export type PairExpectedExchangeParams = {
    amount: string;
    spentTokenAddress: Address | string;
}

export type PairExpectedSpendAmountParams = {
    receiveAmount: string;
    receiveTokenAddress: Address | string;
}

export type PairExpectedDepositLiquidityParams = {
    autoChange: boolean;
    leftAmount: string;
    rightAmount: string;
}

export type PairWithdrawLiquidityParams = {
    amount: string;
    callId?: string;
    dexRootState?: FullContractState;
    deployWalletGrams?: string;
    leftRootAddress: Address | string;
    leftRootState?: FullContractState;
    leftRootUserWalletAddress?: Address | string;
    lpRootAddress: Address | string;
    lpRootState?: FullContractState;
    lpPairWalletAddress?: Address | string;
    lpUserWalletAddress?: Address | string;
    pairAddress?: Address | string;
    pairState?: FullContractState;
    rightRootAddress: Address | string;
    rightRootState?: FullContractState;
    rightRootUserWalletAddress?: Address | string;
    userAddress: Address | string;
}

export enum PairType {
    CONSTANT_PRODUCT = '1',
    STABLESWAP = '2',
    STABLEPOOL = '3',
}

export type PairFullDetails = {
    address: Address;
    balances?: PairBalances;
    decimals?: {
        left: number;
        lp?: number;
        right: number;
    };
    feeParams?: {
        beneficiaryNumerator: string;
        denominator: string;
        numerator: string;
    };
    lpState?: FullContractState;
    roots?: {
        left: Address;
        lp?: Address;
        right: Address;
    };
    state?: FullContractState;
    symbols?: {
        left: string;
        lp?: string;
        right: string;
    };
    type?: PairType;
    wallets?: {
        left?: Address;
        lp?: Address;
        right?: Address;
    };
}

export type PairBalances = {
    left: string;
    lpSupply: string;
    right: string;
}

export type PairExpectedExchange = {
    expectedAmount: string;
    expectedFee: string;
}

export type PairFeeParams = {
    beneficiaryAddress: Address | string;
    beneficiaryNumerator: string;
    denominator: string;
    numerator: string;
    threshold: (readonly [Address, string])[];
}

export type PairExpectedSpendAmount = {
    expectedAmount: string;
    expectedFee: string;
}


export abstract class PairUtils {

    /**
     * Withdraw liquidity through LP owner wallet contract
     * @param {Address | string} dexRootAddress
     * @param {PairWithdrawLiquidityParams} params
     * @param {Partial<SendInternalParams>} [args]
     */
    public static async withdrawLiquidity(
        dexRootAddress: Address | string,
        params: PairWithdrawLiquidityParams,
        args?: Partial<SendInternalParams>,
    ): Promise<DelayedMessageExecution> {
        const pairAddress = params.pairAddress ?? await DexUtils.getExpectedPairAddress(
            dexRootAddress,
            params.leftRootAddress,
            params.rightRootAddress,
            params?.dexRootState,
        )
        const lpRootState = params?.lpRootState ?? await getFullContractState(params.lpRootAddress)

        const [lpPairWalletAddress, lpUserWalletAddress] = await Promise.all([
            params.lpPairWalletAddress ?? await TokenWalletUtils.walletAddress({
                tokenRootAddress: params.lpRootAddress,
                walletOwnerAddress: pairAddress,
            }, lpRootState),
            params.lpUserWalletAddress ?? await TokenWalletUtils.walletAddress({
                tokenRootAddress: params.lpRootAddress,
                walletOwnerAddress: params.userAddress,
            }, lpRootState),
        ])
        const [lpPairWalletState, lpOwnerWalletState] = await Promise.allSettled([
            getFullContractState(lpPairWalletAddress),
            getFullContractState(lpUserWalletAddress),
        ]).then(results => results.map(
            result => (result.status === 'fulfilled' ? result.value : undefined),
        ))

        if (!lpPairWalletState?.isDeployed || !lpOwnerWalletState?.isDeployed) {
            throw new Error('LP wallets not exists')
        }

        const [leftRootUserWalletAddress, rightRootUserWalletAddress] = await Promise.all([
            params.leftRootUserWalletAddress ?? await TokenWalletUtils.walletAddress({
                tokenRootAddress: params.leftRootAddress,
                walletOwnerAddress: params.userAddress,
            }, params?.leftRootState),
            params.rightRootUserWalletAddress ?? await TokenWalletUtils.walletAddress({
                tokenRootAddress: params.rightRootAddress,
                walletOwnerAddress: params.userAddress,
            }, params?.rightRootState),
        ])
        const [leftRootUserWalletState, rightRootUserWalletState] = await Promise.allSettled([
            getFullContractState(leftRootUserWalletAddress),
            getFullContractState(rightRootUserWalletAddress),
        ]).then(results => results.map(
            result => (result.status === 'fulfilled' ? result.value : undefined),
        ))

        const allDeployed = leftRootUserWalletState?.isDeployed && rightRootUserWalletState?.isDeployed
        const deployWalletGrams = params.deployWalletGrams == null ? '100000000' : params.deployWalletGrams

        const payload = await PairUtils.buildWithdrawLiquidityPayload(pairAddress, {
            callId: params.callId ?? getSafeProcessingId(),
            deployWalletGrams: allDeployed ? '0' : deployWalletGrams,
        }, params.pairState)

        return TokenWalletUtils.transferToWallet(lpUserWalletAddress, {
            amount: params.amount,
            notify: true,
            payload,
            recipientTokenWallet: lpPairWalletAddress,
            remainingGasTo: resolveEverscaleAddress(params.userAddress),
        }, {
            amount: '2700000000',
            bounce: true,
            from: resolveEverscaleAddress(params.userAddress),
            ...args,
        })
    }

    public static async balances(
        pairAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<PairBalances> {
        return dexPairContract(pairAddress)
            .methods.getBalances({ answerId: 0 })
            .call({ cachedState })
            .then(({ value0 }) => ({
                left: value0.left_balance.toString(),
                lpSupply: value0.lp_supply.toString(),
                right: value0.right_balance.toString(),
            }))
    }

    public static async buildCrossPairExchangePayload(
        pairAddress: Address | string,
        params: BuildCrossPairExchangePayloadParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Pair, 'buildCrossPairExchangePayload'>['value0']> {
        return (await dexPairContract(pairAddress)
            .methods.buildCrossPairExchangePayload({
                deploy_wallet_grams: params.deployWalletGrams ?? 0,
                expected_amount: params.expectedAmount,
                id: params.callId ?? getSafeProcessingId(),
                steps: params.steps,
            })
            .call({ cachedState }))
            .value0
    }

    public static async buildExchangePayload(
        pairAddress: Address | string,
        params: BuildExchangePayloadParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Pair, 'buildExchangePayload'>['value0']> {
        return (await dexPairContract(pairAddress)
            .methods.buildExchangePayload({
                deploy_wallet_grams: params.deployWalletGrams || '0',
                expected_amount: params.expectedAmount,
                id: params.callId ?? getSafeProcessingId(),
            })
            .call({ cachedState }))
            .value0
    }

    public static async buildDepositLiquidityPayload(
        pairAddress: Address | string,
        params: BuildDepositLiquidityPayloadParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Pair, 'buildDepositLiquidityPayload'>['value0']> {
        return (await dexPairContract(pairAddress)
            .methods.buildDepositLiquidityPayload({
                deploy_wallet_grams: params.deployWalletGrams ?? 0,
                id: params.callId ?? getSafeProcessingId(),
            })
            .call({ cachedState }))
            .value0
    }

    public static async buildWithdrawLiquidityPayload(
        pairAddress: Address | string,
        params: BuildWithdrawLiquidityPayloadParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Pair, 'buildWithdrawLiquidityPayload'>['value0']> {
        return (await dexPairContract(pairAddress)
            .methods.buildWithdrawLiquidityPayload({
                deploy_wallet_grams: params.deployWalletGrams || 0,
                id: params.callId ?? getSafeProcessingId(),
            })
            .call({ cachedState }))
            .value0
    }

    public static async check(
        dexRootAddress: Address | string,
        leftRootAddress: Address | string,
        rightRootAddress: Address | string,
        dexRootCachedState?: FullContractState,
    ): Promise<Address | undefined> {
        let pairAddress!: Address,
            pairState: FullContractState | undefined

        try {
            pairAddress = await DexUtils.getExpectedPairAddress(
                dexRootAddress,
                leftRootAddress,
                rightRootAddress,
                dexRootCachedState,
            )
            pairState = await getFullContractState(pairAddress)
        }
        catch (e) {
            error(e)
        }

        if (!pairState?.isDeployed) {
            debug(
                `%cRPC%c Check pair %c${sliceAddress(pairAddress?.toString())}%c =>%c not deployed`,
                'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 0 5px; line-height: 1rem',
                'color: #c5e4f3',
                'color: #bae701',
                'color: #c5e4f3',
                'color: #e55238',
            )

            return undefined
        }

        if (!await PairUtils.isActive(pairAddress, pairState)) {
            debug(
                `%cRPC%c Check pair %c${sliceAddress(pairAddress?.toString())}%c =>%c inactive`,
                'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 0 5px; line-height: 1rem',
                'color: #c5e4f3',
                'color: #bae701',
                'color: #c5e4f3',
                'color: #e55238',
            )

            return undefined
        }

        debug(
            `%cRPC%c Check pair %c${sliceAddress(pairAddress?.toString())}%c =>%c deployed`,
            'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 0 5px; line-height: 1rem',
            'color: #c5e4f3',
            'color: #bae701',
            'color: #c5e4f3',
            'color: #bae701',
        )

        return pairAddress
    }

    public static async expectedDepositLiquidity(
        pairAddress: Address | string,
        params: PairExpectedDepositLiquidityParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Pair, 'expectedDepositLiquidity'>['value0']> {
        return (await dexPairContract(pairAddress)
            .methods.expectedDepositLiquidity({
                answerId: 0,
                auto_change: params.autoChange,
                left_amount: params.leftAmount,
                right_amount: params.rightAmount,
            })
            .call({ cachedState }))
            .value0
    }

    public static async expectedExchange(
        pairAddress: Address | string,
        params: PairExpectedExchangeParams,
        cachedState?: FullContractState,
    ): Promise<PairExpectedExchange> {
        return dexPairContract(pairAddress)
            .methods.expectedExchange({
                amount: params.amount,
                answerId: 0,
                spent_token_root: resolveEverscaleAddress(params.spentTokenAddress),
            })
            .call({ cachedState })
            .then(({ expected_amount, expected_fee }) => ({
                expectedAmount: expected_amount,
                expectedFee: expected_fee,
            }))
    }

    public static async expectedSpendAmount(
        pairAddress: Address | string,
        params: PairExpectedSpendAmountParams,
        cachedState?: FullContractState,
    ): Promise<PairExpectedSpendAmount> {
        return dexPairContract(pairAddress)
            .methods.expectedSpendAmount({
                answerId: 0,
                receive_amount: params.receiveAmount,
                receive_token_root: resolveEverscaleAddress(params.receiveTokenAddress),
            })
            .call({ cachedState })
            .then(({ expected_amount, expected_fee }) => ({
                expectedAmount: expected_amount,
                expectedFee: expected_fee,
            }))
    }

    public static async feeParams(
        pairAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<PairFeeParams> {
        return dexPairContract(pairAddress)
            .methods.getFeeParams({ answerId: 0 })
            .call({ cachedState })
            .then(({ value0 }) => ({
                beneficiaryAddress: value0.beneficiary,
                beneficiaryNumerator: value0.beneficiary_numerator.toString(),
                denominator: value0.denominator.toString(),
                numerator: value0.pool_numerator.toString(),
                threshold: value0.threshold,
            }))
    }

    public static async getDetails(pairAddress: Address | string): Promise<PairFullDetails> {
        const state = await getFullContractState(pairAddress)

        const [
            balances,
            feeParams,
            roots,
            wallets,
            type,
        ] = await Promise.all([
            PairUtils.balances(pairAddress, state),
            PairUtils.feeParams(pairAddress, state),
            PairUtils.roots(pairAddress, state),
            PairUtils.wallets(pairAddress, state),
            PairUtils.type(pairAddress, state),
        ])

        const result: PairFullDetails = {
            address: resolveEverscaleAddress(pairAddress),
            balances,
            feeParams,
            roots,
            state,
            type,
            wallets,
        }

        result.lpState = await getFullContractState(roots.lp)

        const [leftTokenDetails, rightTokenDetails, lpTokenDetails] = await Promise.all([
            TokenUtils.getDetails(roots.left),
            TokenUtils.getDetails(roots.right),
            TokenUtils.getDetails(roots.lp, result.lpState),
        ])

        if (leftTokenDetails?.decimals !== undefined && rightTokenDetails?.decimals !== undefined) {
            result.decimals = {
                left: leftTokenDetails.decimals,
                right: rightTokenDetails.decimals,
            }

            if (lpTokenDetails?.decimals !== undefined) {
                result.decimals = {
                    ...result.decimals,
                    lp: lpTokenDetails.decimals,
                }
            }
        }

        if (leftTokenDetails?.symbol !== undefined && rightTokenDetails?.symbol !== undefined) {
            result.symbols = {
                left: leftTokenDetails.symbol,
                right: rightTokenDetails.symbol,
            }

            if (lpTokenDetails?.symbol !== undefined) {
                result.symbols = {
                    ...result.symbols,
                    lp: lpTokenDetails.symbol,
                }
            }
        }

        return result
    }

    public static async isActive(
        pairAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Pair, 'isActive'>['value0']> {
        return (await dexPairContract(pairAddress)
            .methods.isActive({ answerId: 0 })
            .call({ cachedState }))
            .value0
    }

    public static async roots(
        pairAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Pair, 'getTokenRoots'>> {
        return dexPairContract(pairAddress)
            .methods.getTokenRoots({ answerId: 0 })
            .call({ cachedState })
    }

    public static async wallets(
        pairAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Pair, 'getTokenWallets'>> {
        return dexPairContract(pairAddress)
            .methods.getTokenWallets({ answerId: 0 })
            .call({ cachedState })
    }

    public static async type(
        pairAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<PairType> {
        return (await dexPairContract(pairAddress)
            .methods.getPoolType({ answerId: 0 })
            .call({ cachedState }))
            .value0 as PairType
    }

}
