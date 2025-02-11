import { ProviderRpcClient, SparxProviderAdapter } from 'everscale-inpage-provider'

import { useTvmWallet } from '@/hooks/useTvmWallet'

export function useRpc(): ProviderRpcClient {
    const wallet = useTvmWallet()
    return wallet.provider ?? new ProviderRpcClient({
        provider: new SparxProviderAdapter(),
    })
}
