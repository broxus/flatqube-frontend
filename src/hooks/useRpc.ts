import {
    EverscaleProviderAdapter,
    ProviderRpcClient,
    SparxProviderAdapter,
} from 'everscale-inpage-provider'
import { getRecentConnectionMeta } from '@broxus/tvm-connect/lib'

import { useTvmWallet } from '@/hooks/useTvmWallet'

export function useRpc(): ProviderRpcClient {
    const meta = getRecentConnectionMeta()
    const wallet = useTvmWallet()
    return wallet.provider ?? new ProviderRpcClient({
        provider: meta?.providerId === 'SparXWallet'
            ? new SparxProviderAdapter()
            : new EverscaleProviderAdapter(),
    })
}
