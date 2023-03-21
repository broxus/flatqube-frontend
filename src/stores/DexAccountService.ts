import {
    action,
    computed,
    makeObservable,
    reaction,
    toJS,
} from 'mobx'
import type { IReactionDisposer } from 'mobx'
import type { Address, FullContractState, Transaction } from 'everscale-inpage-provider'
import { Subscription } from 'everscale-inpage-provider'

import { DexGasValuesAddress, DexRootAddress } from '@/config'
import { useStaticRpc } from '@/hooks'
import {
    DexAccountUtils, dexGasValuesContract, DexUtils, getFullContractState,
} from '@/misc'
import { BaseStore } from '@/stores/BaseStore'
import { useWallet } from '@/stores/WalletService'
import type { WalletService } from '@/stores/WalletService'
import {
    addressesComparer, calcGas,
    debug,
    error,
    throttle,
} from '@/utils'

export type Balances = Map<string, string>

export type DexAccountData = {
    address?: Address;
    balances?: Balances;
    wallets?: Map<string, Address>;
}

export type DexAccountState = {
    accountState?: FullContractState;
    dexState?: FullContractState;
}


const staticRpc = useStaticRpc()

export class DexAccountService extends BaseStore<DexAccountData, DexAccountState> {

    constructor(
        public readonly dexRootAddress: Address | string,
        protected readonly wallet: WalletService,
    ) {
        super()

        this.setData(() => ({
            address: undefined,
            balances: undefined,
            wallets: undefined,
        }))

        debug('DexAccountService.constructor')

        makeObservable<DexAccountService, 'handleAccountChange' | 'handleWalletAccountChange'>(this, {
            accountState: computed,
            address: computed,
            balances: computed,
            dexState: computed,
            handleAccountChange: action.bound,
            handleWalletAccountChange: action.bound,
            wallets: computed,
        })
    }

    public async init(): Promise<void> {
        this.accountDisposer = reaction(() => this.address, this.handleAccountChange, {
            equals: addressesComparer,
            fireImmediately: true,
        })

        this.walletAccountDisposer = reaction(() => this.wallet.account?.address, this.handleWalletAccountChange, {
            equals: addressesComparer,
            fireImmediately: true,
        })

        try {
            const state = await getFullContractState(this.dexRootAddress)
            this.setState('dexState', state)
            debug('Sync DEX Root Contract state', state)
        }
        catch (e) {
            error('Sync DEX state error', e)
        }
    }

    public async dispose(): Promise<void> {
        debug('DexAccountService.dispose', this.toJSON())
        this.setData(() => ({
            address: undefined,
            balances: undefined,
            wallets: undefined,
        }))
        this.setState(() => ({
            accountState: undefined,
            dexState: undefined,
        }))
        this.accountDisposer?.()
        this.walletAccountDisposer?.()
        await this.unsubscribe()
    }

    /**
     * Manually connect to the DEX account.
     * @returns {Promise<void>}
     */
    public async connect(): Promise<void> {
        if (this.wallet.address === undefined) {
            return
        }

        const address = await DexAccountUtils.address(
            this.dexRootAddress,
            this.wallet.address,
            this.state.dexState,
        )

        if (!addressesComparer(address, this.address)) {
            this.setData('address', address)
            debug('DEX Account has been connected', address?.toString())
        }
    }

    /**
     * Manually create DEX account
     * @returns {Promise<Transaction | undefined>}
     */
    public async create(): Promise<Transaction | undefined> {
        if (this.wallet.address === undefined) {
            return undefined
        }

        const { dynamicGas, fixedValue } = (await dexGasValuesContract(DexGasValuesAddress)
            .methods.getDeployAccountGas({})
            .call())
            .value0

        const message = await DexUtils.deployAccount(this.dexRootAddress, {
            dexAccountOwnerAddress: this.wallet.address,
        }, {
            amount: calcGas(fixedValue, dynamicGas),
        })

        return message.transaction
    }

    /**
     * Try to connect to the DEX account, else create a new one
     * @returns {Promise<void>}
     */
    public async connectOrCreate(): Promise<void> {
        if (this.wallet.address === undefined) {
            return
        }

        await this.connect()

        if (this.address === undefined) {
            await this.create()
        }

        await this.connect()
    }

    /**
     * Connect to the DEX account and sync nonce, balances, and run balances updater
     * @returns {Promise<void>}
     */
    public async connectAndSync(): Promise<void> {
        if (this.wallet.address === undefined) {
            return
        }

        await this.connect()

        if (this.address === undefined) {
            return
        }

        await Promise.all([
            this.syncBalances(),
            this.syncWallets(),
        ])
    }

    /**
     * Sync DEX account balances
     * @returns {Promise<void>}
     */
    public async syncBalances(force?: boolean): Promise<void> {
        if (this.address === undefined) {
            return
        }

        const balances = await DexAccountUtils.balances(
            this.address,
            force ? undefined : toJS(this.state.accountState),
        )

        this.setData('balances', balances)
    }

    /**
     * Sync DEX account wallets
     * @returns {Promise<void>}
     */
    public async syncWallets(force?: boolean): Promise<void> {
        if (this.address === undefined) {
            return
        }

        const wallets = await DexAccountUtils.wallets(
            this.address,
            force ? undefined : toJS(this.state.accountState),
        )

        this.setData('wallets', wallets)
    }

    /**
     * Returns account wallet by the given account root address
     * @param {string} address
     */
    public getAccountWallet(address: Address | string): Address | undefined {
        return this.wallets?.get(address.toString())
    }

    /**
     *
     * @param address
     */
    public getBalance(address: Address | string): string | undefined {
        return this.balances?.get(address.toString())
    }

    /**
     * Returns DEX user account address
     */
    public get address(): DexAccountData['address'] {
        return this.data.address
    }

    /**
     * Returns map of the DEX account balances
     */
    public get balances(): DexAccountData['balances'] {
        return this.data.balances
    }

    /**
     * Returns map of the DEX account wallets
     */
    public get wallets(): DexAccountData['wallets'] {
        return this.data.wallets
    }

    public get accountState(): DexAccountState['accountState'] {
        return this.state.accountState
    }

    public get dexState(): DexAccountState['dexState'] {
        return this.state.dexState
    }

    protected async handleAccountChange(address?: Address): Promise<void> {
        if (address === undefined) {
            await this.unsubscribe()
            return
        }

        try {
            const state = await getFullContractState(address)
            this.setState('accountState', state)
            debug('Sync DEX Account Contract state', state)
        }
        catch (e) {
            error('Get full Contract state error', e)
        }
    }

    protected async handleWalletAccountChange(address?: Address, prevAddress?: Address): Promise<void> {
        if (!addressesComparer(address, prevAddress)) {
            await this.unsubscribe()

            this.setData(() => ({
                address: undefined,
                balances: undefined,
                wallets: undefined,
            }))
            this.setState(() => ({
                accountState: undefined,
            }))
        }
    }

    public async subscribe(): Promise<void> {
        if (this.wallet.address === undefined) {
            return
        }

        const address = this.address || await DexUtils.getExpectedAccountAddress(
            this.dexRootAddress,
            this.wallet.address,
            toJS(this.state.dexState),
        )

        if (address === undefined) {
            return
        }

        try {
            this.contractSubscriber = await staticRpc.subscribe(
                'contractStateChanged',
                { address },
            )
            debug('Subscribe to DEX Account Contract changes', address.toString())

            this.contractSubscriber.on('data', throttle(async event => {
                debug(
                    '%cRPC%c The DEX Account `contractStateChanged` event was captured',
                    'font-weight: bold; background: #4a5772; color: #fff; border-radius: 2px; padding: 3px 6.5px',
                    'color: #c5e4f3',
                    event,
                )

                const state = await getFullContractState(event.address)

                this.setState('accountState', state)

                await this.connect()

                if (this.address !== undefined) {
                    await Promise.allSettled([
                        this.syncWallets(),
                        this.syncBalances(),
                    ])
                }
            }, 1000))
        }
        catch (e) {
            error('Contract subscribe error', e)
            this.contractSubscriber = undefined
        }
    }

    public async unsubscribe(): Promise<void> {
        if (this.contractSubscriber !== undefined) {
            if (this.address !== undefined) {
                try {
                    debug('Unsubscribe from DEX Account Contract changes')
                    await this.contractSubscriber.unsubscribe()
                }
                catch (e) {
                    error('DEX Account contract unsubscribe error', e)
                }
            }
            this.contractSubscriber = undefined
        }
    }

    protected contractSubscriber: Subscription<'contractStateChanged'> | undefined

    protected accountDisposer: IReactionDisposer | undefined

    protected walletAccountDisposer: IReactionDisposer | undefined

}


const DexAccount = new DexAccountService(DexRootAddress, useWallet())

export function useDexAccount(): DexAccountService {
    return DexAccount
}
