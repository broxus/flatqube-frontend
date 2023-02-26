import { Address, FullContractState } from 'everscale-inpage-provider'
import {
    computed,
    makeObservable,
    reaction,
    runInAction,
} from 'mobx'
import type { IReactionDisposer } from 'mobx'
import BigNumber from 'bignumber.js'

import { useStaticRpc } from '@/hooks/useStaticRpc'
import { voteEscrowAccountContract, voteEscrowContract } from '@/modules/QubeDao/utils'
import { usePoolsApi } from '@/modules/Pools/hooks/useApi'
import type { PoolStore, PoolTokenData } from '@/modules/Pools/stores'
import { gaugeAccountContract, gaugeContract } from '@/modules/Pools/utils'
import type { GaugeItem } from '@/modules/Pools/types'
import { BaseStore } from '@/stores/BaseStore'
import { debug, error } from '@/utils'

export type PoolRelatedGaugesStoreData = {
    gauges: GaugeItem[];
}

export type PoolRelatedGaugesStoreState = {
    isFetching?: boolean;
    isInitializing?: boolean;
    isSyncingGauges?: boolean;
}

const staticRpc = useStaticRpc()

export class PoolRelatedGaugesStore extends BaseStore<PoolRelatedGaugesStoreData, PoolRelatedGaugesStoreState> {

    protected readonly api = usePoolsApi()

    constructor(protected readonly pool: PoolStore) {
        super()

        this.setData(() => ({ gauges: [] }))

        makeObservable(this, {
            gauges: computed,
            isFetching: computed,
            isSyncingGaugesRewards: computed,
            maxApr: computed,
            scoredLpBalance: computed,
            scoredUsdBalance: computed,
            tokens: computed,
            totalLpBalance: computed,
            totalUsdBalance: computed,
        })
    }

    public async init(): Promise<void> {
        this.#initDisposer = reaction(() => this.pool.lpToken?.root, async root => {
            if (root !== undefined) {
                await this.fetch()
                await this.syncGaugesRewards()
            }
        }, { fireImmediately: true })
    }

    protected async fetch(force?: boolean): Promise<void> {
        if (this.pool.lpToken?.root === undefined) {
            return
        }

        if (!force && this.isFetching) {
            return
        }

        try {
            this.setState('isFetching', true)

            const response = await this.api.relatedGauges({}, {
                method: 'POST',
            }, {
                lpAddress: this.pool.lpToken.root,
            })

            this.setData('gauges', response.gauges)
        }
        catch (e) {
            error('Related gauges fetching error', e)
        }
        finally {
            this.setState('isFetching', false)
        }
    }

    protected async syncGaugesRewards(): Promise<void> {
        const veContractsStates: Record<string, FullContractState> = {}

        await Promise.allSettled(this.gauges.map(gauge => (async () => {
            if (this.pool.wallet.account?.address === undefined) {
                return
            }

            try {
                runInAction(() => {
                    // eslint-disable-next-line no-param-reassign
                    gauge.isSyncing = true
                })

                const gaugeAddress = new Address(gauge.address)

                const { state: gaugeState } = await staticRpc.getFullContractState(
                    { address: gaugeAddress },
                )

                const [
                    tokenDetails,
                    gaugeDetails,
                    gaugeUserAccountAddress,
                    veUserAccountAddress,
                    syncData,
                ] = await Promise.all([
                    gaugeContract(gaugeAddress).methods.getTokenDetails({}).call({
                        cachedState: gaugeState,
                    }),
                    gaugeContract(gaugeAddress).methods.getDetails({}).call({
                        cachedState: gaugeState,
                    }),
                    (await gaugeContract(gaugeAddress).methods.getGaugeAccountAddress({
                        answerId: 0,
                        user: this.pool.wallet.account.address,
                    }).call({ cachedState: gaugeState })).value0,
                    (await gaugeContract(gaugeAddress).methods.getVoteEscrowAccountAddress({
                        answerId: 0,
                        user: this.pool.wallet.account.address,
                    }).call({ cachedState: gaugeState })).value0,
                    (await gaugeContract(gaugeAddress).methods.calcSyncData({}).call({
                        cachedState: gaugeState,
                    })).value0,
                ])

                const [gaugeUserAccountState, veUserAccountState, veState] = await Promise.allSettled([
                    (await staticRpc.getFullContractState(
                        { address: gaugeUserAccountAddress },
                    )).state,
                    (await staticRpc.getFullContractState(
                        { address: veUserAccountAddress },
                    )).state,
                    veContractsStates[gaugeDetails._voteEscrow.toString()] === undefined
                        ? (await staticRpc.getFullContractState(
                            { address: gaugeDetails._voteEscrow },
                        )).state
                        : veContractsStates[gaugeDetails._voteEscrow.toString()],
                ]).then(results => results.map(
                    result => (result.status === 'fulfilled' ? result.value : undefined),
                ))

                if (veState !== undefined) {
                    veContractsStates[gaugeDetails._voteEscrow.toString()] = veState
                }

                const [gaugeAccountDetails, veAverage, veAccountAverage] = await Promise.all([
                    gaugeAccountContract(gaugeUserAccountAddress).methods.getDetails({
                        answerId: 0,
                    }).call({ cachedState: gaugeUserAccountState }),
                    voteEscrowContract(gaugeDetails._voteEscrow).methods.calculateAverage({}).call({
                        cachedState: veState,
                    }),
                    voteEscrowAccountContract(veUserAccountAddress).methods.calculateVeAverage({}).call({
                        cachedState: veUserAccountState,
                    }),
                ])

                const pendingReward = await gaugeAccountContract(gaugeUserAccountAddress)
                    .methods.pendingReward({
                        _veAccQubeAverage: veAccountAverage._veQubeAverage,
                        _veAccQubeAveragePeriod: veAccountAverage._veQubeAveragePeriod,
                        _veQubeAverage: veAverage._veQubeAverage,
                        _veQubeAveragePeriod: veAverage._veQubeAveragePeriod,
                        gauge_sync_data: syncData,
                    })
                    .call({ cachedState: gaugeUserAccountState })

                const qubeTokenBalance = tokenDetails._qubeTokenData.balance
                let qubeLockedReward = pendingReward._qubeReward.lockedReward,
                    qubeUnlockedReward = pendingReward._qubeReward.unlockedReward

                const qubeDebt = new BigNumber(qubeUnlockedReward).gt(qubeTokenBalance)
                    ? new BigNumber(qubeUnlockedReward).minus(qubeTokenBalance).toFixed()
                    : '0'

                qubeLockedReward = new BigNumber(qubeDebt).plus(qubeLockedReward).toFixed()

                qubeUnlockedReward = new BigNumber(qubeUnlockedReward).gt(qubeTokenBalance)
                    ? qubeTokenBalance
                    : qubeUnlockedReward

                const tokensMap = {
                    [tokenDetails._qubeTokenData.root.toString()]: {
                        lockedReward: qubeLockedReward,
                        unlockedReward: qubeUnlockedReward,
                    },
                }

                tokenDetails._extraTokenData.forEach((token, idx) => {
                    const { lockedReward, unlockedReward } = pendingReward._extraReward[idx]

                    const debt = new BigNumber(unlockedReward).gt(token.balance)
                        ? new BigNumber(unlockedReward).minus(token.balance).toFixed()
                        : '0'

                    tokensMap[token.root.toString()] = {
                        lockedReward: new BigNumber(debt).plus(lockedReward).toFixed(),
                        unlockedReward: new BigNumber(unlockedReward).gt(token.balance)
                            ? token.balance
                            : unlockedReward,
                    }
                })

                this.setData('gauges', this.gauges.map(item => ({
                    ...item,
                    isSyncing: false,
                    rewardTokens: item.rewardTokens.map(token => ({
                        ...token,
                        ...tokensMap[token.tokenRoot],
                    })),
                    userLpLocked: gaugeAccountDetails._balance,
                    userShare: new BigNumber(tokenDetails._depositTokenData.balance).gt(0)
                        ? new BigNumber(gaugeAccountDetails._balance)
                            .times(100)
                            .div(tokenDetails._depositTokenData.balance)
                            .toFixed()
                        : '0',
                })))
            }
            catch (e) {
                debug('Related gauge rewards sync error', e)
            }
            finally {
                runInAction(() => {
                    // eslint-disable-next-line no-param-reassign
                    gauge.isSyncing = false
                })
            }
        })()))
    }

    public get gauges(): PoolRelatedGaugesStoreData['gauges'] {
        return this.data.gauges
    }

    public get isFetching(): PoolRelatedGaugesStoreState['isFetching'] {
        return this.state.isFetching
    }

    public get isSyncingGaugesRewards(): boolean {
        return this.gauges.some(gauge => gauge.isSyncing)
    }

    public get maxApr(): string {
        const values = this.gauges.map(gauge => parseInt(gauge.maxApr, 10) || 0)
        if (values.length === 0) {
            values.push(0)
        }
        return Math.max(...values).toString()
    }

    public get scoredLpBalance(): string {
        return this.gauges.reduce(
            (acc, gauge) => acc.plus(gauge.userLpLocked || 0),
            new BigNumber(0),
        ).toFixed()
    }

    public get scoredUsdBalance(): string {
        if (this.pool.lpToken?.root === undefined || this.pool.lpToken.decimals === undefined) {
            return '0'
        }
        return new BigNumber(this.scoredLpBalance || 0).shiftedBy(-this.pool.lpToken.decimals).times(
            this.pool.getPrice(this.pool.lpToken.root) ?? 0,
        ).toFixed()
    }

    public get tokens(): PoolTokenData[] {
        return this.pool.tokens.map(token => {
            const balance = new BigNumber(this.scoredLpBalance || 0)
                .times(token.tvl || 0)
                .div(parseInt(this.pool.pool?.lpLocked ?? '0', 10) || 1)
                .dp(0, BigNumber.ROUND_DOWN)
                .toFixed()
            return {
                ...token,
                balance,
                totalBalance: new BigNumber(token.balance || 0).plus(balance).toFixed(),
            }
        })
    }

    public get totalLpBalance(): string {
        return new BigNumber(this.scoredLpBalance || 0).plus(this.pool.userLpBalance || 0).toFixed()
    }

    public get totalUsdBalance(): string {
        if (this.pool.lpToken?.root === undefined || this.pool.lpToken.decimals === undefined) {
            return '0'
        }
        return new BigNumber(this.totalLpBalance || 0).shiftedBy(-this.pool.lpToken.decimals).times(
            this.pool.getPrice(this.pool.lpToken.root) ?? 0,
        ).toFixed()
    }

    #initDisposer: IReactionDisposer | undefined

}
