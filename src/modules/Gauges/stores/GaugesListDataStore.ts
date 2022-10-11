import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction, toJS,
} from 'mobx'
import { Address } from 'everscale-inpage-provider'
import BigNumber from 'bignumber.js'

import { WalletService } from '@/stores/WalletService'
import { error } from '@/utils'
import { GaugeAbi, Token, VoteEscrowAbi } from '@/misc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { RewardDetails, TokenDetails } from '@/modules/Gauges/types'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { getEndDate, getStartDate } from '@/modules/Gauges/utils'

type Data = {
    loading: {[k: string]: boolean | undefined};
    loaded: {[k: string]: boolean | undefined};
    share: {[k: string]: string | undefined};
    unlockedReward: {[k: string]: string[] | undefined};
    lockedReward: {[k: string]: string[] | undefined};
    qubeUnlockedReward: {[k: string]: string | undefined};
    qubeLockedReward: {[k: string]: string | undefined};
    tokenDetails: {[k: string]: TokenDetails | undefined}
    rewardDetails: {[k: string]: RewardDetails | undefined};
}

const initialData: Data = {
    loaded: {},
    loading: {},
    lockedReward: {},
    qubeLockedReward: {},
    qubeUnlockedReward: {},
    rewardDetails: {},
    share: {},
    tokenDetails: {},
    unlockedReward: {},
}

export class GaugesListDataStore {

    protected reactions?: IReactionDisposer[]

    protected data = initialData

    protected staticRpc = useStaticRpc()


    constructor(
        protected wallet: WalletService,
        protected tokens: GaugesTokensStore,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public init(): void {
        if (!this.reactions) {
            this.reactions = [
                reaction(
                    () => this.wallet.address,
                    () => this.resync(),
                ),
            ]
        }
    }

    public dispose(): void {
        if (this.reactions) {
            this.reactions.forEach(item => item())
            this.reactions = undefined
        }

        this.data = initialData
    }

    public resync(): void {
        [
            ...Object.keys(this.data.share),
            ...Object.keys(this.data.lockedReward),
            ...Object.keys(this.data.unlockedReward),
            ...Object.keys(this.data.qubeLockedReward),
            ...Object.keys(this.data.qubeUnlockedReward),
        ]
            .filter((value, index, self) => self.indexOf(value) === index)
            .forEach(gaugeId => this.sync(gaugeId))
    }

    public async sync(gaugeId: string): Promise<void> {
        if (this.data.loading[gaugeId]) {
            return
        }

        runInAction(() => {
            this.data.loading = {
                ...this.data.loading,
                [gaugeId]: true,
            }
        })

        const gauge = new this.staticRpc.Contract(
            GaugeAbi.Root,
            new Address(gaugeId),
        )

        let tokenDetails!: TokenDetails,
            rewardDetails: RewardDetails
        try {
            [tokenDetails, rewardDetails] = await Promise.all([
                gauge.methods.getTokenDetails({}).call(),
                gauge.methods.getRewardDetails({}).call(),
            ])
            tokenDetails._extraTokenData.forEach(item => this.tokens.sync(item.root.toString()))
            this.tokens.sync(tokenDetails._qubeTokenData.root.toString())
        }
        catch (e) {
            error('GaugesDataStore.sync', e)
        }

        let share = '0',
            qubeLockedReward = '0',
            qubeUnlockedReward = '0',
            extraLockedReward = tokenDetails?._extraTokenData.map(() => '0'),
            extraUnlockedReward = extraLockedReward

        if (this.wallet.address) {
            try {
                const userAddress = await gauge.methods
                    .getGaugeAccountAddress({
                        answerId: 0,
                        user: new Address(this.wallet.address),
                    }).call()

                const account = new this.staticRpc.Contract(
                    GaugeAbi.Account,
                    userAddress.value0,
                )

                const [
                    gaugeDetails, userDetails, syncData,
                ] = await Promise.all([
                    gauge.methods.getDetails({}).call(),
                    account.methods.getDetails({ answerId: 0 }).call(),
                    gauge.methods.calcSyncData({}).call(),
                ])

                const voteEscrow = new this.staticRpc.Contract(
                    VoteEscrowAbi.Root,
                    gaugeDetails._voteEscrow,
                )

                const veAccountAddress = await voteEscrow.methods.getVoteEscrowAccountAddress({
                    answerId: 0,
                    user: new Address(this.wallet.address),
                }).call()

                const veAccount = new this.staticRpc.Contract(
                    VoteEscrowAbi.Account,
                    veAccountAddress.value0,
                )

                const veAverage = await voteEscrow.methods.calculateAverage({}).call()
                const veAccountAverage = await veAccount.methods.calculateVeAverage({}).call()

                const pendingReward = await account.methods.pendingReward({
                    _veAccQubeAverage: veAccountAverage._veQubeAverage,
                    _veAccQubeAveragePeriod: veAccountAverage._veQubeAveragePeriod,
                    _veQubeAverage: veAverage._veQubeAverage,
                    _veQubeAveragePeriod: veAverage._veQubeAveragePeriod,
                    gauge_sync_data: syncData.value0,
                }).call()

                const qubeTokenBalance = tokenDetails._qubeTokenData.balance
                const extraTokensBalance = tokenDetails._extraTokenData.map(item => item.balance)

                qubeLockedReward = pendingReward._qubeReward.lockedReward
                qubeUnlockedReward = pendingReward._qubeReward.unlockedReward

                extraLockedReward = pendingReward._extraReward
                    .map(item => item.lockedReward)

                extraUnlockedReward = pendingReward._extraReward
                    .map(item => item.unlockedReward)

                const extraTokensDebt = extraUnlockedReward.map((item, index) => (
                    new BigNumber(item).gt(extraTokensBalance[index])
                        ? new BigNumber(item).minus(extraTokensBalance[index]).toFixed()
                        : '0'
                ))

                const qubeDebt = new BigNumber(qubeUnlockedReward).gt(qubeTokenBalance)
                    ? new BigNumber(qubeUnlockedReward).minus(qubeTokenBalance).toFixed()
                    : '0'

                extraLockedReward = extraLockedReward.map((item, index) => (
                    new BigNumber(item).plus(extraTokensDebt[index]).toFixed()
                ))

                extraUnlockedReward = extraUnlockedReward.map((item, index) => (
                    new BigNumber(item).gt(extraTokensBalance[index])
                        ? extraTokensBalance[index]
                        : item
                ))

                qubeLockedReward = new BigNumber(qubeDebt).plus(qubeLockedReward).toFixed()

                qubeUnlockedReward = new BigNumber(qubeUnlockedReward).gt(qubeTokenBalance)
                    ? qubeTokenBalance
                    : qubeUnlockedReward

                share = new BigNumber(tokenDetails._depositTokenData.balance).gt(0)
                    ? new BigNumber(userDetails._balance)
                        .multipliedBy(100)
                        .dividedBy(tokenDetails._depositTokenData.balance)
                        .toFixed()
                    : '0'
            }
            catch (e: any) {
                if (e && e.code !== 2) {
                    error('GaugesDataStore.sync', e)
                }
            }
        }

        runInAction(() => {
            this.data.lockedReward = {
                ...this.data.lockedReward,
                [gaugeId]: extraLockedReward,
            }

            this.data.unlockedReward = {
                ...this.data.unlockedReward,
                [gaugeId]: extraUnlockedReward,
            }

            this.data.qubeLockedReward = {
                ...this.data.qubeLockedReward,
                [gaugeId]: qubeLockedReward,
            }

            this.data.qubeUnlockedReward = {
                ...this.data.qubeUnlockedReward,
                [gaugeId]: qubeUnlockedReward,
            }

            this.data.share = {
                ...this.data.share,
                [gaugeId]: share,
            }

            this.data.tokenDetails = {
                ...this.data.tokenDetails,
                [gaugeId]: tokenDetails,
            }

            this.data.rewardDetails = {
                ...this.data.rewardDetails,
                [gaugeId]: rewardDetails,
            }

            this.data.loading = {
                ...this.data.loading,
                [gaugeId]: false,
            }

            this.data.loaded = {
                ...this.data.loaded,
                [gaugeId]: true,
            }
        })
    }

    public get share(): Data['share'] {
        return this.data.share
    }

    public get unlockedReward(): Data['unlockedReward'] {
        return this.data.unlockedReward
    }

    public get lockedReward(): Data['lockedReward'] {
        return this.data.lockedReward
    }

    public get qubeLockedReward(): Data['qubeLockedReward'] {
        return this.data.qubeLockedReward
    }

    public get qubeUnlockedReward(): Data['qubeUnlockedReward'] {
        return this.data.qubeUnlockedReward
    }

    public get extraTokens(): {[k: string]: Token[] | undefined} {
        return Object.fromEntries(
            Object.entries(this.data.tokenDetails)
                .map(([gaugeId, tokenDetails]) => {
                    const tokens = tokenDetails?._extraTokenData
                        .map(token => this.tokens.byRoot[token.root.toString()]) ?? []

                    return tokens?.every(item => !!item)
                        ? [gaugeId, tokens as Token[]]
                        : [gaugeId, undefined]
                }),
        )
    }

    public get qubeToken(): {[k: string]: Token | undefined} {
        return Object.fromEntries(
            Object.entries(this.data.tokenDetails)
                .map(([gaugeId, tokenDetails]) => {
                    const token = tokenDetails
                        ? this.tokens.byRoot[tokenDetails?._qubeTokenData.root.toString()]
                        : undefined

                    return token
                        ? [gaugeId, token]
                        : [gaugeId, undefined]
                }),
        )
    }

    public get startDate(): {[k: string]: number | undefined} {
        return Object.fromEntries(
            Object.entries(toJS(this.data.rewardDetails))
                .map(([gaugeId, rewardDetails]) => (
                    rewardDetails
                        ? [gaugeId, getStartDate(rewardDetails)]
                        : [gaugeId, undefined]
                )),
        )
    }

    public get endDate(): {[k: string]: number | undefined} {
        return Object.fromEntries(
            Object.entries(toJS(this.data.rewardDetails))
                .map(([gaugeId, rewardDetails]) => (
                    rewardDetails
                        ? [gaugeId, getEndDate(rewardDetails)]
                        : [gaugeId, undefined]
                )),
        )
    }

    public get loading(): Data['loading'] {
        return this.data.loading
    }

    public get loaded(): Data['loaded'] {
        return this.data.loaded
    }

}
