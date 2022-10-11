import { Address, Contract } from 'everscale-inpage-provider'

import { useStaticRpc } from '@/hooks/useStaticRpc'
import { VoteEscrowAbi } from '@/misc'

export function voteEscrowContract(
    address: Address,
    provider = useStaticRpc(),
): Contract<typeof VoteEscrowAbi.Root> {
    return new provider.Contract(VoteEscrowAbi.Root, address)
}

export function voteEscrowAccountContract(
    address: Address,
    provider = useStaticRpc(),
): Contract<typeof VoteEscrowAbi.Account> {
    return new provider.Contract(VoteEscrowAbi.Account, address)
}

