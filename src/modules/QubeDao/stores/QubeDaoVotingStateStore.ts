import {
    action,
    computed,
    makeObservable,
    reaction,
} from 'mobx'
import type { IReactionDisposer } from 'mobx'
import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'

import { isAddressValid } from '@/misc'
import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import type {
    QubeDaoEndVotingCallbacks,
    QubeDaoStore,
    QubeDaoVoteEpochCallbacks,
    QubeDaoVoteEpochParams,
} from '@/modules/QubeDao/stores/QubeDaoStore'
import type { QubeDaoEpochStore } from '@/modules/QubeDao/stores/QubeDaoEpochStore'
import type { QubeDaoEpochVoteResponse, QubeDaoEpochVotesSumResponse } from '@/modules/QubeDao/types'
import { BaseStore } from '@/stores/BaseStore'
import { error, isGoodBignumber, uniqueId } from '@/utils'

export type GaugeShape = {
    address: string;
    enabled: boolean;
}

export type Candidate = {
    address: string;
    amount: string;
    key: string;
}

export type QubeDaoVotingStateStoreData = {
    /** Selected candidates in voting form */
    candidates: Candidate[];
    /** Whitelist of the gauges */
    gauges: GaugeShape[];
    /** Limit of the gauges per one vote */
    limit: number;
    prevEpochVotesSummary?: QubeDaoEpochVotesSumResponse[];
    /** List of a user's votes */
    userVotes: QubeDaoEpochVoteResponse[];
}

export type QubeDaoVotingStateStoreState = {
    isFetchingPrevEpoch?: boolean;
    isFetchingUserVotes?: boolean;
    isInitializing: boolean;
}

export type QubeDaoVotingStateStoreCtorOptions = {
    endVotingCallbacks?: QubeDaoEndVotingCallbacks;
    voteEpochCallbacks?: QubeDaoVoteEpochCallbacks;
}


export class QubeDaoVotingStateStore extends BaseStore<QubeDaoVotingStateStoreData, QubeDaoVotingStateStoreState> {

    protected readonly api = useQubeDaoApi()

    constructor(
        protected readonly dao: QubeDaoStore,
        protected readonly epoch: QubeDaoEpochStore,
        protected readonly options: QubeDaoVotingStateStoreCtorOptions,
    ) {
        super()

        this.setData(() => ({
            candidates: [
                {
                    address: '',
                    amount: '',
                    key: uniqueId(),
                },
            ],
            gauges: [],
            limit: 0,
            userVotes: [],
        }))

        makeObservable(this, {
            candidates: computed,
            endVoting: action.bound,
            gauges: computed,
            isFetchingPrevEpoch: computed,
            isFetchingUserVotes: computed,
            isLimitExceed: computed,
            isValid: computed,
            limit: computed,
            scoredGaugesDistribution: computed,
            scoredGaugesFarmSpeed: computed,
            scoredGaugesNormalizedVotesAmount: computed,
            scoredGaugesNormalizedVotesShare: computed,
            scoredGaugesVotesAmount: computed,
            scoredGaugesVotesShare: computed,
            scoredUserCandidatesAmount: computed,
            scoredUserCandidatesShare: computed,
            scoredUserDistribution: computed,
            scoredUserFarmSpeed: computed,
            scoredUserGaugesVotesAmount: computed,
            scoredUserGaugesVotesShare: computed,
            scoredUserVotesAmount: computed,
            scoredUserVotesShare: computed,
            summaryVeAmount: computed,
            userVotes: computed,
            voteEpoch: action.bound,
        })
    }

    public async init(): Promise<void> {
        if (this.state.isInitializing) {
            return
        }

        this.setState('isInitializing', true)

        await this.syncWhitelistGauges()
        await this.fetchPrevEpochDetails()

        this.#initDisposer = reaction(() => this.dao.wallet.address, async (address, prevAddress) => {
            if (address !== undefined && address !== prevAddress) {
                await this.fetchUserVotes(true)
            }
        }, { fireImmediately: true })

        this.setState('isInitializing', false)
    }

    public dispose(): void {
        this.#initDisposer?.()
    }

    public async voteEpoch(params: Partial<QubeDaoVoteEpochParams>): Promise<void> {
        if (!this.isValid) {
            return
        }

        await this.dao.voteEpoch({
            maxGaugesPerVote: this.limit,
            votes: this.candidates.map(
                ({ address, amount }) => [
                    new Address(address),
                    new BigNumber(amount || 0)
                        .dp(this.dao.veDecimals, BigNumber.ROUND_DOWN)
                        .shiftedBy(this.dao.veDecimals)
                        .toFixed(),
                ],
            ),
            // eslint-disable-next-line sort-keys
            onSend: async (...args) => {
                await Promise.all([
                    this.options.voteEpochCallbacks?.onSend?.(...args),
                    params.onSend?.(...args),
                ])
            },
            onTransactionFailure: async reason => {
                await Promise.all([
                    this.options.voteEpochCallbacks?.onTransactionFailure?.(reason),
                    params.onTransactionFailure?.(reason),
                ])
            },
            onTransactionSuccess: async result => {
                const userVotes = result.input.votes.reduce<QubeDaoEpochVoteResponse[]>((acc, [gauge, veAmount]) => {
                    acc.push({
                        createdAt: result.transaction.createdAt,
                        epochNum: Number(this.epoch.epochNum),
                        gauge: gauge.toString(),
                        transactionTime: Number(result.transaction.id.lt),
                        userAddress: result.input.user.toString(),
                        veAmount,
                    })
                    return acc
                }, [])
                const userTotalVoteAmount = result.input.votes.reduce(
                    (acc, [, amount]) => acc.plus(amount),
                    new BigNumber(0),
                )
                this.epoch.setData('userTotalVoteAmount', userTotalVoteAmount.toFixed())
                this.setData({
                    candidates: [],
                    userVotes,
                })
                await Promise.all([
                    this.options.voteEpochCallbacks?.onTransactionSuccess?.(result),
                    params.onTransactionSuccess?.(result),
                ])
            },
        })
    }

    public async endVoting(): Promise<void> {
        await this.dao.endVoting({
            ...this.options.endVotingCallbacks,
            onTransactionSuccess: async result => {
                this.epoch.setState({
                    voteAvailable: false,
                    votingEndAvailable: false,
                })
                await this.options.endVotingCallbacks?.onTransactionSuccess?.(result)
            },
        })
    }

    protected async fetchPrevEpochDetails(force?: boolean, silence: boolean = false): Promise<void> {
        if (!force && this.isFetchingPrevEpoch) {
            return
        }

        if (this.epoch.epochNum === undefined || Number.isNaN(this.epoch.epochNum) || this.epoch.epochNum === 1) {
            return
        }

        this.setState('isFetchingPrevEpoch', !silence)

        try {
            const prevEpochVotesSummary = await this.api.epochsVotesSum({
                epochNum: (this.epoch.epochNum - 1).toString(),
            }, { method: 'GET' })

            if (!prevEpochVotesSummary) {
                return
            }

            this.setData('prevEpochVotesSummary', prevEpochVotesSummary)
        }
        catch (e) {
            error(`Fetch epoch ${this.epoch.epochNum} error`, e)
        }
        finally {
            this.setState('isFetchingPrevEpoch', false)
        }
    }

    protected async fetchUserVotes(force?: boolean, silence: boolean = false): Promise<void> {
        if (this.dao.wallet.address === undefined || this.epoch.epochNum === undefined) {
            return
        }

        if (!force && this.isFetchingUserVotes) {
            return
        }

        this.setState('isFetchingUserVotes', !silence)

        try {
            const response = (await this.api.epochsVotesSearch({}, { method: 'POST' }, {
                epochNum: this.epoch.epochNum,
                limit: this.limit,
                offset: 0,
                userAddress: this.dao.wallet.address,
            })).epochVotes

            this.setData('userVotes', response)
        }
        catch (e) {
            error('Fetch epoch user votes error', e)
        }
        finally {
            this.setState('isFetchingUserVotes', false)
        }
    }

    protected async syncWhitelistGauges(): Promise<void> {
        try {
            const [whitelist, details] = await Promise.all([
                this.dao.veContract
                    .methods.gaugeWhitelist({})
                    .call({ cachedState: this.dao.veContractCachedState }),
                this.dao.veContract
                    .methods.getVotingDetails({})
                    .call({ cachedState: this.dao.veContractCachedState }),
            ])

            const gauges = whitelist.gaugeWhitelist.filter(([, enabled]) => enabled).map(([address, enabled]) => ({
                address: address.toString(),
                enabled,
            }))

            this.setData({
                gauges,
                limit: Math.min(gauges.length, parseInt(details._maxGaugesPerVote, 10)),
            })
        }
        catch (e) {

        }
    }

    public get candidates(): QubeDaoVotingStateStoreData['candidates'] {
        return this.data.candidates
    }

    public get userVotes(): QubeDaoVotingStateStoreData['userVotes'] {
        return this.data.userVotes
    }

    public get gauges(): QubeDaoVotingStateStoreData['gauges'] {
        return this.data.gauges
    }

    public get limit(): QubeDaoVotingStateStoreData['limit'] {
        return this.data.limit
    }

    public get isFetchingPrevEpoch(): QubeDaoVotingStateStoreState['isFetchingPrevEpoch'] {
        return this.state.isFetchingPrevEpoch
    }

    public get isFetchingUserVotes(): QubeDaoVotingStateStoreState['isFetchingUserVotes'] {
        return this.state.isFetchingUserVotes
    }

    public get isLimitExceed(): boolean {
        return this.candidates.length >= this.limit
    }

    public get isValid(): boolean {
        return (
            this.candidates.every(({ address, amount }) => isAddressValid(address) && isGoodBignumber(amount))
            && new BigNumber(this.dao.userVeBalance || 0).gte(this.scoredUserCandidatesAmount)
            && !this.isLimitExceed
        )
    }

    /**
     * Returns gauge distribution in related token (QUBE) by the given gauge address
     * @param {string} gauge
     */
    public currentGaugeDistribution(gauge: string): string {
        if (
            this.epoch.epochNum === this.dao.currentEpochNum
            && this.epoch.normalizedDistribution[gauge] !== undefined
        ) {
            return this.epoch.normalizedDistribution[gauge]
        }
        return this.epoch.epochVotesSummary
            .find(item => gauge === item.gauge)
            ?.distributedAmount
            // if not found in api response - calculate via distributed scheme
            ?? new BigNumber(this.epoch.totalDistribution || 0)
                .times(this.epoch.distributionScheme[0] ?? 1)
                .div(10000)
                .div(100)
                .times(this.currentGaugeNormalizedVoteShare(gauge))
                .dp(0, BigNumber.ROUND_UP)
                .toFixed()
    }

    /**
     *
     * @param gauge
     */
    public currentGaugeFarmingSpeed(gauge: string): string {
        if (this.epoch.epochEnd == null || this.epoch.epochStart == null) {
            return '0'
        }
        return new BigNumber(this.currentGaugeDistribution(gauge) || 0)
            .shiftedBy(-this.dao.tokenDecimals)
            .div(this.dao.epochTime)
            .toFixed()
    }

    public currentGaugeFarmingSpeedRateChange(gauge: string): string {
        if (this.epoch.epochNum === 1) {
            return '100'
        }

        const currentFarmingSpeed = this.currentGaugeFarmingSpeed(gauge)
        const prevEpochGauge = this.data.prevEpochVotesSummary?.find(
            summary => gauge.toLowerCase() === summary.gauge.toLowerCase(),
        )
        const distribution = new BigNumber(prevEpochGauge?.distributedAmount || 0)
        const prevFarmingSpeed = distribution
            .shiftedBy(-this.dao.tokenDecimals)
            .div(this.dao.epochTime)

        return new BigNumber(currentFarmingSpeed ?? 0)
            .div(prevFarmingSpeed)
            .times(100)
            .dp(2)
            .toFixed()
    }

    public currentGaugeNormalizedAmount(gauge: string): string | null | undefined {
        return this.epoch.epochVotesSummary.find(item => gauge === item.gauge)?.normalizedAmount
    }

    public currentGaugeNormalizedVoteShare(gauge: string): string {
        return new BigNumber(this.currentGaugeNormalizedAmount(gauge) ?? 0)
            .div(isGoodBignumber(this.epoch.totalVeAmount) ? (this.epoch.totalVeAmount ?? 1) : 1)
            .times(100)
            .toFixed()
    }

    /**
     * Returns gauge total voted amount (veQUBE) by the given gauge address
     * @param {string} gauge
     */
    public currentGaugeTotalAmount(gauge: string): string | undefined {
        return this.epoch.epochVotesSummary.find(item => gauge === item.gauge)?.totalAmount
    }

    /**
     * Returns gauge share (in percents) by the total
     * epoch voted amount (veQUBE) by the given gauge address
     * @param {string} gauge
     */
    public currentGaugeVoteShare(gauge: string): string {
        return new BigNumber(this.currentGaugeTotalAmount(gauge) ?? 0)
            .div(isGoodBignumber(this.epoch.totalVeAmount) ? (this.epoch.totalVeAmount ?? 1) : 1)
            .times(100)
            .toFixed()
    }

    /**
     * Returns gauge amount share (in percents) by total user
     * voted amount (veQUBE) by the given user entered amount
     * @param {string} amount
     */
    public gaugeUserVoteShare(amount: string): string {
        return new BigNumber(amount || 0)
            .div(this.scoredUserVotesAmount)
            .times(100)
            .toFixed()
    }

    public get scoredGaugesDistribution(): string {
        return this.epoch.epochVotesSummary.reduce(
            (acc, vote) => acc.plus(this.currentGaugeDistribution(vote.gauge)),
            new BigNumber(0),
        ).toFixed()
    }

    public get scoredGaugesFarmSpeed(): string {
        if (this.epoch.epochEnd == null || this.epoch.epochStart == null) {
            return '0'
        }
        return new BigNumber(this.scoredGaugesDistribution || 0)
            .shiftedBy(-this.dao.tokenDecimals)
            .div(this.epoch.epochEnd - this.epoch.epochStart)
            .toFixed()
    }

    public get scoredGaugesNormalizedVotesAmount(): string {
        return this.epoch.epochVotesSummary.reduce(
            (acc, vote) => acc.plus(this.currentGaugeNormalizedAmount(vote.gauge) ?? 0),
            new BigNumber(0),
        ).toFixed()
    }

    public get scoredGaugesNormalizedVotesShare(): string {
        return new BigNumber(this.scoredGaugesNormalizedVotesAmount)
            .div(isGoodBignumber(this.epoch.totalVeAmount) ? (this.epoch.totalVeAmount ?? 1) : 1)
            .times(100)
            .toFixed()
    }

    public get scoredGaugesVotesAmount(): string {
        return this.epoch.epochVotesSummary.reduce(
            (acc, vote) => acc.plus(vote.totalAmount),
            new BigNumber(0),
        ).toFixed()
    }

    public get scoredGaugesVotesShare(): string {
        return new BigNumber(this.scoredGaugesVotesAmount)
            .div(isGoodBignumber(this.epoch.totalVeAmount) ? (this.epoch.totalVeAmount ?? 1) : 1)
            .times(100)
            .toFixed()
    }

    public get scoredUserCandidatesAmount(): string {
        return this.candidates.reduce(
            (acc, candidate) => acc.plus(
                new BigNumber(candidate.amount || 0).shiftedBy(this.dao.veDecimals),
            ),
            new BigNumber(0),
        ).toFixed()
    }

    public get scoredUserCandidatesShare(): string {
        return new BigNumber(this.scoredUserCandidatesAmount || 1)
            .div(isGoodBignumber(this.dao.userVeBalance ?? 0) ? (this.dao.userVeBalance ?? 1) : 1)
            .times(100)
            .dp(2, BigNumber.ROUND_UP)
            .toFixed()
    }

    public get scoredUserDistribution(): string {
        return this.userVotes.reduce(
            (acc, vote) => acc.plus(this.currentGaugeDistribution(vote.gauge)),
            new BigNumber(0),
        ).toFixed()
    }

    public get scoredUserFarmSpeed(): string {
        if (this.epoch.epochEnd == null || this.epoch.epochStart == null) {
            return '0'
        }
        return new BigNumber(this.scoredUserDistribution || 0)
            .shiftedBy(-this.dao.tokenDecimals)
            .div(this.epoch.epochEnd - this.epoch.epochStart)
            .toFixed()
    }

    public get scoredUserGaugesVotesAmount(): string {
        return this.userVotes.reduce(
            (acc, vote) => (
                acc.plus(this.currentGaugeTotalAmount(vote.gauge) ?? 0)
            ),
            new BigNumber(0),
        ).toFixed()
    }

    public get scoredUserGaugesVotesShare(): string {
        return new BigNumber(this.scoredUserGaugesVotesAmount)
            .div(isGoodBignumber(this.epoch.totalVeAmount) ? (this.epoch.totalVeAmount ?? 1) : 1)
            .times(100)
            .toFixed()
    }

    public get scoredUserVotesAmount(): string {
        return this.userVotes.reduce(
            (acc, vote) => acc.plus(vote.veAmount),
            new BigNumber(0),
        ).toFixed()
    }

    public get scoredUserVotesShare(): string {
        return new BigNumber(this.scoredUserVotesAmount || 0)
            .div(this.epoch.userTotalVoteAmount || 1)
            .times(100)
            .toFixed()
    }

    /**
     * Returns sum of the total voted amount (veQUBE) and user total vote amount
     */
    public get summaryVeAmount(): string {
        return new BigNumber(isGoodBignumber(this.epoch.totalVeAmount) ? (this.epoch.totalVeAmount ?? 0) : 0)
            .plus(this.scoredUserCandidatesAmount)
            .toFixed()
    }

    #initDisposer: IReactionDisposer | undefined

}
