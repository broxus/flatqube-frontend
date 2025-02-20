import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'
import {
    computed,
    makeObservable,
    ObservableMap,
    reaction,
    runInAction,
} from 'mobx'

import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { MigrationTokenAbi, TokenWallet, TokenWalletV4 } from '@/misc'
import { useWallet, WalletService } from '@/stores/WalletService'
import { debug, error } from '@/utils'
import { BaseStore } from '@/stores/BaseStore'


export type OutdatedTokenRaw = {
    logoURI?: string;
    proxy?: string;
    rootV4: string;
    rootV5: string;
    symbol: string;
}

export type OutdatedToken = OutdatedTokenRaw & {
    balance?: string;
    decimals: number;
    name?: string;
    wallet?: string;
}

export type OutdatedTokenManifest = {
    name: string;
    tokens: OutdatedTokenRaw[];
}

export type TokensUpgradesStoreData = {
    tokens: OutdatedToken[];
    upgradableTokensList: OutdatedTokenRaw[];
}

export type TokensUpgradesStoreState = {
    isCheckingUpgrades: boolean;
    upgradedTokens: ObservableMap<string, boolean>;
    upgradingTokens: ObservableMap<string, boolean>;
}


const staticRpc = useStaticRpc()


export class TokensUpgradesStore extends BaseStore<TokensUpgradesStoreData, TokensUpgradesStoreState> {

    constructor(
        protected readonly wallet: WalletService,
    ) {
        super()

        this.setData(() => ({
            tokens: [],
            upgradableTokensList: [],
        }))

        this.setState(() => ({
            isCheckingUpgrades: false,
            upgradedTokens: new ObservableMap<string, boolean>(),
            upgradingTokens: new ObservableMap<string, boolean>(),
        }))

        reaction(() => this.wallet.address, async address => {
            if (address !== undefined) {
                await this.checkForUpdates()
            }
        }, { delay: 100, fireImmediately: true })

        makeObservable(this, {
            hasTokensToUpgrade: computed,
            isCheckingUpgrades: computed,
            tokens: computed,
        })
    }

    public async checkForUpdates(): Promise<void> {
        if (this.wallet.account?.address === undefined) {
            return
        }

        const tokens: TokensUpgradesStoreData['tokens'] = []

        try {
            await fetch('https://raw.githubusercontent.com/broxus/everscale-assets-upgrade/master/main.json', {
                method: 'GET',
            }).then(value => value.json()).then((value: OutdatedTokenManifest) => {
                this.setData('upgradableTokensList', value.tokens)
            })
        }
        catch (e) {
            error('Tokens upgrade manifest fetch error', e)
        }

        this.setState('isCheckingUpgrades', true)

        await Promise.allSettled(this.data.upgradableTokensList.map(token => (async () => {
            if (this.wallet.account?.address === undefined) {
                return
            }

            try {
                const rootV5Address = new Address(token.rootV5)
                const owner = (await TokenWallet.rootOwnerAddress(rootV5Address)).toString()

                if (owner !== token.proxy) {
                    return
                }

                const rootV4Address = new Address(token.rootV4)
                const { state } = await staticRpc.getFullContractState({ address: rootV4Address })

                if (state === undefined || !state.isDeployed) {
                    return
                }

                const wallet = await TokenWalletV4.walletAddress({
                    owner: this.wallet.account.address,
                    root: rootV4Address,
                }, state)

                const { state: walletState } = await staticRpc.getFullContractState({
                    address: wallet,
                })

                if (walletState === undefined || !walletState.isDeployed) {
                    return
                }

                const [balance, decimals, symbol, name] = await Promise.all([
                    TokenWalletV4.balance({ wallet }, walletState),
                    TokenWalletV4.getDecimals(rootV4Address, state),
                    TokenWalletV4.getSymbol(rootV4Address, state),
                    TokenWalletV4.getName(rootV4Address, state),
                ])

                if (new BigNumber(balance ?? 0).isZero() || decimals == null) {
                    return
                }

                tokens.push({
                    ...token,
                    balance,
                    decimals,
                    name,
                    symbol,
                    wallet: wallet.toString(),
                })
            }
            catch (e) {
                debug('Token check error', token, e)
            }
        })()))

        this.setData('tokens', tokens)
        this.setState('isCheckingUpgrades', false)
    }

    public async upgrade(token: OutdatedToken): Promise<void> {
        if (
            this.isTokenUpgrading(token.rootV4)
            || this.wallet.account?.address === undefined
            || token.wallet === undefined
            || token.proxy === undefined
            || token.balance === undefined
        ) {
            return
        }

        this.state.upgradingTokens.set(token.rootV4, true)

        const walletAddress = new Address(token.wallet)
        const rpc = useRpc()
        const walletContract = new rpc.Contract(MigrationTokenAbi.WalletV4, walletAddress)

        try {
            await walletContract.methods.burnByOwner({
                callback_address: new Address(token.proxy),
                callback_payload: '',
                grams: 0,
                send_gas_to: this.wallet.account.address,
                tokens: token.balance,
            }).send({
                amount: '1000000000',
                bounce: true,
                from: this.wallet.account.address,
            })
            this.state.upgradedTokens.set(token.rootV4, true)
            runInAction(() => {
                this.data.tokens = this.tokens.filter(t => t.rootV4 !== token.rootV4)
            })
        }
        catch (e) {
            error('Token upgrade error', e)
        }
        finally {
            this.state.upgradingTokens.set(token.rootV4, false)
        }
    }

    public isTokenUpgraded(root: string): boolean {
        return !!this.state.upgradedTokens.get(root)
    }

    public isTokenUpgrading(root: string): boolean {
        return !!this.state.upgradingTokens.get(root)
    }

    public cleanup(): void {
        this.setData(() => ({
            tokens: [],
        }))
    }

    public get isCheckingUpgrades(): TokensUpgradesStoreState['isCheckingUpgrades'] {
        return this.state.isCheckingUpgrades
    }

    public get tokens(): TokensUpgradesStoreData['tokens'] {
        return this.data.tokens
    }

    public get hasTokensToUpgrade(): boolean {
        return this.data.tokens.length > 0
    }

}


const store = new TokensUpgradesStore(useWallet())

export function useTokensUpgrades(): TokensUpgradesStore {
    return store
}
