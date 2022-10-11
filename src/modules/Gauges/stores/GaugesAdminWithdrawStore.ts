import {
    action,
    IReactionDisposer, makeAutoObservable, runInAction,
} from 'mobx'
import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'

import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { WalletService } from '@/stores/WalletService'
import { error, getSafeProcessingId } from '@/utils'
import { GaugeAbi } from '@/misc'
import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'

export class GaugesAdminWithdrawStore {

    public isLoading = false

    protected rpc = useRpc()

    protected staticRpc = useStaticRpc()

    protected reactions?: IReactionDisposer[]

    constructor(
        protected wallet: WalletService,
        protected dataStore: GaugesDataStore,
    ) {
        makeAutoObservable(this, {
            submit: action.bound,
        })
    }

    public async submit(): Promise<boolean> {
        let success = false

        runInAction(() => {
            this.isLoading = true
        })

        try {
            const { availableTokens } = this

            if (!this.dataStore.id) {
                throw new Error('Id must be defined')
            }

            if (!this.wallet.address) {
                throw new Error('Address must be defined')
            }

            if (!this.dataStore.extraTokens) {
                throw new Error('ExtraTokens must be defined')
            }

            if (!availableTokens) {
                throw new Error('AvailableTokens must be defined')
            }

            const ids = this.dataStore.extraTokens
                .filter((_, index) => availableTokens[index])
                .map(token => token.root)

            const rootContract = new this.rpc.Contract(
                GaugeAbi.Root,
                new Address(this.dataStore.id),
            )

            const callId = getSafeProcessingId()

            const subscriber = new this.staticRpc.Subscriber()

            const successStream = await subscriber
                .transactions(new Address(this.dataStore.id))
                .flatMap(item => item.transactions)
                .flatMap(transaction => rootContract.decodeTransactionEvents({
                    transaction,
                }))
                .filterMap(result => {
                    if (
                        result.event === 'WithdrawUnclaimed'
                        && result.data.call_id === callId
                    ) {
                        return true
                    }
                    return undefined
                })
                .delayed(s => s.first())

            const msg = await rootContract.methods.withdrawUnclaimed({
                ids,
                meta: {
                    call_id: callId,
                    nonce: 0,
                    send_gas_to: new Address(this.wallet.address),
                },
                to: new Address(this.wallet.address),
            })
                .sendDelayed({
                    amount: new BigNumber('500000000')
                        .multipliedBy(ids.length)
                        .plus('2000000000')
                        .toFixed(),
                    bounce: true,
                    from: new Address(this.wallet.address),
                })

            await msg.transaction
            await successStream()
            await subscriber.unsubscribe()
            await this.dataStore.sync()

            success = true
        }
        catch (e) {
            error('AdminWithdrawStore.submit', e)
        }

        runInAction(() => {
            this.isLoading = false
        })

        return success
    }

    public get availableTokens(): boolean[] | undefined {
        const { rewardDetails, tokenDetails } = this.dataStore

        if (!rewardDetails || !tokenDetails) {
            return undefined
        }

        const {
            _extraRewardEnded, _extraRewardRounds,
            _extraVestingPeriods, _withdrawAllLockPeriod,
        } = rewardDetails
        const { _extraTokenData } = tokenDetails

        return _extraRewardEnded.map((ended, index) => {
            if (ended) {
                const tokenRounds = _extraRewardRounds[index]
                const lastRound = tokenRounds[tokenRounds.length - 1]
                const vestingPeriod = _extraVestingPeriods[index]

                if (lastRound && vestingPeriod) {
                    return new BigNumber(_extraTokenData[index].balance).gt(0)
                        && new BigNumber(lastRound.endTime)
                            .plus(vestingPeriod)
                            .plus(_withdrawAllLockPeriod)
                            .multipliedBy(1000)
                            .gt(Date.now())
                }
            }

            return false
        })
    }

}
