import { Address } from 'everscale-inpage-provider'
import {
    IReactionDisposer, makeAutoObservable, reaction, runInAction, toJS,
} from 'mobx'

import { VoteEscrowAbi } from '@/misc'
import { CastedVotes, CreatedProposals } from '@/modules/Governance/types'
import { handleProposalsCount } from '@/modules/Governance/utils'
import { error } from '@/utils'
import { WalletService } from '@/stores/WalletService'
import { useStaticRpc } from '@/hooks'
import { VoteEscrowAddress } from '@/config'

type UserDataStoreData = {
    veAccountAddress?: Address;
    tokenBalance?: string;
    lockedTokens?: string;
    castedVotes?: CastedVotes;
    createdProposals?: CreatedProposals;
    votesCount?: number;
}

type UserDataStoreState = {
    hasAccount?: boolean;
}

export class UserDataStore {

    protected data: UserDataStoreData = {}

    protected state: UserDataStoreState = {}

    protected syncDisposer?: IReactionDisposer

    constructor(
        protected wallet: WalletService,
    ) {
        makeAutoObservable(this, {}, {
            autoBind: true,
        })
    }

    public init(): void {
        this.syncDisposer?.()
        this.syncDisposer = reaction(
            () => this.isConnected,
            this.syncData,
            {
                fireImmediately: true,
            },
        )
    }

    public dispose(): void {
        this.syncDisposer?.()
        this.reset()
    }

    public reset(): void {
        this.data = {}
        this.state = {}
    }

    public async syncData(): Promise<void> {
        let createdProposals: CreatedProposals,
            castedVotes: CastedVotes,
            lockedTokens: string,
            tokenBalance: string,
            veAccountAddress: Address,
            hasAccount: boolean,
            votesCount: number

        if (this.wallet.address) {
            try {
                const staticRpc = useStaticRpc()

                const voteEscrow = new staticRpc.Contract(VoteEscrowAbi.Root, VoteEscrowAddress)

                const { value0: _veAccountAddress } = await voteEscrow.methods.getVoteEscrowAccountAddress({
                    answerId: 0,
                    user: new Address(this.wallet.address),
                }).call()

                const { state: veAccountState } = await staticRpc.getFullContractState({
                    address: _veAccountAddress,
                })

                const veAccount = new staticRpc.Contract(VoteEscrowAbi.Account, _veAccountAddress)

                const details = await veAccount.methods
                    .getDetails({ answerId: 0 })
                    .call({ cachedState: veAccountState })

                const { value0: _lockedTokens } = await veAccount.methods
                    .lockedTokens({ answerId: 0 })
                    .call({ cachedState: veAccountState })

                const { casted_votes: _castedVotes } = await veAccount.methods
                    .casted_votes({})
                    .call({ cachedState: veAccountState })

                const { created_proposals: _createdProposals } = await veAccount.methods
                    .created_proposals({})
                    .call({ cachedState: veAccountState })

                const proposalsCount = await handleProposalsCount({}, {}, {
                    voters: [this.wallet.address],
                })

                createdProposals = _createdProposals
                castedVotes = _castedVotes
                lockedTokens = _lockedTokens
                tokenBalance = details._veQubeBalance
                veAccountAddress = _veAccountAddress
                votesCount = proposalsCount?.[0]?.count
                hasAccount = true
            }
            catch (e) {
                error(e)
                hasAccount = false
            }
        }

        runInAction(() => {
            this.data.castedVotes = castedVotes
            this.data.createdProposals = createdProposals
            this.data.lockedTokens = lockedTokens
            this.data.tokenBalance = tokenBalance
            this.data.veAccountAddress = veAccountAddress
            this.state.hasAccount = hasAccount
            this.data.votesCount = votesCount
        })
    }

    public get isConnected(): boolean {
        return this.wallet.isConnected
    }

    public get lockedTokens(): string | undefined {
        return this.data.lockedTokens
    }

    public get castedVotes(): CastedVotes | undefined {
        return toJS(this.data.castedVotes)
    }

    public get createdProposals(): CreatedProposals | undefined {
        return toJS(this.data.createdProposals)
    }

    public get tokenBalance(): string | undefined {
        return this.data.tokenBalance
    }

    public get veAccountAddress(): Address | undefined {
        return this.data.veAccountAddress
    }

    public get hasAccount(): boolean | undefined {
        return this.state.hasAccount
    }

    public get votesCount(): number | undefined {
        return this.data.votesCount
    }

}
