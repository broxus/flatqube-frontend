import { computed, makeObservable } from 'mobx'

import { TokenListURI } from '@/config'
import { BaseStore } from '@/stores/BaseStore'
import { error } from '@/utils'


export type EverToken = {
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

export type EverTokenListManifest = {
    name: string;
    version: {
        major: number;
        minor: number;
        patch: number;
    };
    keywords: string[];
    timestamp: string;
    tokens: EverToken[];
}

export type TokensListData = {
    tokens: EverToken[];
}

export type TokensListState = {
    isFetching: boolean;
    time?: number;
}


export class TokensListService extends BaseStore<TokensListData, TokensListState> {

    constructor(public readonly uri: string) {
        super()
        this.setState(() => ({ isFetching: false }))
        makeObservable(this, {
            isFetching: computed,
            roots: computed,
            time: computed,
            tokens: computed,
        })
    }

    /**
     * Fetch tokens list manifest by the given URI
     */
    public fetch(): void {
        if (this.isFetching) {
            return
        }

        this.setState('isFetching', true)

        fetch(this.uri, { method: 'GET' }).then(
            value => value.json(),
        ).then((value: EverTokenListManifest) => {
            this.setData('tokens', value.tokens)
            this.setState({
                isFetching: false,
                time: new Date().getTime(),
            })
        }).catch(reason => {
            error('Cannot load token list', reason)
            this.setState('isFetching', false)
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
     * Returns computed Ever tokens list
     */
    public get tokens(): EverToken[] {
        return this.data.tokens
    }

    /**
     * Returns computed list of the addresses of the manifest tokens
     */
    public get roots(): string[] {
        return this.data.tokens.map(({ address }) => address)
    }

}


const TokensList = new TokensListService(TokenListURI)

export function useTokensList(): TokensListService {
    return TokensList
}
