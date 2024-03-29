import BigNumber from 'bignumber.js'
import { DateTime } from 'luxon'
import {
    action,
    IReactionDisposer,
    makeAutoObservable,
    reaction,
} from 'mobx'
import { Address, Subscriber } from 'everscale-inpage-provider'

import { FarmFabricAddress } from '@/config'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { Farm, FarmAbi } from '@/misc'
import {
    DEFAULT_CREATE_FARM_POOL_STORE_DATA,
    DEFAULT_CREATE_FARM_POOL_STORE_STATE,
} from '@/modules/Farming/constants'
import {
    CreateFarmPoolStoreData,
    CreateFarmPoolStoreState,
    FarmDate,
    FarmRewardToken,
    FarmToken,
} from '@/modules/Farming/types'
import { parseDate, resolveToken } from '@/modules/Farming/utils'
import { useWallet, WalletService } from '@/stores/WalletService'
import { debounce, error } from '@/utils'


const staticRpc = useStaticRpc()


export class CreateFarmPoolStore {

    /**
     *
     * @protected
     */
    protected data: CreateFarmPoolStoreData = DEFAULT_CREATE_FARM_POOL_STORE_DATA

    /**
     *
     * @protected
     */
    protected state: CreateFarmPoolStoreState = DEFAULT_CREATE_FARM_POOL_STORE_STATE

    constructor(protected wallet: WalletService) {
        makeAutoObservable<
            CreateFarmPoolStore,
            | 'handleFarmTokenChange'
            | 'handleFarmStartChange'
            | 'handleRewardTokensChange'
        >(this, {
            addRewardToken: action.bound,
            create: action.bound,
            handleFarmTokenChange: action.bound,
            handleFarmStartChange: action.bound,
            handleRewardTokensChange: action.bound,
        })
    }

    /*
     * External actions for use it in UI
     * ----------------------------------------------------------------------------------
     */

    /**
     *
     * @param {keyof CreateFarmPoolStoreData} key
     * @param {CreateFarmPoolStoreData[K]} value
     */
    public changeData<K extends keyof CreateFarmPoolStoreData>(key: K, value: CreateFarmPoolStoreData[K]): void {
        this.data[key] = value
    }

    /**
     *
     * @param {number} idx
     * @param {FarmToken} token
     */
    public updateRewardToken(idx: number, token: FarmRewardToken): void {
        const rewardTokens = this.rewardTokens.slice()
        rewardTokens[idx] = {
            ...rewardTokens[idx],
            ...token,
        }
        this.changeData('rewardTokens', rewardTokens)
    }

    /**
     *
     */
    public addRewardToken(): void {
        const rewardTokens = this.rewardTokens.slice()
        rewardTokens.push({})
        this.changeData('rewardTokens', rewardTokens)
    }

    /**
     *
     */
    public async init(): Promise<void> {
        this.#farmTokenResolveDisposer = reaction(() => this.farmToken, debounce(this.handleFarmTokenChange, 2000))
        this.#farmStartDisposer = reaction(() => this.farmStart, this.handleFarmStartChange)
        this.#rewardTokensDisposer = reaction(() => this.rewardTokens, debounce(this.handleRewardTokensChange, 2000))
        await this.unsubscribeTransactionSubscriber()
    }

    /**
     *
     */
    public async dispose(): Promise<void> {
        this.#farmTokenResolveDisposer?.()
        this.#farmStartDisposer?.()
        this.#rewardTokensDisposer?.()
        this.reset()
        await this.unsubscribeTransactionSubscriber()
    }

    /**
     *
     */
    public async create(): Promise<void> {
        if (
            this.isCreating
            || this.wallet.address == null
            || !this.isValid
        ) {
            return
        }

        this.changeState('isCreating', true)

        await this.unsubscribeTransactionSubscriber()

        try {
            const startLt = this.wallet.contract?.lastTransactionId?.lt

            this.#transactionSubscriber = new staticRpc.Subscriber()

            const stream = await this.#transactionSubscriber
                .transactions(FarmFabricAddress)
                .flatMap(a => a.transactions)
                .filter(tx => !startLt || tx.id.lt > startLt)
                .filterMap(async transaction => {
                    const decodedTx = await new staticRpc.Contract(FarmAbi.Fabric, FarmFabricAddress)
                        .decodeTransaction({
                            methods: ['onPoolDeploy'],
                            transaction,
                        })

                    if (decodedTx?.method === 'onPoolDeploy' && decodedTx.input.pool_owner.toString() === this.wallet.address) {
                        this.changeData('createdFarmPoolAddress', transaction.inMessage.src)
                        this.changeState('isCreating', false)
                        return { createdFarmPoolAddress: transaction.inMessage.src }
                    }

                    return undefined
                })
                .delayed(s => s.first())

            await Farm.createPool(
                new Address(this.wallet.address),
                new Address(this.farmToken.root as string),
                this.rewardTokens.map(token => new Address(token.root as string)),
                ((this.farmStart.date as Date).getTime() / 1000).toFixed(0),
                this.rewardTokens.map(
                    token => new BigNumber(token.farmSpeed || 0).shiftedBy(token.decimals as number)
                        .decimalPlaces(0, BigNumber.ROUND_DOWN)
                        .toFixed(),
                ),
                this.farmVesting.vestingPeriod || '0',
                new BigNumber(this.farmVesting.vestingRatio || '0')
                    .times(10)
                    .dp(0, BigNumber.ROUND_DOWN)
                    .toFixed(),
            )

            await stream()
        }
        catch (e) {
            this.changeState('isCreating', false)
            throw e
        }
        finally {
            await this.unsubscribeTransactionSubscriber()
        }
    }

    /*
     * Reactions handlers
     * ----------------------------------------------------------------------------------
     */

    /**
     *
     * @param {FarmToken} farmToken
     * @param {FarmToken} prevFarmToken
     * @protected
     */
    protected async handleFarmTokenChange(
        farmToken: FarmToken | undefined,
        prevFarmToken: FarmToken | undefined,
    ): Promise<void> {
        if (!farmToken?.root || farmToken.root === prevFarmToken?.root) {
            if (!farmToken?.root) {
                this.changeData('farmToken', DEFAULT_CREATE_FARM_POOL_STORE_DATA.farmToken)
            }
            return
        }

        const token = await resolveToken(farmToken.root)
        this.changeData('farmToken', {
            ...farmToken,
            ...token,
            isValid: token != null,
        })
    }

    /**
     *
     * @param {FarmDate} farmStart
     * @param {FarmDate} prevFarmStart
     * @protected
     */
    protected handleFarmStartChange(farmStart: FarmDate, prevFarmStart: FarmDate): void {
        this.handleChangeDate(farmStart, prevFarmStart, 'farmStart')
    }

    /**
     *
     * @param {FarmToken[]} tokens
     * @protected
     */
    protected handleRewardTokensChange(tokens: FarmRewardToken[]): void {
        tokens.forEach(async (token, idx) => {
            if (
                token.root
                && token.root?.length > 0
                && !token.isValid && !token.isSyncing
                && (token.symbol == null || token.decimals == null)
            ) {
                this.updateRewardToken(idx, { ...token, isSyncing: true })
                const resolvedToken = await resolveToken(token.root)
                if (resolvedToken == null) {
                    this.updateRewardToken(idx, {
                        isSyncing: false,
                        isValid: false,
                        root: token.root,
                    })
                    return
                }
                this.updateRewardToken(idx, {
                    ...token,
                    ...resolvedToken,
                    isSyncing: false,
                    isValid: !tokens.some(
                        ({ root }, i) => (root === token.root && i !== idx),
                    ),
                })
            }
        })
    }

    /*
     * Internal utilities methods
     * ----------------------------------------------------------------------------------
     */

    /**
     * Try to unsubscribe from transaction subscriber
     * @protected
     */
    protected async unsubscribeTransactionSubscriber(): Promise<void> {
        if (this.#transactionSubscriber !== undefined) {
            try {
                await this.#transactionSubscriber.unsubscribe()
            }
            catch (e) {
                error('Transaction unsubscribe error', e)
            }

            this.#transactionSubscriber = undefined
        }
    }

    /**
     *
     * @param {CreateFarmPoolStoreState} key
     * @param {CreateFarmPoolStoreState[K]} value
     */
    protected changeState<K extends keyof CreateFarmPoolStoreState>(key: K, value: CreateFarmPoolStoreState[K]): void {
        this.state[key] = value
    }

    /**
     *
     * @param {FarmDate} farmDate
     * @param {FarmDate} prevFarmDate
     * @param {'farmStart' | 'farmEnd'} key
     * @protected
     */
    protected handleChangeDate(farmDate: FarmDate, prevFarmDate: FarmDate, key: 'farmStart'): void {
        if (!farmDate?.value || farmDate.value === prevFarmDate?.value) {
            if (!farmDate?.value && prevFarmDate.value) {
                this.changeData(key, DEFAULT_CREATE_FARM_POOL_STORE_DATA[key])
            }
            return
        }

        const date = parseDate(farmDate.value)
        const now = DateTime.local().toMillis()
        this.changeData(key, {
            ...farmDate,
            date,
            isValid: date != null && DateTime.fromJSDate(date).toMillis() > now,
        })
    }

    /**
     *
     * @protected
     */
    protected reset(): void {
        this.data = DEFAULT_CREATE_FARM_POOL_STORE_DATA
    }

    /*
     * Computed states
     * ----------------------------------------------------------------------------------
     */

    /**
     *
     */
    public get isValid(): boolean {
        return (
            !!this.farmToken.isValid
            && !!this.farmStart.isValid
            && this.isVestingValid
            && this.rewardTokens.every(token => token.isValid && token.isRewardTotalValid)
            && this.rewardTokens.findIndex(t => t.root === this.farmToken.root) < 0
        )
    }

    /*
     * Memoized store data values
     * ----------------------------------------------------------------------------------
     */

    /**
     *
     */
    public get createdFarmPoolAddress(): CreateFarmPoolStoreData['createdFarmPoolAddress'] {
        return this.data.createdFarmPoolAddress
    }

    /**
     *
     */
    public get farmToken(): CreateFarmPoolStoreData['farmToken'] {
        return this.data.farmToken
    }

    /**
     *
     */
    public get farmStart(): CreateFarmPoolStoreData['farmStart'] {
        return this.data.farmStart
    }

    /**
     *
     */
    public get rewardTokens(): CreateFarmPoolStoreData['rewardTokens'] {
        return this.data.rewardTokens
    }

    /**
     *
     */
    public get farmVesting(): CreateFarmPoolStoreData['farmVesting'] {
        return this.data.farmVesting
    }

    /**
     *
     */
    public get isVestingValid(): boolean {
        if (this.farmVesting.vestingRatio || this.farmVesting.vestingPeriod) {
            const periodBN = new BigNumber(this.farmVesting.vestingPeriod || 0)
                .dp(0, BigNumber.ROUND_DOWN)
            const ratioBN = new BigNumber(this.farmVesting.vestingRatio || 0)
                .times(10)
                .dp(0, BigNumber.ROUND_DOWN)
            const isPeriodValid = !periodBN.isZero()
                && periodBN.isFinite()
                && !periodBN.isNaN()
                && periodBN.isPositive()
            const isRatioValid = !ratioBN.isZero()
                && ratioBN.isFinite()
                && !ratioBN.isNaN()
                && ratioBN.isPositive()
                && ratioBN.lte(1000)
            return isPeriodValid && isRatioValid
        }
        return true
    }

    /*
     * Memoized store state values
     * ----------------------------------------------------------------------------------
     */

    /**
     *
     */
    public get isCreating(): CreateFarmPoolStoreState['isCreating'] {
        return this.state.isCreating
    }

    /*
     * Internal reaction disposers
     * ----------------------------------------------------------------------------------
     */

    #farmTokenResolveDisposer: IReactionDisposer | undefined

    #farmStartDisposer: IReactionDisposer | undefined

    #rewardTokensDisposer: IReactionDisposer | undefined

    /**
     * Internal swap transaction subscriber
     * @type {Subscriber}
     * @protected
     */
    #transactionSubscriber: Subscriber | undefined

}

const CreateFarmPool = new CreateFarmPoolStore(useWallet())

export function useCreateFarmPoolStore(): CreateFarmPoolStore {
    return CreateFarmPool
}
