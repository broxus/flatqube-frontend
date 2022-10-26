import { makeAutoObservable, runInAction } from 'mobx'
import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'

import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { GaugesUserDataStore } from '@/modules/Gauges/stores/GaugesUserDataStore'
import { WalletService } from '@/stores/WalletService'
import { normalizeAmount } from '@/modules/Gauges/utils'
import { useRpc } from '@/hooks/useRpc'
import { GaugeAbi } from '@/misc'
import { error, getSafeProcessingId } from '@/utils'
import { useStaticRpc } from '@/hooks/useStaticRpc'

type State = {
    amount?: string;
    claim?: boolean;
    isLoading?: boolean;
}

export class GaugesWithdrawFormStore {

    protected rpc = useRpc()

    protected staticRpc = useStaticRpc()

    protected state: State = {}

    constructor(
        protected wallet: WalletService,
        protected data: GaugesDataStore,
        protected userData: GaugesUserDataStore,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public async submit(): Promise<boolean> {
        let success = false

        runInAction(() => {
            this.state.isLoading = true
        })

        try {
            if (!this.data.id) {
                throw new Error('Id must be defined')
            }
            if (!this.wallet.address) {
                throw new Error('Owner address must be defined')
            }
            if (!this.normalizedAmount) {
                throw new Error('NormalizedAmount must be defined')
            }

            const rootContract = new this.rpc.Contract(
                GaugeAbi.Root,
                new Address(this.data.id),
            )

            const callId = getSafeProcessingId()

            const subscriber = new this.staticRpc.Subscriber()

            const successStream = await subscriber
                .transactions(new Address(this.data.id))
                .flatMap(item => item.transactions)
                .flatMap(transaction => rootContract.decodeTransactionEvents({
                    transaction,
                }))
                .filterMap(result => {
                    if (
                        result.event === 'Withdraw'
                        && result.data.call_id === callId
                    ) {
                        return true
                    }
                    return undefined
                })
                .delayed(s => s.first())

            await rootContract.methods.withdraw({
                amount: this.normalizedAmount,
                claim: this.claim,
                meta: {
                    call_id: callId,
                    nonce: 0,
                    send_gas_to: new Address(this.wallet.address),
                },
            })
                .sendDelayed({
                    amount: await this.userData.calcMinGas(),
                    bounce: true,
                    from: new Address(this.wallet.address),
                })

            await successStream()
            await subscriber.unsubscribe()
            await this.userData.sync()

            runInAction(() => {
                this.state.amount = undefined
                this.state.claim = undefined
            })

            success = true
        }
        catch (e) {
            error('WithdrawFormStore.submit', e)
        }

        runInAction(() => {
            this.state.isLoading = false
        })

        return success
    }

    public setAmount(val: string): void {
        this.state.amount = val
    }

    public setClaim(val: boolean): void {
        this.state.claim = val
    }

    public get isLoading(): boolean {
        return !!this.state.isLoading
    }

    public get amount(): string {
        return this.state.amount ?? ''
    }

    public get normalizedAmount(): string | undefined {
        return this.amount && this.data.rootToken
            ? normalizeAmount(this.amount, this.data.rootToken.decimals)
            : undefined
    }

    public get amountIsValid(): boolean {
        if (this.normalizedAmount) {
            const normalizedAmountBN = new BigNumber(this.normalizedAmount)

            if (
                !normalizedAmountBN.isNaN()
                && normalizedAmountBN.gt(0)
                && normalizedAmountBN.isFinite()
                && this.userData.withdrawBalance
                && normalizedAmountBN.lte(this.userData.withdrawBalance)
            ) {
                return true
            }
        }

        return false
    }

    public get claim(): boolean {
        return !!this.state.claim
    }


    public get isValid(): boolean {
        return this.amountIsValid
    }

}
