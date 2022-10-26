import {
    action, IReactionDisposer, makeAutoObservable, reaction, runInAction,
} from 'mobx'
import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'

import { error, getSafeProcessingId, lastOfCalls } from '@/utils'
import { WalletService } from '@/stores/WalletService'
import { GaugesUserDataStore } from '@/modules/Gauges/stores/GaugesUserDataStore'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { calcBoost, daysToSecs, normalizeAmount } from '@/modules/Gauges/utils'
import { useRpc } from '@/hooks/useRpc'
import { GaugeAbi, TokenAbi } from '@/misc'
import { useStaticRpc } from '@/hooks/useStaticRpc'

type State = {
    days?: string;
    amount?: string;
    boost?: string;
    isLoading?: boolean;
}

export class GaugesDepositFormStore {

    protected syncBoostReaction?: IReactionDisposer

    protected rpc = useRpc()

    protected staticRpc = useStaticRpc()

    protected calcBoost = lastOfCalls(calcBoost)

    protected state: State = {}

    constructor(
        protected wallet: WalletService,
        protected data: GaugesDataStore,
        protected userData: GaugesUserDataStore,
    ) {
        makeAutoObservable(this, {
            setAmount: action.bound,
            setDays: action.bound,
            syncBoost: action.bound,
        })
    }

    public init(): void {
        if (!this.syncBoostReaction) {
            this.syncBoostReaction = reaction(
                () => [this.data.id, this.normalizedAmount, this.lockTime],
                () => this.syncBoost(),
            )
        }
    }

    public dispose(): void {
        if (this.syncBoostReaction) {
            this.syncBoostReaction()
            this.syncBoostReaction = undefined
        }

        this.state = {}
    }

    public async syncBoost(): Promise<void> {
        if (
            !this.data.id
            || !this.normalizedAmount
            || new BigNumber(this.lockTime).isZero()
        ) {
            runInAction(() => {
                this.state.boost = undefined
            })
        }
        else {
            try {
                const boost = await this.calcBoost(
                    this.data.id,
                    this.normalizedAmount,
                    this.lockTime,
                )

                if (boost) {
                    runInAction(() => {
                        this.state.boost = boost
                    })
                }
            }
            catch (e) {
                error('DepositFormStore.syncBoost', e)
            }
        }
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
            if (!this.data.rootToken) {
                throw new Error('RootToken must be defined')
            }
            if (!this.normalizedAmount) {
                throw new Error('NormalizedAmount must be defined')
            }

            const rootContract = new this.rpc.Contract(
                GaugeAbi.Root,
                new Address(this.data.id),
            )

            const callId = getSafeProcessingId()

            const payload = await rootContract.methods.encodeDepositPayload({
                call_id: callId,
                claim: false,
                deposit_owner: new Address(this.wallet.address),
                lock_time: this.lockTime,
                nonce: 0,
            }).call()

            const tokenContract = new this.rpc.Contract(
                TokenAbi.Root,
                new Address(this.data.rootToken.root),
            )
            const tokenWallet = (await tokenContract.methods.walletOf({
                answerId: 0,
                walletOwner: new Address(this.wallet.address),
            }).call()).value0

            const tokenWalletContract = new this.rpc.Contract(
                TokenAbi.Wallet,
                tokenWallet,
            )

            const subscriber = new this.staticRpc.Subscriber()

            const successStream = await subscriber
                .transactions(new Address(this.data.id))
                .flatMap(item => item.transactions)
                .flatMap(transaction => rootContract.decodeTransactionEvents({
                    transaction,
                }))
                .filterMap(result => {
                    if (
                        result.event === 'Deposit'
                        && result.data.call_id === callId
                    ) {
                        return true
                    }
                    return undefined
                })
                .delayed(s => s.first())

            await tokenWalletContract.methods.transfer({
                amount: this.normalizedAmount,
                deployWalletValue: '0',
                notify: true,
                payload: payload.deposit_payload,
                recipient: new Address(this.data.id),
                remainingGasTo: new Address(this.wallet.address),
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
                this.state.amount = ''
                this.state.days = ''
            })

            success = true
        }
        catch (e) {
            error('DepositForm.submit', e)
        }

        runInAction(() => {
            this.state.isLoading = false
        })

        return success
    }

    public setAmount(value: string): void {
        this.state.amount = value
    }

    public setDays(value: string): void {
        this.state.days = value
    }

    public get amount(): string | undefined {
        return this.state.amount
    }

    public get days(): string | undefined {
        return this.state.days
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
                && this.userData.walletBalance
                && normalizedAmountBN.lte(this.userData.walletBalance)
            ) {
                return true
            }
        }

        return false
    }

    public get lockTime(): string {
        return this.days ? daysToSecs(this.days) : '0'
    }

    public get daysIsValid(): boolean {
        if (new BigNumber(this.lockTime).isZero()) {
            return true
        }

        if (this.data.maxLockTime) {
            return new BigNumber(this.lockTime).lte(this.data.maxLockTime)
        }

        return false
    }

    public get boost(): string {
        return this.state.boost ?? '1'
    }

    public get isLoading(): boolean {
        return !!this.state.isLoading
    }

    public get isValid(): boolean {
        return this.daysIsValid && this.amountIsValid
    }

}
