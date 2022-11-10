import BigNumber from 'bignumber.js'
import { action, computed, makeObservable } from 'mobx'
import { toast } from 'react-toastify'

import { QubeDaoMaxLockPeriod, QubeDaoMinLockPeriod } from '@/config'
import { SECONDS_IN_DAY } from '@/constants'
import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import type {
    QubeDaoDepositCallbacks,
    QubeDaoDepositSuccessResult,
    QubeDaoStore,
} from '@/modules/QubeDao/stores/QubeDaoStore'
import type { GaugeInfo, TransactionSuccessResult } from '@/modules/QubeDao/types'
import { BaseStore } from '@/stores/BaseStore'
import { FavoritePairs } from '@/stores/FavoritePairs'
import { error, isGoodBignumber, storage } from '@/utils'


export type QubeDaoDepositFormStoreData = {
    amount: string;
    lockPeriod: number;
    veMintAmount: string;
    userGauges: GaugeInfo[];
}

export type QubeDaoDepositFormStoreState = {
    isCalculating: boolean;
}

export type QubeDaoDepositFormStoreCtorOptions = {
    callbacks?: QubeDaoDepositCallbacks;
}


export class QubeDaoDepositFormStore extends BaseStore<QubeDaoDepositFormStoreData, QubeDaoDepositFormStoreState> {

    protected readonly api = useQubeDaoApi()

    protected readonly favorites: FavoritePairs

    constructor(
        protected readonly dao: QubeDaoStore,
        protected readonly options: QubeDaoDepositFormStoreCtorOptions,
    ) {
        super()

        this.setData(() => ({
            amount: '',
            lockPeriod: QubeDaoMinLockPeriod,
            userGauges: [],
            veMintAmount: '0',
        }))

        this.setState(() => ({
            isCalculating: false,
            isProcessing: false,
        }))

        makeObservable(this, {
            amount: computed,
            deposit: action.bound,
            isAmountValid: computed,
            isCalculating: computed,
            isLockPeriodValid: computed,
            isValid: computed,
            lockPeriod: computed,
            userGauges: computed,
            veMintAmount: computed,
        })

        this.favorites = new FavoritePairs(storage, dao.wallet, 'favourite_gauges')
    }

    public async calculateVeMintAmount(): Promise<void> {
        try {
            this.setState('isCalculating', true)
            this.setData('veMintAmount', (await this.dao.veContract
                .methods.calculateVeMint({
                    lock_time: this.lockPeriod * SECONDS_IN_DAY,
                    qube_amount: new BigNumber(this.amount || 0).shiftedBy(this.dao.tokenDecimals).toFixed(),
                })
                .call({ cachedState: this.dao.veContractCachedState }))
                .ve_amount)
        }
        catch (e) {
            error('Calculate Vote Escrow mint amount error', e)
        }
        finally {
            this.setState('isCalculating', false)
        }
    }

    public async deposit(): Promise<void> {
        if (!this.isValid) {
            return
        }

        const onTransactionSuccess = async (result: TransactionSuccessResult<QubeDaoDepositSuccessResult>) => {
            if (this.dao.wallet.address !== undefined) {
                const response = await this.api.gaugesByUserAddress({}, {
                    method: 'POST',
                }, { userAddress: this.dao.wallet.address })

                const userGauges = response.gauges.filter(gauge => gauge.hasQubeReward)

                if (userGauges.length === 0) {
                    this.setData('userGauges', [])
                    await this.options.callbacks?.onTransactionSuccess?.(result)
                }
                else {
                    toast.dismiss(`toast__${result.callId}`)
                    this.setData('userGauges', userGauges)
                }
            }
            else {
                await this.options.callbacks?.onTransactionSuccess?.(result)
            }
        }

        await this.dao.deposit({
            amount: new BigNumber(this.amount || 0).shiftedBy(this.dao.tokenDecimals).toFixed(),
            lockPeriod: this.lockPeriod * SECONDS_IN_DAY,
            veAmount: this.veMintAmount,
            // eslint-disable-next-line sort-keys
            onSend: (...args) => {
                this.options.callbacks?.onSend?.(...args)
                this.setData({
                    amount: '',
                    lockPeriod: this.lockPeriod,
                    veMintAmount: '0',
                })
            },
            onTransactionFailure: this.options.callbacks?.onTransactionFailure,
            onTransactionSuccess,
        })
    }

    public get amount(): QubeDaoDepositFormStoreData['amount'] {
        return this.data.amount
    }

    public get lockPeriod(): QubeDaoDepositFormStoreData['lockPeriod'] {
        return this.data.lockPeriod
    }

    public get userGauges(): QubeDaoDepositFormStoreData['userGauges'] {
        return this.data.userGauges
    }

    public get veMintAmount(): QubeDaoDepositFormStoreData['veMintAmount'] {
        return this.data.veMintAmount
    }

    public get isCalculating(): QubeDaoDepositFormStoreState['isCalculating'] {
        return this.state.isCalculating
    }

    public get isAmountValid(): boolean {
        return this.amount.length > 0
            ? (
                isGoodBignumber(this.amount || 0)
                && new BigNumber(this.amount || 0)
                    .shiftedBy(this.dao.tokenDecimals)
                    .lte(this.dao.token?.balance ?? 0)
            )
            : true
    }

    public get isLockPeriodValid(): boolean {
        return (
            this.lockPeriod >= QubeDaoMinLockPeriod
            && this.lockPeriod <= QubeDaoMaxLockPeriod
        )
    }

    public get isValid(): boolean {
        return (
            this.amount.length > 0 && this.isAmountValid
            && this.isLockPeriodValid
        )
    }

}
