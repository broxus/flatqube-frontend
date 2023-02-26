import type {
    Address,
    DecodedAbiFunctionOutputs,
    DelayedMessageExecution,
    FullContractState,
    SendInternalParams,
} from 'everscale-inpage-provider'

import { useRpc } from '@/hooks'
import { DexAbi } from '@/misc/abi'
import { dexRootContract } from '@/misc/contracts'
import { resolveEverscaleAddress } from '@/utils'


export type DexDeployAccountParams = {
    dexAccountOwnerAddress: Address | string;
    senderAddress?: Address | string;
    sendGasTo?: Address | string;
}

export type DexDeployPairParams = {
    leftRootAddress: Address | string;
    rightRootAddress: Address | string;
    sendGasTo: Address | string;
}

export type DexDeployPoolParams = {
    roots: Address[];
    sendGasTo: Address | string;
}


export abstract class DexUtils {

    /**
     * Sends a delayed message to deploy a DEX Account
     * @param {Address | string} dexRootAddress
     * @param {DexDeployAccountParams} params
     * @param {Partial<SendInternalParams>} [args]
     */
    public static async deployAccount(
        dexRootAddress: Address | string,
        params: DexDeployAccountParams,
        args?: Partial<SendInternalParams>,
    ): Promise<DelayedMessageExecution> {
        const accountOwner = resolveEverscaleAddress(params.dexAccountOwnerAddress)
        const senderAddress = params.senderAddress ? resolveEverscaleAddress(params.senderAddress) : undefined
        const sendGasTo = params.sendGasTo ? resolveEverscaleAddress(params.sendGasTo) : undefined
        return dexRootContract(dexRootAddress, useRpc())
            .methods.deployAccount({
                account_owner: resolveEverscaleAddress(params.dexAccountOwnerAddress),
                send_gas_to: sendGasTo ?? senderAddress ?? accountOwner,
            })
            .sendDelayed({
                amount: '2000000000',
                bounce: false,
                from: senderAddress ?? accountOwner,
                ...args,
            })
    }

    /**
     * Sends a delayed message to deploy a pair
     * @param {Address | string} dexRootAddress
     * @param {DexDeployPairParams} params
     * @param {Partial<SendInternalParams>} [args]
     */
    public static async deployPair(
        dexRootAddress: Address | string,
        params: DexDeployPairParams,
        args?: Partial<SendInternalParams>,
    ): Promise<DelayedMessageExecution> {
        return dexRootContract(dexRootAddress, useRpc())
            .methods.deployPair({
                left_root: resolveEverscaleAddress(params.leftRootAddress),
                right_root: resolveEverscaleAddress(params.rightRootAddress),
                send_gas_to: resolveEverscaleAddress(params.sendGasTo),
            })
            .sendDelayed({
                amount: '15000000000',
                bounce: false,
                from: resolveEverscaleAddress(params.sendGasTo),
                ...args,
            })
    }

    public static async getExpectedAccountAddress(
        dexRootAddress: Address | string,
        dexAccountOwnerAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Root, 'getExpectedAccountAddress'>['value0']> {
        return (await dexRootContract(dexRootAddress)
            .methods.getExpectedAccountAddress({
                account_owner: resolveEverscaleAddress(dexAccountOwnerAddress),
                answerId: 0,
            })
            .call({ cachedState }))
            .value0
    }

    public static async getExpectedPairAddress(
        dexRootAddress: Address | string,
        leftRootAddress: Address | string,
        rightRootAddress: Address | string,
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Root, 'getExpectedPairAddress'>['value0']> {
        return (await dexRootContract(dexRootAddress)
            .methods.getExpectedPairAddress({
                answerId: 0,
                left_root: resolveEverscaleAddress(leftRootAddress),
                right_root: resolveEverscaleAddress(rightRootAddress),
            })
            .call({ cachedState }))
            .value0
    }

    public static async getExpectedPoolAddress(
        dexRootAddress: Address | string,
        roots: (Address | string)[],
        cachedState?: FullContractState,
    ): Promise<DecodedAbiFunctionOutputs<typeof DexAbi.Root, 'getExpectedPoolAddress'>['value0']> {
        return (await dexRootContract(dexRootAddress)
            .methods.getExpectedPoolAddress({
                _roots: roots.map(root => resolveEverscaleAddress(root)),
                answerId: 0,
            })
            .call({ cachedState }))
            .value0
    }

}
