import { Mutex } from '@broxus/await-semaphore'
import {
    action,
    computed,
    makeObservable,
    ObservableMap,
    reaction,
    runInAction,
} from 'mobx'
import { Address, Subscription } from 'everscale-inpage-provider'

import { useRpc } from '@/hooks/useRpc'
import {
    isAddressValid,
    Token,
    TokenUtils,
    TokenWalletUtils,
} from '@/misc'
import { BaseStore } from '@/stores/BaseStore'
import { TokensListService, useTokensList } from '@/stores/TokensListService'
import { useWallet, WalletService } from '@/stores/WalletService'
import {
    debug,
    error,
    sliceAddress,
    storage,
    warn,
} from '@/utils'


export type TokenCache = Token

export type TokensCacheData = {
    tokens: TokenCache[];
}

export type TokensCacheState = {
    isImporting: boolean;
    isReady: boolean;
    queue: TokenCache[];
    updatingTokens: ObservableMap<string, boolean>;
    updatingTokensBalance: ObservableMap<string, boolean>;
    updatingTokensWallet: ObservableMap<string, boolean>;
}

export type TokensCacheCtorConfig = {
    withImportedTokens: boolean;
}



export const IMPORTED_TOKENS_STORAGE_KEY = 'imported_tokens'


export function getImportedTokens(): string[] {
    return JSON.parse(storage.get(IMPORTED_TOKENS_STORAGE_KEY) || '[]')
}


export class TokensCacheService extends BaseStore<TokensCacheData, TokensCacheState> {

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensList: TokensListService,
        protected readonly options?: TokensCacheCtorConfig,
    ) {
        super()

        this.setData('tokens', [])

        this.setState({
            isImporting: false,
            isReady: false,
            queue: [],
            updatingTokens: new ObservableMap<string, boolean>(),
            updatingTokensBalance: new ObservableMap<string, boolean>(),
            updatingTokensWallet: new ObservableMap<string, boolean>(),
        })

        makeObservable<TokensCacheService, '_byRoot' | '_verifiedByRoot'>(this, {
            _byRoot: computed,
            _verifiedByRoot: computed,
            add: action.bound,
            currentImportingToken: computed,
            isFetching: computed,
            isImporting: computed,
            isReady: computed,
            queue: computed,
            roots: computed,
            tokens: computed,
            verifiedBroxusTokens: computed,
            // eslint-disable-next-line sort-keys
            onImportConfirm: action.bound,
            onImportDismiss: action.bound,
        })

        // When the Tokens List Service has loaded the list of
        // available tokens, we will start creating a token map
        reaction(
            () => [this.tokensList.time, this.tokensList.tokens],
            async (
                [time, tokens],
                [prevTime, prevTokens],
            ) => {
                if (time !== prevTime || tokens !== prevTokens) {
                    await this.build()
                }
            },
            { delay: 100 },
        )

        reaction(() => this.wallet.address, (address, prevAddress) => {
            if (address !== prevAddress) {
                this.setData('tokens', this.tokens.map(token => ({ ...token, balance: undefined, wallet: undefined })))
            }
        })

        this.#tokensBalancesSubscribers = new Map<string, Subscription<'contractStateChanged'>>()
        this.#tokensBalancesSubscribersMutex = new Mutex();

        (async () => {
            await tokensList.fetch()
        })()
    }

    /**
     * Create a tokens list based on the loaded list of
     * tokens in the related `TokensListCache` service.
     * @protected
     */
    protected async build(): Promise<void> {
        if (this.tokensList.tokens.length === 0) {
            this.setState('isReady', false)
            return
        }

        this.setState('isReady', false)

        this.setData('tokens', this.tokensList?.tokens.map(token => ({
            balance: undefined,
            decimals: token.decimals,
            icon: token.logoURI,
            name: token.name,
            root: token.address,
            symbol: token.symbol,
            updatedAt: -1,
            vendor: token.vendor,
            verified: token.verified,
            wallet: undefined,
        })))

        this.setState('isReady', true)

        if (this.options?.withImportedTokens) {
            const importedTokens = getImportedTokens()

            importedTokens.forEach(root => {
                this.add({ root } as TokenCache)
            })

            await this.resolveCustomTokens()
        }
    }

    protected async resolveCustomTokens(): Promise<void> {
        const importedTokens = getImportedTokens()

        if (importedTokens.length > 0) {
            await Promise.allSettled(
                importedTokens.map(root => this.syncCustomToken(root, true)),
            )
        }
    }

    /**
     * Returns tokens map where key is a token root address.
     * @protected
     */
    protected get _byRoot(): Record<string, TokenCache> {
        const entries: Record<string, TokenCache> = {}
        this.tokens.forEach(token => {
            entries[token.root] = token
        })
        return entries
    }

    /**
     * Returns verified tokens map where key is a token root address.
     * @protected
     */
    protected get _verifiedByRoot(): Record<string, TokenCache> {
        const entries: Record<string, TokenCache> = {}
        this.tokens.forEach(token => {
            if (token.verified) {
                entries[token.root] = token
            }
        })
        return entries
    }

    /**
     * Returns list of the cached tokens list.
     * @returns {TokenCache[]}
     */
    public get tokens(): TokenCache[] {
        return this.data.tokens
    }

    /**
     * Returns only verified tokens and tokens were vendor is Broxus
     */
    public get verifiedBroxusTokens(): TokenCache[] {
        return this.tokens.filter(token => (token.verified && token.vendor === 'broxus'))
    }

    /**
     * Returns list of the cached tokens root addresses.
     * @returns {string[]}
     */
    public get roots(): string[] {
        return this.tokens.map(token => token.root)
    }

    /**
     * Returns token by the given token root address.
     * @param {string} [root]
     * @param {boolean} [verified]
     * @returns {TokenCache}
     */
    public get(root?: string, verified: boolean = false): TokenCache | undefined {
        if (root === undefined) {
            return undefined
        }
        if (verified) {
            return this._verifiedByRoot[root]
        }
        return this._byRoot[root]
    }

    /**
     * Check if token was stored to the cache.
     * @param {string} [root]
     * @returns {boolean}
     */
    public has(root?: string): boolean {
        return this.get(root) !== undefined
    }

    /**
     * Add a new token to the tokens list.
     * @param {TokenCache} token
     */
    public add(token: TokenCache): void {
        if (this.has(token.root)) {
            this.setData('tokens', this.tokens.map(item => {
                if (item.root === token.root) {
                    return { ...item, ...token }
                }
                return item
            }))
        }
        else {
            const tokens = this.tokens.slice()
            tokens.push(token)
            this.setData('tokens', tokens)
        }
    }

    /**
     * Remove a given token from the tokens list.
     * @param {TokenCache} token
     */
    public remove(token: TokenCache): void {
        this.setData('tokens', this.tokens.filter(item => item.root !== token.root))
    }

    /**
     * Update token field by the given root address, key and value.
     * @template {K extends keyof TokenCache & string} K
     * @param {string} root
     * @param {K} key
     * @param {TokenCache[K]} value
     */
    public update<K extends keyof TokenCache & string>(root: string, key: K, value: TokenCache[K]): void {
        this.setData('tokens', this.tokens.map(token => {
            if (token.root === root) {
                return { ...token, [key]: value }
            }
            return token
        }))
    }

    /**
     *
     */
    public get isFetching(): boolean {
        return this.tokensList.isFetching
    }

    public isCustomToken(root: string): boolean {
        return !this.tokensList.tokens?.some(token => token.address === root)
    }

    /**
     *
     * @param {string} root
     */
    public isTokenUpdating(root: string): boolean {
        return this.state.updatingTokens.get(root) || false
    }

    /**
     *
     * @param {string} root
     */
    public isTokenUpdatingBalance(root?: string): boolean {
        return (root === undefined ? false : this.state.updatingTokensBalance.get(root)) || false
    }

    /**
     *
     * @param {string} root
     */
    public isTokenUpdatingWallet(root?: string): boolean {
        return (root === undefined ? false : this.state.updatingTokensWallet.get(root)) || false
    }

    /**
     * Search token by the given query string.
     * Query string can be a token symbol, name or address.
     * @param {string} query
     * @returns {Promise<TokenCache[]>}
     */
    public async search(query: string): Promise<TokenCache[]> {
        const filtered = this.tokens.filter(token => (
            token.symbol?.toLowerCase?.().includes(query?.toLowerCase?.())
            || token.name?.toLowerCase?.().includes(query?.toLowerCase?.())
            || token.root?.toLowerCase?.().includes(query?.toLowerCase?.())
        ))

        if (filtered.length === 0 && isAddressValid(query)) {
            try {
                const token = await TokenUtils.getDetails(query)
                if (token !== undefined) {
                    filtered.push(token)
                }
            }
            catch (e) {}
        }

        return filtered
    }

    /**
     * Sync token balance with balance in the network by the given token root address.
     * Pass `true` in second parameter to force update.
     * @param {string} root
     * @param {boolean} force
     * @returns {Promise<void>}
     */
    public async syncToken(root: string, force?: boolean): Promise<void> {
        if (this.wallet.address === undefined) {
            return
        }

        const token = this.get(root)

        if (
            token === undefined
            || (!force && (this.isTokenUpdating(root) || Date.now() - (token.updatedAt || 0) < 60 * 1000))
        ) {
            return
        }

        this.setState('updatingTokens', new ObservableMap(this.state.updatingTokens).set(root, true))

        if (token.wallet === undefined && !this.isTokenUpdatingWallet(root)) {
            try {
                await this.syncTokenWalletAddress(root)
            }
            catch (e) {
                error('Sync token wallet address error', e)
                this.update(root, 'wallet', undefined)
            }
        }

        if (token.wallet !== undefined && !this.isTokenUpdatingBalance(root)) {
            try {
                await this.syncTokenBalance(root)
            }
            catch (e) {
                warn('Sync token balance error', e)
                this.update(root, 'balance', undefined)
            }
        }

        this.update(root, 'updatedAt', Date.now())
        this.setState('updatingTokens', new ObservableMap(this.state.updatingTokens).set(root, false))
    }

    /**
     * Sync custom token
     * @param {string} root
     * @param force
     * @returns {Promise<void>}
     */
    public async syncCustomToken(root: string, force?: boolean): Promise<void> {
        try {
            if (!force && this.has(root)) {
                return
            }

            const token = await TokenUtils.getDetails(root)

            if (token === undefined || (!force && this.has(token.root))) {
                return
            }

            this.add(token)
        }
        catch (e) {
            error('Sync custom token error', e)
        }
    }

    /**
     * Start to watch token balance updates by the given token root address.
     * @param {string} [root]
     * @param {string} [prefix]
     * @returns {Promise<void>}
     */
    public async watch(root?: string, prefix: string = ''): Promise<void> {
        if (root === undefined) {
            return
        }

        const token = this.get(root)

        if (token === undefined) {
            return
        }

        try {
            await this.syncToken(root, true)
        }
        catch (e) {}

        if (token.wallet !== undefined) {
            const key = `${prefix}-${(root)}`

            await this.#tokensBalancesSubscribersMutex.use(async () => {
                const entry = this.#tokensBalancesSubscribers.get(key)

                if (entry != null || token.wallet === undefined) {
                    debug('Reset token subscription')
                    return
                }

                const address = new Address(token.wallet)

                const rpc = useRpc()

                const subscription = (await rpc.subscribe('contractStateChanged', {
                    address,
                })).on('data', async event => {
                    debug(
                        `%cRPC%c %c${token.symbol}%c \`contractStateChanged\` event was captured'`,
                        'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 3px 6.5px',
                        'color: #c5e4f3',
                        'color: #bae701',
                        'color: #c5e4f3',
                        event,
                    )
                    await this.syncToken(root, true)
                })

                this.#tokensBalancesSubscribers.set(key, subscription)

                debug(
                    `%cRPC%c Subscribe to the %c${token.symbol}%c token wallet %c${sliceAddress(token.wallet)}%c balance updates with key %c${prefix}-${sliceAddress(root)}`,
                    'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 3px 6.5px',
                    'color: #c5e4f3',
                    'color: #bae701',
                    'color: #c5e4f3',
                    'color: #bae701',
                    'color: #c5e4f3',
                    'color: #bae701',
                )
            })
        }
    }

    /**
     * Stop watching token balance updates by the given token root address.
     * @param {string} [root]
     * @param {string} [prefix]
     * @returns {Promise<void>}
     */
    public async unwatch(root?: string, prefix: string = ''): Promise<void> {
        if (root === undefined) {
            return
        }

        const token = this.get(root)

        if (token === undefined) {
            return
        }

        const key = `${prefix}-${token.root}`

        await this.#tokensBalancesSubscribersMutex.use(async () => {
            const subscriber = this.#tokensBalancesSubscribers.get(key)

            try {
                await subscriber?.unsubscribe()
            }
            catch (e) {
                error('Cannot unsubscribe from token balance update', e)
            }

            this.#tokensBalancesSubscribers.delete(key)

            debug(
                `%cRPC%c Unsubscribe from the %c${token.symbol}%c token wallet %c${sliceAddress(token.wallet)}%c balance updates with key %c${prefix}-${sliceAddress(root)}`,
                'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 3px 6.5px',
                'color: #c5e4f3',
                'color: #bae701',
                'color: #c5e4f3',
                'color: #bae701',
                'color: #c5e4f3',
                'color: #bae701',
            )
        })
    }

    /**
     * Directly update token balance by the given token root address.
     * It updates balance in the tokens list.
     * @param {string} root
     */
    public async syncTokenBalance(root: string): Promise<void> {
        if (root === undefined || this.wallet.account?.address === undefined || this.isTokenUpdatingBalance(root)) {
            return
        }

        const token = this.get(root)

        if (token === undefined || token.wallet === undefined) {
            return
        }

        try {
            this.setState('updatingTokensBalance', new ObservableMap(this.state.updatingTokensBalance).set(root, true))

            const balance = await TokenWalletUtils.balance({
                tokenWalletAddress: token.wallet,
            })

            // Force update
            runInAction(() => {
                token.balance = balance
            })

            this.update(root, 'balance', balance)
        }
        catch (e: any) {
            warn('Cannot update token balance. Wallet account of this token not created yet ->', e.message)
            this.update(root, 'balance', undefined)
        }
        finally {
            this.setState('updatingTokensBalance', new ObservableMap(this.state.updatingTokensBalance).set(root, false))
        }
    }

    /**
     * Update token wallet address by the given token root address and current wallet address.
     * @param {string} root
     * @returns {Promise<void>}
     */
    public async syncTokenWalletAddress(root: string): Promise<void> {
        if (root === undefined || this.wallet.account?.address === undefined || this.isTokenUpdatingWallet(root)) {
            return
        }

        const token = this.get(root)

        if (token === undefined) {
            return
        }

        if (token.wallet === undefined) {
            this.setState('updatingTokensWallet', new ObservableMap(this.state.updatingTokensWallet).set(root, true))

            try {
                const address = await TokenWalletUtils.walletAddress({
                    tokenRootAddress: token.root,
                    walletOwnerAddress: this.wallet.account.address,
                })

                // Force update
                runInAction(() => {
                    token.wallet = address.toString()
                })

                this.update(root, 'wallet', address.toString())
            }
            catch (e) {
                error('Token wallet address update error', e)
            }
            finally {
                this.setState('updatingTokensWallet', new ObservableMap(this.state.updatingTokensWallet).set(root, false))
            }
        }
    }

    /**
     * Import custom token to the list.
     * Saves token root address to the localStorage.
     * @param {TokenCache} token
     */
    public import(token: TokenCache): void {
        try {
            const importedTokens = getImportedTokens()
            if (!importedTokens.includes(token.root)) {
                importedTokens.push(token.root)
                storage.set(IMPORTED_TOKENS_STORAGE_KEY, JSON.stringify(importedTokens))
            }
            this.add(token)
        }
        catch (e) {
            error('Can\'t import token', e)
        }
    }

    /**
     *
     */
    public get isImporting(): TokensCacheState['isImporting'] {
        return this.state.isImporting
    }

    /**
     *
     */
    public get isReady(): TokensCacheState['isReady'] {
        return this.state.isReady
    }

    /**
     *
     */
    public get queue(): TokensCacheState['queue'] {
        return this.state.queue
    }

    /**
     *
     */
    public get currentImportingToken(): TokenCache | undefined {
        return this.queue.slice().shift()
    }

    /**
     *
     * @param {string} [root]
     */
    public async addToImportQueue(root?: string): Promise<void> {
        if (root === undefined || !isAddressValid(root)) {
            return
        }

        try {
            const customToken = await TokenUtils.getDetails(root)

            if (customToken) {
                const filtered = this.queue.filter(token => token.root !== root)
                filtered.push(customToken)
                this.setState({
                    isImporting: true,
                    queue: filtered,
                })
            }
            else {
                this.setState('isImporting', this.queue.length > 0)
            }
        }
        catch (e) {
            error(e)
            this.setState('isImporting', this.queue.length > 0)
        }
    }

    /**
     *
     */
    public onImportDismiss(): void {
        const queue = this.queue.slice()
        queue.shift()
        this.setState({
            isImporting: queue.length > 0,
            queue,
        })
    }

    /**
     *
     */
    public onImportConfirm(token: TokenCache): void {
        this.import(token)
        const queue = this.queue.slice()
        queue.shift()
        this.setState({
            isImporting: queue.length > 0,
            queue,
        })
    }

    /**
     * TON Subscription for the contract state changes.
     * @type {Map<string, Subscription<'contractStateChanged'>>}
     * @private
     */
    #tokensBalancesSubscribers: Map<string, Subscription<'contractStateChanged'>>

    /**
     * Subscribers map mutex. Used to prevent duplicate subscriptions
     * @type Mutex
     * @private
     */
    #tokensBalancesSubscribersMutex: Mutex

}


const TokensCacheServiceStore = new TokensCacheService(
    useWallet(),
    useTokensList(),
    { withImportedTokens: true },
)

export function useTokensCache(): TokensCacheService {
    return TokensCacheServiceStore
}
