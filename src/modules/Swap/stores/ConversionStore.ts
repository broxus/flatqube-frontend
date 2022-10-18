import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'
import { computed, makeObservable } from 'mobx'

import { useRpc } from '@/hooks/useRpc'
import { TokenWallet } from '@/misc'
import type { ConversionStoreCtorOptions, ConversionStoreData, ConversionStoreState } from '@/modules/Swap/types'
import { BaseStore } from '@/stores/BaseStore'
import { TokensCacheService } from '@/stores/TokensCacheService'
import type { TokenCache } from '@/stores/TokensCacheService'
import { WalletService } from '@/stores/WalletService'
import { error, getSafeProcessingId, isGoodBignumber } from '@/utils'


const rpc = useRpc()


export class ConversionStore extends BaseStore<ConversionStoreData, ConversionStoreState> {

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly options?: ConversionStoreCtorOptions,
    ) {
        super()

        this.setData({
            amount: '',
        })

        this.setState({
            isProcessing: false,
        })

        makeObservable(this, {
            isInsufficientUnwrapBalance: computed,
            isInsufficientWrapBalance: computed,
            isProcessing: computed,
            isUnwrapAmountValid: computed,
            isUnwrapValid: computed,
            isWrapAmountValid: computed,
            isWrapValid: computed,
            token: computed,
            txHash: computed,
            unwrappedAmount: computed,
            wrappedAmount: computed,
        })
    }

    public async wrap(): Promise<void> {
        if (this.wallet.account?.address === undefined || this.options?.wrappedCoinVaultAddress === undefined) {
            return
        }

        const callId = getSafeProcessingId()

        try {
            this.setState('isProcessing', true)

            const wrappedAmount = new BigNumber(this.amount ?? 0).shiftedBy(this.wallet.coin.decimals)
            const amount = wrappedAmount.plus(this.options?.wrapGas ?? 0).toFixed()

            const message = await rpc.sendMessageDelayed({
                amount,
                bounce: false,
                recipient: this.options.wrappedCoinVaultAddress,
                sender: this.wallet.account.address,
            })

            this.options?.callbacks?.onSend?.(message, { callId, mode: 'wrap' })

            this.setState('isProcessing', false)

            const transaction = await message.transaction

            this.options?.callbacks?.onTransactionSuccess?.({
                amount: wrappedAmount.toFixed(),
                callId,
                direction: 'wrap',
                receivedDecimals: this.token?.decimals,
                receivedIcon: this.token?.icon,
                receivedRoot: this.token?.root,
                receivedSymbol: this.token?.symbol,
                txHash: transaction.id.hash,
            })
        }
        catch (e: any) {
            error('Wrap error', e)
            if (e.code !== 3) {
                this.options?.callbacks?.onTransactionFailure?.({ callId, direction: 'wrap', message: e.message })
            }
            throw e
        }
        finally {
            this.setState('isProcessing', false)
        }
    }

    public async unwrap(): Promise<void> {
        if (
            this.wallet.account?.address === undefined
            || this.token?.wallet === undefined
            || this.token?.decimals === undefined
            || this.options?.wrappedCoinVaultAddress === undefined
        ) {
            return
        }

        const callId = getSafeProcessingId()

        try {
            const amount = new BigNumber(this.amount ?? 0).shiftedBy(this.token.decimals ?? 0).toFixed()

            this.setState('isProcessing', true)

            const message = await TokenWallet.transfer({
                address: new Address(this.token.wallet),
                bounce: false,
                deployWalletValue: '0',
                grams: '500000000',
                owner: this.wallet.account.address,
                payload: '',
                recipient: this.options.wrappedCoinVaultAddress,
                tokens: amount,
            })

            this.options?.callbacks?.onSend?.(message, { callId, mode: 'unwrap' })

            this.setState('isProcessing', false)

            const transaction = await message.transaction

            this.options?.callbacks?.onTransactionSuccess?.({
                amount,
                callId,
                direction: 'unwrap',
                receivedDecimals: this.wallet.coin.decimals,
                receivedIcon: this.wallet.coin.icon,
                receivedSymbol: this.wallet.coin.symbol,
                txHash: transaction.id.hash,
            })
        }
        catch (e: any) {
            error('Unwrap error', e)
            if (e.code !== 3) {
                this.options?.callbacks?.onTransactionFailure?.({ callId, direction: 'unwrap', message: e.message })
            }
            throw e
        }
        finally {
            this.setState('isProcessing', false)
        }
    }

    public get amount(): ConversionStoreData['amount'] {
        return this.data.amount
    }

    public get wrappedAmount(): ConversionStoreData['wrappedAmount'] {
        return this.data.wrappedAmount
    }

    public get unwrappedAmount(): ConversionStoreData['unwrappedAmount'] {
        return this.data.unwrappedAmount
    }

    public get token(): TokenCache | undefined {
        return this.tokensCache.get(this.options?.tokenAddress?.toString())
    }

    public get txHash(): ConversionStoreData['txHash'] {
        return this.data.txHash
    }

    public get isWrapAmountValid(): boolean {
        if (this.amount.length === 0) {
            return true
        }

        return this.amount.length > 0 && !this.isInsufficientWrapBalance
    }

    public get isUnwrapAmountValid(): boolean {
        if (this.amount.length === 0) {
            return true
        }

        return this.amount.length > 0 && !this.isInsufficientUnwrapBalance
    }

    public get isInsufficientWrapBalance(): boolean {
        if (this.wallet.coin.decimals === undefined) {
            return true
        }

        const amount = new BigNumber(this.amount || 0)
        const balance = new BigNumber(this.wallet.balance || 0).shiftedBy(-this.wallet.coin.decimals)
        const safeAmount = new BigNumber(this.options?.safeAmount ?? 0).shiftedBy(-this.wallet.coin.decimals)

        return isGoodBignumber(amount) && balance.minus(safeAmount).lt(amount)
    }

    public get isInsufficientUnwrapBalance(): boolean {
        if (this.token?.decimals === undefined) {
            return true
        }

        const amount = new BigNumber(this.amount || 0)
        const balance = new BigNumber(this.token?.balance || 0).shiftedBy(-this.token.decimals)

        return isGoodBignumber(amount) && balance.lt(amount)
    }

    public get isProcessing(): ConversionStoreState['isProcessing'] {
        return this.state.isProcessing
    }

    public get isWrapValid(): boolean {
        return this.amount.length > 0 && isGoodBignumber(this.amount) && this.isWrapAmountValid
    }

    public get isUnwrapValid(): boolean {
        return this.amount.length > 0 && isGoodBignumber(this.amount) && this.isUnwrapAmountValid
    }

}
