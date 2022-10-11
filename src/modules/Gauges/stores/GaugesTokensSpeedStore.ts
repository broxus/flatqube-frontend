import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction,
} from 'mobx'

import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'
import { RewardRound } from '@/modules/Gauges/api/models'
import { error } from '@/utils'
import { tokenRewardRoundsHandler } from '@/modules/Gauges/utils'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'

type State = {
    gaugeAddress?: string;
    total?: number;
    offset: number;
    limit: number;
    isLoading?: boolean;
    isLoaded?: boolean;
    rewardRounds?: RewardRound[];
}

const initialState: State = {
    limit: 5,
    offset: 0,
}

export class GaugesTokensSpeedStore {

    protected state = initialState

    protected reactions?: IReactionDisposer[]

    constructor(
        protected autoResync: GaugesAutoResyncStore,
        protected tokensStore: GaugesTokensStore,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public init(gaugeAddress: string): void {
        this.state.gaugeAddress = gaugeAddress

        if (!this.reactions) {
            this.reactions = [
                reaction(
                    () => [
                        this.state.offset,
                        this.state.limit,
                    ],
                    () => this.fetch(),
                    { fireImmediately: true },
                ),
                reaction(
                    () => this.autoResync.counter,
                    () => this.fetch(true),
                ),
            ]
        }
    }

    public dispose(): void {
        if (this.reactions) {
            this.reactions.forEach(item => item())
            this.reactions = undefined
        }

        this.state = initialState
    }

    public async fetch(silence?: boolean): Promise<void> {
        let { total, rewardRounds } = this.state

        if (!silence) {
            runInAction(() => {
                this.state.isLoading = true
            })
        }

        try {
            if (!this.state.gaugeAddress) {
                throw new Error('GaugeAddress must be defined')
            }

            const response = await tokenRewardRoundsHandler({}, {}, {
                gaugeAddress: this.state.gaugeAddress,
                limit: this.state.limit,
                offset: this.state.offset,
            })

            const roots = response.rewardRounds
                .flatMap(item => item.rewardTokens.map(token => token.tokenRoot))
                .filter((value, index, self) => self.indexOf(value) === index)

            await Promise.all(roots.map(root => this.tokensStore.sync(root)))

            if (roots.some(root => !this.tokensStore.byRoot[root])) {
                throw new Error('Token not founded')
            }

            total = response.total
            rewardRounds = response.rewardRounds
        }
        catch (e) {
            error('DepositsStore.fetch', e)
        }

        runInAction(() => {
            this.state.total = total
            this.state.rewardRounds = rewardRounds
            this.state.isLoading = false
            this.state.isLoaded = true
        })
    }

    public async nextPage(): Promise<void> {
        this.state.offset += this.state.limit
    }

    public async prevPage(): Promise<void> {
        this.state.offset -= this.state.limit
    }

    public async setPage(page: number): Promise<void> {
        this.state.offset = (page - 1) * this.state.limit
    }

    public get limit(): number {
        return this.state.limit
    }

    public get offset(): number {
        return this.state.offset
    }

    public get total(): number {
        return this.state.total ?? 0
    }

    public get rewardRounds(): RewardRound[] {
        return this.state.rewardRounds ?? []
    }

    public get isLoading(): boolean {
        return !!this.state.isLoading
    }

    public get isLoaded(): boolean {
        return !!this.state.isLoaded
    }

}
