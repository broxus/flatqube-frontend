/* eslint-disable max-len */
import BigNumber from 'bignumber.js'

import {
    Description, Proposal, ProposalsCountResponse, ProposalsRequest,
    ProposalsResponse, UserProposalsResponse, VotesRequest, VotesResponse,
} from '@/modules/Governance/types'
import { DaoIndexerApiBaseUrl } from '@/config'
import { createHandler, isGoodBignumber } from '@/utils'
import { governanceRoutes } from '@/routes'

export const MinGasToUnlockCastedVotes = '11000000000'
export const GasToUnlockCastedVote = '200000000'
export const GasToStaking = '11500000000'
export const GasToCastVote = '11500000000'
export const GasToUnlockVoteTokens = '11500000000'

export const handleProposals = createHandler(governanceRoutes.proposals, DaoIndexerApiBaseUrl)<ProposalsResponse, ProposalsRequest>()

export const handleUserProposals = createHandler(governanceRoutes.userProposals, DaoIndexerApiBaseUrl)<UserProposalsResponse, ProposalsRequest>()

export const handleVotes = createHandler(governanceRoutes.votes, DaoIndexerApiBaseUrl)<VotesResponse, VotesRequest>()

export const handleProposalsByIds = createHandler(governanceRoutes.proposalsByIds, DaoIndexerApiBaseUrl)<Proposal[], {ids: number[]}>()

export const handleProposalsCount = createHandler(governanceRoutes.proposalsCount, DaoIndexerApiBaseUrl)<ProposalsCountResponse, { voters: string[] }>()

export function parseDescription(description: string): Description | undefined {
    try {
        const json = JSON.parse(description)

        return {
            title: json[0],
            link: json[1],
            description: json[2],
        }
    }
    catch (e) {
        return undefined
    }
}

export function getVotesPercents(forVotes: BigNumber.Value, againstVotes: BigNumber.Value): [number, number] {
    const allVotesBN = new BigNumber(againstVotes).plus(forVotes)
    const left = isGoodBignumber(allVotesBN)
        ? new BigNumber(forVotes).times(100).dividedBy(allVotesBN).integerValue()
            .toNumber()
        : 0
    const right = isGoodBignumber(allVotesBN)
        ? new BigNumber(againstVotes).times(100).dividedBy(allVotesBN).integerValue()
            .toNumber()
        : 0

    return [left, right]
}

export function calcGazToUnlockVotes(count: number): string {
    const minAmountBN = new BigNumber(MinGasToUnlockCastedVotes)
    const unlockAmountBN = new BigNumber(GasToUnlockCastedVote)
        .times(count)
        .plus('1500000000')
    const amountBN = BigNumber.max(unlockAmountBN, minAmountBN)

    return amountBN.toFixed()
}
