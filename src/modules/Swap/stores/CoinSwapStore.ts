import BigNumber from 'bignumber.js'
import { Address, Subscriber } from 'everscale-inpage-provider'
import { computed, makeObservable, override } from 'mobx'

import { EverToTip3Address, Tip3ToEverAddress, WeverVaultAddress } from '@/config'
import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { EverAbi, TokenAbi, TokenWallet } from '@/misc'
import { DirectSwapStore } from '@/modules/Swap/stores/DirectSwapStore'
import { WalletService } from '@/stores/WalletService'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { error, getSafeProcessingId, isGoodBignumber } from '@/utils'
import type { CoinSwapStoreInitialData, CoinSwapTransactionCallbacks } from '@/modules/Swap/types'

const rpc = useRpc()
const staticRpc = useStaticRpc()


export class CoinSwapStore extends DirectSwapStore {

    constructor(
        protected readonly wallet: WalletService,
        protected readonly tokensCache: TokensCacheService,
        protected readonly initialData?: CoinSwapStoreInitialData,
        protected readonly _callbacks?: CoinSwapTransactionCallbacks,
    ) {
        super(wallet, tokensCache, initialData)

        makeObservable(this, {
            isEnoughCoinBalance: computed,
            isLeftAmountValid: override,
            isValid: override,
        })
    }


    /*
     * Public actions. Useful in UI
     * ----------------------------------------------------------------------------------
     */

    /**
     *
     * @param way
     */
    public async submit(way: 'fromCoinToTip3' | 'fromTip3ToCoin'): Promise<void> {
        switch (way) {
            case 'fromCoinToTip3':
                await this.swapCoinToTip3()
                break

            case 'fromTip3ToCoin':
                await this.swapTip3ToCoin()
                break

            default:
        }
    }


    /*
     * Computed values
     * ----------------------------------------------------------------------------------
     */

    /**
     *
     */
    public get isEnoughCoinBalance(): boolean {
        const balance = new BigNumber(this.coin.balance ?? 0).shiftedBy(-this.coin.decimals)
        const fee = new BigNumber(this.initialData?.swapFee ?? 0).shiftedBy(-this.coin.decimals)
        return (
            isGoodBignumber(this.leftAmountNumber)
            && this.leftAmountNumber.shiftedBy(-this.leftTokenDecimals).lte(balance.minus(fee))
        )
    }

    /**
     * Returns `true` if all data and bill is valid, otherwise `false`.
     * @returns {boolean}
     */
    public get isValidCoinToTip3(): boolean {
        return (
            this.isEnoughCoinBalance
            && this.wallet.account?.address !== undefined
            && new BigNumber(this.amount || 0).gt(0)
            && new BigNumber(this.expectedAmount || 0).gt(0)
            && new BigNumber(this.minExpectedAmount || 0).gt(0)
        )
    }

    /**
     * Returns `true` if all data and bill is valid, otherwise `false`.
     * @returns {boolean}
     */
    public get isValidTip3ToCoin(): boolean {
        return (
            this.wallet.account?.address !== undefined
            && this.leftToken?.wallet !== undefined
            && this.leftTokenAddress !== undefined
            && new BigNumber(this.amount || 0).gt(0)
            && new BigNumber(this.expectedAmount || 0).gt(0)
            && new BigNumber(this.minExpectedAmount || 0).gt(0)
            && new BigNumber(this.leftToken?.balance || 0).gte(this.amount || 0)
        )
    }


    /*
     * Internal and external utilities methods
     * ----------------------------------------------------------------------------------
     */

    /**
     *
     * @protected
     */
    protected async swapCoinToTip3(): Promise<void> {
        if (!this.isValidCoinToTip3) {
            this.setState('isSwapping', false)
            return
        }

        this.setState('isSwapping', true)

        await this.unsubscribeTransactionSubscriber()

        try {
            const walletAddress = await TokenWallet.walletAddress({
                root: this.rightTokenAddress!,
                owner: EverToTip3Address,
            })

            if (walletAddress === undefined) {
                this.setState('isSwapping', false)
                return
            }

            const hasWallet = (await TokenWallet.balance({ wallet: walletAddress })) !== undefined

            const callId = getSafeProcessingId()
            const deployGrams = (this.rightToken?.balance === undefined || !hasWallet) ? '100000000' : '0'
            const startLt = this.wallet.contract?.lastTransactionId?.lt

            this.#transactionSubscriber = new staticRpc.Subscriber()

            const stream = await this.#transactionSubscriber
                .transactions(this.wallet.account!.address)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || tx.id.lt > startLt)
                .filterMap(async transaction => {
                    const decodedTx = await this.wallet.walletContractCallbacks?.decodeTransaction({
                        methods: ['onSwapEverToTip3Cancel', 'onSwapEverToTip3Success'],
                        transaction,
                    })

                    if (decodedTx?.method === 'onSwapEverToTip3Cancel' && decodedTx.input.id.toString() === callId) {
                        this.setState('isSwapping', false)
                        this._callbacks?.onTransactionFailure?.({ input: decodedTx.input })
                        return { input: decodedTx.input }
                    }

                    if (decodedTx?.method === 'onSwapEverToTip3Success' && decodedTx.input.id.toString() === callId) {
                        this.setState('isSwapping', false)
                        this._callbacks?.onTransactionSuccess?.({ input: decodedTx.input, transaction })
                        return { input: decodedTx.input, transaction }
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const payload = (await new staticRpc.Contract(EverAbi.EverToTip3, EverToTip3Address)
                .methods.buildExchangePayload({
                    deployWalletValue: deployGrams,
                    expectedAmount: this.minExpectedAmount!,
                    id: callId,
                    pair: this.pair!.address!,
                })
                .call())
                .value0

            await new rpc.Contract(EverAbi.WeverVault, WeverVaultAddress)
                .methods.wrap({
                    gas_back_address: this.wallet.account!.address,
                    owner_address: EverToTip3Address,
                    payload,
                    tokens: this.leftAmountNumber.toFixed(),
                })
                .send({
                    amount: this.leftAmountNumber.plus('5000000000').toFixed(),
                    bounce: true,
                    from: this.wallet.account!.address,
                })

            await stream()
        }
        catch (e) {
            error('Currency to Tip3 Swap finished with error: ', e)
            this.setState('isSwapping', false)
        }
        finally {
            await this.unsubscribeTransactionSubscriber()
        }
    }

    /**
     *
     * @protected
     */
    protected async swapTip3ToCoin(): Promise<void> {
        if (!this.isValidTip3ToCoin) {
            this.setState('isSwapping', false)
        }

        this.setState('isSwapping', true)

        await this.unsubscribeTransactionSubscriber()

        try {
            const walletAddress = await TokenWallet.walletAddress({
                root: this.leftTokenAddress!,
                owner: Tip3ToEverAddress,
            })

            if (walletAddress === undefined) {
                this.setState('isSwapping', false)
                return
            }

            const hasWallet = (await TokenWallet.balance({ wallet: walletAddress })) !== undefined

            const callId = getSafeProcessingId()
            const deployGrams = !hasWallet ? '100000000' : '0'
            const startLt = this.wallet.contract?.lastTransactionId?.lt

            this.#transactionSubscriber = new staticRpc.Subscriber()

            const stream = await this.#transactionSubscriber
                .transactions(this.wallet.account!.address)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || tx.id.lt > startLt)
                .filterMap(async transaction => {
                    const decodedTx = await this.wallet.walletContractCallbacks?.decodeTransaction({
                        methods: ['onSwapTip3ToEverCancel', 'onSwapTip3ToEverSuccess'],
                        transaction,
                    })

                    if (decodedTx?.method === 'onSwapTip3ToEverCancel' && decodedTx.input.id.toString() === callId) {
                        this.setState('isSwapping', false)
                        this._callbacks?.onTransactionFailure?.({ input: decodedTx.input })
                        return { input: decodedTx.input }
                    }

                    if (decodedTx?.method === 'onSwapTip3ToEverSuccess' && decodedTx.input.id.toString() === callId) {
                        this.setState('isSwapping', false)
                        this._callbacks?.onTransactionSuccess?.({ input: decodedTx.input, transaction })
                        return { input: decodedTx.input, transaction }
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const payload = (await new staticRpc.Contract(EverAbi.Tip3ToEver, Tip3ToEverAddress)
                .methods.buildExchangePayload({
                    expectedAmount: this.minExpectedAmount!,
                    id: callId,
                    pair: this.pair!.address!,
                })
                .call())
                .value0

            await new rpc.Contract(TokenAbi.Wallet, new Address(this.leftToken!.wallet!))
                .methods.transfer({
                    amount: this.amount!,
                    deployWalletValue: deployGrams,
                    notify: true,
                    payload,
                    recipient: Tip3ToEverAddress,
                    remainingGasTo: this.wallet.account!.address!,
                })
                .send({
                    amount: new BigNumber(3600000000).plus(deployGrams).toFixed(),
                    bounce: true,
                    from: this.wallet.account!.address!,
                })

            await stream()
        }
        catch (e) {
            error('decodeTransaction error: ', e)
            this.setState('isSwapping', false)
        }
        finally {
            await this.unsubscribeTransactionSubscriber()
        }
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
     * Internal swap transaction subscriber
     * @type {Subscriber}
     * @protected
     */
    #transactionSubscriber: Subscriber | undefined

}
