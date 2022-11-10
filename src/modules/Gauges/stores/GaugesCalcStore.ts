import {
    comparer, IReactionDisposer, makeAutoObservable, reaction, runInAction, toJS,
} from 'mobx'
import BigNumber from 'bignumber.js'
import { Address } from 'everscale-inpage-provider'

import { GaugeItem } from '@/modules/Gauges/api/models'
import { daoMainPageHandler, decimalAmount, gaugesHandler } from '@/modules/Gauges/utils'
import { GaugeFactoryAddress, TokenListURI } from '@/config'
import { getImportedTokens } from '@/stores/TokensCacheService'
import { error, isGoodBignumber } from '@/utils'
import { GaugesTokensStore } from '@/modules/Gauges/stores/GaugesTokensStore'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { GaugeAbi, Token, TokenAbi } from '@/misc'
import { FactoryDetails } from '@/modules/Gauges/types'
import veIcon from '@/modules/QubeDao/assets/veQUBE.svg'
import { FavoritePairs } from '@/stores/FavoritePairs'
import { SECONDS_IN_DAY } from '@/constants'
import { WalletService } from '@/stores/WalletService'

type State = {
    factoryDetails?: FactoryDetails;
    totalVeAmount?: string;
    gauges?: GaugeItem[];
    limit?: number;
    offset?: number;
    total?: number;
    isLoading?: boolean;
    onlyFav?: boolean;
    lpAmount?: string;
    qubeAmount?: string;
    lpLockDays?: string;
    veLockDays?: string;
    veQubeForMaxApr?: (string | undefined)[];
    qubeBalance?: string;
}

export class GaugesCalcStore {

    protected state: State = {}

    protected reactions?: IReactionDisposer[]

    public readonly veSymbol = 'veQUBE'

    public readonly veDecimals = 9

    public readonly veIcon = veIcon

    public readonly lpLockMinDays = 1

    public readonly veLockMinDays = 14

    public readonly veLockMaxDays = 365 * 4

    constructor(
        protected tokens: GaugesTokensStore,
        protected favorites: FavoritePairs,
        protected wallet: WalletService,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public init(): void {
        if (!this.reactions) {
            this.reactions = [
                reaction(
                    () => [
                        this.limit,
                        this.offset,
                        this.onlyFav,
                        this.favorites.addresses,
                    ],
                    () => this.syncGauges(),
                    {
                        delay: 50,
                        equals: comparer.structural,
                        fireImmediately: true,
                    },
                ),
                reaction(
                    () => [
                        this.gauges,
                        this.totalVeAmount,
                        this.lpAmount,
                        this.lpAmountValid,
                    ],
                    () => this.syncVeQubeForMaxApr(),
                    {
                        delay: 300,
                        equals: comparer.structural,
                    },
                ),
                reaction(
                    () => [this.wallet.address, this.qube],
                    () => this.syncQubeBalance(),
                    {
                        equals: comparer.structural,
                        fireImmediately: true,
                    },
                ),
            ]
        }

        this.syncFactoryDetails()
        this.syncTotalVeAmount()
    }

    public dispose(): void {
        if (this.reactions) {
            this.reactions.forEach(item => item())
            this.reactions = undefined
        }

        this.state = {}
    }

    protected async syncGauges(): Promise<void> {
        let gauges: GaugeItem[],
            total: number

        runInAction(() => {
            this.state.isLoading = true
        })

        try {
            const data = await gaugesHandler({}, {}, {
                additionalTokenRoots: getImportedTokens(),
                limit: this.limit,
                offset: this.offset,
                starredGauges: this.onlyFav ? this.favorites.addresses : undefined,
                whitelistUri: TokenListURI,
            })

            await Promise.all(
                data.gauges.map(item => (
                    Promise.allSettled(item.poolTokens.map(token => (
                        this.tokens.sync(token.tokenRoot)
                    )))
                )),
            )

            gauges = data.gauges
            total = data.total
        }
        catch (e) {
            error('GaugesCalcStore.sync', e)
        }

        runInAction(() => {
            this.state.veQubeForMaxApr = undefined
            this.state.gauges = gauges
            this.state.total = total
            this.state.isLoading = false
        })
    }

    protected async syncFactoryDetails(): Promise<void> {
        let factoryDetails: FactoryDetails

        try {
            const rpc = useStaticRpc()
            const factoryContract = new rpc.Contract(GaugeAbi.Factory, GaugeFactoryAddress)
            factoryDetails = await factoryContract.methods.getDetails({}).call()
            await this.tokens.sync(factoryDetails._qube.toString())
        }
        catch (e) {
            error('GaugesCalcStore.syncFactoryDetails', e)
        }
        runInAction(() => {
            this.state.factoryDetails = factoryDetails
        })
    }

    protected async syncTotalVeAmount(): Promise<void> {
        let totalVeAmount: string

        try {
            const result = await daoMainPageHandler({}, {
                method: 'GET',
            })
            totalVeAmount = decimalAmount(result.totalVeAmount, this.veDecimals)
        }
        catch (e) {
            error('GaugesCalcStore.syncTotalVeAmount', e)
        }
        runInAction(() => {
            this.state.totalVeAmount = totalVeAmount
        })
    }

    protected async syncVeQubeForMaxApr(): Promise<void> {
        const { lpAmount, totalVeAmount } = this
        let veQubeForMaxApr: (string | undefined)[]

        try {
            if (this.gauges && this.lpAmountValid && lpAmount && totalVeAmount) {
                veQubeForMaxApr = await Promise.all(
                    this.gauges.map(gauge => (
                        gauge.hasQubeReward
                            ? GaugesCalcStore.calcVeQubeForMaxApr(
                                lpAmount,
                                totalVeAmount,
                                gauge.tvl,
                            )
                            : undefined
                    )),
                )
            }
        }
        catch (e) {
            error('GaugesCalcStore.syncVeQubeForMaxApr', e)
        }

        runInAction(() => {
            this.state.veQubeForMaxApr = veQubeForMaxApr
        })
    }

    protected async syncQubeBalance(): Promise<void> {
        let qubeBalance: string

        if (this.wallet.address && this.qube) {
            try {
                const rpc = useStaticRpc()
                const tokenContract = new rpc.Contract(
                    TokenAbi.Root,
                    new Address(this.qube.root),
                )
                const tokenWallet = (await tokenContract.methods.walletOf({
                    answerId: 0,
                    walletOwner: new Address(this.wallet.address),
                }).call()).value0
                const tokenWalletContract = new rpc.Contract(TokenAbi.Wallet, tokenWallet)
                qubeBalance = (await tokenWalletContract.methods.balance({
                    answerId: 0,
                }).call()).value0
            }
            catch (e) {
                error('GaugesCalcStore.syncQubeBalance', e)
            }
        }

        runInAction(() => {
            this.state.qubeBalance = qubeBalance
        })
    }

    public setPage(page: number): void {
        this.state.offset = (page - 1) * this.limit
    }

    public nextPage(): void {
        this.setPage(this.page + 1)
    }

    public prevPage(): void {
        this.setPage(this.page - 1)
    }

    public setOnlyFav(value: boolean): void {
        this.state.offset = 0
        this.state.onlyFav = value
    }

    public setLpAmount(value: string): void {
        this.state.lpAmount = value
    }

    public setQubeAmount(value: string): void {
        this.state.qubeAmount = value
    }

    public setLpLockDays(value: string): void {
        this.state.lpLockDays = value
    }

    public setVeLockDays(value: string): void {
        this.state.veLockDays = value
    }

    public clear(): void {
        this.state.lpLockDays = undefined
        this.state.veLockDays = undefined
        this.state.lpAmount = undefined
        this.state.qubeAmount = undefined
    }

    public get limit(): number {
        return this.state.limit ?? 5
    }

    public get offset(): number {
        return this.state.offset ?? 0
    }

    public get gauges(): GaugeItem[] | undefined {
        return this.state.gauges
    }

    public get total(): number | undefined {
        return this.state.total
    }

    public get page(): number {
        return Math.ceil(this.offset / this.limit) + 1
    }

    public get totalPages(): number | undefined {
        return this.total !== undefined
            ? Math.ceil(this.total / this.limit)
            : undefined
    }

    public get qube(): Token | undefined {
        return this.state.factoryDetails
            ? this.tokens.byRoot[this.state.factoryDetails._qube.toString()]
            : undefined
    }

    public get isLoading(): boolean {
        return !!this.state.isLoading
    }

    public get onlyFav(): boolean {
        return !!this.state.onlyFav
    }

    public get totalVeAmount(): string | undefined {
        return this.state.totalVeAmount
    }

    public get lpAmount(): string | undefined {
        return this.state.lpAmount
    }

    public get lpAmountValid(): boolean {
        if (this.state.lpAmount) {
            return isGoodBignumber(this.state.lpAmount)
        }
        return false
    }

    public get qubeAmount(): string | undefined {
        return this.state.qubeAmount
    }

    public get qubeAmountValid(): boolean {
        if (this.state.qubeAmount) {
            return isGoodBignumber(this.state.qubeAmount)
        }
        return false
    }

    public get lpLockMaxDays(): number | undefined {
        if (this.state.gauges && this.state.gauges.length > 0) {
            const days = this.state.gauges.map(item => (
                new BigNumber(item.maxLockTime)
                    .dividedBy(SECONDS_IN_DAY)
                    .decimalPlaces(BigNumber.ROUND_DOWN)
                    .toNumber()
            ))

            return Math.max.apply(undefined, days)
        }
        return undefined
    }

    public get lpLockDays(): string | undefined {
        return this.state.lpLockDays
    }

    public get lpLockDaysNumber(): number {
        const lpLockDays = this.state.lpLockDays
            ? parseInt(this.state.lpLockDays, 10)
            : undefined

        return lpLockDays ?? this.lpLockMinDays
    }

    public get lpLockDaysValid(): boolean {
        if (this.state.lpLockDays) {
            const bn = new BigNumber(this.state.lpLockDays)
            return this.lpLockMaxDays
                ? bn.gte(this.lpLockMinDays) && bn.lte(this.lpLockMaxDays)
                : isGoodBignumber(bn)
        }
        return false
    }

    public get lpLockEndDate(): number | undefined {
        return this.lpLockDaysValid && this.lpLockDaysNumber
            ? Date.now() + (this.lpLockDaysNumber * SECONDS_IN_DAY * 1000)
            : undefined
    }

    public get lpLockSecs(): number | undefined {
        if (this.lpLockDays && this.lpLockDaysValid) {
            return new BigNumber(this.lpLockDays).times(SECONDS_IN_DAY).toNumber()
        }
        return undefined
    }

    public get veLockDays(): string | undefined {
        return this.state.veLockDays
    }

    public get veLockDaysNumber(): number {
        const veLockDays = this.state.veLockDays
            ? parseInt(this.state.veLockDays, 10)
            : undefined

        return veLockDays ?? this.veLockMinDays
    }

    public get veLockDaysValid(): boolean {
        if (this.state.veLockDays) {
            const bn = new BigNumber(this.state.veLockDays)
            return bn.gte(this.veLockMinDays) && bn.lte(this.veLockMaxDays)
        }
        return false
    }

    public get veLockEndDate(): number | undefined {
        return this.veLockDaysValid && this.veLockDaysNumber
            ? Date.now() + (this.veLockDaysNumber * SECONDS_IN_DAY * 1000)
            : undefined
    }

    public get lpBoostActive(): boolean {
        return this.lpAmountValid && this.lpLockDaysValid
    }

    public get veBoostActive(): boolean {
        return this.qubeAmountValid && this.veLockDaysValid
    }

    public get lpLockBoost(): string[] | undefined {
        const { gauges, lpLockSecs, lpAmountValid } = this

        if (gauges && lpAmountValid && lpLockSecs) {
            return gauges.map(gauge => (
                new BigNumber(gauge.maxBoost)
                    .minus(1)
                    .times(BigNumber
                        .min(lpLockSecs, gauge.maxLockTime)
                        .dividedBy(gauge.maxLockTime))
                    .toString()
            ))
        }

        return undefined
    }

    public get veQubesMinted(): string | undefined {
        if (this.qubeAmount && this.qubeAmountValid && this.veLockDays && this.veLockDaysValid) {
            return new BigNumber(this.veLockDays)
                .dividedBy(this.veLockMaxDays)
                .times(this.qubeAmount)
                .toString()
        }
        return undefined
    }

    public get veLockBoost(): (string | undefined)[] | undefined {
        const { gauges, veQubesMinted, totalVeAmount, lpAmount, lpAmountValid } = this

        if (gauges && veQubesMinted && totalVeAmount && lpAmount && lpAmountValid) {
            return gauges.map(gauge => (
                gauge.hasQubeReward
                    ? GaugesCalcStore.calcVeLockBoost(
                        lpAmount,
                        veQubesMinted,
                        totalVeAmount,
                        gauge.tvl,
                    )
                    : undefined
            ))
        }

        return undefined
    }

    public get veQubeForMaxApr(): (string | undefined)[] | undefined {
        return toJS(this.state.veQubeForMaxApr)
    }

    public get qubeBalance(): string | undefined {
        return this.state.qubeBalance
    }

    static calcUserPoolBoostedDeposit(
        lpAmount: string,
        veQubesMinted: string,
        totalVeAmount: string,
        tvl: string,
    ): string {
        return BigNumber.min(
            new BigNumber(lpAmount)
                .times(0.4)
                .plus(new BigNumber(veQubesMinted)
                    .dividedBy(totalVeAmount)
                    .times(0.6)
                    .times(tvl)),
            lpAmount,
        )
            .times(2.5)
            .toString()
    }

    static calcVeLockBoost(
        lpAmount: string,
        veQubesMinted: string,
        totalVeAmount: string,
        tvl: string,
    ): string {
        const userPoolBoostedDeposit = GaugesCalcStore.calcUserPoolBoostedDeposit(
            lpAmount,
            veQubesMinted,
            totalVeAmount,
            tvl,
        )

        return new BigNumber(userPoolBoostedDeposit)
            .dividedBy(lpAmount)
            .minus(1)
            .toString()
    }

    static async calcVeQubeForMaxApr(
        lpAmount: string,
        totalVeAmount: string,
        tvl: string,
    ): Promise<string> {
        const testBN = new BigNumber(lpAmount).times(2.5)
        let result = new BigNumber(0),
            stepBN = new BigNumber(lpAmount),
            deposit: string

        while (stepBN.gte(0.01)) {
            result = result.plus(stepBN)
            deposit = GaugesCalcStore.calcUserPoolBoostedDeposit(
                lpAmount,
                result.toString(),
                totalVeAmount,
                tvl,
            )
            if (testBN.lte(deposit)) {
                result = result.minus(stepBN)
                stepBN = stepBN.dividedBy(10)
            }
        }

        return result.toString()
    }

}
