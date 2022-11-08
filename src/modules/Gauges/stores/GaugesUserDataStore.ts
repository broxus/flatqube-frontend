import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction,
} from 'mobx'
import { Address } from 'everscale-inpage-provider'
import BigNumber from 'bignumber.js'

import { WalletService } from '@/stores/WalletService'
import { error } from '@/utils'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { GaugeAbi, TokenAbi, VoteEscrowAbi } from '@/misc'
import { GaugesDataStore } from '@/modules/Gauges/stores/GaugesDataStore'
import { decimalAmount, historyBalanceHandler } from '@/modules/Gauges/utils'
import { GaugesAutoResyncStore } from '@/modules/Gauges/stores/GaugesAutoResyncStore'
import { GaugesPriceStore } from '@/modules/Gauges/stores/GaugesPriceStore'
import {
    LockBalanceAverage, PendingReward, SyncData, VeAccountAverage, VeAverage,
} from '@/modules/Gauges/types'
import { HistoryBalance } from '@/modules/Gauges/api/models'

type AprBoost = {
    currentApr: string;
    lockBoostApr: string;
    qubeBoostApr?: string;
}

type Data = {
    address?: string;
    veAccountAddress?: string;
    qubeLockedReward?: string;
    qubeUnlockedReward?: string;
    extraLockedReward?: string[];
    extraUnlockedReward?: string[];
    qubeVestingTime?: string;
    extraVestingTime?: string[];
    lockBoostApr?: string;
    qubeBoostApr?: string;
    currentApr?: string;
    balance?: string;
    lockedBalance?: string;
    walletBalance?: string;
    lockBoostedBalance?: string;
    isLoading?: boolean;
    historyBalance?: HistoryBalance;
}

type State = {
    addressIsLoading?: boolean;
    balanceIsLoading?: boolean;
    rewardIsLoading?: boolean;
    aprIsLoading?: boolean;
    hasUserData?: boolean;
}

export class GaugesUserDataStore {

    protected reactions?: IReactionDisposer[]

    protected data: Data = {}

    protected state: State = {}

    protected staticRpc = useStaticRpc()

    constructor(
        protected wallet: WalletService,
        protected dataStore: GaugesDataStore,
        protected autoResync: GaugesAutoResyncStore,
        protected price: GaugesPriceStore,
    ) {
        makeAutoObservable(this)
    }

    public init(): void {
        if (!this.reactions) {
            this.reactions = [
                reaction(
                    () => [
                        this.dataStore.id,
                        this.wallet.address,
                        this.dataStore.veAddress,
                        this.dataStore.apr,
                        this.depositToken,
                        this.extraTokens,
                        this.isReady,
                    ],
                    () => {
                        this.sync()
                    },
                ),
                reaction(
                    () => this.autoResync.counter,
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

    public async getUserAddress(gauge: string, owner: string): Promise<string | undefined> {
        try {
            const rootContract = new this.staticRpc.Contract(
                GaugeAbi.Root,
                new Address(gauge),
            )
            const userAddress = await rootContract.methods
                .getGaugeAccountAddress({
                    answerId: 0,
                    user: new Address(owner),
                }).call()
            return userAddress.value0.toString()
        }
        catch (e) {
            error('UserDataStore.getUserAddress', e)
            return undefined
        }
    }

    public async getBalance(user: string): Promise<string | undefined> {
        try {
            const account = new this.staticRpc.Contract(
                GaugeAbi.Account,
                new Address(user),
            )
            const result = await account.methods.getDetails({ answerId: 0 }).call()
            return result._balance
        }
        catch (e: any) {
            if (e && e.code !== 2) {
                error('UserDataStore.getBalance', e)
            }
            return undefined
        }
    }

    public async getWalletBalance(token: string, owner: string): Promise<string | undefined> {
        try {
            const tokenRoot = new this.staticRpc.Contract(
                TokenAbi.Root,
                new Address(token),
            )

            const tokenUserWallet = await tokenRoot.methods
                .walletOf({
                    answerId: 0,
                    walletOwner: new Address(owner),
                }).call()

            const tokenWallet = new this.staticRpc.Contract(
                TokenAbi.Wallet,
                tokenUserWallet.value0,
            )

            const result = await tokenWallet.methods
                .balance({ answerId: 0 }).call()

            return result.value0
        }
        catch (e: any) {
            if (e && e.code !== 2) {
                error('UserDataStore.getWalletBalance', e)
            }
            return undefined
        }
    }

    public async getLockBalanceAverage(user: string): Promise<LockBalanceAverage | undefined> {
        try {
            const accountContract = new this.staticRpc.Contract(
                GaugeAbi.Account,
                new Address(user),
            )
            const result = await accountContract.methods
                .calculateLockBalanceAverage({}).call()
            return result
        }
        catch (e: any) {
            if (e && e.code !== 2) {
                error('UserDataStore.getLockBalanceAverage', e)
            }
            return undefined
        }
    }

    public async getVeAverage(veAddress: string): Promise<VeAverage | undefined> {
        try {
            const voteEscrow = new this.staticRpc.Contract(
                VoteEscrowAbi.Root,
                new Address(veAddress),
            )
            const veAverage = await voteEscrow.methods.calculateAverage({}).call()
            return veAverage
        }
        catch (e) {
            error('UserDataStore.getVeAverage', e)
            return undefined
        }
    }

    public async getVeAccountAddress(veAddress: string, owner: string): Promise<string | undefined> {
        try {
            const voteEscrow = new this.staticRpc.Contract(
                VoteEscrowAbi.Root,
                new Address(veAddress),
            )
            const result = await voteEscrow.methods.getVoteEscrowAccountAddress({
                answerId: 0,
                user: new Address(owner),
            }).call()
            return result.value0.toString()
        }
        catch (e) {
            error('UserDataStore.getVeAccountAddress', e)
            return undefined
        }
    }

    public async getSyncData(gauge: string): Promise<SyncData | undefined> {
        try {
            const gaugeContract = new this.staticRpc.Contract(
                GaugeAbi.Root,
                new Address(gauge),
            )
            const result = await gaugeContract.methods.calcSyncData({}).call()
            return result.value0
        }
        catch (e) {
            error('UserDataStore.getSyncData', e)
            return undefined
        }
    }

    public async getVeAccountAverage(veAccountAddress: string): Promise<VeAccountAverage | undefined> {
        try {
            const veAccount = new this.staticRpc.Contract(
                VoteEscrowAbi.Account,
                new Address(veAccountAddress),
            )
            const veAccountAverage = await veAccount.methods.calculateVeAverage({}).call()
            return veAccountAverage
        }
        catch (e) {
            error('UserDataStore.getVeAccountAverage', e)
            return undefined
        }
    }

    public async getPendingReward(
        userAddress: string,
        veAverage: VeAverage,
        veAccountAverage: VeAccountAverage,
        syncData: SyncData,
    ): Promise<PendingReward | undefined> {
        try {
            const account = new this.staticRpc.Contract(
                GaugeAbi.Account,
                new Address(userAddress),
            )
            const pendingReward = await account.methods
                .pendingReward({
                    _veAccQubeAverage: veAccountAverage._veQubeAverage,
                    _veAccQubeAveragePeriod: veAccountAverage._veQubeAveragePeriod,
                    _veQubeAverage: veAverage._veQubeAverage,
                    _veQubeAveragePeriod: veAverage._veQubeAveragePeriod,
                    gauge_sync_data: syncData,
                }).call()
            return pendingReward
        }
        catch (e: any) {
            if (e && e.code !== 2) {
                error('UserDataStore.getPendingReward', e)
            }
            return undefined
        }
    }

    public async getAprBoost(
        apr: string,
        userAddress: string,
        lockBalanceAverage: LockBalanceAverage,
        veAccountAverage: VeAccountAverage,
        veAverage: VeAverage,
        syncData: SyncData,
        qubeSpeed: string,
    ): Promise<AprBoost | undefined> {
        try {
            const account = new this.staticRpc.Contract(
                GaugeAbi.Account,
                new Address(userAddress),
            )

            const result = await account.methods
                .calculateTotalBoostedBalance({
                    _gaugeDepositSupply: syncData.depositSupply,
                    _lockBoostedBalance: lockBalanceAverage._lockBoostedBalance,
                    _veAccBalance: veAccountAverage._veQubeBalance,
                    _veSupply: veAverage?._veQubeBalance,
                }).call()

            const div = new BigNumber(10).pow(18)

            const lockBoostMultiplier = new BigNumber(result._lockBoostMultiplier)
                .dividedBy(div)

            const qubeBoostMultiplier = new BigNumber(result._veBoostMultiplier)
                .dividedBy(div)

            const lockBoostApr = lockBoostMultiplier
                .minus(1)
                .multipliedBy(apr)
                .toFixed()

            const qubeBoostApr = new BigNumber(qubeSpeed).gt(0)
                ? qubeBoostMultiplier
                    .minus(1)
                    .multipliedBy(apr)
                    .toFixed()
                : '0'

            const currentApr = new BigNumber(apr)
                .plus(lockBoostApr)
                .plus(qubeBoostApr)
                .toFixed()

            return {
                currentApr,
                lockBoostApr,
                qubeBoostApr,
            }
        }
        catch (e) {
            error('UserDataStore.getAprBoost', e)
            return undefined
        }
    }

    static async getHistoryBalance(
        gaugeAddress: string,
        userAddress: string,
    ): Promise<HistoryBalance | undefined> {
        try {
            const result = await historyBalanceHandler({}, {}, { gaugeAddress, userAddress })
            return result.historyBalance
        }
        catch (e) {
            error('GaugesUserDataStore.getHistoryBalance', e)
            return undefined
        }
    }

    public async sync(): Promise<void> {
        try {
            const { apr, veAddress, id, qubeTokenSpeed } = this.dataStore
            const token = this.depositToken
            const owner = this.wallet.address

            if (!this.extraTokens || !this.isReady || !id || !veAddress || !token || !apr || !qubeTokenSpeed) {
                return
            }

            if (owner) {
                if (!this.state.hasUserData) {
                    runInAction(() => {
                        this.state.addressIsLoading = true
                        this.state.aprIsLoading = true
                        this.state.balanceIsLoading = true
                        this.state.rewardIsLoading = true
                    })
                }

                const userAddress = await this.getUserAddress(id, owner)

                runInAction(() => {
                    this.data.address = userAddress
                    this.state.addressIsLoading = false
                })

                const [
                    syncData, veAverage, veAccountAddress, balance, walletBalance,
                    lockBalanceAverage, historyBalance,
                ] = await Promise.all([
                    this.getSyncData(id),
                    this.getVeAverage(veAddress),
                    this.getVeAccountAddress(veAddress, owner),
                    userAddress ? await this.getBalance(userAddress) : undefined,
                    this.getWalletBalance(token, owner),
                    userAddress ? this.getLockBalanceAverage(userAddress) : undefined,
                    GaugesUserDataStore.getHistoryBalance(id, owner),
                ])

                runInAction(() => {
                    this.data.balance = balance ?? '0'
                    this.data.walletBalance = walletBalance ?? '0'
                    this.data.lockedBalance = lockBalanceAverage?._lockedBalance ?? '0'
                    this.data.lockBoostedBalance = lockBalanceAverage?._lockBoostedBalance ?? '0'
                    this.data.historyBalance = historyBalance
                    this.state.balanceIsLoading = false
                    this.data.veAccountAddress = veAccountAddress
                })

                const veAccountAverage = veAccountAddress
                    ? await this.getVeAccountAverage(veAccountAddress)
                    : undefined

                const [pendingReward, aprBoost] = await Promise.all([
                    userAddress && veAverage && veAccountAverage && syncData
                        ? this.getPendingReward(
                            userAddress,
                            veAverage,
                            veAccountAverage,
                            syncData,
                        )
                        : undefined,
                    userAddress && lockBalanceAverage && veAccountAverage && veAverage && syncData
                        ? this.getAprBoost(
                            apr,
                            userAddress,
                            lockBalanceAverage,
                            veAccountAverage,
                            veAverage,
                            syncData,
                            qubeTokenSpeed,
                        )
                        : undefined,
                ])

                runInAction(() => {
                    this.data.qubeLockedReward = pendingReward?._qubeReward.lockedReward ?? '0'
                    this.data.qubeUnlockedReward = pendingReward?._qubeReward.unlockedReward ?? '0'
                    this.data.extraLockedReward = pendingReward?._extraReward.map(item => item.lockedReward) ?? []
                    this.data.extraUnlockedReward = pendingReward?._extraReward.map(item => item.unlockedReward) ?? []
                    this.data.qubeVestingTime = pendingReward?._qubeVesting.vestingTime
                    this.data.extraVestingTime = pendingReward?._extraVesting.map(item => item.vestingTime) ?? []
                    this.state.rewardIsLoading = false

                    this.data.lockBoostApr = aprBoost?.lockBoostApr ?? '0'
                    this.data.qubeBoostApr = aprBoost?.qubeBoostApr ?? '0'
                    this.data.currentApr = aprBoost?.currentApr ?? '0'
                    this.state.aprIsLoading = false
                    this.state.hasUserData = true
                })
            }
            else {
                runInAction(() => {
                    this.data = {
                        balance: '0',
                        currentApr: '0',
                        extraLockedReward: this.extraTokens?.map(() => '0'),
                        extraUnlockedReward: this.extraTokens?.map(() => '0'),
                        lockBoostApr: '0',
                        lockBoostedBalance: '0',
                        lockedBalance: '0',
                        qubeBoostApr: '0',
                        qubeLockedReward: '0',
                        qubeUnlockedReward: '0',
                        walletBalance: '0',
                    }
                })
            }
        }
        catch (e) {
            error('UserDataStore.sync', e)
        }
    }

    public async calcMinGas(): Promise<string> {
        const { address } = this
        const { extraTokens } = this.dataStore
        const { veAccountAddress } = this.data

        if (!address) {
            throw new Error('UserAddress must be defined')
        }

        if (!veAccountAddress) {
            throw new Error('veAccountAddress must be defined')
        }

        if (!extraTokens) {
            throw new Error('extraTokens must be defined')
        }

        const getAccountMinGas = async () => {
            try {
                const account = new this.staticRpc.Contract(
                    GaugeAbi.Account,
                    new Address(address),
                )
                const result = await account.methods.calculateMinGas({
                    answerId: 0,
                }).call()
                return result.min_gas
            }
            catch (e) {
                return new BigNumber(extraTokens.length)
                    .multipliedBy(500000000)
                    .plus('3000000000')
                    .toFixed()
            }
        }

        const getVeAccountMinGas = async () => {
            try {
                const veAccount = new this.staticRpc.Contract(
                    VoteEscrowAbi.Account,
                    new Address(veAccountAddress),
                )
                const result = await veAccount.methods.calculateMinGas({
                    answerId: 0,
                }).call()
                return result.min_gas
            }
            catch (e) {
                return '2500000000'
            }
        }

        const accountMinGas = await getAccountMinGas()
        const veAccountMinGas = await getVeAccountMinGas()

        return new BigNumber('3500000000')
            .plus(accountMinGas)
            .plus(veAccountMinGas)
            .toFixed()
    }

    public get isReady(): boolean {
        return !this.wallet.isInitializing && !this.wallet.isConnecting
    }

    public get depositToken(): string | undefined {
        return this.dataStore.rootToken?.root
    }

    public get extraTokens(): string[] | undefined {
        return this.dataStore.extraTokens?.map(item => item.root)
    }

    public get walletBalance(): string | undefined {
        return this.data.walletBalance
    }

    public get balance(): string | undefined {
        return this.data.balance
    }

    public get lockedBalance(): string | undefined {
        return this.data.lockedBalance
    }

    public get withdrawBalance(): string | undefined {
        return this.balance && this.lockedBalance
            ? new BigNumber(this.balance).minus(this.lockedBalance).toFixed()
            : undefined
    }

    public get balanceUSDT(): string | undefined {
        const price = this.dataStore.rootTokenPrice

        if (this.balance && price && this.dataStore.rootToken) {
            const amount = decimalAmount(this.balance, this.dataStore.rootToken.decimals)
            return new BigNumber(price).times(amount).toString()
        }

        return undefined
    }

    public get lockedBalanceUSDT(): string | undefined {
        const price = this.dataStore.rootTokenPrice

        if (this.lockedBalance && price && this.dataStore.rootToken) {
            const amount = decimalAmount(this.lockedBalance, this.dataStore.rootToken.decimals)
            return new BigNumber(price).times(amount).toString()
        }
        return undefined
    }

    public get withdrawBalanceUSDT(): string | undefined {
        const price = this.dataStore.rootTokenPrice

        if (this.withdrawBalance && price && this.dataStore.rootToken) {
            const amount = decimalAmount(this.withdrawBalance, this.dataStore.rootToken.decimals)
            return new BigNumber(price).times(amount).toString()
        }
        return undefined
    }

    public get qubeLockedReward(): string | undefined {
        const { qubeLockedReward, qubeUnlockedReward } = this.data
        const { qubeTokenBalance } = this.dataStore

        if (qubeLockedReward && qubeTokenBalance && qubeUnlockedReward) {
            const debt = new BigNumber(qubeUnlockedReward).gt(qubeTokenBalance)
                ? new BigNumber(qubeUnlockedReward).minus(qubeTokenBalance).toFixed()
                : '0'

            return new BigNumber(debt).plus(qubeLockedReward).toFixed()
        }

        return undefined
    }

    public get qubeUnlockedReward(): string | undefined {
        const { qubeUnlockedReward } = this.data
        const { qubeTokenBalance } = this.dataStore

        if (qubeTokenBalance && qubeUnlockedReward) {
            return new BigNumber(qubeUnlockedReward).gt(qubeTokenBalance)
                ? qubeTokenBalance
                : qubeUnlockedReward
        }

        return undefined
    }

    public get extraLockedReward(): string[] | undefined {
        const { extraTokensBalance } = this.dataStore
        const { extraLockedReward } = this.data
        const { extraUnlockedReward } = this.data

        if (extraLockedReward && extraTokensBalance && extraUnlockedReward) {
            const debt = extraUnlockedReward.map((item, index) => (
                new BigNumber(item).gt(extraTokensBalance[index])
                    ? new BigNumber(item).minus(extraTokensBalance[index]).toFixed()
                    : '0'
            ))

            return extraLockedReward.map((item, index) => (
                new BigNumber(item).plus(debt[index]).toFixed()
            ))
        }

        return undefined
    }

    public get extraUnlockedReward(): string[] | undefined {
        const { extraTokensBalance } = this.dataStore
        const { extraUnlockedReward } = this.data

        if (extraTokensBalance && extraUnlockedReward) {
            return extraUnlockedReward.map((item, index) => (
                new BigNumber(item).gt(extraTokensBalance[index])
                    ? extraTokensBalance[index]
                    : item
            ))
        }

        return undefined
    }

    public get qubeVestingTime(): number | undefined {
        return this.data.qubeVestingTime
            ? parseInt(this.data.qubeVestingTime, 10) * 1000
            : undefined
    }

    public get extraVestingTime(): number[] | undefined {
        return this.data.extraVestingTime
            ? this.data.extraVestingTime.map(item => (
                parseInt(item, 10) * 1000
            ))
            : undefined
    }

    public get unlockedRewardUSDT(): string | undefined {
        const { qubeToken, extraTokens } = this.dataStore

        if (this.qubeUnlockedReward && this.extraUnlockedReward && qubeToken && extraTokens) {
            const qubeReward = decimalAmount(this.qubeUnlockedReward, qubeToken.decimals)
            const extraReward = this.extraUnlockedReward.map((item, index) => (
                decimalAmount(item, extraTokens[index].decimals)
            ))

            const qubeTokenPrice = this.price.byRoot[qubeToken.root]
            const qubePriceBN = qubeTokenPrice
                ? new BigNumber(qubeTokenPrice).times(qubeReward)
                : undefined

            const extraPriceBN = extraReward.reduce<BigNumber | undefined>((acc, item, index) => {
                const tokenPrice = this.price.byRoot[extraTokens[index].root]

                if (acc && tokenPrice) {
                    return acc.plus(new BigNumber(tokenPrice).times(item))
                }

                return acc
            }, new BigNumber(0))

            if (qubePriceBN && extraPriceBN) {
                return qubePriceBN.plus(extraPriceBN).toString()
            }
        }

        return undefined
    }

    public get lockedRewardUSDT(): string | undefined {
        const { qubeToken, extraTokens } = this.dataStore

        if (this.qubeLockedReward && this.extraLockedReward && qubeToken && extraTokens) {
            const qubeReward = decimalAmount(this.qubeLockedReward, qubeToken.decimals)
            const extraReward = this.extraLockedReward.map((item, index) => (
                decimalAmount(item, extraTokens[index].decimals)
            ))

            const qubeTokenPrice = this.price.byRoot[qubeToken.root]
            const qubePriceBN = qubeTokenPrice
                ? new BigNumber(qubeTokenPrice).times(qubeReward)
                : undefined

            const extraPriceBN = extraReward.reduce<BigNumber | undefined>((acc, item, index) => {
                const tokenPrice = this.price.byRoot[extraTokens[index].root]

                if (acc && tokenPrice) {
                    return acc.plus(new BigNumber(tokenPrice).times(item))
                }

                return acc
            }, new BigNumber(0))

            if (qubePriceBN && extraPriceBN) {
                return qubePriceBN.plus(extraPriceBN).toString()
            }
        }

        return undefined
    }

    public get share(): string | undefined {
        if (this.dataStore.rootTokenBalance && this.balance) {
            return new BigNumber(this.dataStore.rootTokenBalance).gt(0)
                ? new BigNumber(this.balance)
                    .multipliedBy(100)
                    .dividedBy(this.dataStore.rootTokenBalance)
                    .toFixed()
                : '0'
        }
        return undefined
    }

    public get historyBalance(): HistoryBalance | undefined {
        return this.data.historyBalance
    }

    public get address(): string | undefined {
        return this.data.address
    }

    public get lockBoostApr(): string | undefined {
        return this.data.lockBoostApr
    }

    public get qubeBoostApr(): string | undefined {
        return this.data.qubeBoostApr
    }

    public get currentApr(): string | undefined {
        return this.data.currentApr
    }

    public get addressIsLoading(): boolean {
        return !!this.state.addressIsLoading
    }

    public get aprIsLoading(): boolean {
        return !!this.state.aprIsLoading
    }

    public get balanceIsLoading(): boolean {
        return !!this.state.balanceIsLoading
    }

    public get rewardIsLoading(): boolean {
        return !!this.state.rewardIsLoading
    }

}
