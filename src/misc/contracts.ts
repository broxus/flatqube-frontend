import type { Address, Contract, FullContractState } from 'everscale-inpage-provider'

import { useRpc, useStaticRpc } from '@/hooks'
import { DexAbi, EverAbi, TokenAbi } from '@/misc/abi'
import { resolveEverscaleAddress } from '@/utils'

const staticRpc = useStaticRpc()


export async function getFullContractState(address: Address | string): Promise<FullContractState | undefined> {
    try {
        return (await staticRpc.getFullContractState({ address: resolveEverscaleAddress(address) })).state
    }
    catch (e) {
        return undefined
    }
}

export function dexAccountCallbacksContract(
    address: Address | string,
    provider = staticRpc,
): Contract<typeof DexAbi.DexAccountCallbacks> {
    return new provider.Contract(DexAbi.DexAccountCallbacks, resolveEverscaleAddress(address))
}

export function dexAccountContract(
    address: Address | string,
    provider = staticRpc,
): Contract<typeof DexAbi.Account> {
    return new provider.Contract(DexAbi.Account, resolveEverscaleAddress(address))
}

export function dexPairCallbacksContract(
    address: Address | string,
    provider = staticRpc,
): Contract<typeof DexAbi.DexPairCallbacks> {
    return new provider.Contract(DexAbi.DexPairCallbacks, resolveEverscaleAddress(address))
}

export function dexPairContract(
    address: Address | string,
    provider = staticRpc,
): Contract<typeof DexAbi.Pair> {
    return new provider.Contract(DexAbi.Pair, resolveEverscaleAddress(address))
}

export function dexRootContract(
    address: Address | string,
    provider = staticRpc,
): Contract<typeof DexAbi.Root> {
    return new provider.Contract(DexAbi.Root, resolveEverscaleAddress(address))
}

export function dexStablePairContract(
    address: Address | string,
    provider = staticRpc,
): Contract<typeof DexAbi.StablePair> {
    return new provider.Contract(DexAbi.StablePair, resolveEverscaleAddress(address))
}

export function dexStablePoolContract(
    address: Address | string,
    provider = staticRpc,
): Contract<typeof DexAbi.StablePool> {
    return new provider.Contract(DexAbi.StablePool, resolveEverscaleAddress(address))
}

export function dexGasValuesContract(
    address: Address | string,
    provider = staticRpc,
): Contract<typeof DexAbi.DexGasValues> {
    return new provider.Contract(DexAbi.DexGasValues, resolveEverscaleAddress(address))
}

export function swapCallbacksContract(
    address: Address | string,
    provider = staticRpc,
): Contract<typeof DexAbi.SwapCallbacks> {
    return new provider.Contract(DexAbi.SwapCallbacks, resolveEverscaleAddress(address))
}

export function tokenRootContract(
    address: Address | string,
    provider = staticRpc,
): Contract<typeof TokenAbi.Root> {
    return new provider.Contract(TokenAbi.Root, resolveEverscaleAddress(address))
}

export function tokenWalletContract(
    address: Address | string,
    provider = useRpc(),
): Contract<typeof TokenAbi.Wallet> {
    return new provider.Contract(TokenAbi.Wallet, resolveEverscaleAddress(address))
}

export function wrappedCoinVaultContract(
    address: Address | string,
    provider = useRpc(),
): Contract<typeof EverAbi.WeverVault> {
    return new provider.Contract(EverAbi.WeverVault, resolveEverscaleAddress(address))
}
