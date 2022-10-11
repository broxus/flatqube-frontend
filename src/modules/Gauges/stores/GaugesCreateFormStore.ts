import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction,
} from 'mobx'
import { Address } from 'everscale-inpage-provider'
import BigNumber from 'bignumber.js'

import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { GaugeAbi, isAddressValid, Token } from '@/misc'
import { error, getSafeProcessingId } from '@/utils'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { GaugeFactoryAddress } from '@/config'
import { WalletService } from '@/stores/WalletService'
import { SECONDS_IN_DAY } from '@/constants'
import { useRpc } from '@/hooks/useRpc'
import { SingleGaugeResponse } from '@/modules/Gauges/api/models'
import { gaugeHandler } from '@/modules/Gauges/utils'
import { FavoritePairs } from '@/stores/FavoritePairs'

type Reward = {
    tokenRoot?: string;
    vestingPeriod?: string;
    vestingRatio?: string;
}

type RewardValidation = {
    tokenRoot?: boolean;
    vestingPeriod?: boolean;
    vestingRatio?: boolean;
}

type Data = {
    address?: string;
    tokenRoot?: string;
    boostEnabled?: boolean;
    maxLockPeriod?: string;
    maxBoost?: string;
    rewards: Reward[];
    isLoading?: boolean;
    qubeVestingPeriod?: string;
    qubeVestingRatio?: string;
    qubeToken?: string;
}

const initialReward = {
    tokenRoot: '',
    vestingPeriod: '',
    vestingRatio: '',
}

const initialData: Data = {
    rewards: [],
}

export class GaugesCreateFormStore {

    protected rpc = useRpc()

    protected staticRpc = useStaticRpc()

    protected data = initialData

    protected reactions?: IReactionDisposer[]

    constructor(
        protected tokensStore: GaugesTokensStore,
        protected wallet: WalletService,
        protected favorites: FavoritePairs,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public init(): void {
        if (!this.reactions) {
            this.reactions = [
                reaction(
                    () => [this.data.tokenRoot],
                    () => this.syncToken(),
                ),
                reaction(
                    () => [this.data.qubeToken],
                    () => this.syncQubeToken(),
                ),
                reaction(
                    () => [this.data.rewards],
                    () => this.syncRewardTokens(),
                ),
            ]
        }

        this.syncData()
    }

    public dispose(): void {
        if (this.reactions) {
            this.reactions.forEach(item => item())
            this.reactions = undefined
        }

        this.data = {
            rewards: [],
        }
    }

    public async syncData(): Promise<void> {
        let qubeVestingPeriod: string,
            qubeVestingRatio: string,
            qubeToken: string

        try {
            const factory = new this.staticRpc.Contract(
                GaugeAbi.Factory,
                GaugeFactoryAddress,
            )

            const details = await factory.methods.getDetails({}).call()

            qubeToken = details._qube.toString()
            qubeVestingPeriod = details._default_qube_vesting_period
            qubeVestingRatio = details._default_qube_vesting_ratio
        }
        catch (e) {
            error('CreateFormStore.syncData', e)
        }

        runInAction(() => {
            this.data.qubeToken = qubeToken
            this.data.qubeVestingPeriod = qubeVestingPeriod
            this.data.qubeVestingRatio = qubeVestingRatio
        })
    }

    public async syncQubeToken(): Promise<void> {
        if (!this.data.qubeToken) {
            return
        }
        try {
            await this.tokensStore.sync(this.data.qubeToken)
        }
        catch (e) {
            error('CreateFormStore.syncToken', e)
        }
    }

    public async syncToken(): Promise<void> {
        if (!this.data.tokenRoot || !this.tokenRootIsValid) {
            return
        }
        try {
            await this.tokensStore.sync(this.data.tokenRoot)
        }
        catch (e) {
            error('CreateFormStore.syncToken', e)
        }
    }

    public async syncRewardTokens(): Promise<void> {
        const tokensToSync = this.rewards
            .map(reward => reward.tokenRoot)
            .filter(tokenRoot => isAddressValid(tokenRoot)) as string[]

        try {
            await Promise.allSettled(
                tokensToSync.map(tokenRoot => this.tokensStore.sync(tokenRoot)),
            )
        }
        catch (e) {
            error('CreateFormStore.syncRewardTokens', e)
        }
    }

    public async create(): Promise<boolean> {
        runInAction(() => {
            this.data.isLoading = true
        })

        const subscriber = new this.staticRpc.Subscriber()

        let address!: string,
            success = false

        try {
            if (!this.data.tokenRoot) {
                throw new Error('TokenRoot must be defined')
            }

            if (!this.wallet.address) {
                throw new Error('Address must be defined')
            }

            const factory = new this.rpc.Contract(
                GaugeAbi.Factory,
                GaugeFactoryAddress,
            )

            const callId = getSafeProcessingId()

            const successStream = await subscriber
                .transactions(GaugeFactoryAddress)
                .flatMap(item => item.transactions)
                .flatMap(transaction => factory.decodeTransactionEvents({
                    transaction,
                }))
                .filterMap(result => {
                    if (result.event === 'NewGauge' && result.data.call_id === callId) {
                        address = result.data.gauge.toString()
                        return true
                    }
                    return undefined
                })
                .delayed(s => s.first())

            const msg = await factory.methods.deployGauge({
                call_id: callId,
                depositTokenRoot: new Address(this.data.tokenRoot),
                gauge_owner: new Address(this.wallet.address),
                maxBoost: this.data.maxBoost
                    ? new BigNumber(this.data.maxBoost)
                        .multipliedBy(1000)
                        .toFixed()
                    : '1000',
                maxLockTime: this.data.maxLockPeriod
                    ? new BigNumber(this.data.maxLockPeriod)
                        .multipliedBy(SECONDS_IN_DAY)
                        .decimalPlaces(0, BigNumber.ROUND_DOWN)
                        .toFixed()
                    : '0',
                rewardTokenRoots: this.data.rewards
                    .map(item => new Address(item.tokenRoot as string)),
                vestingPeriods: this.data.rewards
                    .map(item => new BigNumber(item.vestingPeriod as string)
                        .multipliedBy(SECONDS_IN_DAY)
                        .decimalPlaces(0, BigNumber.ROUND_DOWN)
                        .toFixed()),
                vestingRatios: this.data.rewards
                    .map(item => new BigNumber(item.vestingRatio as string)
                        .multipliedBy(1000)
                        .dividedBy(100)
                        .toFixed()),
                withdrawAllLockPeriod: SECONDS_IN_DAY * 30,
            })
                .sendDelayed({
                    amount: new BigNumber('500000000')
                        .multipliedBy(this.data.rewards.length)
                        .plus('5000000000')
                        .toFixed(),
                    bounce: true,
                    from: new Address(this.wallet.address),
                })

            await msg.transaction
            await successStream()
            await subscriber.unsubscribe()

            this.favorites.add(address)

            let gauge: SingleGaugeResponse | undefined
            do {
                // eslint-disable-next-line no-await-in-loop
                await new Promise(r => {
                    setTimeout(r, 3000)
                })
                // eslint-disable-next-line no-await-in-loop
                gauge = await gaugeHandler({}, {}, {
                    gaugeAddress: address,
                }).catch(() => undefined)
            } while (
                !gauge?.gauge
            )

            success = true
        }
        catch (e) {
            error('CreateFormStore.submit', e)
        }

        runInAction(() => {
            this.data.address = address
            this.data.isLoading = false
        })

        return success
    }

    public setTokenRoot(value: string): void {
        this.data.tokenRoot = value
    }

    public setBoostEnabled(value: boolean): void {
        this.data.boostEnabled = value
    }

    public setMaxLockPeriod(value: string): void {
        this.data.maxLockPeriod = value
    }

    public setMaxBoost(value: string): void {
        this.data.maxBoost = value
    }

    public addReward(): void {
        this.data.rewards = [...this.data.rewards, initialReward]
    }

    public removeReward(index: number): void {
        const next = [...this.data.rewards]
        next.splice(index, 1)
        this.data.rewards = next
    }

    public setRewardTokenRoot(value: string, index: number): void {
        const rewards = [...this.data.rewards]
        rewards[index].tokenRoot = value
        this.data.rewards = rewards
    }

    public setRewardVestingPeriod(value: string, index: number): void {
        const rewards = [...this.data.rewards]
        rewards[index].vestingPeriod = value
        this.data.rewards = rewards
    }

    public setRewardVestingRatio(value: string, index: number): void {
        const rewards = [...this.data.rewards]
        rewards[index].vestingRatio = value
        this.data.rewards = rewards
    }

    public get tokenRoot(): string | undefined {
        return this.data.tokenRoot
    }

    public get maxLockPeriod(): string | undefined {
        return this.data.maxLockPeriod
    }

    public get maxBoost(): string | undefined {
        return this.data.maxBoost
    }

    public get boostEnabled(): boolean | undefined {
        return this.data.boostEnabled
    }

    public get rewards(): Reward[] {
        return this.data.rewards
    }

    public get token(): Token | undefined {
        return this.data.tokenRoot
            ? this.tokensStore.byRoot[this.data.tokenRoot]
            : undefined
    }

    public get qubeToken(): Token | undefined {
        return this.data.qubeToken
            ? this.tokensStore.byRoot[this.data.qubeToken]
            : undefined
    }

    public get isLoading(): boolean {
        return !!this.data.isLoading
    }

    public get tokenRootIsValid(): boolean {
        return this.data.tokenRoot
            ? isAddressValid(this.data.tokenRoot)
            : false
    }

    public get rewardValidation(): RewardValidation[] {
        return this.rewards.map(reward => {
            const vestingPeriod = reward.vestingPeriod
                ? new BigNumber(reward.vestingPeriod)
                : undefined
            const vestingRatio = reward.vestingRatio
                ? new BigNumber(reward.vestingRatio)
                : undefined

            return {
                tokenRoot: reward.tokenRoot
                    ? (
                        !!this.data.qubeToken
                        && this.data.qubeToken !== reward.tokenRoot
                        && isAddressValid(reward.tokenRoot)
                    )
                    : false,
                vestingPeriod: vestingPeriod
                    ? !vestingPeriod.isNaN()
                        && vestingPeriod.gt(0)
                        && vestingPeriod.isFinite()
                    : false,
                vestingRatio: vestingRatio
                    ? !vestingRatio.isNaN()
                        && vestingRatio.gt(0)
                        && vestingRatio.lte(100)
                    : false,
            }
        })
    }

    public get maxLockPeriodIsValid(): boolean {
        if (this.data.boostEnabled) {
            const maxLockPeriod = this.data.maxLockPeriod
                ? new BigNumber(this.data.maxLockPeriod)
                : undefined

            return maxLockPeriod
                ? !maxLockPeriod.isNaN()
                    && maxLockPeriod.gt(0)
                    && maxLockPeriod.isFinite()
                : false
        }

        return true
    }

    public get maxBoostIsValid(): boolean {
        if (this.data.boostEnabled) {
            const maxBoost = this.data.maxBoost
                ? new BigNumber(this.data.maxBoost)
                : undefined

            return maxBoost
                ? !maxBoost.isNaN()
                    && maxBoost.gte(1)
                    && maxBoost.isFinite()
                : false
        }

        return true
    }

    public get isValid(): boolean {
        return this.tokenRootIsValid
            && this.rewardValidation
                .every(item => (
                    item.tokenRoot
                    && item.vestingPeriod
                    && item.vestingRatio
                ))
            && this.maxLockPeriodIsValid
            && this.maxBoostIsValid
    }

    public get rewardTokes(): (Token | undefined)[] {
        return this.data.rewards.map(reward => (
            reward.tokenRoot
                ? this.tokensStore.byRoot[reward.tokenRoot]
                : undefined
        ))
    }

    public get address(): string | undefined {
        return this.data.address
    }

    public get qubeVestingPeriod(): string | undefined {
        return this.data.qubeVestingPeriod
            ? new BigNumber(this.data.qubeVestingPeriod)
                .dividedBy(SECONDS_IN_DAY)
                .decimalPlaces(1)
                .toFixed()
            : undefined
    }

    public get qubeVestingRatio(): string | undefined {
        return this.data.qubeVestingRatio
            ? new BigNumber(this.data.qubeVestingRatio)
                .multipliedBy(100)
                .dividedBy(1000)
                .toFixed()
            : undefined
    }

}
