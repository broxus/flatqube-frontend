import { ProviderRpcClient } from 'everscale-inpage-provider'
import { EverscaleStandaloneClient, checkConnection } from 'everscale-standalone-client'
import { ConnectionProperties } from 'everscale-standalone-client/client/ConnectionController'

import { debug } from '@/utils'


const MAINNET_JRPC: ConnectionProperties = 'mainnetJrpc'
const MAINNET_GQL: ConnectionProperties = {
    data: {
        endpoints: [
            'https://mainnet.evercloud.dev/89a3b8f46a484f2ea3bdd364ddaee3a3/graphql',
        ],
    },
    id: 42,
    type: 'graphql',
}

let rpc: ProviderRpcClient

export function useStaticRpc(): ProviderRpcClient {
    if (rpc === undefined) {
        debug(
            '%cCreated a new one ProviderRpcClient instance as a static provider to interacts with contracts',
            'color: #bae701',
        )
        rpc = new ProviderRpcClient({
            fallback: () => checkConnection('mainnetJrpc')
                .then(() => MAINNET_JRPC)
                .catch(() => MAINNET_GQL)
                .then(props => EverscaleStandaloneClient.create(
                    { connection: props },
                )),
            forceUseFallback: true,
        })
    }
    return rpc
}
