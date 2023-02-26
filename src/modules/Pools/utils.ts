import { Address, Contract } from 'everscale-inpage-provider'

import { useStaticRpc } from '@/hooks/useStaticRpc'
import { GaugeAbi } from '@/misc'

export function gaugeContract(
    address: Address,
    provider = useStaticRpc(),
): Contract<typeof GaugeAbi.Root> {
    return new provider.Contract(GaugeAbi.Root, address)
}

export function gaugeAccountContract(
    address: Address,
    provider = useStaticRpc(),
): Contract<typeof GaugeAbi.Account> {
    return new provider.Contract(GaugeAbi.Account, address)
}

