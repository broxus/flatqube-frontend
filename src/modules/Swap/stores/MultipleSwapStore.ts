import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'
import { computed, makeObservable, override } from 'mobx'

import { useStaticRpc } from '@/hooks/useStaticRpc'
import { EverAbi, TokenWallet } from '@/misc'
import { CoinSwapStore } from '@/modules/Swap/stores/CoinSwapStore'
import type { CoinSwapStoreInitialData, MultipleSwapStoreCtorOptions } from '@/modules/Swap/types'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { WalletService } from '@/stores/WalletService'
import { error, getSafeProcessingId, isGoodBignumber } from '@/utils'
import { createTransactionSubscriber, unsubscribeTransactionSubscriber } from '@/modules/Swap/utils'


const staticRpc = useStaticRpc()


export class MultipleSwapStore extends CoinSwapStore {

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly initialData?: CoinSwapStoreInitialData,
        protected readonly options?: MultipleSwapStoreCtorOptions,
    ) {
        super(wallet, tokensCache, initialData, options)

        makeObservable(this, {
            combinedBalanceNumber: computed,
            isEnoughCombinedBalance: computed,
            isEnoughTokenBalance: computed,
            isLeftAmountValid: override,
            isValid: computed,
        })
    }

    public async submit(): Promise<void> {
        if (!this.isValid) {
            return
        }

        this.setState('isSwapping', true)

        const callId = getSafeProcessingId()

        await unsubscribeTransactionSubscriber(callId)

        const subscriber = createTransactionSubscriber(callId)

        try {
            const walletAddress = await TokenWallet.walletAddress({
                owner: this.options!.coinToTip3Address,
                root: this.rightTokenAddress!,
            })

            if (walletAddress === undefined) {
                this.setState('isSwapping', false)
                return
            }

            const hasWallet = (await TokenWallet.balance({ wallet: walletAddress })) !== undefined

            const deployWalletValue = (this.rightToken?.balance === undefined || !hasWallet) ? '100000000' : '0'
            const startLt = this.wallet.contract?.lastTransactionId?.lt

            const stream = await subscriber
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
                        this.options?.callbacks?.onTransactionFailure?.({ callId, input: decodedTx.input, status: 'cancel' })
                        return { input: decodedTx.input }
                    }

                    if (decodedTx?.method === 'onSwapEverToTip3Success' && decodedTx.input.id.toString() === callId) {
                        this.setState('isSwapping', false)
                        this.options?.callbacks?.onTransactionSuccess?.({ callId, input: decodedTx.input, transaction })
                        return { input: decodedTx.input, transaction }
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const payload = (await new staticRpc.Contract(EverAbi.EverWeverToTipP3, this.options!.comboToTip3Address)
                .methods.buildExchangePayload({
                    amount: this.leftAmountNumber.toFixed(),
                    deployWalletValue,
                    expectedAmount: this.minExpectedAmount!,
                    id: callId,
                    pair: this.pair!.address!,
                })
                .call())
                .value0

            const message = await TokenWallet.transfer({
                address: new Address(this.leftToken!.wallet!),
                bounce: true,
                deployWalletValue: '0',
                grams: this.leftAmountNumber.minus(this.leftToken!.balance!).plus(5000000000).toFixed(),
                owner: this.wallet.account!.address!,
                payload,
                recipient: this.options!.comboToTip3Address,
                tokens: this.leftToken!.balance!,
            })

            this.setState('isSwapping', false)

            this.options?.callbacks?.onSend?.(message, { callId, mode: 'swap' })

            await message.transaction

            await stream()
        }
        catch (e: any) {
            error('decodeTransaction error: ', e)
            if (e.code !== 3) {
                this.options?.callbacks?.onTransactionFailure?.({ callId, status: 'cancel' })
            }
            throw e
        }
        finally {
            this.setState('isSwapping', false)
            await unsubscribeTransactionSubscriber(callId)
        }
    }

    public get combinedBalanceNumber(): BigNumber {
        const tokenBalance = new BigNumber(this.leftToken?.balance ?? 0).shiftedBy(-this.leftTokenDecimals)
        const coinBalance = new BigNumber(this.wallet.coin.balance ?? 0).shiftedBy(-this.wallet.coin.decimals)
        return tokenBalance.plus(coinBalance).dp(Math.min(this.leftTokenDecimals, this.wallet.coin.decimals))
    }

    public get isEnoughTokenBalance(): boolean {
        const balance = new BigNumber(this.leftToken?.balance ?? 0).shiftedBy(-this.leftTokenDecimals)
        return (
            isGoodBignumber(this.leftAmountNumber)
            && this.leftAmountNumber.shiftedBy(-this.leftTokenDecimals).lte(balance)
        )
    }

    public get isEnoughCombinedBalance(): boolean {
        const safeAmount = new BigNumber(this.options?.safeAmount ?? 0).shiftedBy(-this.wallet.coin.decimals)
        return this.leftAmountNumber
            .shiftedBy(-this.leftTokenDecimals)
            .lte(this.combinedBalanceNumber.minus(safeAmount))
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
            && this.options?.coinToTip3Address !== undefined
            && this.options.comboToTip3Address !== undefined
        )
    }

}
