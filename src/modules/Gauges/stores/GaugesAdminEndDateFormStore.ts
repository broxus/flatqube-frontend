import {
    IReactionDisposer, makeAutoObservable, runInAction, toJS,
} from 'mobx'
import { DateTime } from 'luxon'
import { Address } from 'everscale-inpage-provider'

import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { WalletService } from '@/stores/WalletService'
import { useRpc } from '@/hooks/useRpc'
import { GaugeAbi, Token } from '@/misc'
import { zip } from '@/utils/zip'
import { error, getSafeProcessingId } from '@/utils'
import { useStaticRpc } from '@/hooks/useStaticRpc'

type State = {
    isLoading?: boolean;
    date: string[];
    time: string[];
}

const initialState: State = {
    date: [],
    time: [],
}

export class GaugesAdminEndDateFormStore {

    protected reactions?: IReactionDisposer[]

    protected rpc = useRpc()

    protected staticRpc = useStaticRpc()

    protected state = initialState

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
            const { dateTime } = this

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

            const rootContract = new this.rpc.Contract(
                GaugeAbi.Root,
                new Address(this.dataStore.id),
            )

            const callId = getSafeProcessingId()

            const ids = this.dateTime
                .reduce<number []>((acc, item, index) => (
                    item ? [...acc, index] : acc
                ), [])

            const subscriber = new this.staticRpc.Subscriber()

            const successStream = await subscriber
                .transactions(new Address(this.dataStore.id))
                .flatMap(item => item.transactions)
                .flatMap(transaction => rootContract.decodeTransactionEvents({
                    transaction,
                }))
                .filterMap(result => {
                    if (
                        result.event === 'ExtraFarmEndSet'
                        && result.data.call_id === callId
                    ) {
                        return true
                    }
                    return undefined
                })
                .delayed(s => s.first())

            const msg = await rootContract.methods.setExtraFarmEndTime({
                farm_end_times: this.dateTime
                    .filter(item => !!item)
                    .map(item => Math.ceil(item as number / 1000)),
                ids,
                meta: {
                    call_id: callId,
                    nonce: 0,
                    send_gas_to: new Address(this.wallet.address),
                },
            })
                .sendDelayed({
                    amount: '1000000000',
                    bounce: true,
                    from: new Address(this.wallet.address),
                })

            await msg.transaction
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

    public setDate(index: number, value: string): void {
        const date = [...this.state.date]
        date[index] = value
        this.state.date = date
    }

    public setTime(index: number, value: string): void {
        const time = [...this.state.time]
        time[index] = value
        this.state.time = time
    }

    public get date(): string[] {
        return toJS(this.state.date)
    }

    public get time(): string[] {
        return toJS(this.state.time)
    }

    public get dateTime(): (number | undefined)[] {
        return zip(this.date, this.time)
            .map(([date, time]) => (
                date && time
                    ? DateTime
                        .fromFormat(`${date} ${time}`, 'yyyy.LL.dd HH:mm')
                        .toMillis()
                    : undefined
            ))
    }

    public get rewardEnded(): boolean[] | undefined {
        return this.dataStore.rewardDetails?._extraRewardEnded
    }

    public get minEndTimes(): number[] | undefined {
        return this.dataStore.rewardDetails?._extraRewardRounds.map(rounds => {
            const lastRound = rounds[rounds.length - 1]
            return lastRound
                ? parseInt(lastRound.startTime, 10) * 1000
                : Date.now()
        })
    }

    public get dateTimeIsValid(): boolean[] {
        return this.dateTime.map((item, index) => {
            if (!this.minEndTimes) {
                return false
            }

            return item ? item > this.minEndTimes[index] : true
        })
    }

    public get isValid(): boolean {
        return this.dateTimeIsValid.every(valid => valid)
            && this.dateTime.some(item => !!item)
    }

    public get isLoading(): boolean {
        return !!this.state.isLoading
    }

    public get tokens(): Token[] | undefined {
        return this.dataStore.extraTokens
    }

}
