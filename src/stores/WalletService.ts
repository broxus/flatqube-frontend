import BigNumber from 'bignumber.js'
import {
    AssetType,
    Contract,
    ContractState,
    FullContractState,
    hasEverscaleProvider,
    Permissions,
} from 'everscale-inpage-provider'
import { action, computed, makeObservable } from 'mobx'
import { TvmWalletService } from '@broxus/tvm-connect/lib'

import { MinWalletVersion } from '@/config'
import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { DexAbi, DexConstants, Token } from '@/misc'
import { BaseStore } from '@/stores/BaseStore'
import { error, log } from '@/utils'
import { useTvmWallet } from '@/hooks'


export type Account = Permissions['accountInteraction']

export type WalletData = {
    account?: Account;
    balance: string;
    contract?: ContractState | FullContractState;
    version?: string;
}

export type WalletState = {
    hasProvider: boolean;
    isConnecting?: boolean;
    isDisconnecting?: boolean;
    isInitialized?: boolean;
    isInitializing?: boolean;
    isUpdatingContract?: boolean;
}

export type WalletServiceCtorOptions = {
    /** Semver dot-notation string */
    minWalletVersion?: string;
}

export type WalletNativeCoin = Pick<Token, 'balance' | 'decimals' | 'icon' | 'name' | 'symbol'>


const DEFAULT_WALLET_DATA: WalletData = {
    account: undefined,
    balance: '0',
    contract: undefined,
}

const DEFAULT_WALLET_STATE: WalletState = {
    hasProvider: false,
    isConnecting: false,
    isDisconnecting: false,
    isInitialized: false,
    isInitializing: false,
    isUpdatingContract: false,
}

const staticRpc = useStaticRpc()


export async function connect(): Promise<Permissions['accountInteraction'] | undefined> {
    const hasProvider = await hasEverscaleProvider()

    if (hasProvider) {
        const rpc = useRpc()
        await rpc.ensureInitialized()
        return (await rpc.requestPermissions({
            permissions: ['basic', 'accountInteraction'],
        })).accountInteraction
    }
    return undefined
}

export class WalletService extends BaseStore<WalletData, WalletState> {

    private _service: TvmWalletService = useTvmWallet()

    constructor(
        protected readonly nativeCoin?: WalletNativeCoin,
        protected readonly options?: WalletServiceCtorOptions,
    ) {
        super()

        this.setData(() => DEFAULT_WALLET_DATA)
        this.setState(() => ({
            ...DEFAULT_WALLET_STATE,
            isInitializing: true,
        }))

        makeObservable(this, {
            account: computed,
            address: computed,
            balance: computed,
            balanceNumber: computed,
            coin: computed,
            connect: action.bound,
            contract: computed,
            disconnect: action.bound,
            hasProvider: computed,
            isConnected: computed,
            isConnecting: computed,
            isInitialized: computed,
            isInitializing: computed,
            isOutdated: computed,
            isReady: computed,
            isUpdatingContract: computed,
            service: computed,
            walletContractCallbacks: computed,
        })

        this.init().catch(reason => {
            error('Wallet init error', reason)
            this.setState('isConnecting', false)
        })
    }

    public get service(): TvmWalletService {
        return this._service
    }

    /**
     * Manually connect to the wallet
     * @returns {Promise<void>}
     */
    public async connect(): Promise<void> {
        await this._service.connect()
    }

    /**
     * Manually disconnect from the wallet
     * @returns {Promise<void>}
     */
    public async disconnect(): Promise<void> {
        await this._service.disconnect()
    }

    /**
     * Add custom token asset to the EVER Wallet
     * @param {string} root
     * @param {AssetType} [type]
     */
    public async addAsset(root: string, type: AssetType = 'tip3_token'): Promise<{ newAsset: boolean } | undefined> {
        const result = await this._service.addAsset(root, type) ?? false
        return { newAsset: result }
    }

    /**
     * Returns computed wallet address value
     * @returns {string | undefined}
     */
    public get address(): string | undefined {
        return this._service.address?.toString()
    }

    /**
     * Returns computed wallet balance value
     * @returns {string | undefined}
     */
    public get balance(): WalletData['balance'] {
        return this._service.balance
    }

    /**
     * Returns computed BigNumber instance of the wallet balance value
     * @returns {BigNumber}
     */
    public get balanceNumber(): BigNumber {
        return BigNumber(this.balance || 0).shiftedBy(-this._service.currency.decimals)
    }

    /**
     * Returns `true` if provider is available.
     * That means extension is installed and activated, else `false`
     * @returns {boolean}
     */
    public get hasProvider(): WalletState['hasProvider'] {
        return this._service.hasProvider
    }

    /**
     * Returns `true` if wallet is connected
     * @returns {boolean}
     */
    public get isConnected(): boolean {
        return this.address !== undefined
    }

    /**
     * Returns `true` if wallet is connecting
     * @returns {boolean}
     */
    public get isConnecting(): WalletState['isConnecting'] {
        return this._service.isConnecting
    }

    /**
     * Returns `true` if wallet is initialized
     * @returns {boolean}
     */
    public get isInitialized(): WalletState['isInitialized'] {
        return this._service.isInitialized
    }

    /**
     * Returns `true` if wallet is initializing
     * @returns {boolean}
     */
    public get isInitializing(): WalletState['isInitializing'] {
        return this._service.isInitializing
    }

    /**
     * Returns `true` if installed wallet has outdated version
     */
    public get isOutdated(): boolean {
        return this._service.isOutdated
    }

    /**
     * Returns `true` if connection to RPC is initialized and connected
     * @returns {boolean}
     */
    public get isReady(): boolean {
        return this._service.isReady
    }

    /**
     * Returns `true` if wallet contract is updating
     * @returns {boolean}
     */
    public get isUpdatingContract(): WalletState['isUpdatingContract'] {
        return this._service.isSyncing
    }

    /**
     * Returns computed account
     * @returns {WalletData['account']}
     */
    public get account(): WalletData['account'] {
        return this._service.account
    }

    /**
     * Returns base native wallet coin
     * @returns {WalletNativeCoin}
     */
    public get coin(): WalletNativeCoin {
        return {
            balance: this.balance,
            ...this._service.currency,
        }
    }

    /**
     * Returns computed wallet contract state
     * @returns {WalletData['contract']}
     */
    public get contract(): WalletData['contract'] {
        return this._service.contract
    }

    /**
     * Returns computed DEX Callbacks ABI Contract for current by current wallet address.
     * @returns {Contract<typeof DexAbi.Callbacks> | undefined}
     */
    public get walletContractCallbacks(): Contract<typeof DexAbi.Callbacks> | undefined {
        return this.account?.address !== undefined
            ? new staticRpc.Contract(DexAbi.Callbacks, this.account.address)
            : undefined
    }

    /**
     * Wallet initializing. It runs
     * @returns {Promise<void>}
     * @protected
     */
    protected async init(): Promise<void> {
        await this._service.init()
    }

}


let wallet: WalletService

export function useWallet(): WalletService {
    if (wallet === undefined) {
        log(
            '%cCreated a new one WalletService instance as global service to interact with the EVER Wallet browser extension',
            'color: #bae701',
        )
        wallet = new WalletService({
            decimals: DexConstants.CoinDecimals,
            icon: DexConstants.CoinLogoURI,
            name: DexConstants.CoinSymbol,
            symbol: DexConstants.CoinSymbol,
        }, {
            minWalletVersion: MinWalletVersion,
        })
    }
    return wallet
}
