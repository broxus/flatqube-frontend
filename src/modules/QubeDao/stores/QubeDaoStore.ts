import BigNumber from 'bignumber.js'
import type {
    Address, Contract, DecodedAbiFunctionOutputs, DecodedEvent, FullContractState, Transaction,
} from 'everscale-inpage-provider'
import { computed, makeObservable, reaction } from 'mobx'
import type { IReactionDisposer } from 'mobx'
import { Subscription } from 'everscale-inpage-provider'

import { useRpc } from '@/hooks/useRpc'
import { useStaticRpc } from '@/hooks/useStaticRpc'
import { TokenAbi, TokenWallet, VoteEscrowAbi } from '@/misc'
import { useQubeDaoApi } from '@/modules/QubeDao/hooks/useApi'
import type {
    QubeDaoMainPageResponse,
    SendMessageCallback,
    TransactionCallbacks,
    TransactionFailureReason,
    TransactionSuccessResult,
} from '@/modules/QubeDao/types'
import { voteEscrowAccountContract, voteEscrowContract } from '@/modules/QubeDao/utils'
import { BaseStore } from '@/stores/BaseStore'
import { TokenCache, TokensCacheService } from '@/stores/TokensCacheService'
import { WalletService } from '@/stores/WalletService'
import {
    debug,
    error,
    getSafeProcessingId,
    isGoodBignumber,
} from '@/utils'


export type QubeDaoDepositSuccessResult = {
    amount: string;
    key: string;
    lockTime: number;
    user: Address;
    veAmount: string;
}

export type QubeDaoDepositSendCallbackParams = {
    amount: string;
    veAmount: string;
}

export type QubeDaoDepositCallbacks = TransactionCallbacks<
    TransactionSuccessResult<QubeDaoDepositSuccessResult>,
    TransactionFailureReason
> & SendMessageCallback<QubeDaoDepositSendCallbackParams>

export type QubeDaoDepositParams = {
    amount: string;
    lockPeriod: number;
    veAmount: string;
} & QubeDaoDepositCallbacks

export type QubeDaoWithdrawSuccessResult = {
    amount: string;
    user: Address;
}

export type QubeDaoWithdrawSendCallbackParams = {
    amount: string;
}

export type QubeDaoWithdrawCallbacks = TransactionCallbacks<
    TransactionSuccessResult<QubeDaoWithdrawSuccessResult>,
    TransactionFailureReason
> & SendMessageCallback<QubeDaoWithdrawSendCallbackParams>

export type QubeDaoWithdrawParams = QubeDaoWithdrawCallbacks


export type QubeDaoVoteEpochSuccessResult = {
    user: Address;
    votes: (readonly [Address, string])[];
}

export type QubeDaoVoteEpochCallbacks = TransactionCallbacks<
    TransactionSuccessResult<QubeDaoVoteEpochSuccessResult>,
    TransactionFailureReason
> & SendMessageCallback

export type QubeDaoVoteEpochParams = {
    maxGaugesPerVote: number;
    votes: (readonly [Address, string])[];
} & QubeDaoVoteEpochCallbacks

export type QubeDaoEndVotingSuccessResult = {
    newEpoch: number;
    newEpochEnd: number;
    newEpochStart: number;
    totalVotes: string;
    treasuryVotes: string;
    votes: (readonly [Address, string])[];
}

export type QubeDaoEndVotingCallbacks = TransactionCallbacks<
    TransactionSuccessResult<QubeDaoEndVotingSuccessResult>,
    TransactionFailureReason
> & SendMessageCallback

export type QubeDaoEndVotingParams<P = {}> = P & QubeDaoEndVotingCallbacks

export type QubeDaoStoreData = {
    accountAddress?: Address;
    averageLockTime: number;
    currentEpochNum: number;
    epochTime: number;
    farmingAllocatorTokenBalance?: string;
    maxVotesRatio?: string;
    minVotesRatio?: string;
    tokenOwnerTokenBalance?: string;
    tokenPrice?: string;
    tokenTotalSupply?: string;
    totalLockedAmount?: string;
    totalLockedVeAmount?: string;
    unlockedAmount?: string;
    userBalance?: string;
    userVeBalance?: string;
}

export type QubeDaoStoreState = {
    isDepositing: boolean;
    isFetchingDetails?: boolean;
    isFetchingTokenPrice?: boolean;
    isInitializing: boolean;
    isSyncingBalances?: boolean;
    isSyncingTokenBalance?: boolean;
    isVotingFinishing: boolean;
    isVotingEpoch: boolean;
    isWithdrawing: boolean;
    veContractCachedState?: FullContractState;
}

export type QubeDaoStoreCtorOptions = {
    farmingAllocatorAddress?: Address;
    tokenAddress: Address;
    tokenDecimals: number;
    tokenOwnerAddress?: Address;
    tokenSymbol: string;
    veAddress: Address;
    veDecimals: number;
    veSymbol: string;
    veIcon?: string;
}

const rpc = useRpc()
const staticRpc = useStaticRpc()

export class QubeDaoStore extends BaseStore<QubeDaoStoreData, QubeDaoStoreState> {

    protected readonly api = useQubeDaoApi()

    constructor(
        public readonly wallet: WalletService,
        public readonly tokensCache: TokensCacheService,
        protected readonly options: QubeDaoStoreCtorOptions,
    ) {
        super()

        this.setData(() => ({
            averageLockTime: 0,
            currentEpochNum: 0,
        }))

        makeObservable(this, {
            averageLockTime: computed,
            currentEpochNum: computed,
            epochTime: computed,
            farmingAllocatorTokenBalance: computed,
            hasUnlockedAmount: computed,
            isDepositing: computed,
            isFetchingDetails: computed,
            isFetchingTokenPrice: computed,
            isSyncingBalances: computed,
            isSyncingTokenBalance: computed,
            isVotingEpoch: computed,
            isVotingFinishing: computed,
            isWithdrawing: computed,
            token: computed,
            tokenAddress: computed,
            tokenDecimals: computed,
            tokenOwnerTokenBalance: computed,
            tokenPrice: computed,
            tokenSymbol: computed,
            tokenTotalSupply: computed,
            totalLockedAmount: computed,
            totalLockedVeAmount: computed,
            unlockedAmount: computed,
            userBalance: computed,
            userVeBalance: computed,
            veAddress: computed,
            veContract: computed,
            veContractCachedState: computed,
            veDecimals: computed,
            veIcon: computed,
            veSymbol: computed,
        })
    }

    public async init(): Promise<void> {
        if (this.state.isInitializing) {
            return
        }

        this.setState('isInitializing', true)

        await this.syncVeContractState()
        await this.syncVotingDetails()

        this.#initDisposer = reaction(
            () => [this.wallet.address, this.tokensCache.isReady],
            async ([address, isTokensCacheReady]) => {
                if (address !== undefined && isTokensCacheReady) {
                    await this.syncAccountAddress()
                    await Promise.allSettled([
                        this.syncTokenBalance(false, true),
                        this.syncBalances(false),
                    ])
                    await this.tokensCache.watch(this.options.tokenAddress.toString(), 'qube-dao')
                }

                if (address === undefined) {
                    this.setData({
                        accountAddress: undefined,
                        unlockedAmount: undefined,
                        userBalance: undefined,
                        userVeBalance: undefined,
                    })
                    this.setState('isSyncingBalances', false)
                    await this.tokensCache.unwatch(this.options.tokenAddress.toString(), 'qube-dao')
                }
            },
            { fireImmediately: true },
        )

        await Promise.all([
            this.fetchDetails(),
            this.fetchTokenPrice(),
        ])

        await this.subscribe()

        this.setState('isInitializing', false)
    }

    public async dispose(): Promise<void> {
        this.#initDisposer?.()
        await this.tokensCache.unwatch(this.options.tokenAddress.toString(), 'qube-dao')
        await this.unsubscribe()
    }

    public async deposit(params: QubeDaoDepositParams): Promise<void> {
        if (this.wallet.account?.address === undefined) {
            throw new Error('Wallet not connected')
        }

        const callId = getSafeProcessingId()
        const subscriber = new staticRpc.Subscriber()
        let transaction!: Transaction

        try {
            this.setState('isDepositing', true)

            const walletAddress = await TokenWallet.walletAddress({
                owner: this.wallet.account.address,
                root: this.options.tokenAddress,
            })

            const startLt = this.veContractCachedState?.lastTransactionId?.lt

            const stream = await subscriber
                .transactions(this.options.veAddress)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || tx.id.lt > startLt)
                .filterMap(async tx => {
                    const events = await this.veContract.decodeTransactionEvents({
                        transaction: tx,
                    })

                    if (events.length === 0) {
                        return undefined
                    }

                    let event = events.find(e => e.event === 'DepositRevert' && e.data.call_id === callId)

                    if (event) {
                        debug('DepositRevert', event)

                        await params.onTransactionFailure?.({
                            callId,
                            message: event.event,
                            transaction: tx,
                        })

                        return event
                    }

                    event = events.find(e => e.event === 'Deposit' && e.data.call_id === callId)

                    if (event === undefined) {
                        return undefined
                    }

                    debug('Deposit', event)

                    const { data } = (event as DecodedEvent<typeof VoteEscrowAbi.Root, 'Deposit'>)

                    await params.onTransactionSuccess?.({
                        callId,
                        input: {
                            amount: data.amount,
                            key: data.key,
                            lockTime: parseInt(data.lock_time, 10),
                            user: data.user,
                            veAmount: data.ve_amount,
                        },
                        transaction: tx,
                    })

                    return event
                })
                .delayed(s => s.first())

            const [payload, minGas] = await Promise.all([
                (await this.veContract
                    .methods.encodeDepositPayload({
                        call_id: callId,
                        deposit_owner: this.wallet.account.address,
                        lock_time: 3600, // params.lockPeriod,
                        nonce: '0',
                    })
                    .call({ cachedState: this.veContractCachedState }))
                    .payload,
                (await this.veAccountContract
                    ?.methods.calculateMinGas({ answerId: 0 })
                    .call().catch(() => ({ min_gas: '1500000000' })))
                    ?.min_gas ?? '1500000000',
            ])

            const message = await new rpc.Contract(TokenAbi.Wallet, walletAddress)
                .methods.transfer({
                    amount: params.amount,
                    deployWalletValue: '0',
                    notify: true,
                    payload,
                    recipient: this.options.veAddress,
                    remainingGasTo: this.wallet.account.address,
                })
                .sendDelayed({
                    amount: new BigNumber(1500000000).plus(minGas).toFixed(),
                    bounce: true,
                    from: this.wallet.account.address,
                })

            await params.onSend?.(message, {
                amount: params.amount,
                callId,
                veAmount: params.veAmount,
            })

            this.setState('isDepositing', false)

            transaction = await message.transaction

            await stream()
        }
        catch (e: any) {
            if (e.code !== 3) {
                await params.onTransactionFailure?.({
                    callId,
                    message: e.message,
                    transaction,
                })
            }
            throw e
        }
        finally {
            this.setState('isDepositing', false)
            await subscriber.unsubscribe()
        }
    }

    protected async fetchTokenPrice(force?: boolean): Promise<void> {
        if (!force && this.isFetchingTokenPrice) {
            return
        }

        try {
            this.setState('isFetchingTokenPrice', true)

            const currency = await this.api.currency({
                address: this.options.tokenAddress.toString(),
            })
            this.setData('tokenPrice', currency.price)
        }
        catch (e) {
            //
        }
        finally {
            this.setState('isFetchingTokenPrice', false)
        }
    }

    protected async fetchDetails(force?: boolean): Promise<void> {
        if (!force && this.isFetchingDetails) {
            return
        }

        try {
            this.setState('isFetchingDetails', true)

            type ResponseTuple = [
                QubeDaoMainPageResponse,
                string,
                DecodedAbiFunctionOutputs<typeof VoteEscrowAbi.Root, 'getCurrentEpochDetails'>,
                string,
                string,
            ]

            const [
                response,
                tokenTotalSupply,
                details,
                farmingAllocatorTokenBalance,
                tokenOwnerTokenBalance,
            ] = await Promise.allSettled([
                this.api.mainPage({}, { method: 'GET' }),
                TokenWallet.totalSupply(this.tokenAddress),
                this.veContract
                    .methods.getCurrentEpochDetails({})
                    .call({ cachedState: this.veContractCachedState }),
                this.options.farmingAllocatorAddress && TokenWallet.balance({
                    owner: this.options.farmingAllocatorAddress,
                    root: this.tokenAddress,
                }),
                this.options.tokenOwnerAddress && TokenWallet.balance({
                    owner: this.options.tokenOwnerAddress,
                    root: this.tokenAddress,
                }),
            ]).then(res => res.map(
                r => (r.status === 'fulfilled' ? r.value : undefined),
            )) as ResponseTuple

            this.setData({
                averageLockTime: response?.averageLockTime ?? 0,
                currentEpochNum: parseInt(details._currentEpoch, 10),
                farmingAllocatorTokenBalance,
                tokenOwnerTokenBalance,
                tokenTotalSupply,
                totalLockedAmount: response.totalAmount ?? 0,
                totalLockedVeAmount: response.totalVeAmount ?? 0,
            })
        }
        catch (e) {
            //
        }
        finally {
            this.setState('isFetchingDetails', false)
        }
    }

    protected async syncAccountAddress(): Promise<void> {
        if (this.wallet.account?.address === undefined) {
            return
        }

        try {
            this.setData('accountAddress', (await this.veContract
                .methods.getVoteEscrowAccountAddress({ answerId: 0, user: this.wallet.account.address })
                .call({ cachedState: this.veContractCachedState }))
                .value0)
        }
        catch (e) {

        }
    }

    protected async syncBalances(force?: boolean, silence: boolean = false): Promise<void> {
        if (this.veAccountContract === undefined || (!force && this.isSyncingBalances)) {
            return
        }

        try {
            this.setState('isSyncingBalances', !silence)

            const result = await this.veAccountContract.methods.calculateVeAverage({}).call()

            this.setData({
                unlockedAmount: result?._unlockedQubes ?? '0',
                userBalance: result?._qubeBalance ?? '0',
                userVeBalance: result?._veQubeBalance ?? '0',
            })
        }
        catch (e) {
            debug('Sync balances error: ', e)
            this.setData({
                unlockedAmount: undefined,
                userBalance: undefined,
                userVeBalance: undefined,
            })
        }
        finally {
            this.setState('isSyncingBalances', false)
        }
    }

    protected async syncTokenBalance(force?: boolean, silence: boolean = false): Promise<void> {
        if (!force && this.isSyncingTokenBalance) {
            return
        }

        try {
            this.setState('isSyncingTokenBalance', !silence)

            await this.tokensCache.syncToken(this.options.tokenAddress.toString(), true)
        }
        catch (e) {
            debug('Sync token balance error: ', e)
        }
        finally {
            this.setState('isSyncingTokenBalance', false)
        }
    }

    protected async syncVotingDetails(): Promise<void> {
        try {
            const details = await this.veContract
                .methods.getVotingDetails({})
                .call({ cachedState: this.veContractCachedState })

            this.setData({
                epochTime: parseInt(details._epochTime, 10),
                maxVotesRatio: details._gaugeMaxVotesRatio,
                minVotesRatio: details._gaugeMinVotesRatio,
            })
        }
        catch (e) {
            error(e)
        }
    }

    public async voteEpoch(params: QubeDaoVoteEpochParams): Promise<void> {
        if (this.wallet.account?.address === undefined) {
            throw new Error('Wallet not connected')
        }

        const callId = getSafeProcessingId()
        const subscriber = new staticRpc.Subscriber()
        let transaction!: Transaction

        try {
            this.setState('isVotingEpoch', true)

            const isAlreadyVoted = (await this.veAccountContract
                ?.methods.getDetails({ answerId: 0 })
                .call())
                ?._lastEpochVoted === this.currentEpochNum.toString()

            if (isAlreadyVoted) {
                await params.onTransactionFailure?.({
                    callId,
                    message: 'AlreadyVoted',
                })
                return
            }

            const startLt = this.veContractCachedState?.lastTransactionId?.lt

            const stream = await subscriber
                .transactions(this.options.veAddress)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || tx.id.lt > startLt)
                .filterMap(async tx => {
                    const events = await this.veContract.decodeTransactionEvents({
                        transaction: tx,
                    })

                    if (events.length === 0) {
                        return undefined
                    }

                    let event = events.find(e => e.event === 'VoteRevert' && e.data.call_id === callId)

                    if (event) {
                        debug('VoteRevert', event)

                        await params.onTransactionFailure?.({
                            callId,
                            message: event.event,
                            transaction: tx,
                        })

                        return event
                    }

                    event = events.find(e => e.event === 'Vote' && e.data.call_id === callId)

                    if (event === undefined) {
                        return undefined
                    }

                    debug('Vote', event)

                    const { data } = (event as DecodedEvent<typeof VoteEscrowAbi.Root, 'Vote'>)

                    await params.onTransactionSuccess?.({
                        callId,
                        input: {
                            user: data.user,
                            votes: data.votes,
                        },
                        transaction: tx,
                    })

                    return event
                })
                .delayed(s => s.first())

            const minGas = (await this.veAccountContract
                ?.methods.calculateMinGas({ answerId: 0 })
                .call().catch(() => ({ min_gas: '1500000000' })))
                ?.min_gas ?? '1500000000'

            const message = await voteEscrowContract(this.options.veAddress, useRpc())
                .methods.voteEpoch({
                    meta: {
                        call_id: callId,
                        nonce: '0',
                        send_gas_to: this.wallet.account.address,
                    },
                    votes: params.votes,
                })
                .sendDelayed({
                    amount: new BigNumber(1500000000)
                        .plus(new BigNumber(20000000).times(params.maxGaugesPerVote || 0))
                        .plus(minGas)
                        .toFixed(),
                    bounce: true,
                    from: this.wallet.account.address,
                })

            await params?.onSend?.(message, {
                callId,
            })

            transaction = await message.transaction

            await stream()
        }
        catch (e: any) {
            error('Vote epoch error', e)
            if (e.code !== 3) {
                await params.onTransactionFailure?.({
                    callId,
                    message: e.message,
                    transaction,
                })
            }
            throw e
        }
        finally {
            this.setState('isVotingEpoch', false)
            await subscriber.unsubscribe()
        }
    }

    public async endVoting(params: QubeDaoEndVotingParams): Promise<void> {
        if (this.wallet.account?.address === undefined) {
            throw new Error('Wallet not connected')
        }

        const callId = getSafeProcessingId()
        const subscriber = new staticRpc.Subscriber()
        let transaction!: Transaction

        try {
            this.setState('isVotingFinishing', true)

            const startLt = this.veContractCachedState?.lastTransactionId?.lt

            const stream = await subscriber
                .transactions(this.veAddress)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || tx.id.lt > startLt)
                .filterMap(async tx => {
                    const events = await this.veContract.decodeTransactionEvents({
                        transaction: tx,
                    })

                    if (events.length === 0) {
                        return undefined
                    }

                    let event = events.find(e => e.event === 'VotingEndRevert' && e.data.call_id === callId)

                    if (event) {
                        debug('VotingEndRevert', event)

                        await params.onTransactionFailure?.({
                            callId,
                            message: event.event,
                            transaction: tx,
                        })

                        return event
                    }

                    event = events.find(e => e.event === 'VotingEnd' && e.data.call_id === callId)

                    if (event === undefined) {
                        return undefined
                    }

                    debug('VotingEnd', event)

                    const { data } = (event as DecodedEvent<typeof VoteEscrowAbi.Root, 'VotingEnd'>)

                    await params.onTransactionSuccess?.({
                        callId,
                        input: {
                            newEpoch: parseInt(data.new_epoch, 10),
                            newEpochEnd: parseInt(data.new_epoch_end, 10),
                            newEpochStart: parseInt(data.new_epoch_start, 10),
                            totalVotes: data.total_votes,
                            treasuryVotes: data.treasury_votes,
                            votes: data.votes,
                        },
                        transaction: tx,
                    })

                    return event
                })
                .delayed(s => s.first())

            const amount = (await this.veContract
                ?.methods.calculateGasForEndVoting({})
                .call().catch(() => ({ min_gas: '1500000000' })))
                ?.min_gas ?? '1500000000'

            const message = await voteEscrowContract(this.options.veAddress, useRpc())
                .methods.endVoting({
                    meta: {
                        call_id: callId,
                        nonce: '0',
                        send_gas_to: this.wallet.account.address,
                    },
                })
                .sendDelayed({
                    amount,
                    bounce: true,
                    from: this.wallet.account.address,
                })

            await params?.onSend?.(message, {
                callId,
            })

            transaction = await message.transaction

            await stream()
        }
        catch (e: any) {
            error('End voting error', e)
            if (e.code !== 3) {
                await params.onTransactionFailure?.({
                    callId,
                    message: e.message,
                    transaction,
                })
            }
            throw e
        }
        finally {
            this.setState('isVotingFinishing', false)
            await subscriber.unsubscribe()
        }
    }

    public async withdraw(params: QubeDaoWithdrawParams): Promise<void> {
        if (this.wallet.account?.address === undefined) {
            throw new Error('Wallet not connected')
        }

        const callId = getSafeProcessingId()
        const subscriber = new staticRpc.Subscriber()
        let transaction!: Transaction

        try {
            this.setState('isWithdrawing', true)

            const startLt = this.veContractCachedState?.lastTransactionId?.lt

            const stream = await subscriber
                .transactions(this.options.veAddress)
                .flatMap(item => item.transactions)
                .filter(tx => !startLt || tx.id.lt > startLt)
                .filterMap(async tx => {
                    const events = await this.veContract.decodeTransactionEvents({
                        transaction: tx,
                    })

                    if (events.length === 0) {
                        return undefined
                    }

                    let event = events.find(e => e.event === 'WithdrawRevert' && e.data.call_id === callId)

                    if (event) {
                        debug('WithdrawRevert', event)

                        await params.onTransactionFailure?.({
                            callId,
                            message: event.event,
                            transaction: tx,
                        })

                        return event
                    }

                    event = events.find(e => e.event === 'Withdraw' && e.data.call_id === callId)

                    if (event === undefined) {
                        return undefined
                    }

                    debug('Withdraw', event)

                    const { data } = (event as DecodedEvent<typeof VoteEscrowAbi.Root, 'Withdraw'>)

                    await params.onTransactionSuccess?.({
                        callId,
                        input: {
                            amount: data.amount,
                            user: data.user,
                        },
                        transaction: tx,
                    })

                    return event
                })
                .delayed(s => s.first())

            const minGas = (await this.veAccountContract
                ?.methods.calculateMinGas({ answerId: 0 })
                .call().catch(() => ({ min_gas: '1500000000' })))
                ?.min_gas ?? '1500000000'

            const { unlockedAmount } = this

            const message = await voteEscrowContract(this.options.veAddress, useRpc())
                .methods.withdraw({
                    meta: {
                        call_id: callId,
                        nonce: '0',
                        send_gas_to: this.wallet.account.address,
                    },
                })
                .sendDelayed({
                    amount: new BigNumber(1500000000).plus(minGas).toFixed(),
                    bounce: true,
                    from: this.wallet.account.address,
                })

            await params?.onSend?.(message, {
                amount: unlockedAmount ?? '0',
                callId,
            })

            transaction = await message.transaction

            await stream()
        }
        catch (e: any) {
            if (e.code !== 3) {
                await params.onTransactionFailure?.({
                    callId,
                    message: e.message,
                    transaction,
                })
            }
            throw e
        }
        finally {
            this.setState('isWithdrawing', false)
            await subscriber.unsubscribe()
        }
    }

    public get accountAddress(): QubeDaoStoreData['accountAddress'] {
        return this.data.accountAddress
    }

    public get averageLockTime(): QubeDaoStoreData['averageLockTime'] {
        return this.data.averageLockTime
    }

    public get currentEpochNum(): QubeDaoStoreData['currentEpochNum'] {
        return this.data.currentEpochNum
    }

    public get epochTime(): QubeDaoStoreData['epochTime'] {
        return this.data.epochTime
    }

    public get farmingAllocatorTokenBalance(): QubeDaoStoreData['farmingAllocatorTokenBalance'] {
        return this.data.farmingAllocatorTokenBalance
    }

    public get maxVotesRatio(): QubeDaoStoreData['maxVotesRatio'] {
        return this.data.maxVotesRatio
    }

    public get minVotesRatio(): QubeDaoStoreData['minVotesRatio'] {
        return this.data.minVotesRatio
    }

    public get tokenOwnerTokenBalance(): QubeDaoStoreData['tokenOwnerTokenBalance'] {
        return this.data.tokenOwnerTokenBalance
    }

    public get tokenPrice(): QubeDaoStoreData['tokenPrice'] {
        return this.data.tokenPrice
    }

    public get tokenTotalSupply(): QubeDaoStoreData['tokenTotalSupply'] {
        return this.data.tokenTotalSupply
    }

    public get totalLockedAmount(): QubeDaoStoreData['totalLockedAmount'] {
        return this.data.totalLockedAmount
    }

    public get totalLockedVeAmount(): QubeDaoStoreData['totalLockedVeAmount'] {
        return this.data.totalLockedVeAmount
    }

    public get unlockedAmount(): QubeDaoStoreData['unlockedAmount'] {
        return this.data.unlockedAmount
    }

    public get userBalance(): QubeDaoStoreData['userBalance'] {
        return this.data.userBalance
    }

    public get userVeBalance(): QubeDaoStoreData['userVeBalance'] {
        return this.data.userVeBalance
    }

    public get isDepositing(): QubeDaoStoreState['isDepositing'] {
        return this.state.isDepositing
    }

    public get isFetchingDetails(): QubeDaoStoreState['isFetchingDetails'] {
        return this.state.isFetchingDetails
    }

    public get isFetchingTokenPrice(): QubeDaoStoreState['isFetchingTokenPrice'] {
        return this.state.isFetchingTokenPrice
    }

    public get isSyncingBalances(): QubeDaoStoreState['isSyncingBalances'] {
        return this.state.isSyncingBalances
    }

    public get isSyncingTokenBalance(): QubeDaoStoreState['isSyncingTokenBalance'] {
        return this.state.isSyncingTokenBalance
    }

    public get isVotingEpoch(): QubeDaoStoreState['isVotingEpoch'] {
        return this.state.isVotingEpoch
    }

    public get isVotingFinishing(): QubeDaoStoreState['isVotingFinishing'] {
        return this.state.isVotingFinishing
    }

    public get isWithdrawing(): QubeDaoStoreState['isWithdrawing'] {
        return this.state.isWithdrawing
    }

    public get veContractCachedState(): QubeDaoStoreState['veContractCachedState'] {
        return this.state.veContractCachedState
    }

    public get hasUnlockedAmount(): boolean {
        return isGoodBignumber(this.unlockedAmount ?? 0)
    }

    public get token(): TokenCache | undefined {
        return this.tokensCache.get(this.options.tokenAddress.toString())
    }

    public get tokenAddress(): Address {
        return this.options.tokenAddress
    }

    public get tokenDecimals(): number {
        return this.token?.decimals ?? this.options.tokenDecimals
    }

    public get tokenSymbol(): string {
        return this.token?.symbol ?? this.options.tokenSymbol
    }

    public get veAccountContract(): Contract<typeof VoteEscrowAbi.Account> | undefined {
        return this.accountAddress !== undefined ? voteEscrowAccountContract(this.accountAddress) : undefined
    }

    public get veAddress(): Address {
        return this.options.veAddress
    }

    public get veContract(): Contract<typeof VoteEscrowAbi.Root> {
        return voteEscrowContract(this.options.veAddress)
    }

    public get veDecimals(): number {
        return this.options.veDecimals
    }

    public get veIcon(): string | undefined {
        return this.options.veIcon ?? this.token?.icon
    }

    public get veSymbol(): string {
        return this.options.veSymbol
    }

    protected async syncVeContractState(): Promise<void> {
        try {
            this.setState(
                'veContractCachedState',
                (await staticRpc.getFullContractState({
                    address: this.veAddress,
                })).state,
            )
        }
        catch (e) {
            error(e)
        }
    }

    protected async subscribe(): Promise<void> {
        try {
            await this.unsubscribe()
            this.#veContractStateSubscription = await staticRpc.subscribe('contractStateChanged', {
                address: this.veAddress,
            })
            this.#veContractStateSubscription.on('data', async () => {
                await this.syncVeContractState()
                await Promise.all([
                    this.fetchDetails(),
                    this.fetchTokenPrice(true),
                    this.syncBalances(true, true),
                ])
            })
        }
        catch (e) {
            error('Subscribe to Vote Escrow contract state error: ', e)
        }
    }

    protected async unsubscribe(): Promise<void> {
        try {
            await this.#veContractStateSubscription?.unsubscribe()
            this.#veContractStateSubscription = undefined
        }
        catch (e) {
            error('Unsubscribe from Vote Escrow contract state error: ', e)
        }
    }

    #veContractStateSubscription: Subscription<'contractStateChanged'> | undefined

    #initDisposer: IReactionDisposer | undefined

}
