import { makeAutoObservable, runInAction, when } from 'mobx'

import { TokensListService } from '@/stores/TokensListService'
import { error } from '@/utils'
import { Token, TokenWallet } from '@/misc'

type Data = {
    tokens: {[k: string]: Token | undefined}
    loading: {[k: string]: boolean | undefined}
}

export class GaugesTokensStore {

    protected data: Data = {
        loading: {},
        tokens: {},
    }

    constructor(
        protected tokensList: TokensListService,
    ) {
        makeAutoObservable(this)
    }

    public async sync(root: string): Promise<void> {
        await when(() => this.tokensList.tokens.length > 0)

        let token = this.data.tokens[root]
        const loading = this.data.loading[root]

        if (!token && !loading) {
            runInAction(() => {
                this.data.loading = {
                    ...this.data.loading,
                    [root]: true,
                }
            })

            try {
                const rawToken = await TokenWallet.getTokenFullDetails(root)

                if (rawToken) {
                    token = {
                        ...rawToken,
                        root,
                    }
                }
            }
            catch (e) {
                error('TokensStore.syncToken', e)
            }
        }

        runInAction(() => {
            this.data.tokens = {
                ...this.data.tokens,
                [root]: token,
            }

            this.data.loading = {
                ...this.data.loading,
                [root]: false,
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
