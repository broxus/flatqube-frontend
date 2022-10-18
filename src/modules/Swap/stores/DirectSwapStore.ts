import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'
import { computed, makeObservable, toJS } from 'mobx'

import { TokenWallet } from '@/misc'
import { DEFAULT_SWAP_BILL } from '@/modules/Swap/constants'
import { BaseSwapStore } from '@/modules/Swap/stores/BaseSwapStore'
import type {
    DirectSwapStoreCtorOptions,
    DirectSwapStoreData,
    DirectSwapStoreInitialData,
} from '@/modules/Swap/types'
import { createTransactionSubscriber, unsubscribeTransactionSubscriber } from '@/modules/Swap/utils'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { WalletService } from '@/stores/WalletService'
import { error, getSafeProcessingId } from '@/utils'


export class DirectSwapStore extends BaseSwapStore<DirectSwapStoreData> {

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly initialData?: DirectSwapStoreInitialData,
        protected readonly options?: DirectSwapStoreCtorOptions,
    ) {
        super(tokensCache, initialData)

        makeObservable(this, {
            isValid: computed,
        })
    }


    /*
     * Public actions. Useful in UI
     * ----------------------------------------------------------------------------------
     */

    /**
     * Manually start direct swap process.
     * @returns {Promise<void>}
     */
    public async submit(..._: any[]): Promise<void> {
        if (!this.isValid) {
            this.setState('isSwapping', false)
            return
        }

        this.setState('isSwapping', true)

        const callId = getSafeProcessingId()

        await unsubscribeTransactionSubscriber(callId)
        const subscriber = createTransactionSubscriber(callId)

        try {
            const deployGrams = this.rightToken?.balance === undefined ? '100000000' : '0'
            const startLt = this.wallet.contract?.lastTransactionId?.lt

            const stream = await subscriber
                .transactions(this.wallet.account!.address)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || tx.id.lt > startLt)
                .filterMap(async transaction => {
                    const decodedTx = await this.wallet.walletContractCallbacks?.decodeTransaction({
                        methods: ['dexPairOperationCancelled', 'dexPairExchangeSuccess'],
                        transaction,
                    })

                    if (decodedTx?.method === 'dexPairOperationCancelled' && decodedTx.input.id.toString() === callId) {
                        this.setState('isSwapping', false)
                        this.options?.callbacks?.onTransactionFailure?.({ callId, input: decodedTx.input })
                        return { input: decodedTx.input }
                    }

                    if (decodedTx?.method === 'dexPairExchangeSuccess' && decodedTx.input.id.toString() === callId) {
                        this.setState('isSwapping', false)
                        this.options?.callbacks?.onTransactionSuccess?.({ callId, input: decodedTx.input, transaction })
                        return { input: decodedTx.input, transaction }
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const [pairWallet, payload] = await Promise.all([
                TokenWallet.walletAddress({
                    owner: this.pair!.address!,
                    root: this.leftTokenAddress!,
                }),
                (await this.pair!.contract!
                    .methods.buildExchangePayload({
                        deploy_wallet_grams: deployGrams,
                        expected_amount: this.minExpectedAmount!,
                        id: callId,
                    })
                    .call({
                        cachedState: toJS(this.pair!.state),
                    }))
                    .value0,
            ])

            const message = await TokenWallet.transferToWallet({
                address: new Address(this.leftToken!.wallet!),
                grams: new BigNumber(2500000000).plus(deployGrams).toFixed(),
                owner: this.wallet.account!.address,
                payload,
                recipient: pairWallet,
                tokens: this.amount!,
            })

            this.options?.callbacks?.onSend?.(message, { callId, mode: 'swap' })

            await message.transaction

            await stream()
        }
        catch (e: any) {
            error('Swap finished with error: ', e)
            if (e.code !== 3) {
                this.options?.callbacks?.onTransactionFailure?.({ callId, message: e.message })
            }
            throw e
        }
        finally {
            this.setState('isSwapping', false)
            await unsubscribeTransactionSubscriber(callId)
        }
    }

    /**
     * Full reset
     * @protected
     */
    public reset(): void {
        this.setData({
            bill: DEFAULT_SWAP_BILL,
            leftAmount: '',
            leftToken: undefined,
            ltrPrice: undefined,
            pair: undefined,
            rightAmount: '',
            rightToken: undefined,
            rtlPrice: undefined,
            slippage: this.data.slippage,
        })
        this.setState({
            isCalculating: false,
            isLowTvl: false,
            isPairChecking: false,
            isSwapping: false,
        })
    }

    /*
     * Computed values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns `true` if all data and bill is valid, otherwise `false`.
     * @returns {boolean}
     */
    public get isValid(): boolean {
        return (
            this.isEnoughLiquidity
            && this.wallet.account?.address !== undefined
            && this.pair?.address !== undefined
            && this.pair?.contract !== undefined
            && this.leftToken?.wallet !== undefined
            && this.leftTokenAddress !== undefined
            && new BigNumber(this.amount || 0).gt(0)
            && new BigNumber(this.expectedAmount || 0).gt(0)
            && new BigNumber(this.minExpectedAmount || 0).gt(0)
            && new BigNumber(this.leftToken.balance || 0).gte(this.amount || 0)
        )
    }

}
