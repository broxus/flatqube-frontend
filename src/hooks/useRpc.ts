import { ProviderRpcClient } from 'everscale-inpage-provider'

const rpc = new ProviderRpcClient()


export function useRpc(): ProviderRpcClient {
    return rpc
}
