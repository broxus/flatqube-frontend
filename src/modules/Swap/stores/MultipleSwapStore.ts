import BigNumber from 'bignumber.js'
import { Address, Subscriber } from 'everscale-inpage-provider'
import { computed, makeObservable, override } from 'mobx'

import { EverToTip3Address, EverWeverToTip3Address } from '@/config'
import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { EverAbi, TokenAbi, TokenWallet } from '@/misc'
import { CoinSwapStore } from '@/modules/Swap/stores/CoinSwapStore'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { WalletService } from '@/stores/WalletService'
import { error, getSafeProcessingId, isGoodBignumber } from '@/utils'
import type {
    CoinSwapStoreInitialData,
    CoinSwapTransactionCallbacks,
} from '@/modules/Swap/types'


const rpc = useRpc()
const staticRpc = useStaticRpc()


export class MultipleSwapStore extends CoinSwapStore {

    constructor(
        protected readonly wallet: WalletService,
        protected readonly tokensCache: TokensCacheService,
        protected readonly initialData?: CoinSwapStoreInitialData,
        protected readonly _callbacks?: CoinSwapTransactionCallbacks,
    ) {
        super(wallet, tokensCache, initialData)

        makeObservable(this, {
            combinedBalanceNumber: computed,
            isEnoughCombinedBalance: computed,
            isEnoughTokenBalance: computed,
            isLeftAmountValid: override,
            isValid: override,
        })
    }

    public async submit(): Promise<void> {
        if (!this.isValid) {
            return
        }

        this.setState('isSwapping', true)

        await this.unsubscribeTransactionSubscriber()

        try {
            const walletAddress = await TokenWallet.walletAddress({
                owner: EverToTip3Address,
                root: this.rightTokenAddress!,
            })

            if (walletAddress === undefined) {
                this.setState('isSwapping', false)
                return
            }

            const hasWallet = (await TokenWallet.balance({ wallet: walletAddress })) !== undefined

            const callId = getSafeProcessingId()
            const deployWalletValue = (this.rightToken?.balance === undefined || !hasWallet) ? '100000000' : '0'
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

            const payload = (await new staticRpc.Contract(EverAbi.EverWeverToTipP3, EverWeverToTip3Address)
                .methods.buildExchangePayload({
                    amount: this.leftAmountNumber.toFixed(),
                    expectedAmount: this.minExpectedAmount!,
                    deployWalletValue,
                    id: callId,
                    pair: this.pair!.address!,
                })
                .call())
                .value0

            await new rpc.Contract(TokenAbi.Wallet, new Address(this.leftToken!.wallet!))
                .methods.transfer({
                    payload,
                    recipient: EverWeverToTip3Address,
                    deployWalletValue: '0',
                    amount: this.leftToken!.balance!,
                    notify: true,
                    remainingGasTo: this.wallet.account!.address!,
                })
                .send({
                    amount: this.leftAmountNumber.minus(this.leftToken!.balance!).plus(5000000000).toFixed(),
                    from: this.wallet.account!.address!,
                    bounce: true,
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

    public get combinedBalanceNumber(): BigNumber {
        const tokenBalance = new BigNumber(this.leftToken?.balance ?? 0).shiftedBy(-this.leftTokenDecimals)
        const coinBalance = new BigNumber(this.coin.balance ?? 0).shiftedBy(-this.coin.decimals)
        return tokenBalance.plus(coinBalance).dp(Math.min(this.leftTokenDecimals, this.coin.decimals))
    }

    public get isEnoughTokenBalance(): boolean {
        const balance = new BigNumber(this.leftToken?.balance ?? 0).shiftedBy(-this.leftTokenDecimals)
        return (
            isGoodBignumber(this.leftAmountNumber)
            && this.leftAmountNumber.shiftedBy(-this.leftTokenDecimals).lte(balance)
        )
    }

    public get isEnoughCombinedBalance(): boolean {
        const fee = new BigNumber(this.initialData?.swapFee ?? 0).shiftedBy(-this.coin.decimals)
        return this.leftAmountNumber.shiftedBy(-this.leftTokenDecimals).lte(this.combinedBalanceNumber.minus(fee))
    }

    public get isLeftAmountValid(): boolean {
        if (this.leftAmount.length === 0) {
            return true
        }
        return (
            this.leftAmount.length > 0
            && isGoodBignumber(this.leftAmountNumber, false)
            && this.isEnoughCombinedBalance
        )
    }

    /**
     * Returns `true` if all data and bill is valid, otherwise `false`.
     * @returns {boolean}
     */
    public get isValid(): boolean {
        return (
            this.isEnoughLiquidity
            && (this.isEnoughTokenBalance || this.isEnoughCoinBalance || this.isEnoughCombinedBalance)
            && this.wallet.account?.address !== undefined
            && this.pair?.address !== undefined
            && this.pair?.contract !== undefined
            && this.leftToken?.wallet !== undefined
            && this.leftTokenAddress !== undefined
            && isGoodBignumber(this.amount || 0)
            && isGoodBignumber(this.expectedAmount || 0)
            && isGoodBignumber(this.minExpectedAmount || 0)
        )
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
