import { ProviderRpcClient, StaticProviderAdapter } from 'everscale-inpage-provider'
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
            provider: new StaticProviderAdapter(
                EverscaleStandaloneClient.create({
                    connection: 'mainnetJrpc',
                }),
            ),
        })
    }
    return rpc
}
