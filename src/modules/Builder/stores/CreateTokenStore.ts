import {
    action,
    IReactionDisposer,
    makeAutoObservable,
    reaction,
} from 'mobx'
import { AddressLiteral, Subscriber } from 'everscale-inpage-provider'

import { TokenFactoryAddress } from '@/config'
import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { TokenAbi } from '@/misc'
import {
    DEFAULT_CREATE_TOKEN_STORE_DATA,
    DEFAULT_CREATE_TOKEN_STORE_STATE,
} from '@/modules/Builder/constants'
import {
    CreateTokenStoreData,
    CreateTokenStoreState,
    CreateTokenSuccessResult,
    CreateTokenTransactionResult,
} from '@/modules/Builder/types'
import { saveTokenToLocalStorage } from '@/modules/Builder/utils'
import { useWallet, WalletService } from '@/stores/WalletService'
import { error } from '@/utils'


const rpc = useRpc()
const staticRpc = useStaticRpc()


export class CreateTokenStore {

    /**
     * Current data of the creating token form
     * @type {CreateTokenStoreData}
     * @protected
     */
    protected data: CreateTokenStoreData = DEFAULT_CREATE_TOKEN_STORE_DATA

    /**
     * Current state of the creating token store
     * @type {CreateTokenStoreState}
     * @protected
     */
    protected state: CreateTokenStoreState = DEFAULT_CREATE_TOKEN_STORE_STATE

    /**
     * Last creating token transaction result data
     * @type {CreateTokenTransactionResult | undefined}
     * @protected
     */
    protected transactionResult: CreateTokenTransactionResult | undefined = undefined

    /**
     * Internal builder transaction subscriber
     * @type {Subscriber}
     * @protected
     */
    protected transactionSubscriber: Subscriber | undefined

    /**
     *
     * @param {WalletService} wallet
     */
    constructor(protected readonly wallet: WalletService = useWallet()) {
        makeAutoObservable<
            CreateTokenStore,
            | 'handleWalletAccountChange'
            | 'handleTransactionResult'
            | 'handleCreateTokenSuccess'
            | 'handleCreateTokenFailure'
        >(this, {
            changeData: action.bound,
            createToken: action.bound,
            handleWalletAccountChange: action.bound,
            handleTransactionResult: action.bound,
            handleCreateTokenSuccess: action.bound,
            handleCreateTokenFailure: action.bound,
        })
    }

    /**
     * Manually change store data by the given key
     * @template K
     * @param {K} key
     * @param {CreateTokenStoreData[k]} value
     */
    public changeData<K extends keyof CreateTokenStoreData>(key: K, value: CreateTokenStoreData[K]): void {
        this.data[key] = value
    }

    /**
     * Manually change store state by the given key
     * @template K
     * @param {K} key
     * @param {CreateTokenStoreState[K]} value
     */
    protected changeState<K extends keyof CreateTokenStoreState>(key: K, value: CreateTokenStoreState[K]): void {
        this.state[key] = value
    }

    public async init(): Promise<void> {
        this.#walletAccountDisposer = reaction(() => this.wallet.address, this.handleWalletAccountChange)
        await this.unsubscribeTransactionSubscriber()
    }

    /**
     * Manually dispose all of the internal subscribers.
     * Clean reset creating token `data` to default values.
     */
    public async dispose(): Promise<void> {
        this.#walletAccountDisposer?.()
        this.reset()
        await this.unsubscribeTransactionSubscriber()
    }

    /**
     * Try to unsubscribe from transaction subscriber
     * @protected
     */
    protected async unsubscribeTransactionSubscriber(): Promise<void> {
        if (this.#transactionSubscriber !== undefined) {
            try {
                await this.#transactionSubscriber.unsubscribe()
            }
            catch (e) {
                error('Transaction unsubscribe error', e)
            }

            this.#transactionSubscriber = undefined
        }
    }

    /**
     * Manually clean last transaction result
     */
    public cleanTransactionResult(): void {
        this.transactionResult = undefined
    }

    /**
     *
     * @param {string} [walletAddress]
     * @param {string} [prevWalletAddress]
     * @protected
     */
    protected handleWalletAccountChange(walletAddress?: string, prevWalletAddress?: string): void {
        if (walletAddress !== prevWalletAddress) {
            this.reset()
        }
    }

    /**
     * Success transaction callback handler
     * @param {CreateTokenSuccessResult['input']} input
     * @param {CreateTokenSuccessResult['transaction']} transaction
     * @protected
     */
    protected handleCreateTokenSuccess({ input, transaction }: CreateTokenSuccessResult): void {
        this.transactionResult = {
            hash: transaction.id.hash,
            name: this.name,
            root: input.token_root.toString(),
            success: true,
            symbol: this.symbol,
        }

        this.changeState('isCreating', false)

        this.changeData('decimals', '')
        this.changeData('name', '')
        this.changeData('symbol', '')

        saveTokenToLocalStorage(input.token_root.toString())
    }

    /**
     * Failure transaction callback handler
     * @protected
     */
    protected handleCreateTokenFailure(): void {
        this.transactionResult = {
            success: false,
        }

        this.changeState('isCreating', false)
        this.changeData('decimals', '')
        this.changeData('name', '')
        this.changeData('symbol', '')
    }

    /**
     *
     * Manually start creating token processing
     * @returns {Promise<void>>}
     */
    public async createToken(): Promise<void> {
        if (
            !this.wallet.account?.address
            || !this.name
            || !this.symbol
            || !this.decimals
        ) {
            this.changeState('isCreating', false)
            return
        }

        this.changeState('isCreating', true)

        try {
            // eslint-disable-next-line no-bitwise
            const callId = ((Math.random() * 100000) | 0).toString()
            const startLt = this.wallet.contract?.lastTransactionId?.lt

            this.#transactionSubscriber = new staticRpc.Subscriber()

            const stream = await this.#transactionSubscriber
                .transactions(this.wallet.account.address)
                .flatMap(a => a.transactions)
                .filter(tx => !startLt || tx.id.lt > startLt)
                .filterMap(async transaction => {
                    const decodedTx = await new staticRpc.Contract(
                        TokenAbi.TokenRootDeployCallbacks,
                        this.wallet.account!.address,
                    ).decodeTransaction({
                        methods: ['onTokenRootDeployed'],
                        transaction,
                    })

                    if (decodedTx !== undefined) {
                        if (decodedTx.method === 'onTokenRootDeployed' && decodedTx.input.callId.toString() === callId) {
                            this.handleCreateTokenSuccess({ input: decodedTx.input, transaction })
                            return { input: decodedTx.input, transaction }
                        }

                        this.handleCreateTokenFailure()
                        return { input: decodedTx.input }
                    }

                    return undefined
                })
                .delayed(s => s.first())

            await new rpc.Contract(TokenAbi.Factory, TokenFactoryAddress)
                .methods.createToken({
                    callId,
                    name: this.name.trim(),
                    symbol: this.symbol.trim(),
                    decimals: this.decimals.trim(),
                    initialSupplyTo: new AddressLiteral('0:0000000000000000000000000000000000000000000000000000000000000000'),
                    initialSupply: 0,
                    deployWalletValue: '0',
                    mintDisabled: false,
                    burnByRootDisabled: false,
                    burnPaused: false,
                    remainingGasTo: this.wallet.account.address,
                })
                .send({
                    amount: '5000000000',
                    bounce: true,
                    from: this.wallet.account.address,
                })

            await stream()
        }
        catch (e) {
            error('Create token error', e)
            this.changeState('isCreating', false)
        }
        finally {
            await this.unsubscribeTransactionSubscriber()
        }

    }

    /**
     * Reset creating token `state` to default values
     * @protected
     */
    protected reset(): void {
        this.data = {
            ...DEFAULT_CREATE_TOKEN_STORE_DATA,
        }
    }

    /**
     *
     * @returns {CreateTokenStoreData['decimals']}
     */
    public get decimals(): CreateTokenStoreData['decimals'] {
        return this.data.decimals
    }

    /**
     *
     * @returns {CreateTokenStoreData['name']}
     */
    public get name(): CreateTokenStoreData['name'] {
        return this.data.name
    }

    /**
     *
     * @returns {CreateTokenStoreData['symbol']}
     */
    public get symbol(): CreateTokenStoreData['symbol'] {
        return this.data.symbol
    }

    public get isCreating(): CreateTokenStoreState['isCreating'] {
        return this.state.isCreating
    }

    public get transaction(): CreateTokenTransactionResult | undefined {
        return this.transactionResult
    }

    #walletAccountDisposer: IReactionDisposer | undefined

    /**
     * Internal swap transaction subscriber
     * @type {Subscriber}
     * @protected
     */
    #transactionSubscriber: Subscriber | undefined

}

const CreateToken = new CreateTokenStore()

export function useCreateTokenStore(): CreateTokenStore {
    return CreateToken
}
