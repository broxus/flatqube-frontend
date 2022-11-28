import { makeAutoObservable, runInAction } from 'mobx'
import { Mutex } from '@broxus/await-semaphore'

import { TokensListService } from '@/stores/TokensListService'
import { error } from '@/utils'
import { Token, TokenWallet } from '@/misc'

type Data = {
    tokens: {[k: string]: Token | undefined}
}

export class GaugesTokensStore {

    protected syncMutex = new Mutex()

    protected data: Data = {
        tokens: {},
    }

    constructor(
        protected tokensList: TokensListService,
    ) {
        makeAutoObservable(this)
    }

    public async sync(root: string): Promise<void> {
        await this.syncMutex.use(async () => {
            if (this.data.tokens[root]) {
                return
            }

            try {
                const rawToken = await TokenWallet.getTokenFullDetails(root)

                if (rawToken) {
                    const token: Token = {
                        ...rawToken,
                        root,
                    }

                    runInAction(() => {
                        this.data.tokens = {
                            ...this.data.tokens,
                            [root]: token,
                        }
                    })
                }
            }
            catch (e) {
                error('TokensStore.syncToken', e)
            }
        })
    }

    public get byRoot(): {[k: string]: Token | undefined} {
        let tokens = Object.fromEntries(
            (this.tokensList.tokens ?? [])
                .map(item => [item.address, ({
                    ...item,
                    icon: item.logoURI,
                    root: item.address,
                })]),
        )

        Object.values(this.data.tokens).forEach(token => {
            if (token) {
                tokens = {
                    ...tokens,
                    [token.root]: {
                        ...token,
                        ...tokens[token.root],
                    },
                }
            }
        })

        return tokens
    }

}
