import { makeAutoObservable, runInAction } from 'mobx'
import { Address } from 'everscale-inpage-provider'
import BigNumber from 'bignumber.js'

import { error, getSafeProcessingId } from '@/utils'
import { useRpc } from '@/hooks/useRpc'
import { GaugeAbi } from '@/misc'
import { WalletService } from '@/stores/WalletService'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { GaugesUserDataStore } from '@/modules/Gauges/stores/GaugesUserDataStore'
import { useStaticRpc } from '@/hooks/useStaticRpc'

export class GaugesClaimRewardStore {

    public isLoading = false

    protected rpc = useRpc()

    protected staticRpc = useStaticRpc()

    constructor(
        protected wallet: WalletService,
        protected dataStore: GaugesDataStore,
        protected userData: GaugesUserDataStore,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public async claim(): Promise<boolean> {
        const success = false

        runInAction(() => {
            this.isLoading = true
        })

        try {
            if (!this.dataStore.id) {
                throw new Error('Id must be defined')
            }

            if (!this.wallet.address) {
                throw new Error('Address must be defined')
            }

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
                        result.event === 'Claim'
                        && result.data.call_id === callId
                    ) {
                        return true
                    }
                    return undefined
                })
                .delayed(s => s.first())

            const msg = await rootContract.methods.claimReward({
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

            await msg.transaction
            await successStream()
            await subscriber.unsubscribe()
            await this.userData.sync()
        }
        catch (e) {
            error('ClaimRewardStore.claim', e)
        }

        runInAction(() => {
            this.isLoading = false
        })

        return success
    }

    public get hasReward(): boolean {
        const { qubeUnlockedReward, extraUnlockedReward } = this.userData

        if (qubeUnlockedReward && new BigNumber(qubeUnlockedReward).gt(0)) {
            return true
        }

        if (extraUnlockedReward && extraUnlockedReward.some(item => new BigNumber(item).gt(0))) {
            return true
        }

        return false
    }

}
