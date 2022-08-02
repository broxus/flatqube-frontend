import BigNumber from 'bignumber.js'
import { Address, Subscriber } from 'everscale-inpage-provider'
import { computed, makeObservable, toJS } from 'mobx'

import { useStaticRpc } from '@/hooks/useStaticRpc'
import { TokenWallet } from '@/misc'
import { DEFAULT_SWAP_BILL } from '@/modules/Swap/constants'
import { BaseSwapStore } from '@/modules/Swap/stores/BaseSwapStore'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { WalletService } from '@/stores/WalletService'
import { error, getSafeProcessingId } from '@/utils'
import type {
    BaseSwapStoreState,
    DirectSwapStoreData,
    DirectSwapStoreInitialData,
    DirectTransactionCallbacks,
} from '@/modules/Swap/types'
import { SwapDirection } from '@/modules/Swap/types'

const staticRpc = useStaticRpc()


export class DirectSwapStore extends BaseSwapStore<DirectSwapStoreData, BaseSwapStoreState> {

    constructor(
        protected readonly wallet: WalletService,
        protected readonly tokensCache: TokensCacheService,
        protected readonly initialData?: DirectSwapStoreInitialData,
        protected readonly callbacks?: DirectTransactionCallbacks,
    ) {
        super(tokensCache, initialData)

        makeObservable(this, {
            coin: computed,
            isValid: computed,
        })

        this.setData({
            coin: initialData?.coin,
        })
    }


    /*
     * Internal utilities methods
     * ----------------------------------------------------------------------------------
     */

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


    /*
     * Public actions. Useful in UI
     * ----------------------------------------------------------------------------------
     */

    /**
     * Invalidate bills data and recalculate
     */
    public forceInvalidate(direction?: SwapDirection): void {
        this.setData('bill', DEFAULT_SWAP_BILL)
        this.finalizeCalculation(direction).catch(reason => error(reason))
    }

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

        await this.unsubscribeTransactionSubscriber()

        try {
            this.#transactionSubscriber = new staticRpc.Subscriber()

            const pairWallet = await TokenWallet.walletAddress({
                root: this.leftTokenAddress!,
                owner: this.pair!.address!,
            })

            const callId = getSafeProcessingId()
            const deployGrams = this.rightToken?.balance === undefined ? '100000000' : '0'
            const startLt = this.wallet.contract?.lastTransactionId?.lt

            const stream = await this.#transactionSubscriber
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
                        this.callbacks?.onTransactionFailure?.({ input: decodedTx.input })
                        return { input: decodedTx.input }
                    }

                    if (decodedTx?.method === 'dexPairExchangeSuccess' && decodedTx.input.id.toString() === callId) {
                        this.setState('isSwapping', false)
                        this.callbacks?.onTransactionSuccess?.({ input: decodedTx.input, transaction })
                        return { input: decodedTx.input, transaction }
                    }

                    return undefined
                })
                .delayed(s => s.first())

            const payload = (await this.pair!.contract!
                .methods.buildExchangePayload({
                    deploy_wallet_grams: deployGrams,
                    expected_amount: this.minExpectedAmount!,
                    id: callId,
                })
                .call({
                    cachedState: toJS(this.pair!.state),
                }))
                .value0

            await TokenWallet.send({
                address: new Address(this.leftToken!.wallet!),
                grams: new BigNumber(2500000000).plus(deployGrams).toFixed(),
                owner: this.wallet.account!.address,
                payload,
                recipient: pairWallet,
                tokens: this.amount!,
            })

            await stream()
        }
        catch (e) {
            error('Swap finished with error: ', e)
            this.setState('isSwapping', false)
        }
        finally {
            await this.unsubscribeTransactionSubscriber()
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
            pair: undefined,
            priceLeftToRight: undefined,
            priceRightToLeft: undefined,
            rightAmount: '',
            rightToken: undefined,
            slippage: this.data.slippage,
            transaction: undefined,
        })
        this.setState({
            isCalculating: false,
            isLowTvl: false,
            isPairChecking: false,
            isSwapping: false,
        })
    }


    /*
     * Memoized store data and state values
     * ----------------------------------------------------------------------------------
     */

    /**
     * Returns native wallet coin
     * @returns {DirectSwapStoreData['coin']}
     */
    public get coin(): DirectSwapStoreData['coin'] {
        return this.data.coin
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

    /**
     * Internal swap transaction subscriber
     * @type {Subscriber}
     * @protected
     */
    #transactionSubscriber: Subscriber | undefined

}
