import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction,
} from 'mobx'
import { DateTime } from 'luxon'
import { Time } from 'lightweight-charts'
import uniqBy from 'lodash.uniqby'

import { StatRequest, StatResponse, Timeframe } from '@/modules/Gauges/api/models'
import { error } from '@/utils'
import { gaugeMaxAprHandler, gaugeMinAprHandler, gaugeTvlHandler } from '@/modules/Gauges/utils'
import { CommonGraphShape } from '@/modules/Chart/types'

export enum GaugesChartType {
    Tvl, MinApr, MaxApr,
}

export class GaugesChartStore {

    protected reactions?: IReactionDisposer[]

    public data: CommonGraphShape[] = []

    public gauge?: string

    public loading = false

    public loaded = false

    public type = GaugesChartType.Tvl

    public timeframe = Timeframe.D1

    constructor() {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public init(gauge: string): void {
        this.gauge = gauge

        if (!this.reactions) {
            this.reactions = [
                reaction(
                    () => [
                        this.gauge,
                        this.type,
                        this.timeframe,
                    ],
                    () => {
                        this.reset()
                        this.fetch()
                    },
                    { fireImmediately: true },
                ),
            ]
        }
    }

    public dispose(): void {
        if (this.reactions) {
            this.reactions.forEach(item => item())
            this.reactions = undefined
        }
        this.data = []
        this.timeframe = Timeframe.D1
        this.type = GaugesChartType.Tvl
    }

    public setType(value: GaugesChartType): void {
        this.type = value
    }

    public setTimeframe(value: Timeframe): void {
        this.timeframe = value
    }

    public reset(): void {
        this.data = []
    }

    public async fetch(from?: number, to?: number): Promise<void> {
        if (this.loading || !this.gauge) {
            return
        }

        runInAction(() => {
            this.loading = true
        })

        const params: StatRequest = {
            from: from || DateTime.local().minus({
                days: this.timeframe === Timeframe.D1 ? 30 : 7,
            }).toUTC(undefined, {
                keepLocalTime: false,
            }).toMillis(),
            gaugeAddress: this.gauge,
            timeframe: this.timeframe,
            to: to || new Date().getTime(),
        }

        try {
            let response!: StatResponse

            switch (this.type) {
                case GaugesChartType.Tvl:
                    response = await gaugeTvlHandler({}, {}, params)
                    break
                case GaugesChartType.MaxApr:
                    response = await gaugeMaxAprHandler({}, {}, params)
                    break
                case GaugesChartType.MinApr:
                    response = await gaugeMinAprHandler({}, {}, params)
                    break
                default:
                    throw new Error('Wrong type')
            }

            const newData = response.stats
                .map(item => ({
                    time: (item.timestamp / 1000) as Time,
                    value: parseFloat(item.value),
                }))
                .concat(this.data)

            runInAction(() => {
                this.data = uniqBy(newData, 'time')
                this.loaded = true
                this.loading = false
            })
        }
        catch (e) {
            error('ChartStore.fetch', e)
        }
    }

}
