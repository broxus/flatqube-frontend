import { action, makeAutoObservable, runInAction } from 'mobx'
import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'

import { GaugesAdminDepositStore } from '@/modules/Gauges/stores/GaugesAdminDepositStore'
import { GaugeAbi, Token, TokenAbi } from '@/misc'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { normalizeAmount } from '@/modules/Gauges/utils'
import { error, getSafeProcessingId } from '@/utils'
import { useRpc } from '@/hooks/useRpc'
import { WalletService } from '@/stores/WalletService'
import { useStaticRpc } from '@/hooks/useStaticRpc'

type Data = {
    amount?: string;
    extraTokenIndex?: number;
    isLoading?: boolean;
}

export class GaugesAdminDepositFormStore {

    protected rpc = useRpc()

    protected staticRpc = useStaticRpc()

    protected data: Data = {}

    constructor(
        protected adminDeposit: GaugesAdminDepositStore,
        protected dataStore: GaugesDataStore,
        protected wallet: WalletService,
    ) {
        makeAutoObservable(this, {
            setAmount: action.bound,
        })
    }

    public sync(extraTokenIndex: number): void {
        this.data.extraTokenIndex = extraTokenIndex
    }

    public setAmount(amount: string): void {
        this.data.amount = amount
    }

    public async submit(): Promise<boolean> {
        let success = false,
            { amount } = this.data

        runInAction(() => {
            this.data.isLoading = true
        })

        try {
            if (!this.dataStore.id) {
                throw new Error('Id must be defined')
            }

            if (!this.wallet.address) {
                throw new Error('Owner address must be defined')
            }

            if (!this.normalizedAmount) {
                throw new Error('NormalizedAmount must be defined')
            }

            if (!this.token) {
                throw new Error('Token must be defined')
            }

            const rootContract = new this.rpc.Contract(
                GaugeAbi.Root,
                new Address(this.dataStore.id),
            )

            const callId = getSafeProcessingId()

            const payload = await rootContract.methods.encodeRewardDepositPayload({
                call_id: callId,
                nonce: 0,
            }).call()

            const tokenContract = new this.rpc.Contract(
                TokenAbi.Root,
                new Address(this.token.root),
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
                .transactions(new Address(this.dataStore.id))
                .flatMap(item => item.transactions)
                .flatMap(transaction => rootContract.decodeTransactionEvents({
                    transaction,
                }))
                .filterMap(result => {
                    if (
                        result.event === 'RewardDeposit'
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
                payload: payload.reward_deposit_payload,
                recipient: new Address(this.dataStore.id),
                remainingGasTo: new Address(this.wallet.address),
            })
                .sendDelayed({
                    amount: '1000000000',
                    bounce: true,
                    from: new Address(this.wallet.address),
                })

            await successStream()
            await subscriber.unsubscribe()
            await this.dataStore.sync()
            await this.adminDeposit.sync()

            amount = ''
            success = true
        }
        catch (e) {
            error('AdminDepositFormStore.submit', e)
        }

        runInAction(() => {
            this.data.amount = amount
            this.data.isLoading = false
        })

        return success
    }

    public get extraTokenIndex(): number | undefined {
        return this.data.extraTokenIndex
    }

    public get amount(): string | undefined {
        return this.data.amount
    }

    public get normalizedAmount(): string | undefined {
        return this.amount && this.token
            ? normalizeAmount(this.amount, this.token.decimals)
            : undefined
    }

    public get isLoading(): boolean | undefined {
        return this.data.isLoading
    }

    public get deposited(): string | undefined {
        return this.dataStore.tokenDetails && this.extraTokenIndex !== undefined
            ? this.dataStore.tokenDetails?._extraTokenData[this.extraTokenIndex].cumulativeBalance
            : undefined
    }

    public get balance(): string | undefined {
        return this.adminDeposit.extraTokensBalances && this.extraTokenIndex !== undefined
            ? this.adminDeposit.extraTokensBalances[this.extraTokenIndex]
            : undefined
    }

    public get token(): Token | undefined {
        return this.dataStore.extraTokens && this.extraTokenIndex !== undefined
            ? this.dataStore.extraTokens[this.extraTokenIndex]
            : undefined
    }

    public get amountIsValid(): boolean {
        if (this.normalizedAmount) {
            const normalizedAmountBN = new BigNumber(this.normalizedAmount)

            if (
                !normalizedAmountBN.isNaN()
                && normalizedAmountBN.gt(0)
                && normalizedAmountBN.isFinite()
                && this.balance
                && normalizedAmountBN.lte(this.balance)
            ) {
                return true
            }
        }

        return false
    }

}
