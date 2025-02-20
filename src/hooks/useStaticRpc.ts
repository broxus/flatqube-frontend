import { StandaloneClientAdapter } from '@broxus/js-core'
import { ProviderRpcClient } from 'everscale-inpage-provider'

import { debug } from '@/utils'


let rpc: ProviderRpcClient

export function useStaticRpc(): ProviderRpcClient {
    if (rpc === undefined) {
        debug(
            '%cCreated a new one ProviderRpcClient instance as a static provider to interacts with contracts',
            'color: #bae701',
        )
        rpc = new ProviderRpcClient({
            provider: new StandaloneClientAdapter({
                connection: {
                    data: {
                        endpoint: 'https://jrpc.everwallet.net',
                    },
                    id: 42,
                    type: process.env.NODE_ENV === 'production' ? 'proto' : 'jrpc',
                },
            }),
        })
    }
    return rpc
}
