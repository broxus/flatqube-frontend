import { makeAutoObservable, runInAction } from 'mobx'

import { TokenListURI } from '@/config'
import { error } from '@/utils'


export type TonToken = {
    name: string;
    chainId: number;
    symbol: string;
    decimals: number;
    address: string;
    logoURI?: string;
    vendor?: string | null;
    verified?: boolean;
    version?: number;
}

export type TonTokenListManifest = {
    name: string;
    version: {
        major: number;
        minor: number;
        patch: number;
    };
    keywords: string[];
    timestamp: string;
    tokens: TonToken[];
}

export type TokensListData = {
    tokens: TonToken[];
}

export type TokensListState = {
    isFetching: boolean;
    time?: number;
}


export class TokensListService {

    /**
     * Current state of the token list data
     * @type {TokensListData}
     * @protected
     */
    protected data: TokensListData = {
        tokens: [],
    }

    /**
     * Current state of the token list
     * @type {TokensListState}
     * @protected
     */
    protected state: TokensListState = {
        isFetching: false,
    }

    constructor(public readonly uri: string) {
        makeAutoObservable(this)
    }

    /**
     * Fetch tokens list manifest by the given URI
     */
    public fetch(): void {
        if (this.isFetching) {
            return
        }

        this.state.isFetching = true

        fetch(this.uri, {
            method: 'GET',
        }).then(
            value => value.json(),
        ).then((value: TonTokenListManifest) => {
            runInAction(() => {
                this.data.tokens = value.tokens
                this.state = {
                    isFetching: false,
                    time: new Date().getTime(),
                }
            })
        }).catch(reason => {
            error('Cannot load token list', reason)
            runInAction(() => {
                this.state.isFetching = false
            })
        })
    }

    /**
     * Returns computed fetching state value
     */
    public get isFetching(): boolean {
        return this.state.isFetching
    }

    /**
     * Returns computed last fetching timestamp
     */
    public get time(): number | undefined {
        return this.state.time
    }

    /**
     * Returns computed Ton tokens list
     */
    public get tokens(): TonToken[] {
        return this.data.tokens
    }

}


const TokensList = new TokensListService(TokenListURI)

export function useTokensList(): TokensListService {
    return TokensList
}
