import { makeAutoObservable, runInAction, toJS } from 'mobx'
import BigNumber from 'bignumber.js'
import { DateTime } from 'luxon'
import { Address } from 'everscale-inpage-provider'

import { error, getSafeProcessingId } from '@/utils'
import { GaugeAbi, Token } from '@/misc'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { WalletService } from '@/stores/WalletService'
import { useRpc } from '@/hooks/useRpc'
import { normalizeAmount } from '@/modules/Gauges/utils'
import { RewardRound } from '@/modules/Gauges/types'
import { useStaticRpc } from '@/hooks/useStaticRpc'

type State = {
    isLoading?: boolean;
    reward: string[];
    date?: string;
    time?: string;
}

const initialValue: State = {
    reward: [],
}

export class GaugesAdminSpeedFormStore {

    protected rpc = useRpc()

    protected staticRpc = useStaticRpc()

    protected state = initialValue

    constructor(
        protected dataStore: GaugesDataStore,
        protected wallet: WalletService,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public async submit(): Promise<boolean> {
        let success = false

        try {
            const { dateTime, tokens } = this

            runInAction(() => {
                this.state.isLoading = true
            })

            if (!this.dataStore.id) {
                throw new Error('Id must be defined')
            }

            if (!this.wallet.address) {
                throw new Error('Address must be defined')
            }

            if (!dateTime) {
                throw new Error('DateTime must be defined')
            }

            if (!tokens) {
                throw new Error('Tokens must be defined')
            }

            const rootContract = new this.rpc.Contract(
                GaugeAbi.Root,
                new Address(this.dataStore.id),
            )

            const callId = getSafeProcessingId()

            const ids = this.state.reward
                .reduce<number[]>((acc, item, index) => (
                    item ? [...acc, index] : acc
                ), [])

            const newRounds = this.state.reward
                .reduce<RewardRound[]>((acc, item, index) => {
                    if (item) {
                        return [...acc, {
                            accRewardPerShare: '0',
                            endTime: '0',
                            rewardPerSecond: normalizeAmount(item, tokens[index].decimals),
                            startTime: Math.ceil(dateTime / 1000).toString(),
                        }]
                    }
                    return acc
                }, [])

            const subscriber = new this.staticRpc.Subscriber()

            const successStream = await subscriber
                .transactions(new Address(this.dataStore.id))
                .flatMap(item => item.transactions)
                .flatMap(transaction => rootContract.decodeTransactionEvents({
                    transaction,
                }))
                .filterMap(result => {
                    if (
                        result.event === 'RewardRoundAdded'
                        && result.data.call_id === callId
                    ) {
                        return true
                    }
                    return undefined
                })
                .delayed(s => s.first())

            await rootContract.methods.addRewardRounds({
                ids,
                meta: {
                    call_id: callId,
                    nonce: 0,
                    send_gas_to: new Address(this.wallet.address),
                },
                new_rounds: newRounds,
            })
                .sendDelayed({
                    amount: new BigNumber('100000000')
                        .multipliedBy(ids.length)
                        .plus('1000000000')
                        .toFixed(),
                    bounce: true,
                    from: new Address(this.wallet.address),
                })

            await successStream()
            await subscriber.unsubscribe()
            await this.dataStore.sync()

            success = true
        }
        catch (e) {
            error('AdminSpeedFormStore.submit', e)
        }

        runInAction(() => {
            this.state.isLoading = false
        })

        return success
    }

    public setReward(index: number, value: string): void {
        const reward = [...this.state.reward]
        reward[index] = value
        this.state.reward = reward
    }

    public setDate(value: string): void {
        this.state.date = value
    }

    public setTime(value: string): void {
        this.state.time = value
    }

    public get tokens(): Token[] | undefined {
        return this.dataStore.extraTokens
    }

    public get reward(): string[] {
        return toJS(this.state.reward)
    }

    public get date(): string | undefined {
        return this.state.date
    }

    public get time(): string | undefined {
        return this.state.time
    }

    public get isLoading(): boolean {
        return !!this.state.isLoading
    }

    public get dateTime(): number | undefined {
        if (this.state.date && this.state.time) {
            return DateTime
                .fromFormat(`${this.state.date} ${this.state.time}`, 'yyyy.LL.dd HH:mm')
                .toMillis()
        }
        return undefined
    }

    public get minStartTime(): number | undefined {
        const { rewardDetails } = this.dataStore

        if (rewardDetails) {
            const startTimes = this.reward.reduce<number[]>((acc, item, index) => {
                if (item) {
                    const rounds = rewardDetails._extraRewardRounds[index]
                    const lastRound = rounds ? rounds[rounds.length - 1] : undefined
                    return lastRound ? [...acc, parseInt(lastRound.startTime, 10) * 1000] : acc
                }
                return acc
            }, [])

            return startTimes.length > 0
                ? Math.max(Date.now(), ...startTimes)
                : Date.now()
        }

        return undefined
    }

    public get rewardEnded(): boolean[] | undefined {
        return this.dataStore.rewardDetails?._extraRewardEnded
    }

    public get dateTimeIsValid(): boolean {
        if (this.dateTime && this.minStartTime) {
            return this.dateTime > this.minStartTime
        }

        return false
    }

    public get rewardValidation(): boolean[] {
        return this.state.reward.map(item => {
            if (item) {
                const bn = new BigNumber(item)
                return !bn.isNaN() && bn.isFinite() && bn.gte(0)
            }
            return true
        })
    }

    public get isValid(): boolean {
        return this.rewardValidation.every(item => item === true)
            && this.state.reward.some(item => !!item)
            && this.dateTimeIsValid
    }

}
