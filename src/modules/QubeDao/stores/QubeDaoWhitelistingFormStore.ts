import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'
import type { Transaction } from 'everscale-inpage-provider'
import { DateTime } from 'luxon'
import {
    action,
    computed,
    makeObservable,
    reaction,
} from 'mobx'
import type { IReactionDisposer } from 'mobx'

import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { isAddressValid, TokenAbi, TokenWallet } from '@/misc'
import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import type { QubeDaoStore } from '@/modules/QubeDao/stores/QubeDaoStore'
import type {
    GaugeInfo,
    SendMessageCallback,
    TransactionCallbacks,
    TransactionFailureReason,
    TransactionSuccessResult,
} from '@/modules/QubeDao/types'
import { BaseStore } from '@/stores/BaseStore'
import {
    debug,
    error,
    getSafeProcessingId,
    isGoodBignumber,
} from '@/utils'

export type QubeDaoWhitelistingSuccessResult = {
    gauge?: GaugeInfo;
}

export type QubeDaoWhitelistingCallbacks = TransactionCallbacks<
    TransactionSuccessResult<QubeDaoWhitelistingSuccessResult>,
    TransactionFailureReason
> & SendMessageCallback

export type QubeDaoWhitelistFormStoreData = {
    address: string;
    gauge?: GaugeInfo;
    gauges: string[];
    price?: string;
}

export type QubeDaoWhitelistFormStoreState = {
    isFetchingGauge?: boolean;
    isProcessing?: boolean;
    isSyncingDetails?: boolean;
    isVotingState?: boolean;
}

export type QubeDaoWhitelistFormStoreCtorOptions = {
    callbacks?: QubeDaoWhitelistingCallbacks;
}

const rpc = useRpc()
const staticRpc = useStaticRpc()

export class QubeDaoWhitelistingFormStore extends BaseStore<
    QubeDaoWhitelistFormStoreData,
    QubeDaoWhitelistFormStoreState
> {

    protected readonly api = useQubeDaoApi()

    constructor(
        protected readonly dao: QubeDaoStore,
        protected readonly options: QubeDaoWhitelistFormStoreCtorOptions,
    ) {
        super()

        this.setData(() => ({
            address: '',
            gauges: [],
            price: '',
        }))

        makeObservable<QubeDaoWhitelistingFormStore, 'checkFarmingPool'>(this, {
            address: computed,
            checkFarmingPool: action.bound,
            gauge: computed,
            isAddressValid: computed,
            isAlreadyWhitelisted: computed,
            isFetchingGauge: computed,
            isLowBalance: computed,
            isProcessing: computed,
            isSyncingDetails: computed,
            isValid: computed,
            isVotingState: computed,
            price: computed,
            submit: action.bound,
        })
    }

    public async init(): Promise<void> {
        this.#gaugeValidationDisposer = reaction(() => this.address, this.checkFarmingPool)

        await this.syncDetails()
    }

    public dispose(): void {
        this.#gaugeValidationDisposer?.()
    }

    public async submit(): Promise<void> {
        if (this.isProcessing || this.dao.wallet.account?.address === undefined || this.price === undefined) {
            return
        }

        const callId = getSafeProcessingId()
        const subscriber = new staticRpc.Subscriber()
        let transaction!: Transaction

        try {
            this.setState('isProcessing', true)

            const walletAddress = await TokenWallet.walletAddress({
                owner: this.dao.wallet.account.address,
                root: this.dao.tokenAddress,
            })

            const startLt = this.dao.veContractCachedState?.lastTransactionId?.lt
            const gauge = { ...this.gauge } as GaugeInfo

            const stream = await subscriber
                .transactions(this.dao.veAddress)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || tx.id.lt > startLt)
                .filterMap(async tx => {
                    const events = await this.dao.veContract.decodeTransactionEvents({
                        transaction: tx,
                    })

                    let event = events.find(e => e.event === 'DepositRevert' && e.data.call_id === callId)

                    if (event) {
                        debug('DepositRevert', event)

                        await this.options.callbacks?.onTransactionFailure?.({
                            callId,
                            message: event.event,
                            transaction: tx,
                        })

                        return event
                    }


                    if (events.length === 0) {
                        return undefined
                    }

                    event = events.find(e => e.event === 'GaugeWhitelist' && e.data.call_id === callId)

                    if (event === undefined) {
                        return undefined
                    }

                    debug('GaugeWhitelist', event)

                    await this.options.callbacks?.onTransactionSuccess?.({
                        callId,
                        input: { gauge },
                        transaction: tx,
                    })
                    await this.syncDetails()

                    return event
                })
                .delayed(s => s.first())

            const { payload } = await this.dao.veContract
                .methods.encodeWhitelistPayload({
                    call_id: callId,
                    nonce: '0',
                    whitelist_addr: new Address(this.address),
                })
                .call({ cachedState: this.dao.veContractCachedState })

            const message = await new rpc.Contract(TokenAbi.Wallet, walletAddress)
                .methods.transfer({
                    amount: this.price,
                    deployWalletValue: '0',
                    notify: true,
                    payload,
                    recipient: this.dao.veAddress,
                    remainingGasTo: this.dao.wallet.account.address,
                })
                .sendDelayed({
                    amount: '3000000000',
                    bounce: true,
                    from: this.dao.wallet.account.address,
                })

            await this.options.callbacks?.onSend?.(message, {
                callId,
            })

            this.setData({
                address: '',
                gauge: undefined,
                gauges: [],
            })

            this.setState('isProcessing', false)

            transaction = await message.transaction

            await stream()
        }
        catch (e: any) {
            if (e.code !== 3) {
                await this.options.callbacks?.onTransactionFailure?.({
                    callId,
                    message: e.message,
                    transaction,
                })
            }
            throw e
        }
        finally {
            this.setState('isProcessing', false)
            await subscriber.unsubscribe()
        }
    }

    protected async syncDetails(force?: boolean, silence?: boolean): Promise<void> {
        if (!force && this.isSyncingDetails) {
            return
        }

        try {
            this.setState('isSyncingDetails', !silence)

            const [epochDetails, votingDetails, details, whitelist] = await Promise.all([
                this.dao.veContract
                    .methods.getCurrentEpochDetails({})
                    .call({ cachedState: this.dao.veContractCachedState }),
                this.dao.veContract
                    .methods.getVotingDetails({})
                    .call({ cachedState: this.dao.veContractCachedState }),
                this.dao.veContract
                    .methods.getDetails()
                    .call({ cachedState: this.dao.veContractCachedState }),
                this.dao.veContract
                    .methods.gaugeWhitelist({})
                    .call({ cachedState: this.dao.veContractCachedState }),
            ])

            const now = DateTime.local().toSeconds()
            const votingEndTime = parseInt(epochDetails._currentVotingEndTime, 10)
            const votingStartTime = parseInt(epochDetails._currentVotingStartTime, 10)
            const epochStartTime = parseInt(epochDetails._currentEpochStartTime, 10)
            const timeBeforeVoting = parseInt(votingDetails._timeBeforeVoting, 10)

            const gauges = whitelist.gaugeWhitelist.map(([address]) => address.toString())

            this.setState(
                'isVotingState', (
                    (votingStartTime > 0 && now < votingEndTime)
                || (votingStartTime === 0 && now > (epochStartTime + timeBeforeVoting))
                ),
            )

            this.setData({
                gauges,
                price: details._gaugeWhitelistPrice,
            })
        }
        catch (e) {
            error(e)
        }
        finally {
            this.setState('isSyncingDetails', false)
        }
    }

    protected async checkFarmingPool(): Promise<void> {
        if (!this.isAddressValid || this.address.length === 0) {
            this.setData('gauge', undefined)
            return
        }

        try {
            this.setState('isFetchingGauge', true)

            const [[response]] = await Promise.all([
                (await this.api.gaugesBatch({}, {
                    method: 'POST',
                }, {
                    gauges: [this.address],
                })).gauges,
                this.syncDetails(true, true),
            ])

            if (this.isAddressValid) {
                this.setData('gauge', response)
            }
        }
        catch (e) {
            error(e)
        }
        finally {
            this.setState('isFetchingGauge', false)
        }
    }

    public get address(): QubeDaoWhitelistFormStoreData['address'] {
        return this.data.address
    }

    public get gauge(): QubeDaoWhitelistFormStoreData['gauge'] {
        return this.data.gauge
    }

    public get price(): QubeDaoWhitelistFormStoreData['price'] {
        return this.data.price
    }

    public get isFetchingGauge(): QubeDaoWhitelistFormStoreState['isFetchingGauge'] {
        return this.state.isFetchingGauge
    }

    public get isProcessing(): QubeDaoWhitelistFormStoreState['isProcessing'] {
        return this.state.isProcessing
    }

    public get isSyncingDetails(): QubeDaoWhitelistFormStoreState['isSyncingDetails'] {
        return this.state.isSyncingDetails
    }

    public get isVotingState(): QubeDaoWhitelistFormStoreState['isVotingState'] {
        return this.state.isVotingState
    }

    public get isAddressValid(): boolean {
        return this.address.length > 0 && isAddressValid(this.address)
    }

    public get isAlreadyWhitelisted(): boolean {
        return this.data.gauges.length === 0 || this.data.gauges.includes(this.address)
    }

    public get isLowBalance(): boolean {
        return (
            isGoodBignumber(this.price ?? 0, false)
            && new BigNumber(this.dao.token?.balance ?? 0).lt(this.price ?? 0)
        )
    }

    public get isValid(): boolean {
        return (
            this.address.length > 0
            && isAddressValid(this.address)
            && !this.isAlreadyWhitelisted
            && !this.isFetchingGauge
            && !this.isLowBalance
            && !this.isVotingState
            && this.gauge !== undefined
        )
    }

    #gaugeValidationDisposer: IReactionDisposer | undefined

}
