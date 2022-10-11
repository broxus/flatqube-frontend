import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction,
} from 'mobx'

import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'
import { EventType, Transaction } from '@/modules/Gauges/api/models'
import { error } from '@/utils'
import { transactionsHandler } from '@/modules/Gauges/utils'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { GaugesPriceStore } from '@/modules/Gauges/stores/GaugesPriceStore'

type State = {
    onlyUser?: boolean;
    eventTypes: EventType[];
    gaugeAddress?: string;
    userAddress?: string;
    total?: number;
    transactions?: Transaction[];
    offset: number;
    limit: number;
    isLoading?: boolean;
    isLoaded?: boolean;
}

const initialState: State = {
    eventTypes: [
        EventType.Claim,
        EventType.Deposit,
        EventType.RewardDeposit,
        EventType.Withdraw,
    ],
    limit: 5,
    offset: 0,
}

export class GaugesTransactionsStore {

    protected state = initialState

    protected reactions?: IReactionDisposer[]

    constructor(
        protected autoResync: GaugesAutoResyncStore,
        protected tokens: GaugesTokensStore,
        protected prices: GaugesPriceStore,
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
                        this.state.eventTypes,
                        this.state.onlyUser,
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

    public reset(): void {
        this.state.offset = 0
        this.fetch()
    }

    public async fetch(silence?: boolean): Promise<void> {
        let { total, transactions } = this.state

        if (!silence) {
            runInAction(() => {
                this.state.isLoading = true
            })
        }

        try {
            if (!this.state.gaugeAddress) {
                throw new Error('GaugeAddress must be defined')
            }

            if (this.onlyUser && !this.state.userAddress) {
                throw new Error('User must be defined')
            }

            const response = await transactionsHandler({}, {}, {
                eventTypes: this.state.eventTypes,
                gaugeAddress: this.state.gaugeAddress,
                limit: this.state.limit,
                offset: this.state.offset,
                userAddress: this.onlyUser
                    ? this.state.userAddress as string
                    : null,
            })

            const tokenRoots = response.transactions.reduce<string[]>((acc, item) => (
                [...acc, ...item.tokens.map(token => token.tokenRoot)]
            ), [])

            await Promise.all([
                Promise.all(tokenRoots.map(root => this.tokens.sync(root))),
                this.prices.sync(tokenRoots),
            ])

            if (tokenRoots.some(root => !this.tokens.byRoot[root])) {
                throw new Error('Token not founded')
            }

            if (tokenRoots.some(root => !this.prices.byRoot[root])) {
                throw new Error('Price not founded')
            }

            total = response.total
            transactions = response.transactions
        }
        catch (e) {
            error('DepositsStore.fetch', e)
        }

        runInAction(() => {
            this.state.total = total
            this.state.transactions = transactions
            this.state.isLoading = false
            this.state.isLoaded = true
        })
    }

    public nextPage(): void {
        this.state.offset += this.state.limit
    }

    public prevPage(): void {
        this.state.offset -= this.state.limit
    }

    public setPage(page: number): void {
        this.state.offset = (page - 1) * this.state.limit
    }

    public setEventTypes(eventTypes: EventType[]): void {
        this.state.eventTypes = eventTypes
    }

    public setUser(userAddress?: string): void {
        this.state.userAddress = userAddress
    }

    public setOnlyUser(value?: boolean): void {
        this.state.onlyUser = value
        this.state.offset = 0
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

    public get eventTypes(): EventType[] {
        return this.state.eventTypes
    }

    public get list(): Transaction[] {
        return this.state.transactions ?? []
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

    public get onlyUser(): boolean {
        return !!this.state.onlyUser
    }

}
