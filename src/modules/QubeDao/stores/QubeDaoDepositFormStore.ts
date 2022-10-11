import BigNumber from 'bignumber.js'
import { action, computed, makeObservable } from 'mobx'

import { SECONDS_IN_DAY } from '@/constants'
import type { QubeDaoDepositCallbacks, QubeDaoStore } from '@/modules/QubeDao/stores/QubeDaoStore'
import { BaseStore } from '@/stores/BaseStore'
import { error, isGoodBignumber } from '@/utils'


export type QubeDaoDepositFormStoreData = {
    amount: string;
    lockPeriod: number;
    veMintAmount: string;
}

export type QubeDaoDepositFormStoreState = {
    isCalculating: boolean;
}

export type QubeDaoDepositFormStoreCtorOptions = {
    callbacks?: QubeDaoDepositCallbacks;
}


export class QubeDaoDepositFormStore extends BaseStore<QubeDaoDepositFormStoreData, QubeDaoDepositFormStoreState> {

    constructor(
        protected readonly dao: QubeDaoStore,
        protected readonly options: QubeDaoDepositFormStoreCtorOptions,
    ) {
        super()

        this.setData(() => ({
            amount: '',
            lockPeriod: 90,
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
            isValid: computed,
            lockPeriod: computed,
            veMintAmount: computed,
        })
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
            onTransactionSuccess: this.options.callbacks?.onTransactionSuccess,
        })
    }

    public get amount(): QubeDaoDepositFormStoreData['amount'] {
        return this.data.amount
    }

    public get lockPeriod(): QubeDaoDepositFormStoreData['lockPeriod'] {
        return this.data.lockPeriod
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

    public get isValid(): boolean {
        return this.amount.length > 0 && this.isAmountValid
    }

}
