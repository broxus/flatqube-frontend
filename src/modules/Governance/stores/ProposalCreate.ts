import { Address } from 'everscale-inpage-provider'
import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction,
} from 'mobx'
import BigNumber from 'bignumber.js'

import { EthAction, TonAction } from '@/modules/Governance/types'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { UserDataStore } from '@/modules/Governance/stores/UserData'
import { DaoConfigStore } from '@/modules/Governance/stores/DaoConfig'
import { DaoAbi } from '@/misc'
import { DaoRootContractAddress } from '@/config'
import { error, throwException } from '@/utils'
import { WalletService } from '@/stores/WalletService'
import { useRpc } from '@/hooks'
import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import { GaugeInfo } from '@/modules/QubeDao/types'

type State = {
    createLoading?: boolean,
    candidates?: GaugeInfo[],
}

export class ProposalCreateStore {

    protected state: State = {}

    protected syncCandidatesDisposer?: IReactionDisposer

    constructor(
        protected wallet: WalletService,
        protected userData: UserDataStore,
        protected daoConfig: DaoConfigStore,
        protected tokensCache: TokensCacheService,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public init(): void {
        this.userData.init()
        this.daoConfig.init()

        this.syncCandidatesDisposer?.()
        this.syncCandidatesDisposer = reaction(
            () => this.tokensCache.isReady,
            this.syncCandidates,
            {
                fireImmediately: true,
            },
        )
    }

    public dispose(): void {
        this.daoConfig.dispose()
        this.userData.dispose()
        this.syncCandidatesDisposer?.()
        this.state = {}
    }

    public async submit(
        description: string,
        _tonActions: TonAction[],
        _ethActions: EthAction[],
    ): Promise<string | undefined> {
        runInAction(() => {
            this.state.createLoading = true
        })

        let proposalId
        const rpc = useRpc()
        const subscriber = rpc.createSubscriber()

        try {
            const userAddress = this.wallet.account?.address

            if (!userAddress) {
                throwException('Ton wallet must be connected')
            }

            const tonActions = _tonActions.map(item => ({
                ...item,
                payload: item.payload,
                value: new BigNumber(item.value)
                    .shiftedBy(this.wallet.coin.decimals)
                    .decimalPlaces(0)
                    .toFixed(),
                target: new Address(item.target),
            }))

            const ethActions = _ethActions.map(item => ({
                ...item,
                callData: item.callData,
            }))

            const daoContract = rpc.createContract(DaoAbi.Root, DaoRootContractAddress)

            const { totalValue: tonActionsValue } = await daoContract.methods.calcTonActionsValue({
                actions: tonActions,
            }).call()

            const { totalValue: ethActionsValue } = await daoContract.methods.calcEthActionsValue({
                actions: ethActions,
            }).call()

            const proposalIdStream = subscriber
                .transactions(daoContract.address)
                .flatMap(item => item.transactions)
                .flatMap(transaction => daoContract.decodeTransactionEvents({
                    transaction,
                }))
                .filterMap(result => {
                    if (result.event === 'ProposalCreated') {
                        if (result.data.proposer.toString() === userAddress.toString()) {
                            return result.data.proposalId
                        }
                    }
                    return undefined
                })
                .first()

            await daoContract.methods.propose({
                description,
                ethActions,
                tonActions,
                answerId: 0,
            }).send({
                from: userAddress,
                amount: new BigNumber('10000000000')
                    .plus(tonActionsValue)
                    .plus(ethActionsValue)
                    .toFixed(),
            })

            proposalId = await proposalIdStream
        }
        catch (e) {
            await subscriber.unsubscribe()
            error(e)
        }

        runInAction(() => {
            this.state.createLoading = false
        })

        return proposalId
    }

    protected async syncCandidates(): Promise<void> {
        try {
            const api = useQubeDaoApi()

            const response = await api.whitelistSearch({}, {
                method: 'POST',
            }, {
                isActive: true,
                limit: 500,
                offset: 0,
                ordering: {
                    column: 'averagePercentage',
                    direction: 'DESC',
                },
            })

            const { gauges } = await api.gaugesBatch({}, {
                method: 'POST',
            }, {
                gauges: response.gauges.map(gauge => gauge.address.toString()),
            })

            gauges.forEach(gauge => {
                gauge.poolTokens.forEach(token => {
                    this.tokensCache.syncCustomToken(token.tokenRoot).catch(error)
                })
            })

            runInAction(() => {
                this.state.candidates = gauges
            })
        }
        catch (e) {
            error(e)
        }
    }

    public get isConnected(): boolean {
        return this.userData.isConnected && this.wallet.isConnected
    }

    public get createLoading(): boolean {
        return !!this.state.createLoading
    }

    public get canCreate(): boolean | undefined {
        if (
            this.userData.hasAccount === undefined
            || this.daoConfig.threshold === undefined
        ) {
            return undefined
        }

        if (this.userData.hasAccount === false) {
            return false
        }

        if (
            this.userData.tokenBalance === undefined
            || this.userData.lockedTokens === undefined
        ) {
            return false
        }

        return new BigNumber(this.userData.tokenBalance)
            .minus(this.userData.lockedTokens)
            .gte(this.daoConfig.threshold)
    }

    public get tokenMissing(): string | undefined {
        if (
            !this.userData.tokenBalance
            || !this.userData.lockedTokens
            || !this.daoConfig.threshold
        ) {
            return undefined
        }

        const actualBalanceBN = new BigNumber(this.userData.tokenBalance)
            .minus(this.userData.lockedTokens)

        return new BigNumber(this.daoConfig.threshold)
            .minus(actualBalanceBN)
            .toFixed()
    }

    public get threshold(): string | undefined {
        return this.daoConfig.threshold
    }

    public get hasLockedTokens(): boolean | undefined {
        if (!this.userData.lockedTokens) {
            return undefined
        }

        return new BigNumber(this.userData.lockedTokens).gt(0)
    }

    public get lockedTokens(): string | undefined {
        return this.userData.lockedTokens
    }

    public get candidates(): GaugeInfo[] {
        return this.state.candidates ?? []
    }

}
