import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'
import { computed, makeObservable } from 'mobx'

import { DEFAULT_DECIMALS } from '@/modules/Swap/constants'
import { BaseStore } from '@/stores/BaseStore'
import type { TokenCache, TokensCacheService } from '@/stores/TokensCacheService'
import { formattedTokenAmount, isGoodBignumber } from '@/utils'
import { P2PBaseStoreData, P2PBaseStoreState } from '@/modules/LimitOrders/types'

export abstract class P2PBaseStore<
    T extends P2PBaseStoreData | Record<string, any> = P2PBaseStoreData,
    U extends P2PBaseStoreState | Record<string, any> = P2PBaseStoreState
> extends BaseStore<T, U> {

    protected constructor(public readonly tokensCache: TokensCacheService) {
        super()

        this.setData(() => ({
            leftAmount: '',
            rightAmount: '',
        }))

        makeObservable<
            P2PBaseStore<T, U>,
            | 'leftTokenAddress'
            | 'rightTokenAddress'
        >(this, {
            formattedLeftBalance: computed,
            formattedRightBalance: computed,
            isEnoughTokenBalance: computed,
            isLeftAmountValid: computed,
            isProcessing: computed,
            isRightAmountValid: computed,
            leftAmount: computed,
            leftAmountNumber: computed,
            leftBalanceNumber: computed,
            leftToken: computed,
            leftTokenAddress: computed,
            leftTokenDecimals: computed,
            ltrPrice: computed,
            rightAmount: computed,
            rightAmountNumber: computed,
            rightBalanceNumber: computed,
            rightToken: computed,
            rightTokenAddress: computed,
            rightTokenDecimals: computed,
            rtlPrice: computed,
        })
    }


    /*
     * Memoized store data and state values
     * ----------------------------------------------------------------------------------
     */


    /**
     * Returns memoized left amount value
     * @returns {P2PBaseStoreData['leftAmount']}
     */
    public get leftAmount(): P2PBaseStoreData['leftAmount'] {
        return this.data.leftAmount
    }

    /**
     * Price of right token per 1 left token
     * @returns {P2PBaseStoreData['ltrPrice']}
     */
    public get ltrPrice(): P2PBaseStoreData['ltrPrice'] {
        return this.data.ltrPrice
    }

    /**
     * Price of left token per 1 right token
     * @returns {P2PBaseStoreData['rtlPrice']}
     */
    public get rtlPrice(): P2PBaseStoreData['rtlPrice'] {
        return this.data.rtlPrice
    }

    /**
     * Returns memoized right amount value
     * @returns {P2PBaseStoreData['rightAmount']}
     */
    public get rightAmount(): P2PBaseStoreData['rightAmount'] {
        return this.data.rightAmount
    }

    /**
     * Returns `true` if swap process is running. Otherwise, `false`
     * @returns {P2PBaseStoreState['isProcessing']}
     */
    public get isProcessing(): P2PBaseStoreState['isProcessing'] {
        return this.state.isProcessing
    }


    /*
     * Computed values
     * ----------------------------------------------------------------------------------
     */

    /**
     *
     */
    public get isEnoughTokenBalance(): boolean {
        const balance = new BigNumber(this.leftToken?.balance ?? 0).shiftedBy(-this.leftTokenDecimals)
        return (
            isGoodBignumber(this.leftAmountNumber)
            && this.leftAmountNumber.shiftedBy(-this.leftTokenDecimals).lte(balance)
        )
    }

    /**
     * Returns `true` if left amount value is valid, otherwise `false`.
     * NOTE: Use it only in UI for determining field validation and
     * DON'T USE it in internal calculations or validations
     * @returns {boolean}
     */
    public get isLeftAmountValid(): boolean {
        if (this.leftAmount.length === 0) {
            return true
        }
        return isGoodBignumber(this.leftAmountNumber, false) && this.leftBalanceNumber.gte(this.leftAmountNumber)
    }

    /**
     * Returns `true` if right amount value is valid, otherwise `false`.
     * NOTE: Use it only in UI for determining field validation and
     * DON'T USE it in internal calculations or validations
     * @returns {boolean}
     */
    public get isRightAmountValid(): boolean {
        if (this.rightAmount.length === 0) {
            return true
        }
        return this.rightAmount.length > 0 && isGoodBignumber(this.rightAmountNumber)
    }

    /**
     * Returns BigNumber of the left amount value whose shifted by left token decimals
     * @returns {BigNumber}
     */
    public get leftAmountNumber(): BigNumber {
        return new BigNumber(this.data.leftAmount)
            .shiftedBy(this.leftTokenDecimals)
            .dp(0, BigNumber.ROUND_DOWN)
    }

    /**
     * Returns BigNumber of the left token balance
     * @returns {BigNumber}
     */
    public get leftBalanceNumber(): BigNumber {
        return new BigNumber(this.leftToken?.balance || 0)
    }

    /**
     * Returns memoized left selected token
     * @returns {TokenCache | undefined}
     */
    public get leftToken(): TokenCache | undefined {
        return this.tokensCache.get(this.data.leftToken)
    }

    /**
     * Returns left token `Address` instance if left token is selected, otherwise returns `undefined`.
     * @returns {Address | undefined}
     * @protected
     */
    protected get leftTokenAddress(): Address | undefined {
        return this.leftToken?.root !== undefined ? new Address(this.leftToken.root) : undefined
    }

    /**
     * Returns memoized left token decimals or global default decimals - 18.
     * @returns {number}
     */
    public get leftTokenDecimals(): number {
        return this.leftToken?.decimals ?? DEFAULT_DECIMALS
    }

    /**
     * Returns BigNumber of the right amount value whose shifted by right token decimals
     * @returns {BigNumber}
     */
    public get rightAmountNumber(): BigNumber {
        return new BigNumber(this.data.rightAmount)
            .shiftedBy(this.rightTokenDecimals)
            .dp(0, BigNumber.ROUND_DOWN)
    }

    /**
     * Returns BigNumber of the right token balance
     * @returns {BigNumber}
     */
    public get rightBalanceNumber(): BigNumber {
        return new BigNumber(this.rightToken?.balance || 0)
    }

    /**
     * Returns memoized right selected token
     * @returns {TokenCache | undefined}
     */
    public get rightToken(): TokenCache | undefined {
        return this.tokensCache.get(this.data.rightToken)
    }

    /**
     * Returns right token `Address` instance if right token is selected, otherwise returns `undefined`.
     * @returns {Address | undefined}
     * @protected
     */
    protected get rightTokenAddress(): Address | undefined {
        return this.rightToken?.root !== undefined ? new Address(this.rightToken.root) : undefined
    }

    /**
     * Returns memoized right token decimals or global default decimals - 18.
     * @returns {number}
     */
    public get rightTokenDecimals(): number {
        return this.rightToken?.decimals ?? DEFAULT_DECIMALS
    }

    /**
     * Returns formatted balance of the selected left token
     * @returns {string}
     */
    public get formattedLeftBalance(): string {
        return formattedTokenAmount(this.leftToken?.balance, this.leftTokenDecimals)
    }

    /**
     * Returns formatted balance of the selected right token
     * @returns {string}
     */
    public get formattedRightBalance(): string {
        return formattedTokenAmount(this.rightToken?.balance, this.rightTokenDecimals)
    }

}
