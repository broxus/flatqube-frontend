import { ProviderRpcClient } from 'everscale-inpage-provider'
import { EverscaleStandaloneClient } from 'everscale-standalone-client'

import { debug } from '@/utils'


let rpc: ProviderRpcClient

export function useStaticRpc(): ProviderRpcClient {
    if (rpc === undefined) {
        debug(
            '%cCreated a new one ProviderRpcClient instance as a static provider to interacts with contracts',
            'color: #bae701',
        )
        rpc = new ProviderRpcClient({
            fallback: () => EverscaleStandaloneClient.create({
                connection: 'mainnetJrpc',
            }),
            forceUseFallback: true,
        })
    }
    return rpc
}
