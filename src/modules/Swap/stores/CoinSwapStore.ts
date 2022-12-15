import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'
import { computed, makeObservable, override } from 'mobx'

import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { EverAbi, TokenWallet } from '@/misc'
import { DEFAULT_SWAP_BILL } from '@/modules/Swap/constants'
import { BaseSwapStore } from '@/modules/Swap/stores/BaseSwapStore'
import type {
    CoinSwapStoreCtorOptions,
    CoinSwapStoreInitialData,
    DirectSwapStoreData,
} from '@/modules/Swap/types'
import { createTransactionSubscriber, unsubscribeTransactionSubscriber } from '@/modules/Swap/utils'
import { WalletService } from '@/stores/WalletService'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { error, getSafeProcessingId, isGoodBignumber } from '@/utils'

const rpc = useRpc()
const staticRpc = useStaticRpc()


export class CoinSwapStore extends BaseSwapStore<DirectSwapStoreData> {

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly initialData?: CoinSwapStoreInitialData,
        protected readonly options?: CoinSwapStoreCtorOptions,
    ) {
        super(tokensCache, initialData, options)

        makeObservable(this, {
            isEnoughCoinBalance: computed,
            isLeftAmountValid: override,
        })
    }


    /*
     * Public actions. Useful in UI
     * ----------------------------------------------------------------------------------
     */

    /**
     * Reset data and states to their defaults
     */
    public reset(): void {
        this.setData(() => ({
            bill: DEFAULT_SWAP_BILL,
            leftAmount: '',
            leftToken: undefined,
            ltrPrice: undefined,
            pair: undefined,
            rightAmount: '',
            rightToken: undefined,
            rtlPrice: undefined,
            slippage: this.data.slippage,
            transaction: undefined,
        }))

        this.setState(() => ({
            isCalculating: false,
            isLowTvl: false,
            isPairChecking: false,
            isSwapping: false,
        }))
    }

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
        const balance = new BigNumber(this.wallet.coin.balance ?? 0).shiftedBy(-this.wallet.coin.decimals)
        const fee = new BigNumber(this.options?.safeAmount ?? 0).shiftedBy(-this.wallet.coin.decimals)
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
            && this.options?.coinToTip3Address !== undefined
            && this.options.wrappedCoinVaultAddress !== undefined
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
            && this.options?.tip3ToCoinAddress !== undefined
            && this.options.wrappedCoinVaultAddress !== undefined
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

            let hasWallet = false

            try {
                hasWallet = (await TokenWallet.balance({ wallet: walletAddress })) !== undefined
            }
            catch (e) {}

            const deployGrams = (this.rightToken?.balance === undefined || !hasWallet) ? '100000000' : '0'
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

            const payload = (await new staticRpc.Contract(EverAbi.EverToTip3, this.options!.coinToTip3Address!)
                .methods.buildExchangePayload({
                    deployWalletValue: deployGrams,
                    expectedAmount: this.minExpectedAmount!,
                    id: callId,
                    pair: this.pair!.address!,
                })
                .call())
                .value0

            const message = await new rpc.Contract(EverAbi.WeverVault, this.options!.wrappedCoinVaultAddress)
                .methods.wrap({
                    gas_back_address: this.wallet.account!.address,
                    owner_address: this.options!.coinToTip3Address!,
                    payload,
                    tokens: this.leftAmountNumber.toFixed(),
                })
                .sendDelayed({
                    amount: this.leftAmountNumber.plus('5000000000').toFixed(),
                    bounce: true,
                    from: this.wallet.account!.address,
                })

            this.setState('isSwapping', false)

            this.options?.callbacks?.onSend?.(message, { callId, mode: 'swap' })

            await message.transaction

            await stream()
        }
        catch (e: any) {
            error('Currency to Tip3 Swap finished with error: ', e)
            if (e.code !== 3) {
                this.options?.callbacks?.onTransactionFailure?.({ callId, message: e.message, status: 'cancel' })
            }
            throw e
        }
        finally {
            this.setState('isSwapping', false)
            await unsubscribeTransactionSubscriber(callId)
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

        const callId = getSafeProcessingId()

        await unsubscribeTransactionSubscriber(callId)

        const subscriber = createTransactionSubscriber(callId)

        try {
            const walletAddress = await TokenWallet.walletAddress({
                owner: this.options!.tip3ToCoinAddress,
                root: this.leftTokenAddress as Address,
            })

            if (walletAddress === undefined) {
                this.setState('isSwapping', false)
                return
            }

            let hasWallet = false

            try {
                hasWallet = (await TokenWallet.balance({ wallet: walletAddress })) !== undefined
            }
            catch (e) {}

            const deployGrams = !hasWallet ? '100000000' : '0'
            const startLt = this.wallet.contract?.lastTransactionId?.lt

            const stream = await subscriber
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
                        this.options?.callbacks?.onTransactionFailure?.({ callId, input: decodedTx.input, status: 'cancel' })
                        return { input: decodedTx.input }
                    }

                    if (decodedTx?.method === 'onSwapTip3ToEverSuccess' && decodedTx.input.id.toString() === callId) {
                        this.setState('isSwapping', false)
                        this.options?.callbacks?.onTransactionSuccess?.({ callId, input: decodedTx.input, transaction })
                        return { input: decodedTx.input, transaction }
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const payload = (await new staticRpc.Contract(EverAbi.Tip3ToEver, this.options!.tip3ToCoinAddress)
                .methods.buildExchangePayload({
                    expectedAmount: this.minExpectedAmount!,
                    id: callId,
                    pair: this.pair!.address!,
                })
                .call())
                .value0

            const message = await TokenWallet.transfer({
                address: new Address(this.leftToken!.wallet!),
                bounce: true,
                deployWalletValue: deployGrams,
                grams: new BigNumber(3600000000).plus(deployGrams).toFixed(),
                owner: this.wallet.account!.address!,
                payload,
                recipient: this.options!.tip3ToCoinAddress,
                tokens: this.amount!,
            })

            this.setState('isSwapping', false)

            this.options?.callbacks?.onSend?.(message, { callId, mode: 'swap' })

            await message.transaction

            await stream()
        }
        catch (e: any) {
            error('decodeTransaction error: ', e)
            if (e.code !== 3) {
                this.options?.callbacks?.onTransactionFailure?.({ callId, message: e.message, status: 'cancel' })
            }
            throw e
        }
        finally {
            this.setState('isSwapping', false)
            await unsubscribeTransactionSubscriber(callId)
        }
    }

}
