import { ProviderRpcClient } from 'everscale-inpage-provider'

import { debug } from '@/utils'


let rpc: ProviderRpcClient

export function useRpc(): ProviderRpcClient {
    if (rpc === undefined) {
        debug(
            '%cCreated a new one ProviderRpcClient instance as global connection to the EVER Wallet',
            'color: #bae701',
        )
        rpc = new ProviderRpcClient()
    }
    return rpc
}
