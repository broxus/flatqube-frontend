import { DecodedAbiFunctionInputs, DecodedAbiFunctionOutputs } from 'everscale-inpage-provider'

import { GaugeAbi, VoteEscrowAbi } from '@/misc'

export type TokenDetails = DecodedAbiFunctionOutputs<typeof GaugeAbi.Root, 'getTokenDetails'>
export type RewardDetails = DecodedAbiFunctionOutputs<typeof GaugeAbi.Root, 'getRewardDetails'>
export type AccountDetails = DecodedAbiFunctionOutputs<typeof GaugeAbi.Account, 'getDetails'>
export type Average = DecodedAbiFunctionOutputs<typeof VoteEscrowAbi.Root, 'calculateAverage'>
export type PendingReward = DecodedAbiFunctionOutputs<typeof GaugeAbi.Account, 'pendingReward'>
export type RewardRound = DecodedAbiFunctionInputs<typeof GaugeAbi.Root, 'addRewardRounds'>['new_rounds'][0]
export type VeAverage = DecodedAbiFunctionOutputs<typeof VoteEscrowAbi.Root, 'calculateAverage'>
export type SyncData = DecodedAbiFunctionOutputs<typeof GaugeAbi.Root, 'calcSyncData'>['value0']
export type VeAccountAverage = DecodedAbiFunctionOutputs<typeof VoteEscrowAbi.Account, 'calculateVeAverage'>
export type LockBalanceAverage = DecodedAbiFunctionOutputs<typeof GaugeAbi.Account, 'calculateLockBalanceAverage'>
export type FactoryDetails = DecodedAbiFunctionOutputs<typeof GaugeAbi.Factory, 'getDetails'>
export type VeDetails = DecodedAbiFunctionOutputs<typeof VoteEscrowAbi.Root, 'getDetails'>

export type TokenResponse = {
    name: string;
    symbol: string;
    decimals: number;
    rootAddress: string;
    codeHash: string;
    rootOwnerAddress: string;
    tokenStandard: string;
    totalSupply: string;
}

export type GaugesFilters = {
    isLowBalance?: boolean;
    tvlFrom?: string;
    tvlTo?: string;
    aprMinFrom?: string;
    aprMinTo?: string;
    aprMaxFrom?: string;
    aprMaxTo?: string;
}

export type Duration = {
    days: number;
    hours: number;
    minutes: number;
    years: number;
}

export type QubeDaoMainPageResponse = {
    averageLockTime: number;
    totalAmount: string;
    totalVeAmount: string;
}
