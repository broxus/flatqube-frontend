import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction, toJS,
} from 'mobx'
import { Address, FullContractState } from 'everscale-inpage-provider'
import BigNumber from 'bignumber.js'

import { useStaticRpc } from '@/hooks/useStaticRpc'
import { RewardDetails, TokenDetails } from '@/modules/Gauges/types'
import { GaugeAbi, Token } from '@/misc'
import { error, warn } from '@/utils'
import {
    decimalAmount,
    gaugeHandler, getEndDate, getStartDate, normalizeAmount,
} from '@/modules/Gauges/utils'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'
import { GaugesPriceStore } from '@/modules/Gauges/stores/GaugesPriceStore'
import { GaugeItem } from '@/modules/Gauges/api/models'

type Data = {
    id?: string;
    tokenDetails?: TokenDetails;
    rewardDetails?: RewardDetails;
    maxLockTime?: string;
    rootToken?: string;
    qubeToken?: string;
    extraTokens?: string[];
    ownerAddress?: string;
    veAddress?: string;
    gaugeItem?: GaugeItem;
}

export class GaugesDataStore {

    protected reactions?: IReactionDisposer[]

    protected data: Data = {}

    protected staticRpc = useStaticRpc()

    constructor(
        protected tokens: GaugesTokensStore,
        protected autoResync: GaugesAutoResyncStore,
        protected price: GaugesPriceStore,
    ) {
        makeAutoObservable(this)
    }

    public init(id: string): void {
        this.data.id = id

        if (!this.reactions) {
            this.reactions = [
                reaction(
                    () => this.id,
                    () => this.sync(),
                    { fireImmediately: true },
                ),
                reaction(
                    () => [this.autoResync.counter],
                    () => this.sync(),
                ),
            ]
        }
    }

    public dispose(): void {
        if (this.reactions) {
            this.reactions.forEach(item => item())
            this.reactions = undefined
        }

        this.data = {}
    }

    public async syncDetails(cachedState?: FullContractState): Promise<void> {
        let maxLockTime = this.data.maxLockTime ?? '0',
            { ownerAddress, veAddress } = this.data

        if (!this.data.id) {
            warn('DataStore.syncDetails', 'Id must be defined')
        }
        else {
            try {
                const rootContract = new this.staticRpc.Contract(
                    GaugeAbi.Root,
                    new Address(this.data.id),
                )
                const details = await rootContract.methods
                    .getDetails({})
                    .call({ cachedState })

                maxLockTime = details._maxLockTime
                ownerAddress = details._owner.toString()
                veAddress = details._voteEscrow.toString()
            }
            catch (e) {
                error('DataStore.syncDetails', e)
            }
        }

        runInAction(() => {
            this.data.maxLockTime = maxLockTime
            this.data.ownerAddress = ownerAddress
            this.data.veAddress = veAddress
        })
    }

    public async syncRewardDetails(cachedState?: FullContractState): Promise<void> {
        let { rewardDetails } = this.data

        if (!this.data.id) {
            return
        }

        try {
            const rootContract = new this.staticRpc.Contract(
                GaugeAbi.Root,
                new Address(this.data.id),
            )

            rewardDetails = await rootContract.methods
                .getRewardDetails({})
                .call({ cachedState })
        }
        catch (e) {
            error('DataStore.syncRewardDetails', e)
        }

        runInAction(() => {
            this.data.rewardDetails = rewardDetails
        })
    }

    public async getGaugeContractState(): Promise<FullContractState | undefined> {
        if (this.data.id) {
            try {
                const { state } = await this.staticRpc.getFullContractState({
                    address: new Address(this.data.id),
                })
                return state
            }
            catch (e) {
                error(e)
                return undefined
            }
        }
        return undefined
    }

    public async syncTokenDetails(cachedState?: FullContractState): Promise<void> {
        let { tokenDetails } = this.data

        if (!this.data.id) {
            warn('DataStore.syncTokenDetails', 'Id must be defined')
        }
        else {
            try {
                const rootContract = new this.staticRpc.Contract(
                    GaugeAbi.Root,
                    new Address(this.data.id),
                )

                tokenDetails = await rootContract.methods.getTokenDetails({})
                    .call({ cachedState })
            }
            catch (e) {
                error('DataStore.syncTokenDetails', e)
            }
        }

        runInAction(() => {
            this.data.tokenDetails = tokenDetails
        })
    }

    public async syncRootToken(): Promise<void> {
        let { rootToken } = this.data

        if (!this.data.tokenDetails) {
            warn('TokenDetails must be defined')
        }
        else {
            try {
                const tokenAddress = this.data.tokenDetails
                    ._depositTokenData.root.toString()

                await this.tokens.sync(tokenAddress)

                if (this.tokens.byRoot[tokenAddress]) {
                    rootToken = tokenAddress
                }
            }
            catch (e) {
                error('DataStore.syncRootToken', e)
            }
        }

        runInAction(() => {
            this.data.rootToken = rootToken
        })
    }

    public async syncQubeToken(): Promise<void> {
        let { qubeToken } = this.data

        if (!this.data.tokenDetails) {
            warn('TokenDetails must be defined')
        }
        else {
            try {
                const tokenAddress = this.data.tokenDetails
                    ._qubeTokenData.root.toString()

                await this.tokens.sync(tokenAddress)

                if (this.tokens.byRoot[tokenAddress]) {
                    qubeToken = tokenAddress
                }
            }
            catch (e) {
                error('DataStore.syncQubeToken', e)
            }
        }

        runInAction(() => {
            this.data.qubeToken = qubeToken
        })
    }

    public async syncExtraTokens(): Promise<void> {
        let { extraTokens } = this.data

        if (!this.data.tokenDetails) {
            warn('TokenDetails must be defined')
        }
        else {
            try {
                const tokenAddresses = this.data.tokenDetails
                    ._extraTokenData.map(item => item.root.toString())

                await Promise.all(tokenAddresses
                    .map(item => this.tokens.sync(item)))

                if (tokenAddresses.every(item => this.tokens.byRoot[item])) {
                    extraTokens = tokenAddresses
                }
            }
            catch (e) {
                error('DataStore.syncExtraTokens', e)
            }
        }

        runInAction(() => {
            this.data.extraTokens = extraTokens
        })
    }

    public async syncTokensPrice(): Promise<void> {
        if (!this.data.tokenDetails) {
            warn('TokenDetails must be defined')
        }
        else {
            try {
                const roots = [
                    this.data.tokenDetails._depositTokenData.root.toString(),
                    this.data.tokenDetails._qubeTokenData.root.toString(),
                    ...this.data.tokenDetails._extraTokenData.map(item => item.root.toString()),
                ]

                await this.price.sync(roots)

                if (roots.some(root => !this.price.byRoot[root])) {
                    throw new Error('Price not founded')
                }
            }
            catch (e) {
                error('DataStore.syncTokensPrice', e)
            }
        }
    }

    public async syncApi(): Promise<void> {
        let { gaugeItem } = this.data

        if (!this.data.id) {
            return
        }
        try {
            const data = await gaugeHandler({}, {}, {
                gaugeAddress: this.data.id,
            })

            await Promise.all(data.gauge.poolTokens
                .map(item => this.tokens.sync(item.tokenRoot)))

            if (data.gauge.poolTokens.every(item => this.tokens.byRoot[item.tokenRoot])) {
                gaugeItem = data.gauge
            }
        }
        catch (e) {
            error('DataStore.syncApi', e)
        }

        runInAction(() => {
            this.data.gaugeItem = gaugeItem
        })
    }

    public async sync(): Promise<void> {
        if (!this.data.id) {
            return
        }
        try {
            const [contractState] = await Promise.all([
                this.getGaugeContractState(),
                this.syncApi(),
            ])

            await Promise.allSettled([
                this.syncTokenDetails(contractState),
                this.syncRewardDetails(contractState),
                this.syncDetails(contractState),
            ])
            await Promise.allSettled([
                this.syncRootToken(),
                this.syncQubeToken(),
                this.syncExtraTokens(),
                this.syncTokensPrice(),
            ])
        }
        catch (e) {
            error('DataStore.sync', e)
        }
    }

    public get id(): string | undefined {
        return this.data.id
    }

    public get rootToken(): Token | undefined {
        return this.data.rootToken
            ? this.tokens.byRoot[this.data.rootToken]
            : undefined
    }

    public get qubeToken(): Token | undefined {
        return this.data.qubeToken
            ? this.tokens.byRoot[this.data.qubeToken]
            : undefined
    }

    public get extraTokens(): Token[] | undefined {
        return this.data.extraTokens
            ? this.data.extraTokens
                .map(item => this.tokens.byRoot[item] as Token)
            : undefined
    }

    public get extraTokensByRoot(): {[k: string]: Token} | undefined {
        return this.extraTokens
            ? this.extraTokens
                .reduce<{[k: string]: Token}>((acc, item) => ({
                    ...acc,
                    [item.root]: item,
                }), {})
            : undefined
    }

    public get rewardsTokens(): Token[] | undefined {
        return this.extraTokens && this.qubeToken
            ? [...this.extraTokens, this.qubeToken]
            : undefined
    }

    public get tokensByRoot(): {[k: string]: Token} | undefined {
        if (this.rootToken && this.rewardsTokens && this.poolTokens) {
            return [this.rootToken, ...this.rewardsTokens, ...this.poolTokens]
                .reduce<{[k: string]: Token}>((acc, item) => ({
                    ...acc,
                    [item.root]: item,
                }), {})
        }
        return undefined
    }

    public get maxLockTime(): string | undefined {
        return this.data.maxLockTime
    }

    public get rootTokenBalance(): string | undefined {
        return this.data.tokenDetails?._depositTokenData.balance
    }

    public get tvl(): string | undefined {
        return this.data.gaugeItem?.tvl
    }

    public get rootTokenPrice(): string | undefined {
        if (this.tvl && this.rootTokenBalance && this.rootToken) {
            const balance = decimalAmount(this.rootTokenBalance, this.rootToken.decimals)
            return new BigNumber(this.tvl).dividedBy(balance).toFixed()
        }
        return undefined
    }

    public get ownerAddress(): string | undefined {
        return this.data.ownerAddress
    }

    public get veAddress(): string | undefined {
        return this.data.veAddress
    }

    public get rewardDetails(): RewardDetails | undefined {
        return toJS(this.data.rewardDetails)
    }

    public get tokenDetails(): TokenDetails | undefined {
        return this.data.tokenDetails
    }

    public get startDate(): number | undefined {
        if (this.rewardDetails) {
            return getStartDate(this.rewardDetails)
        }
        return undefined
    }

    public get endDate(): number | undefined {
        if (this.rewardDetails) {
            return getEndDate(this.rewardDetails)
        }
        return undefined
    }

    public get extraTokensBalance(): string[] | undefined {
        return this.data.tokenDetails
            ? this.data.tokenDetails._extraTokenData.map(item => item.balance)
            : undefined
    }

    public get qubeTokenBalance(): string | undefined {
        return this.data.tokenDetails
            ? this.data.tokenDetails._qubeTokenData.balance
            : undefined
    }

    public get qubeTokenSpeed(): string | undefined {
        if (this.rewardDetails) {
            const { _qubeRewardRounds } = this.rewardDetails
            return _qubeRewardRounds.length > 0
                ? _qubeRewardRounds[_qubeRewardRounds.length - 1].rewardPerSecond
                : '0'
        }
        return undefined
    }

    public get extraTokenSpeed(): string[] | undefined {
        if (this.rewardDetails) {
            return this.rewardDetails._extraRewardRounds
                .map(item => (
                    item.length > 0 ? item[item.length - 1].rewardPerSecond : '0'
                ))
        }
        return undefined
    }

    public get apr(): string | undefined {
        return this.data.gaugeItem?.minApr
    }

    public get minApr(): string | undefined {
        return this.data.gaugeItem?.minApr
    }

    public get maxApr(): string | undefined {
        return this.data.gaugeItem?.maxApr
    }

    public get poolTokens(): Token[] | undefined {
        if (this.data.gaugeItem) {
            return this.data.gaugeItem.poolTokens.map(item => (
                this.tokens.byRoot[item.tokenRoot] as Token
            ))
        }
        return undefined
    }

    public get poolTokensAmount(): string[] | undefined {
        const { tokensByRoot } = this
        if (this.data.gaugeItem && tokensByRoot) {
            return this.data.gaugeItem.poolTokens.map(item => (
                normalizeAmount(item.amount, tokensByRoot[item.tokenRoot].decimals)
            ))
        }
        return undefined
    }

    public get isLowBalance(): boolean | undefined {
        return this.data.gaugeItem?.isLowBalance
    }

}
