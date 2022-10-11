import { makeAutoObservable, runInAction } from 'mobx'
import { Mutex } from '@broxus/await-semaphore'

import { error } from '@/utils'
import { usdtPriceHandler } from '@/modules/Gauges/utils'

type Data = {
    prices: {[k: string]: string | undefined}
}

const initialState: Data = {
    prices: {},
}

export class GaugesPriceStore {

    protected syncMutex = new Mutex()

    protected data = initialState

    constructor() {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public async sync(tokens: string[]): Promise<void> {
        await this.syncMutex.use(async () => {
            let result: {[k: string]: string} = {}

            try {
                const exists = Object.keys(this.data.prices)

                const roots = tokens
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .filter(token => !exists.includes(token))

                if (roots.length > 0) {
                    result = await usdtPriceHandler({}, {}, {
                        currency_addresses: roots,
                    })
                }
            }
            catch (e) {
                error('PriceStore.sync', e)
            }

            runInAction(() => {
                this.data.prices = {
                    ...this.data.prices,
                    ...result,
                }
            })
        })
    }

    public get byRoot(): {[k: string]: string | undefined} {
        return this.data.prices
    }

}
