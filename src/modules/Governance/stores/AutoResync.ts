import { makeAutoObservable, runInAction } from 'mobx'

type State = {
    counter: number;
    isLoading?: boolean;
}

const initialState = {
    counter: 0,
}

export class AutoResyncStore {

    protected interval?: ReturnType<typeof setInterval>

    protected state: State = initialState

    constructor() {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public start(): void {
        this.stop()

        this.interval = setInterval(() => {
            runInAction(() => {
                this.state.counter = this.state.counter < 1000
                    ? this.state.counter + 1
                    : 1
            })
        }, 15000)
    }

    public stop(): void {
        if (this.interval) {
            clearInterval(this.interval)
        }

        this.interval = undefined
    }

    public loading(value: boolean): void {
        this.state.isLoading = value
    }

    public get isLoading(): boolean {
        return !!this.state.isLoading
    }

    public get counter(): number {
        return this.state.counter
    }

}
