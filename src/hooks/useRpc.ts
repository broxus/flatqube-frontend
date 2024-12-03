import { ProviderRpcClient, EverscaleProviderAdapter, SparxProviderAdapter } from 'everscale-inpage-provider'

import { debug } from '@/utils'

let rpc: ProviderRpcClient

export function useRpc(): ProviderRpcClient {
    if (rpc === undefined) {
        debug(
            '%cCreated a new one ProviderRpcClient instance as global connection to the EVER Wallet',
            'color: #bae701',
        )
        const isSparx = window.navigator.userAgent.includes('SparXWalletBrowser')
        rpc = new ProviderRpcClient({
            provider: isSparx
                ? new SparxProviderAdapter()
                : new EverscaleProviderAdapter(),
        })
    }
    return rpc
}
