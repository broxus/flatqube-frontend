/* eslint-disable no-debugger */
import { Address, LT_COLLATOR, Subscriber } from 'everscale-inpage-provider'
import {
    action,
    computed,
    IReactionDisposer,
    makeObservable,
    reaction,
} from 'mobx'

import {
    NotifyCallbacks,
    P2PNotifyStoreData,
    P2PNotifyStoreState,
} from '@/modules/LimitOrders/types'
import { useWallet, WalletService } from '@/stores/WalletService'
import { TokensCacheService, useTokensCache } from '@/stores/TokensCacheService'
import { OrderAbi } from '@/misc/abi/order.abi'
import { P2PNotifiedCallbacks } from '@/modules/LimitOrders/hooks/useP2PNotificationCallbacks'
import { useStaticRpc } from '@/hooks'
import { BaseStore } from '@/stores/BaseStore'
import { error, getSafeProcessingId, log } from '@/utils'

const staticRpc = useStaticRpc()

export class P2PNotifyStore extends BaseStore<P2PNotifyStoreData, P2PNotifyStoreState> {

    protected callbackSubscriber?: Subscriber = undefined

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly callbacks: NotifyCallbacks,

    ) {
        super()
        makeObservable<
            P2PNotifyStore,
            'handleTokensCacheReady'
            | 'handleWalletAccountChange'
        >(this, {
            handleTokensCacheReady: action.bound,
            handleWalletAccountChange: action.bound,
            lastNotifyTransactionId: computed,
        })
    }

    /**
     * Manually initiate store.
     * Run all necessary subscribers.
     */
    public async init(): Promise<void> {
        this.tokensCacheDisposer = reaction(
            () => this.tokensCache.isReady,
            this.handleTokensCacheReady,
            { fireImmediately: true },
        )
    }

    /**
    *
    * @param {boolean} isReady
    * @protected
    */
    protected async handleTokensCacheReady(isReady: boolean): Promise<void> {

        if (!isReady) {
            return
        }

        this.walletReactionDisposer = reaction(
            () => this.wallet.address,
            this.handleWalletAccountChange,
            { fireImmediately: true },
        )
    }

    /**
    * Handle wallet account change.
    * @param {Address} [address]
    * @protected
    */
    protected async handleWalletAccountChange(currAddress?: string, prevAddress?: string): Promise<void> {

        if (currAddress && prevAddress !== currAddress) {
            this.unsubscribe()
            this.subscribe(new Address(currAddress))
        }
        else if (!currAddress) {
            await this.unsubscribe()
        }
    }

    protected async subscribe(address: Address): Promise<void> {
        // const orderContractCallbacks = new staticRpc.Contract(OrderAbi.Callbacks, address)

        const startLt = this.wallet.contract?.lastTransactionId?.lt
        try {
            if (!this.callbackSubscriber) {
                this.callbackSubscriber = new staticRpc.Subscriber()
            }

            const stream = await this.callbackSubscriber
                .transactions(address)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || LT_COLLATOR.compare(tx.id.lt, startLt) > 0)
                .filterMap(async transaction => {
                    const decodedTx = await new staticRpc.Contract(OrderAbi.Callbacks, address)?.decodeTransaction({
                        methods: ['onOrderPartExchangeSuccess', 'onOrderStateFilled'],
                        transaction,
                    })
                    if (decodedTx?.method === 'onOrderPartExchangeSuccess' || decodedTx?.method === 'onOrderStateFilled') {
                        if (decodedTx.input.owner.toString() === address.toString()) {
                            const { receiveToken, spentToken } = decodedTx.input.result
                            if (decodedTx?.method === 'onOrderStateFilled') {
                                this.callbacks.onOrderStateFilled?.({
                                    callId: getSafeProcessingId(),
                                    result: {
                                        ...decodedTx.input.result,
                                        fee: decodedTx.input.fee,
                                        receiveToken: this.tokensCache.get(receiveToken.toString()),
                                        spentToken: this.tokensCache.get(spentToken.toString()),
                                    },
                                    transaction,
                                })
                                this.setData('lastNotifyTransactionId', transaction.id.lt)
                            }
                            if (decodedTx?.method === 'onOrderPartExchangeSuccess') {
                                this.callbacks.onOrderPartExchangeSuccess?.({
                                    callId: getSafeProcessingId(),
                                    result: {
                                        ...decodedTx.input.result,
                                        fee: decodedTx.input.fee,
                                        receiveToken: this.tokensCache.get(receiveToken.toString()),
                                        spentToken: this.tokensCache.get(spentToken.toString()),
                                    },
                                    transaction,
                                })
                                this.setData('lastNotifyTransactionId', transaction.id.lt)
                            }
                        }
                    }
                    return undefined
                })
                .delayed((s: any) => s.first())
            await stream()
        }
        catch (e) {
            error('subscribeOrderClosing', e)
            await this.callbackSubscriber?.unsubscribe()
        }
    }

    protected async unsubscribe(): Promise<void> {
        await this.callbackSubscriber?.unsubscribe()
        this.callbackSubscriber = undefined
        this.setData('lastNotifyTransactionId', undefined)
    }

    protected async dispose(): Promise<void> {
        this.walletReactionDisposer?.()
        this.tokensCacheDisposer?.()
    }

    public get lastNotifyTransactionId(): P2PNotifyStoreData['lastNotifyTransactionId'] {
        return this.data.lastNotifyTransactionId
    }

    // protected orderListRefresh: (() => void | undefined) | undefined

    /*
     * Internal reaction disposers
     * ----------------------------------------------------------------------------------
     */

    protected walletReactionDisposer: IReactionDisposer | undefined

    protected tokensCacheDisposer: IReactionDisposer | undefined

}

let P2PNotify: P2PNotifyStore

export function useP2PNotifyStore(
    p2pNotifiedCallbacks: P2PNotifiedCallbacks,
): P2PNotifyStore {
    if (P2PNotify === undefined) {
        log(
            '%cCreated a new one P2PNotifyStore instance as global service',
            'color: #bae701',
        )
        P2PNotify = new P2PNotifyStore(
            useWallet(),
            useTokensCache(),
            p2pNotifiedCallbacks,
        )
    }
    return P2PNotify
}
