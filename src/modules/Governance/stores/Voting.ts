/* eslint-disable sort-keys */
import { makeAutoObservable, toJS } from 'mobx'

import { VoteEscrowAbi } from '@/misc'
import { CastedVotes, CreatedProposals, VotingStoreState } from '@/modules/Governance/types'
import { UserDataStore } from '@/modules/Governance/stores/UserData'
import { GasToCastVote, GasToUnlockVoteTokens, calcGazToUnlockVotes } from '@/modules/Governance/utils'
import { error } from '@/utils'
import { useRpc, useStaticRpc } from '@/hooks'
import { WalletService } from '@/stores/WalletService'
import { VoteEscrowAddress } from '@/config'

export class VotingStore {

    protected state: VotingStoreState = {}

    constructor(
        protected wallet: WalletService,
        protected userData: UserDataStore,
    ) {
        makeAutoObservable(this)
    }

    public init(): void {
        this.userData.init()
    }

    public dispose(): void {
        this.userData.dispose()
        this.reset()
    }

    public reset(): void {
        this.state = {}
    }

    public async castVote(proposalId: number, support: boolean, reason?: string): Promise<void> {
        this.setState('castLoading', true)

        const rpc = useRpc()
        const staticRpc = useStaticRpc()
        const subscriber = new staticRpc.Subscriber()

        try {
            if (!this.wallet.account?.address) {
                throw new Error('Ton wallet must be connected')
            }

            if (!this.userData.veAccountAddress) {
                throw new Error('userDataAddress must be defined')
            }

            const ve = new rpc.Contract(VoteEscrowAbi.Root, VoteEscrowAddress)

            const veAccount = new rpc.Contract(VoteEscrowAbi.Account, this.userData.veAccountAddress)

            const successStream = subscriber.transactions(veAccount.address)
                .flatMap(item => item.transactions)
                .flatMap(transaction => veAccount.decodeTransactionEvents({ transaction }))
                .filterMap(result => {
                    if (result.event === 'VoteCast' && result.data.proposal_id === proposalId.toString()) {
                        return true
                    }
                    return undefined
                })
                .first()

            if (reason) {
                await ve.methods.castVoteWithReason({
                    reason,
                    support,
                    proposal_id: proposalId,
                })
                    .send({
                        from: this.wallet.account.address,
                        amount: GasToCastVote,
                    })
            }
            else {
                await ve.methods.castVote({
                    support,
                    proposal_id: proposalId,
                })
                    .send({
                        from: this.wallet.account.address,
                        amount: GasToCastVote,
                    })
            }

            await successStream
            await this.userData.syncData()
        }
        catch (e) {
            await subscriber.unsubscribe()
            error(e)
        }

        this.setState('castLoading', false)
    }

    public async unlockCastedVote(proposalIds: number[]): Promise<boolean> {
        this.setState('unlockLoading', true)

        let success = false
        const rpc = useRpc()
        const staticRpc = useStaticRpc()
        const subscriber = new staticRpc.Subscriber()

        try {
            if (!this.wallet.account?.address) {
                throw new Error('Ton wallet must be connected')
            }

            if (!this.userData.veAccountAddress) {
                throw new Error('userDataAddress must be defined')
            }

            const ve = new rpc.Contract(VoteEscrowAbi.Root, VoteEscrowAddress)
            const veAccount = new rpc.Contract(VoteEscrowAbi.Account, this.userData.veAccountAddress)
            let testIds = proposalIds.map(id => `${id}`)

            const successStream = subscriber
                .transactions(veAccount.address)
                .flatMap(item => item.transactions)
                .flatMap(transaction => veAccount.decodeTransactionEvents({
                    transaction,
                }))
                .filterMap(result => {
                    if (result.event === 'UnlockCastedVotes') {
                        if (testIds.includes(result.data.proposal_id)) {
                            testIds = testIds.filter(id => id !== result.data.proposal_id)
                            this.addUnlockedId(parseInt(result.data.proposal_id, 10))
                        }
                    }
                    if (testIds.length === 0) {
                        return true
                    }
                    return undefined
                })
                .first()

            await ve.methods.tryUnlockCastedVotes({
                proposal_ids: proposalIds,
            })
                .send({
                    from: this.wallet.account.address,
                    amount: calcGazToUnlockVotes(proposalIds.length),
                })

            await successStream
            await this.userData.syncData()
            success = true
        }
        catch (e) {
            await subscriber.unsubscribe()
            error(e)
        }

        this.setState('unlockLoading', false)

        return success
    }

    public async unlockVoteTokens(proposalId: number): Promise<boolean> {
        this.setState('unlockLoading', true)

        let success = false
        const rpc = useRpc()
        const subscriber = rpc.createSubscriber()

        try {
            if (!this.wallet.account?.address) {
                throw new Error('Ton wallet must be connected')
            }

            if (!this.userData.veAccountAddress) {
                throw new Error('userDataAddress must be defined')
            }

            const ve = new rpc.Contract(VoteEscrowAbi.Root, VoteEscrowAddress)
            const veAccount = new rpc.Contract(VoteEscrowAbi.Account, this.userData.veAccountAddress)

            const successStream = subscriber
                .transactions(veAccount.address)
                .flatMap(item => item.transactions)
                .flatMap(transaction => veAccount.decodeTransactionEvents({
                    transaction,
                }))
                .filterMap(result => {
                    if (result.event === 'UnlockVotes') {
                        if (result.data.proposal_id === `${proposalId}`) {
                            return true
                        }
                    }
                    return undefined
                })
                .first()

            await ve.methods.tryUnlockVoteTokens({
                proposal_id: proposalId,
            })
                .send({
                    from: this.wallet.account.address,
                    amount: GasToUnlockVoteTokens,
                })


            await successStream
            await this.userData.syncData()
            success = true
        }
        catch (e) {
            await subscriber.unsubscribe()
            error(e)
        }

        this.setState('unlockLoading', false)

        return success
    }

    public addUnlockedId(id: number): void {
        this.setState('unlockedIds', [...this.unlockedIds, id])
    }

    protected setState<K extends keyof VotingStoreState>(key: K, value: VotingStoreState[K]): void {
        this.state[key] = value
    }

    public get isConnected(): boolean {
        return this.userData.isConnected && this.wallet.isConnected
    }

    public get loading(): boolean {
        return this.userData.hasAccount === undefined
    }

    public get castLoading(): boolean {
        return !!this.state.castLoading
    }

    public get unlockLoading(): boolean {
        return !!this.state.unlockLoading
    }

    public get tokenBalance(): string | undefined {
        return this.userData.tokenBalance
    }

    public get castedVotes(): CastedVotes | undefined {
        return toJS(this.userData.castedVotes)
    }

    public get createdProposals(): CreatedProposals | undefined {
        return toJS(this.userData.createdProposals)
    }

    public get lockedTokens(): string | undefined {
        return this.userData.lockedTokens
    }

    public get unlockedIds(): number[] {
        return this.state.unlockedIds || []
    }

    public get votesCount(): number | undefined {
        return this.userData.votesCount
    }

}
