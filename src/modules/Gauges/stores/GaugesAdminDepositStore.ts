import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction,
} from 'mobx'
import { Address } from 'everscale-inpage-provider'

import { error, warn } from '@/utils'
import { WalletService } from '@/stores/WalletService'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { TokenAbi } from '@/misc'

type Data = {
    extraTokensBalances?: string[];
}

export class GaugesAdminDepositStore {

    protected data: Data = {}

    protected staticRpc = useStaticRpc()

    protected reactions?: IReactionDisposer[]

    constructor(
        protected wallet: WalletService,
        protected dataStore: GaugesDataStore,
    ) {
        makeAutoObservable(this)
    }

    public init(): void {
        if (!this.reactions) {
            this.reactions = [
                reaction(
                    () => [this.wallet.address, this.dataStore.extraTokens],
                    () => this.sync(),
                ),
            ]
        }
    }

    public dispose(): void {
        if (this.reactions) {
            this.reactions.forEach(item => item())
            this.reactions = undefined
        }

        this.data = {}
    }

    protected async getBalance(token: string): Promise<string> {
        let balance = '0'

        if (!this.wallet.address) {
            warn('AdminDepositStore.syncWalletBalance', 'Wallet must be connected')
        }
        else {
            try {
                const tokenRootContract = new this.staticRpc.Contract(
                    TokenAbi.Root,
                    new Address(token),
                )
                const tokenUserWallet = await tokenRootContract.methods
                    .walletOf({
                        answerId: 0,
                        walletOwner: new Address(this.wallet.address),
                    }).call()
                const tokenWalletContract = new this.staticRpc.Contract(
                    TokenAbi.Wallet,
                    tokenUserWallet.value0,
                )

                const result = await tokenWalletContract.methods
                    .balance({ answerId: 0 }).call()

                balance = result.value0
            }
            catch (e) {
                error('AdminDepositStore.syncBalance', e)
            }
        }

        return balance
    }

    public async syncBalances(): Promise<void> {
        const { extraTokens } = this.dataStore

        if (!extraTokens) {
            return
        }

        let extraTokensBalances = extraTokens.map(_ => '0')

        if (!this.wallet.address) {
            warn('AdminDepositStore.syncWalletBalance', 'Wallet must be connected')
        }
        else {
            try {
                extraTokensBalances = await Promise.all(
                    extraTokens.map(token => this.getBalance(token.root)),
                )
            }
            catch (e) {
                error('AdminDepositStore.syncWalletBalance', e)
            }
        }

        runInAction(() => {
            this.data.extraTokensBalances = extraTokensBalances
        })
    }

    public async sync(): Promise<void> {
        try {
            await Promise.allSettled([
                this.syncBalances(),
            ])
        }
        catch (e) {
            error('AdminDepositStore.sync', e)
        }
    }

    public get extraTokensBalances(): string[] | undefined {
        return this.data.extraTokensBalances
    }

}
