import type {
    Address,
    DecodedAbiFunctionOutputs,
    DelayedMessageExecution,
    FullContractState,
    SendInternalParams,
} from 'everscale-inpage-provider'

import { DexAbi } from '@/misc/abi'
import { dexStablePoolContract, getFullContractState } from '@/misc/contracts'
import { TokenUtils } from '@/misc/utils/TokenUtils'
import { TokenWalletUtils } from '@/misc/utils/TokenWalletUtils'
import { getSafeProcessingId, isGoodBignumber, resolveEverscaleAddress } from '@/utils'

/* eslint-disable camelcase */

export type StablePoolBuildExchangePayloadParams = {
    callId?: string;
    deployWalletGrams?: string;
    expectedAmount: string;
    outcoming: Address | string;
    recipient: Address | string;
    referrer: Address | string;
}

export type StablePoolBuildDepositLiquidityPayloadParams = {
    callId?: string;
    cancelPayload?: string | null;
    deployWalletGrams?: string;
    expectedAmount: string;
    recipient: Address | string;
    referrer: Address | string;
    successPayload?: string | null;
}

export type StablePoolBuildWithdrawLiquidityPayloadParams = {
    callId?: string;
    cancelPayload?: string | null;
    deployWalletGrams?: string;
    expectedAmounts: (string | number)[];
    recipient: Address | string;
    referrer: Address | string;
    successPayload?: string | null;
}

export type StablePoolBuildWithdrawLiquidityOneCoinPayloadParams = {
    callId?: string;
    cancelPayload?: string | null;
    deployWalletGrams?: string;
    expectedAmount: string | number;
    outcoming: Address | string;
    recipient: Address | string;
    referrer: Address | string;
    successPayload?: string | null;
}

export type StablePoolExpectedDepositLiquidityParams = {
    amounts: string[];
}

export type StablePoolExpectedDepositSpendAmountParams = {
    lpAmount: string | number;
    spentTokenAddress: Address | string;
}

export type StablePoolExpectedDepositLiquidityOneCoinParams = {
    amount: string | number;
    spentTokenAddress: Address | string;
}

export type StablePoolExpectedExchangeParams = {
    amount: string | number;
    spentTokenAddress: Address | string;
    receiveTokenAddress: Address | string;
}

export type StablePoolExpectedWithdrawLiquidityOneCoinParams = {
    amount: string | number;
    outcoming: Address | string;
}

export type StablePoolExpectedOneCoinWithdrawalSpendAmountParams = {
    receiveAmount: string;
    receiveTokenAddress: Address | string;
}

export type StablePoolDepositLiquidityOneCoinParams = {
    amount: string;
    callId?: string;
    deployWalletGrams?: string;
    lpRootAddress: Address | string;
    lpRootState?: FullContractState;
    lpUserWalletAddress?: Address | string;
    poolAddress: Address | string;
    poolState?: FullContractState;
    referrer: Address | string;
    roots: {
        address: Address | string;
        state?: FullContractState;
        userWalletAddress?: Address | string;
    }[];
    spentTokenAddress: Address | string;
    spentTokenPoolWalletAddress?: Address | string;
    spentTokenState?: FullContractState;
    spentTokenUserWalletAddress?: Address | string;
    userAddress: Address | string;
}

export type StablePoolWithdrawLiquidityParams = {
    amount: string;
    callId?: string;
    deployWalletGrams?: string;
    lpRootAddress: Address | string;
    lpRootState?: FullContractState;
    lpPoolWalletAddress?: Address | string;
    lpUserWalletAddress?: Address | string;
    poolAddress: Address | string;
    poolState?: FullContractState;
    referrer: Address | string;
    roots: {
        address: Address | string;
        state?: FullContractState;
        userWalletAddress?: Address | string;
    }[];
    userAddress: Address | string;
}

export type StablePoolWithdrawLiquidityOneCoinParams = {
    outcoming: Address | string;
} & StablePoolWithdrawLiquidityParams

export type StablePoolDepositPriceImpactParams = {
    amount: string | number;
    priceAmount: string | number;
    spentTokenAddress: Address | string;
}

export type StablePoolWithdrawalPriceImpactParams = {
    amount: string | number;
    priceAmount: string | number;
    receiveTokenAddress: Address | string;
}

export type StablePoolFullDetails = {
    address: Address;
    balances?: StablePoolBalances;
    decimals?: {
        lp?: number;
        tokens: (number | undefined)[];
    };
    lpState?: FullContractState;
    roots?: StablePoolRoots;
    state?: FullContractState;
    symbols?: {
        lp?: string;
        tokens: (string | undefined)[];
    };
    wallets?: StablePoolWallets;
}

export type StablePoolBalances = {
    lpSupply: string;
    tokens: string[];
}

export type StablePoolExpectedExchange = {
    expectedAmount: string;
    expectedFee: string;
}

export type StablePoolFeeParams = {
    beneficiaryAddress: Address | string;
    beneficiaryNumerator: string;
    denominator: string;
    numerator: string;
    threshold: (readonly [Address, string])[];
}

export type StablePoolRoots = {
    lp: Address;
    tokens: Address[];
}

export type StablePoolWallets = {
    lp: Address;
    tokens: Address[];
}


export abstract class StablePoolUtils {

    public static async depositLiquidityOneCoin(
        params: StablePoolDepositLiquidityOneCoinParams,
        args?: Partial<SendInternalParams>,
    ): Promise<DelayedMessageExecution> {
        const spentTokenState = params?.spentTokenState ?? await getFullContractState(params.spentTokenAddress)

        const [spentTokenPoolWalletAddress, spentTokenUserWalletAddress, lpUserWalletAddress] = await Promise.all([
            params.spentTokenPoolWalletAddress ?? await TokenWalletUtils.walletAddress({
                tokenRootAddress: params.spentTokenAddress,
                walletOwnerAddress: params.poolAddress,
            }, spentTokenState),
            params.spentTokenUserWalletAddress ?? await TokenWalletUtils.walletAddress({
                tokenRootAddress: params.spentTokenAddress,
                walletOwnerAddress: params.userAddress,
            }, spentTokenState),
            params.lpUserWalletAddress ?? await TokenWalletUtils.walletAddress({
                tokenRootAddress: params.lpRootAddress,
                walletOwnerAddress: params.userAddress,
            }, params.lpRootState),
        ])

        const {
            lp_reward: expectedAmount,
        } = await StablePoolUtils.expectedDepositLiquidityOneCoin(params.poolAddress, {
            amount: params.amount,
            spentTokenAddress: params.spentTokenAddress,
        }, params.poolState)

        if (!isGoodBignumber(expectedAmount)) {
            throw new Error('Can`t calculate expected amount')
        }

        const lpUserWalletState = await getFullContractState(lpUserWalletAddress)
        const deployWalletGrams = params.deployWalletGrams == null ? '100000000' : params.deployWalletGrams

        const payload = await StablePoolUtils.buildDepositLiquidityPayload(params.poolAddress, {
            callId: params.callId ?? getSafeProcessingId(),
            deployWalletGrams: lpUserWalletState?.isDeployed ? '0' : deployWalletGrams,
            expectedAmount,
            recipient: params.userAddress,
            referrer: params.referrer,
        }, params.poolState)

        return TokenWalletUtils.transferToWallet(spentTokenUserWalletAddress, {
            amount: params.amount,
            notify: true,
            payload,
            recipientTokenWallet: spentTokenPoolWalletAddress,
            remainingGasTo: params.userAddress,
        }, {
            amount: '2700000000',
            bounce: true,
            from: resolveEverscaleAddress(params.userAddress),
            ...args,
        })
    }

    public static async withdrawLiquidity(
        params: StablePoolWithdrawLiquidityParams,
        args?: Partial<SendInternalParams>,
    ): Promise<DelayedMessageExecution> {
        const lpRootState = params?.lpRootState ?? await getFullContractState(params.lpRootAddress)

        const [lpPairWalletAddress, lpUserWalletAddress] = await Promise.all([
            params.lpPoolWalletAddress ?? await TokenWalletUtils.walletAddress({
                tokenRootAddress: params.lpRootAddress,
                walletOwnerAddress: params.poolAddress,
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

        const userRootsWallets = await Promise.all(
            params.roots.map(root => root.userWalletAddress ?? TokenWalletUtils.walletAddress({
                tokenRootAddress: root.address,
                walletOwnerAddress: params.userAddress,
            }, root.state)),
        )

        const allDeployed = (await Promise.allSettled(
            userRootsWallets.map(getFullContractState),
        ).then(results => results.map(
            result => (result.status === 'fulfilled' ? result.value : undefined),
        ))).every(state => !!state?.isDeployed)

        const deployWalletGrams = params.deployWalletGrams == null ? '100000000' : params.deployWalletGrams

        const { amounts } = await StablePoolUtils.expectedWithdrawLiquidity(
            params.poolAddress,
            params.amount,
            params.poolState,
        )

        const payload = await StablePoolUtils.buildWithdrawLiquidityPayload(params.poolAddress, {
            callId: params.callId ?? getSafeProcessingId(),
            deployWalletGrams: allDeployed ? '0' : deployWalletGrams,
            expectedAmounts: amounts,
            recipient: params.userAddress,
            referrer: params.referrer,
        }, params.poolState)

        return TokenWalletUtils.transferToWallet(lpUserWalletAddress, {
            amount: params.amount,
            notify: true,
            payload,
            recipientTokenWallet: lpPairWalletAddress,
            remainingGasTo: params.userAddress,
        }, {
            amount: '2700000000',
            bounce: true,
            from: resolveEverscaleAddress(params.userAddress),
            ...args,
        })
    }

    public static async withdrawLiquidityOneCoin(
        params: StablePoolWithdrawLiquidityOneCoinParams,
        args?: Partial<SendInternalParams>,
    ): Promise<DelayedMessageExecution> {
        const lpRootState = params?.lpRootState ?? await getFullContractState(params.lpRootAddress)

        const [lpPairWalletAddress, lpUserWalletAddress] = await Promise.all([
            params.lpPoolWalletAddress ?? await TokenWalletUtils.walletAddress({
                tokenRootAddress: params.lpRootAddress,
                walletOwnerAddress: params.poolAddress,
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

        const userRootsWallets = await Promise.all(
            params.roots.map(root => root.userWalletAddress ?? TokenWalletUtils.walletAddress({
                tokenRootAddress: root.address,
                walletOwnerAddress: params.userAddress,
            }, root.state)),
        )

        const allDeployed = (await Promise.allSettled(
            userRootsWallets.map(getFullContractState),
        ).then(results => results.map(
            result => (result.status === 'fulfilled' ? result.value : undefined),
        ))).every(state => !!state?.isDeployed)

        const deployWalletGrams = params.deployWalletGrams == null ? '100000000' : params.deployWalletGrams

        const idx = params.roots.findIndex(
            token => token.address.toString().toLowerCase() === params.outcoming.toString().toLowerCase(),
        )

        if (idx < 0) {
            throw new Error('Can`t find outcoming token')
        }

        const { amounts } = await StablePoolUtils.expectedWithdrawLiquidityOneCoin(params.poolAddress, {
            amount: params.amount,
            outcoming: params.outcoming,
        }, params.poolState)

        const expectedAmount = amounts[idx]

        if (!isGoodBignumber(expectedAmount)) {
            throw new Error('Can`t calculate expected amount')
        }

        const payload = await StablePoolUtils.buildWithdrawLiquidityOneCoinPayload(params.poolAddress, {
            callId: params.callId ?? getSafeProcessingId(),
            deployWalletGrams: allDeployed ? '0' : deployWalletGrams,
            expectedAmount,
            outcoming: params.outcoming,
            recipient: params.userAddress,
            referrer: params.referrer,
        }, params.poolState)

        return TokenWalletUtils.transferToWallet(lpUserWalletAddress, {
            amount: params.amount,
            notify: true,
            payload,
            recipientTokenWallet: lpPairWalletAddress,
            remainingGasTo: params.userAddress,
        }, {
            amount: '2700000000',
            bounce: true,
            from: resolveEverscaleAddress(params.userAddress),
            ...args,
        })
    }

    public static async balances(
        poolAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<StablePoolBalances> {
        return dexStablePoolContract(poolAddress)
            .methods.getBalances({ answerId: 0 })
            .call({ cachedState })
            .then(({ value0 }) => ({
                lpSupply: value0.lp_supply,
                tokens: value0.balances,
            }))
    }

    public static async buildExchangePayload(
        poolAddress: Address | string,
        params: StablePoolBuildExchangePayloadParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'buildExchangePayload'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.buildExchangePayload({
                cancel_payload: null,
                deploy_wallet_grams: params.deployWalletGrams || '0',
                expected_amount: params.expectedAmount,
                id: params.callId ?? getSafeProcessingId(),
                outcoming: resolveEverscaleAddress(params.outcoming),
                recipient: resolveEverscaleAddress(params.recipient),
                referrer: resolveEverscaleAddress(params.referrer),
                success_payload: null,
            })
            .call({ cachedState }))
            .value0
    }

    public static async buildDepositLiquidityPayload(
        poolAddress: Address | string,
        params: StablePoolBuildDepositLiquidityPayloadParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'buildDepositLiquidityPayload'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.buildDepositLiquidityPayload({
                cancel_payload: params.cancelPayload ?? null,
                deploy_wallet_grams: params.deployWalletGrams || '0',
                expected_amount: params.expectedAmount,
                id: params.callId ?? getSafeProcessingId(),
                recipient: resolveEverscaleAddress(params.recipient),
                referrer: resolveEverscaleAddress(params.referrer),
                success_payload: params.successPayload ?? null,
            })
            .call({ cachedState }))
            .value0
    }

    public static async buildWithdrawLiquidityPayload(
        poolAddress: Address | string,
        params: StablePoolBuildWithdrawLiquidityPayloadParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'buildWithdrawLiquidityPayload'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.buildWithdrawLiquidityPayload({
                cancel_payload: params.cancelPayload ?? null,
                deploy_wallet_grams: params.deployWalletGrams || '0',
                expected_amounts: params.expectedAmounts,
                id: params.callId ?? getSafeProcessingId(),
                recipient: resolveEverscaleAddress(params.recipient),
                referrer: resolveEverscaleAddress(params.referrer),
                success_payload: params.successPayload ?? null,
            })
            .call({ cachedState }))
            .value0
    }

    public static async buildWithdrawLiquidityOneCoinPayload(
        poolAddress: Address | string,
        params: StablePoolBuildWithdrawLiquidityOneCoinPayloadParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'buildWithdrawLiquidityOneCoinPayload'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.buildWithdrawLiquidityOneCoinPayload({
                cancel_payload: params.cancelPayload ?? null,
                deploy_wallet_grams: params.deployWalletGrams || '0',
                expected_amount: params.expectedAmount,
                id: params.callId ?? getSafeProcessingId(),
                outcoming: resolveEverscaleAddress(params.outcoming),
                recipient: resolveEverscaleAddress(params.recipient),
                referrer: resolveEverscaleAddress(params.referrer),
                success_payload: params.successPayload ?? null,
            })
            .call({ cachedState }))
            .value0
    }

    public static async expectedDepositLiquidity(
        poolAddress: Address | string,
        params: StablePoolExpectedDepositLiquidityParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'expectedDepositLiquidityV2'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.expectedDepositLiquidityV2({
                amounts: params.amounts,
                answerId: 0,
            })
            .call({ cachedState }))
            .value0
    }

    public static async expectedDepositLiquidityOneCoin(
        poolAddress: Address | string,
        params: StablePoolExpectedDepositLiquidityOneCoinParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'expectedDepositLiquidityOneCoin'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.expectedDepositLiquidityOneCoin({
                amount: params.amount,
                answerId: 0,
                spent_token_root: resolveEverscaleAddress(params.spentTokenAddress),
            })
            .call({ cachedState }))
            .value0
    }

    public static async expectedDepositSpendAmount(
        poolAddress: Address | string,
        params: StablePoolExpectedDepositSpendAmountParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'expectedDepositSpendAmount'>> {
        return dexStablePoolContract(poolAddress)
            .methods.expectedDepositSpendAmount({
                answerId: 0,
                lp_amount: params.lpAmount,
                spent_token_root: resolveEverscaleAddress(params.spentTokenAddress),
            })
            .call({ cachedState })
    }

    public static async expectedExchange(
        poolAddress: Address | string,
        params: StablePoolExpectedExchangeParams,
        cachedState?: FullContractState,
    ): Promise<StablePoolExpectedExchange> {
        return dexStablePoolContract(poolAddress)
            .methods.expectedExchange({
                amount: params.amount,
                answerId: 0,
                receive_token_root: resolveEverscaleAddress(params.receiveTokenAddress),
                spent_token_root: resolveEverscaleAddress(params.spentTokenAddress),
            })
            .call({ cachedState })
            .then(({ expected_amount, expected_fee }) => ({
                expectedAmount: expected_amount,
                expectedFee: expected_fee,
            }))
    }

    public static async expectedOneCoinWithdrawalSpendAmount(
        poolAddress: Address | string,
        params: StablePoolExpectedOneCoinWithdrawalSpendAmountParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'expectedOneCoinWithdrawalSpendAmount'>> {
        return dexStablePoolContract(poolAddress)
            .methods.expectedOneCoinWithdrawalSpendAmount({
                answerId: 0,
                receive_amount: params.receiveAmount,
                receive_token_root: resolveEverscaleAddress(params.receiveTokenAddress),
            })
            .call({ cachedState })
    }

    public static async expectedWithdrawLiquidity(
        poolAddress: Address | string,
        amount: string | number,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'expectedWithdrawLiquidity'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.expectedWithdrawLiquidity({
                answerId: 0,
                lp_amount: amount,
            })
            .call({ cachedState }))
            .value0
    }

    public static async expectedWithdrawLiquidityOneCoin(
        poolAddress: Address | string,
        params: StablePoolExpectedWithdrawLiquidityOneCoinParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'expectedWithdrawLiquidityOneCoin'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.expectedWithdrawLiquidityOneCoin({
                answerId: 0,
                lp_amount: params.amount,
                outcoming: resolveEverscaleAddress(params.outcoming),
            })
            .call({ cachedState }))
            .value0
    }

    public static async getDepositPriceImpact(
        poolAddress: Address | string,
        params: StablePoolDepositPriceImpactParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'getDepositPriceImpact'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.getDepositPriceImpact({
                amount: params.amount,
                price_amount: params.priceAmount,
                spent_token_root: resolveEverscaleAddress(params.spentTokenAddress),
            })
            .call({ cachedState }))
            .value0
    }

    public static async getWithdrawalPriceImpact(
        poolAddress: Address | string,
        params: StablePoolWithdrawalPriceImpactParams,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'getWithdrawalPriceImpact'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.getWithdrawalPriceImpact({
                amount: params.amount,
                price_amount: params.priceAmount,
                receive_token_root: resolveEverscaleAddress(params.receiveTokenAddress),
            })
            .call({ cachedState }))
            .value0
    }

    public static async feeParams(
        poolAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<StablePoolFeeParams> {
        return dexStablePoolContract(poolAddress)
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

    public static async getDetails(poolAddress: Address | string): Promise<StablePoolFullDetails> {
        const state = await getFullContractState(poolAddress)
        const [
            balances,
            roots,
            wallets,
        ] = await Promise.all([
            StablePoolUtils.balances(poolAddress, state),
            StablePoolUtils.roots(poolAddress, state),
            StablePoolUtils.wallets(poolAddress, state),
        ])

        const result: StablePoolFullDetails = {
            address: resolveEverscaleAddress(poolAddress),
            balances,
            roots,
            state,
            wallets,
        }

        const lpState = await getFullContractState(roots.lp)

        const [lpDetails, tokensDetails] = await Promise.all([
            TokenUtils.getDetails(roots.lp, lpState),
            Promise.all(roots.tokens.map(address => TokenUtils.getDetails(address))),
        ])

        result.decimals = {
            lp: lpDetails?.decimals,
            tokens: [],
        }

        result.symbols = {
            lp: lpDetails?.symbol,
            tokens: [],
        }

        tokensDetails.forEach(token => {
            result.decimals?.tokens.push(token?.decimals)
            result.symbols?.tokens.push(token?.symbol)
        })

        return result
    }

    public static async isActive(
        poolAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.StablePool, 'isActive'>['value0']> {
        return (await dexStablePoolContract(poolAddress)
            .methods.isActive({ answerId: 0 })
            .call({ cachedState }))
            .value0
    }

    public static async roots(
        poolAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<StablePoolRoots> {
        return dexStablePoolContract(poolAddress)
            .methods.getTokenRoots({ answerId: 0 })
            .call({ cachedState })
            .then(({ lp, roots }) => ({
                lp,
                tokens: roots,
            }))
    }

    public static async wallets(
        poolAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<StablePoolWallets> {
        return dexStablePoolContract(poolAddress)
            .methods.getTokenWallets({ answerId: 0 })
            .call({ cachedState })
            .then(({ lp, token_wallets }) => ({
                lp,
                tokens: token_wallets,
            }))
    }


}
