import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction,
} from 'mobx'

import { error } from '@/utils'
import { Deposit } from '@/modules/Gauges/api/models'
import { depositsHandler } from '@/modules/Gauges/utils'
import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'

type State = {
    gaugeAddress?: string;
    userAddress?: string;
    total?: number;
    deposits?: Deposit[];
    offset: number;
    limit: number;
    isLoading?: boolean;
    isLoaded?: boolean;
}

const initialState: State = {
    limit: 5,
    offset: 0,
}

export class GaugesDepositsStore {

    protected state = initialState

    protected reactions?: IReactionDisposer[]

    constructor(
        protected autoResync: GaugesAutoResyncStore,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public init(gaugeAddress: string, userAddress?: string): void {
        this.state.gaugeAddress = gaugeAddress
        this.state.userAddress = userAddress

        if (!this.reactions) {
            this.reactions = [
                reaction(
                    () => [
                        this.state.offset,
                        this.state.limit,
                        this.state.userAddress,
                        this.state.gaugeAddress,
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
        let total: number,
            deposits: Deposit[]

        if (this.state.userAddress) {
            if (!silence) {
                runInAction(() => {
                    this.state.isLoading = true
                })
            }

            try {
                if (!this.state.gaugeAddress) {
                    throw new Error('GaugeAddress must be defined')
                }


                const response = await depositsHandler({}, {}, {
                    gaugeAddress: this.state.gaugeAddress,
                    limit: this.state.limit,
                    offset: this.state.offset,
                    userAddress: this.state.userAddress,
                })

                total = response.total
                deposits = response.deposits
            }
            catch (e) {
                error('DepositsStore.fetch', e)
            }
        }

        runInAction(() => {
            this.state.total = total
            this.state.deposits = deposits
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

    public get deposits(): Deposit[] {
        return this.state.deposits ?? []
    }

    public get userAddress(): string | undefined {
        return this.state.userAddress
    }

    public get isLoading(): boolean {
        return !!this.state.isLoading
    }

    public get isLoaded(): boolean {
        return !!this.state.isLoaded
    }

}
