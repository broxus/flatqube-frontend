import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'
import { makeAutoObservable, runInAction, toJS } from 'mobx'

import { FarmingApi, useApi } from '@/modules/Farming/hooks/useApi'
import {
    FarmingPoolResponse, RewardInfo, Transaction, TransactionsRequest,
} from '@/modules/Farming/types'
import { getUserAmount, getUserPendingReward } from '@/modules/Farming/utils'
import { CurrencyInfo } from '@/modules/Currencies/types'
import { useWallet, WalletService } from '@/stores/WalletService'
import { TokenCache, TokensCacheService, useTokensCache } from '@/stores/TokensCacheService'
import {
    Dex, Farm, PairBalances, PoolDetails,
    TokenWallet, UserPendingReward,
} from '@/misc'
import { concatSymbols, error } from '@/utils'
import { SECONDS_IN_DAY } from '@/constants'

type State = {
    poolAddress?: string;
    apiResponse?: FarmingPoolResponse;
    poolDetails?: PoolDetails;
    pairBalances?: PairBalances;
    rewardCurrencies?: (CurrencyInfo | undefined)[];
    userAddress?: string;
    userPoolDataAddress?: Address;
    userLpWalletAddress?: Address;
    userRewardTokensBalance?: string[];
    userLpWalletAmount?: string;
    userLpFarmingAmount?: string;
    userPendingReward?: UserPendingReward;
    userLastWithdrawTransaction?: Transaction;
    userLastDepositTransaction?: Transaction;
    loaded?: boolean;
}

export class FarmingDataStore {

    protected state: State = {}

    constructor(
        protected api: FarmingApi,
        protected wallet: WalletService,
        protected tokensCache: TokensCacheService,
    ) {
        makeAutoObservable(this, {}, { autoBind: true })
    }

    public dispose(): void {
        this.state = {}
    }

    protected async syncApiData(): Promise<void> {
        try {
            if (!this.state.poolAddress) {
                throw new Error('Pool address must be defined')
            }

            const result = await this.api.farmingPool({
                address: this.state.poolAddress,
            }, {}, {
                userAddress: this.state.userAddress,
                afterZeroBalance: true,
            })

            runInAction(() => {
                this.state.apiResponse = result
            })
        }
        catch (e) {
            error(e)
        }
    }

    protected async syncPoolDetails(): Promise<void> {
        try {
            if (!this.state.poolAddress) {
                throw new Error('Pool address must be defined')
            }
            if (!this.state.apiResponse) {
                throw new Error('Api Response must be defined')
            }

            const result = this.wallet.isConnected
                ? await Farm.poolGetDetails(new Address(this.state.poolAddress))
                : undefined

            // FIXME: Hotfix. Need to refactoring using objects instead arrays
            if (result) {
                const cache = this.state.apiResponse.reward_token_root_info
                    .reduce<any>((acc, item) => ({
                        ...acc,
                        [item.reward_root_address]: item,
                    }), {})

                const fixedApiResponse = {
                    ...this.state.apiResponse,
                    reward_token_root_info: result.rewardTokenRoot
                        .map(root => cache[root.toString()]),
                }

                runInAction(() => {
                    this.state.apiResponse = fixedApiResponse
                })
            }

            runInAction(() => {
                this.state.poolDetails = result
            })
        }
        catch (e) {
            error(e)
        }
    }

    protected async syncPairBalances(): Promise<void> {
        try {
            if (!this.state.apiResponse) {
                throw new Error('Api Response must be defined')
            }

            if (
                this.wallet.isConnected
                && this.state.apiResponse.left_address
                && this.state.apiResponse.right_address
            ) {
                const result = await Dex.pairBalances(
                    await Dex.pairAddress(
                        new Address(this.state.apiResponse.left_address),
                        new Address(this.state.apiResponse.right_address),
                    ),
                )
                runInAction(() => {
                    this.state.pairBalances = result
                })
            }
        }
        catch (e) {
            error(e)
        }
    }

    protected async syncRewardCurrencies(): Promise<void> {
        try {
            if (!this.state.apiResponse) {
                throw new Error('Api Response must be defined')
            }

            const result = await Promise.all(
                this.state.apiResponse.reward_token_root_info.map(reward => (
                    this.api.currency({
                        address: reward.reward_root_address,
                    }).catch(() => undefined)
                )),
            )

            runInAction(() => {
                this.state.rewardCurrencies = result
            })
        }
        catch (e) {
            error(e)
        }
    }

    protected async syncUserPoolDataAddress(): Promise<void> {
        try {
            if (!this.state.poolAddress) {
                throw new Error('Pool address must be defined')
            }
            if (!this.state.userAddress) {
                throw new Error('User address must be defined')
            }
            if (!this.wallet.isConnected) {
                throw new Error('Wallet must be connected')
            }

            const userPoolDataAddress = await Farm.userDataAddress(
                new Address(this.state.poolAddress),
                new Address(this.state.userAddress),
            )

            runInAction(() => {
                this.state.userPoolDataAddress = userPoolDataAddress
            })
        }
        catch (e) {
            error(e)
        }
    }

    protected async syncUserLpWalletAddress(): Promise<void> {
        try {
            if (!this.state.userAddress) {
                throw new Error('User address must be defined')
            }
            if (!this.wallet.isConnected) {
                throw new Error('Wallet must be connected')
            }
            if (!this.state.poolDetails) {
                throw new Error('poolDetails must be defined')
            }

            const userLpWalletAddress = await TokenWallet.walletAddress({
                owner: new Address(this.state.userAddress),
                root: this.state.poolDetails.tokenRoot,
            })

            runInAction(() => {
                this.state.userLpWalletAddress = userLpWalletAddress
            })
        }
        catch (e) {
            error(e)
        }
    }

    protected async syncUserRewardTokensBalance(): Promise<void> {
        try {
            if (!this.state.userAddress) {
                throw new Error('User address must be defined')
            }
            if (!this.state.poolDetails) {
                throw new Error('poolDetails must be defined')
            }

            const ownerAddress = new Address(this.state.userAddress)

            const userRewardTokensBalance = await Promise.all(
                this.state.poolDetails.rewardTokenRoot.map(tokenAddress => (
                    TokenWallet.balanceByTokenRoot(
                        ownerAddress,
                        tokenAddress,
                    ).catch(() => '0')
                )),
            )

            runInAction(() => {
                this.state.userRewardTokensBalance = userRewardTokensBalance
            })
        }
        catch (e) {
            error(e)
        }
    }

    protected async syncUserLpWalletAmount(): Promise<void> {
        try {
            if (!this.wallet.isConnected) {
                throw new Error('Wallet must be connected')
            }

            if (!this.state.userLpWalletAddress) {
                throw new Error('userLpWalletAddress must be defined')
            }

            const userLpWalletAmount = await TokenWallet.balanceByWalletAddress(
                this.state.userLpWalletAddress,
            )

            runInAction(() => {
                this.state.userLpWalletAmount = userLpWalletAmount
            })
        }
        catch (e) {
            error(e)
        }
    }

    protected async syncUserLpFarmingAmount(): Promise<void> {
        try {
            if (!this.wallet.isConnected) {
                throw new Error('Wallet must be connected')
            }

            if (!this.state.userPoolDataAddress) {
                throw new Error('userPoolDataAddress must be defined')
            }

            const userLpFarmingAmount = await getUserAmount(
                this.state.userPoolDataAddress,
            )

            runInAction(() => {
                this.state.userLpFarmingAmount = userLpFarmingAmount
            })
        }
        catch (e) {
            error(e)
        }
    }

    protected async syncUserPendingReward(): Promise<void> {
        try {
            if (!this.state.poolAddress) {
                throw new Error('Pool address must be defined')
            }
            if (!this.wallet.isConnected) {
                throw new Error('Wallet must be connected')
            }
            if (!this.state.userPoolDataAddress) {
                throw new Error('userPoolDataAddress must be defined')
            }
            if (!this.state.poolDetails) {
                throw new Error('poolDetails must be defined')
            }

            const userPendingReward = await getUserPendingReward(
                new Address(this.state.poolAddress),
                this.state.userPoolDataAddress,
                this.state.poolDetails.farmEndTime,
            )

            runInAction(() => {
                this.state.userPendingReward = userPendingReward
            })
        }
        catch (e) {
            error(e)
        }
    }

    protected async syncUserLastTransactions(): Promise<void> {
        try {
            if (!this.state.poolAddress) {
                throw new Error('Pool address must be defined')
            }
            if (!this.state.userAddress) {
                throw new Error('User address must be defined')
            }

            const defaultParams = {
                limit: 1,
                offset: 0,
                poolAddress: this.state.poolAddress,
                userAddress: this.state.userAddress,
                ordering: 'blocktimedescending',
            } as TransactionsRequest

            const [
                depositTransactions,
                withdrawTransactions,
            ] = await Promise.all([
                this.api.transactions({}, {}, {
                    ...defaultParams,
                    eventTypes: ['deposit'],
                }).catch(() => undefined),
                this.api.transactions({}, {}, {
                    ...defaultParams,
                    eventTypes: ['withdraw'],
                }).catch(() => undefined),
            ])

            runInAction(() => {
                this.state.userLastDepositTransaction = depositTransactions?.transactions?.[0]
                this.state.userLastWithdrawTransaction = withdrawTransactions?.transactions?.[0]
            })
        }
        catch (e) {
            error(e)
        }
    }

    public syncTokens(): void {
        if (this.rewardTokensAddress) {
            this.rewardTokensAddress.forEach(address => {
                this.tokensCache.syncCustomToken(address)
            })
        }

        if (this.leftTokenAddress) {
            this.tokensCache.syncCustomToken(this.leftTokenAddress)
        }

        if (this.rightTokenAddress) {
            this.tokensCache.syncCustomToken(this.rightTokenAddress)
        }

        if ((!this.leftTokenAddress || !this.rightTokenAddress) && this.lpTokenAddress) {
            this.tokensCache.syncCustomToken(this.lpTokenAddress)
        }
    }

    public async syncData(): Promise<void> {
        try {
            await this.syncApiData()
            await Promise.allSettled([
                this.syncPoolDetails(),
                this.syncPairBalances(),
            ])
            await this.syncRewardCurrencies()

            if (this.state.userAddress) {
                await Promise.allSettled([
                    this.syncUserPoolDataAddress(),
                    this.syncUserLpWalletAddress(),
                    this.syncUserRewardTokensBalance(),
                ])
                await Promise.allSettled([
                    this.syncUserLpWalletAmount(),
                    this.syncUserLpFarmingAmount(),
                    this.syncUserPendingReward(),
                    this.syncUserLastTransactions(),
                ])
            }

            await this.syncTokens()
        }
        catch (e) {
            error(e)
        }
    }

    public async fetchData(poolAddress: string, userAddress?: string): Promise<void> {
        try {
            const _userAddress = userAddress || this.wallet.address

            runInAction(() => {
                this.state.poolAddress = poolAddress
                this.state.userAddress = _userAddress
            })

            await this.syncData()
        }
        catch (e) {
            error(e)
        }
        finally {
            runInAction(() => {
                this.state.loaded = true
            })
        }
    }

    public get loaded(): boolean {
        return !!this.state.loaded
    }

    public get hasBaseData(): boolean {
        return !!this.state.apiResponse
    }

    public get isExternalLpToken(): boolean | undefined {
        const { apiResponse } = this.state

        if (!apiResponse) {
            return undefined
        }

        if (!apiResponse.left_address || !apiResponse.right_address) {
            return true
        }

        return false
    }

    public get apr(): string | undefined | null {
        if (this.isExternalLpToken === true) {
            return null
        }

        return this.state.apiResponse?.apr
    }

    public get tvl(): string | undefined | null {
        if (this.isExternalLpToken === true) {
            return null
        }

        return this.state.apiResponse?.tvl
    }

    public get userUsdtBalance(): string | undefined | null {
        if (this.isExternalLpToken === true) {
            return null
        }

        return this.state.apiResponse?.user_usdt_balance
    }

    public get userHistoryUsdtBalance(): string | undefined | null {
        if (this.isExternalLpToken === true) {
            return null
        }

        return this.state.apiResponse?.history_info?.usdt_amount
    }

    public get userHistoryLeftAmount(): string | undefined | null {
        if (this.isExternalLpToken === true) {
            return null
        }

        return this.state.apiResponse?.history_info?.left_amount
    }

    public get userHistoryRightAmount(): string | undefined | null {
        if (this.isExternalLpToken === true) {
            return null
        }

        return this.state.apiResponse?.history_info?.right_amount
    }

    public get userHistoryLastUpdateTime(): number | undefined {
        const depositTimestamp = this.state.userLastDepositTransaction?.timestampBlock
        const withdrawTimestamp = this.state.userLastWithdrawTransaction?.timestampBlock

        if (!depositTimestamp && !withdrawTimestamp) {
            return undefined
        }

        if (depositTimestamp && withdrawTimestamp) {
            return Math.max(depositTimestamp, withdrawTimestamp)
        }

        return depositTimestamp || withdrawTimestamp
    }

    public get leftTokenAddress(): string | undefined {
        return this.state.apiResponse?.left_address
    }

    public get leftTokenSymbol(): string | undefined {
        return this.state.apiResponse?.left_currency
    }

    public get rightTokenAddress(): string | undefined {
        return this.state.apiResponse?.right_address
    }

    public get rightTokenSymbol(): string | undefined {
        return this.state.apiResponse?.right_currency
    }

    public get symbol(): string | undefined {
        return this.leftTokenSymbol || this.rightTokenSymbol
            ? concatSymbols(this.leftTokenSymbol, this.rightTokenSymbol)
            : this.lpTokenSymbol
    }

    public get pairBalanceLeft(): string | undefined {
        return this.state.pairBalances?.left
    }

    public get pairBalanceRight(): string | undefined {
        return this.state.pairBalances?.right
    }

    public get pairBalanceLp(): string | undefined {
        return this.state.pairBalances?.lp
    }

    public get userLpWalletAmount(): string | undefined {
        return this.state.userLpWalletAmount
    }

    public get userLpFarmingAmount(): string | undefined {
        return this.state.userLpFarmingAmount
    }

    public get lpTokenAddress(): string | undefined {
        return this.state.apiResponse?.token_root_address
    }

    public get lpTokenSymbol(): string | undefined {
        return this.state.apiResponse?.token_root_currency
    }

    public get lpTokenDecimals(): number | undefined {
        return this.state.apiResponse?.token_root_scale
    }

    public get lpTokenBalance(): string | undefined {
        return this.state.apiResponse?.pool_balance
    }

    public get leftTokenBalance(): string | undefined {
        return this.state.apiResponse?.left_balance
    }

    public get rightTokenBalance(): string | undefined {
        return this.state.apiResponse?.right_balance
    }

    public get poolAddress(): string | undefined {
        return this.state.poolAddress
    }

    public get userAddress(): string | undefined {
        return this.state.userAddress
    }

    public get poolOwnerAddress(): string | undefined {
        return this.state.apiResponse?.pool_owner_address
    }

    public get userPoolDataAddress(): string | undefined {
        return this.state.userPoolDataAddress?.toString()
    }

    public get userLpWalletAddress(): string | undefined {
        return this.state.userLpWalletAddress?.toString()
    }

    public get poolWalletAddress(): string | undefined {
        return this.state.poolDetails?.tokenWallet.toString()
    }

    public get startTime(): number | undefined {
        return this.state.apiResponse?.farm_start_time
    }

    public get rewardTokensAddress(): string[] | undefined {
        return this.state.apiResponse?.reward_token_root_info
            .map(reward => reward.reward_root_address)
    }

    public get rewardTokensBalanceCumulative(): string[] | undefined {
        return toJS(this.state.poolDetails?.rewardTokenBalanceCumulative)
    }

    public get rewardTokensBalance(): string[] | undefined {
        return toJS(this.state.poolDetails?.rewardTokenBalance)
    }

    public get rewardTotalBalance(): string | undefined {
        const { rewardCurrencies } = this.state

        if (
            !rewardCurrencies
            || !this.userPendingRewardDebt
            || !this.userPendingRewardEntitled
            || !this.userPendingRewardVested
            || !this.rewardTokensAddress
        ) {
            return undefined
        }

        if (rewardCurrencies.includes(undefined)) {
            return undefined
        }

        const rewardTokens = this.rewardTokensAddress
            .map(tokenAddress => this.tokensCache.get(tokenAddress))

        if (rewardTokens.includes(undefined)) {
            return undefined
        }

        const reduceReward = (acc: BigNumber, item: string, index: number): BigNumber => {
            const token = rewardTokens[index] as TokenCache
            if (token === undefined) {
                return acc
            }
            const { decimals } = token
            const currency = rewardCurrencies[index] as CurrencyInfo
            const current = new BigNumber(item).shiftedBy(-decimals).multipliedBy(currency.price)
            return acc.plus(current)
        }

        const debtBalance = this.userPendingRewardDebt
            .reduce<BigNumber>(reduceReward, new BigNumber(0))

        const entitledBalance = this.userPendingRewardEntitled
            .reduce<BigNumber>(reduceReward, new BigNumber(0))

        const vestedBalance = this.userPendingRewardVested
            .reduce<BigNumber>(reduceReward, new BigNumber(0))

        return debtBalance
            .plus(entitledBalance)
            .plus(vestedBalance)
            .toFixed()
    }

    public get userInFarming(): boolean {
        if (this.wallet.isConnected && this.state.apiResponse) {
            if (
                new BigNumber(this.state.apiResponse.user_token_balance).gt(0)
                || new BigNumber(this.state.apiResponse.user_usdt_balance).gt(0)
            ) {
                return true
            }
        }

        return Boolean(this.state.userPendingReward)
    }

    public get userPendingRewardVested(): string[] | undefined {
        return toJS(this.state.userPendingReward?._vested)
    }

    public get userPendingRewardEntitled(): string[] | undefined {
        return toJS(this.state.userPendingReward?._entitled)
    }

    public get userPendingRewardDebt(): string[] | undefined {
        return toJS(this.state.userPendingReward?._pool_debt)
    }

    public get userRewardTokensBalance(): string[] | undefined {
        return toJS(this.state.userRewardTokensBalance)
    }

    public get userShare(): string | undefined {
        return this.state.apiResponse?.share
    }

    public get vestingTime(): number[] | undefined {
        if (!this.state.userPendingReward) {
            return undefined
        }

        return this.state.userPendingReward._vesting_time
            .map(seconds => parseInt(seconds, 10) * 1000)
    }

    public get vestingRatio(): number | undefined {
        return this.state.apiResponse?.pool_info.vesting_ratio
    }

    public get vestingPeriodDays(): string | undefined {
        if (!this.state.apiResponse) {
            return undefined
        }

        return new BigNumber(this.state.apiResponse.pool_info.vesting_period)
            .div(SECONDS_IN_DAY)
            .decimalPlaces(0, BigNumber.ROUND_DOWN)
            .toFixed()
    }

    public get endTime(): number {
        if (!this.state.apiResponse) {
            return 0
        }

        const rounds = this.state.apiResponse.pool_info.rounds_info
        const lastRound = rounds[rounds.length - 1]

        return lastRound.end_time ? (lastRound.end_time * 1000) : 0
    }

    public get isActive(): boolean {
        return this.endTime === 0 || new Date().getTime() < this.endTime
    }

    public get isAdmin(): boolean {
        if (!this.wallet.address) {
            return false
        }

        return this.poolOwnerAddress === this.wallet.address
    }

    public get rpsAmount(): string[] | undefined {
        const { apiResponse } = this.state

        if (!apiResponse) {
            return undefined
        }

        const activePeriods = apiResponse.pool_info.rounds_info
            .filter(({ start_time }) => (
                start_time * 1000 < new Date().getTime()
            ))

        const currentPeriod = activePeriods.length > 0
            ? activePeriods[activePeriods.length - 1]
            : undefined

        if (currentPeriod) {
            const rewards = currentPeriod.reward_info
                .reduce<{[k: string]: RewardInfo}>((acc, item) => ({
                    ...acc,
                    [item.rewardTokenRootAddress]: item,
                }), {})

            return apiResponse.reward_token_root_info
                .map(item => rewards[item.reward_root_address].rewardPerSec)
        }

        return []
    }

    public get roundRps(): string[][] | undefined {
        const { apiResponse } = this.state

        if (!apiResponse) {
            return undefined
        }

        return toJS(apiResponse.pool_info.rounds_info)
            .map(round => {
                const rewards = round.reward_info
                    .reduce<{[k: string]: RewardInfo}>((acc, item) => ({
                        ...acc,
                        [item.rewardTokenRootAddress]: item,
                    }), {})

                return apiResponse.reward_token_root_info
                    .map(item => rewards[item.reward_root_address].rewardPerSec)
            })
    }

    public get roundStartTimes(): number[] | undefined {
        if (!this.state.apiResponse) {
            return undefined
        }

        return toJS(this.state.apiResponse.pool_info.rounds_info)
            .map(round => round.start_time * 1000)
    }

    public get rewardBalanceIsZero(): boolean | undefined {
        if (!this.rewardTokensBalance) {
            return undefined
        }

        return this.rewardTokensBalance
            .every(amount => new BigNumber(amount).lte(0))
    }

    public get rewardBalanceIsLow(): boolean | undefined {
        return this.state.apiResponse?.is_low_balance
    }

}

const farmingDataStore = new FarmingDataStore(
    useApi(),
    useWallet(),
    useTokensCache(),
)

export function useFarmingDataStore(): FarmingDataStore {
    return farmingDataStore
}
