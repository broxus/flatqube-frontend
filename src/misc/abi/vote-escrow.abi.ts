export abstract class VoteEscrowAbi {

    static Account = {
        'ABI version': 2,
        version: '2.2',
        header: ['time'],
        functions: [
            {
                name: 'constructor',
                inputs: [
                ],
                outputs: [
                ],
            },
            {
                name: 'upgrade',
                inputs: [
                    { name: 'new_code', type: 'cell' },
                    { name: 'new_version', type: 'uint32' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onDeployRetry',
                id: '0x23DC4360',
                inputs: [
                    { name: 'value0', type: 'cell' },
                    { name: 'value1', type: 'cell' },
                    { name: 'sendGasTo', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processVoteEpoch',
                inputs: [
                    { name: 'voteEpoch', type: 'uint32' },
                    { name: 'votes', type: 'map(address,uint128)' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processWithdraw',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processDeposit',
                inputs: [
                    { name: 'deposit_nonce', type: 'uint32' },
                    { name: 'qube_amount', type: 'uint128' },
                    { name: 've_amount', type: 'uint128' },
                    { name: 'lock_time', type: 'uint32' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getVeAverage',
                inputs: [
                    { name: 'callback_receiver', type: 'address' },
                    { name: 'callback_nonce', type: 'uint32' },
                    { name: 'sync_time', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'lockedTokens',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'uint128' },
                ],
            },
            {
                name: 'propose',
                inputs: [
                    { name: 'proposal_data', type: 'cell' },
                    { name: 'threshold', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onProposalDeployed',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                    { name: 'proposal_id', type: 'uint32' },
                    { name: 'answer_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'castVote',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                    { name: 'support', type: 'bool' },
                    { name: 'reason', type: 'string' },
                ],
                outputs: [
                ],
            },
            {
                name: 'voteCasted',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'rejectVote',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'tryUnlockVoteTokens',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'unlockVoteTokens',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                    { name: 'success', type: 'bool' },
                ],
                outputs: [
                ],
            },
            {
                name: 'tryUnlockCastedVotes',
                inputs: [
                    { name: 'proposal_ids', type: 'uint32[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'unlockCastedVote',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                    { name: 'success', type: 'bool' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getDetails',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: '_current_version', type: 'uint32' },
                    { name: '_voteEscrow', type: 'address' },
                    { name: '_user', type: 'address' },
                    { name: '_qubeBalance', type: 'uint128' },
                    { name: '_veQubeBalance', type: 'uint128' },
                    { name: '_veQubeAverage', type: 'uint128' },
                    { name: '_veQubeAveragePeriod', type: 'uint32' },
                    { name: '_unlockedQubes', type: 'uint128' },
                    { name: '_lastUpdateTime', type: 'uint32' },
                    { name: '_lastEpochVoted', type: 'uint32' },
                    { name: '_activeDeposits', type: 'uint32' },
                ],
            },
            {
                name: 'calculateMinGas',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'min_gas', type: 'uint128' },
                ],
            },
            {
                name: 'calculateVeAverage',
                inputs: [
                ],
                outputs: [
                    { name: '_qubeBalance', type: 'uint128' },
                    { name: '_veQubeBalance', type: 'uint128' },
                    { name: '_expiredVeQubes', type: 'uint128' },
                    { name: '_unlockedQubes', type: 'uint128' },
                    { name: '_veQubeAverage', type: 'uint128' },
                    { name: '_veQubeAveragePeriod', type: 'uint128' },
                ],
            },
            {
                name: 'deposits',
                inputs: [
                ],
                outputs: [
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'veAmount', type: 'uint128' }, { name: 'createdAt', type: 'uint32' }, { name: 'lockTime', type: 'uint32' }], name: 'deposits', type: 'map(uint64,tuple)' },
                ],
            },
            {
                name: 'created_proposals',
                inputs: [
                ],
                outputs: [
                    { name: 'created_proposals', type: 'map(uint32,uint128)' },
                ],
            },
            {
                name: '_tmp_proposals',
                inputs: [
                ],
                outputs: [
                    { name: '_tmp_proposals', type: 'map(uint32,uint128)' },
                ],
            },
            {
                name: 'casted_votes',
                inputs: [
                ],
                outputs: [
                    { name: 'casted_votes', type: 'map(uint32,bool)' },
                ],
            },
        ],
        data: [
        ],
        events: [
            {
                name: 'VoteCast',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                    { name: 'support', type: 'bool' },
                    { name: 'votes', type: 'uint128' },
                    { name: 'reason', type: 'string' },
                ],
                outputs: [
                ],
            },
            {
                name: 'UnlockVotes',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                    { name: 'value', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'UnlockCastedVotes',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'ProposalCreationRejected',
                inputs: [
                    { name: 'votes_available', type: 'uint128' },
                    { name: 'threshold', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'ProposalCodeUpgraded',
                inputs: [
                    { name: 'votes_available', type: 'uint128' },
                    { name: 'threshold', type: 'uint128' },
                ],
                outputs: [
                ],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'current_version', type: 'uint32' },
            { name: 'voteEscrow', type: 'address' },
            { name: 'user', type: 'address' },
            { name: 'dao_root', type: 'address' },
            { name: '_proposal_nonce', type: 'uint32' },
            { name: 'platform_code', type: 'cell' },
            { name: 'qubeBalance', type: 'uint128' },
            { name: 'veQubeBalance', type: 'uint128' },
            { name: 'unlockedQubes', type: 'uint128' },
            { name: 'veQubeAverage', type: 'uint128' },
            { name: 'veQubeAveragePeriod', type: 'uint32' },
            { name: 'lastUpdateTime', type: 'uint32' },
            { name: 'lastEpochVoted', type: 'uint32' },
            { name: 'activeDeposits', type: 'uint32' },
            { components: [{ name: 'amount', type: 'uint128' }, { name: 'veAmount', type: 'uint128' }, { name: 'createdAt', type: 'uint32' }, { name: 'lockTime', type: 'uint32' }], name: 'deposits', type: 'map(uint64,tuple)' },
            { name: 'created_proposals', type: 'map(uint32,uint128)' },
            { name: '_tmp_proposals', type: 'map(uint32,uint128)' },
            { name: 'casted_votes', type: 'map(uint32,bool)' },
        ],
    } as const

    static Root = {
        'ABI version': 2,
        version: '2.2',
        header: ['time', 'expire'],
        functions: [
            {
                name: 'constructor',
                inputs: [
                    { name: '_owner', type: 'address' },
                    { name: '_qube', type: 'address' },
                    { name: '_dao', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgrade',
                inputs: [
                    { name: 'code', type: 'cell' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'transferOwnership',
                inputs: [
                    { name: 'new_owner', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'acceptOwnership',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'receiveTokenWalletAddress',
                inputs: [
                    { name: 'wallet', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onAcceptTokensTransfer',
                inputs: [
                    { name: 'value0', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'sender', type: 'address' },
                    { name: 'value3', type: 'address' },
                    { name: 'remainingGasTo', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [
                ],
            },
            {
                name: 'revertDeposit',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'deposit_nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'finishDeposit',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'deposit_key', type: 'uint64' },
                    { name: 'deposit_nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdraw',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'revertWithdraw',
                inputs: [
                    { name: 'user', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'finishWithdraw',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'unlockedQubes', type: 'uint128' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'burnVeQubes',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'expiredVeQubes', type: 'uint128' },
                    { name: 'expiredDeposits', type: 'uint64[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setQubeLockTimeLimits',
                inputs: [
                    { name: 'new_min', type: 'uint32' },
                    { name: 'new_max', type: 'uint32' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setPause',
                inputs: [
                    { name: 'new_state', type: 'bool' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setEmergency',
                inputs: [
                    { name: 'new_state', type: 'bool' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setWhitelistPrice',
                inputs: [
                    { name: 'new_price', type: 'uint128' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'addToWhitelist',
                inputs: [
                    { name: 'gauge', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'removeFromWhitelist',
                inputs: [
                    { name: 'gauge', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getVeAverage',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'calculateAverage',
                inputs: [
                ],
                outputs: [
                    { name: '_lastUpdateTime', type: 'uint32' },
                    { name: '_veQubeBalance', type: 'uint128' },
                    { name: '_veQubeAverage', type: 'uint128' },
                    { name: '_veQubeAveragePeriod', type: 'uint32' },
                ],
            },
            {
                name: 'initialize',
                inputs: [
                    { name: 'start_offset', type: 'uint32' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setVotingParams',
                inputs: [
                    { name: '_epoch_time', type: 'uint32' },
                    { name: '_time_before_voting', type: 'uint32' },
                    { name: '_voting_time', type: 'uint32' },
                    { name: '_gauge_min_votes_ratio', type: 'uint32' },
                    { name: '_gauge_max_votes_ratio', type: 'uint32' },
                    { name: '_gauge_max_downtime', type: 'uint8' },
                    { name: '_max_gauges_per_vote', type: 'uint32' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setDistributionScheme',
                inputs: [
                    { name: '_new_scheme', type: 'uint32[]' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setDistribution',
                inputs: [
                    { name: '_new_distribution', type: 'uint128[]' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'startVoting',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'voteEpoch',
                inputs: [
                    { name: 'votes', type: 'map(address,uint128)' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'finishVote',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'votes', type: 'map(address,uint128)' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'revertVote',
                inputs: [
                    { name: 'user', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'calculateGasForEndVoting',
                inputs: [
                ],
                outputs: [
                    { name: 'min_gas', type: 'uint128' },
                ],
            },
            {
                name: 'endVoting',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'countVotesStep',
                inputs: [
                    { name: 'start_addr', type: 'address' },
                    { name: 'exceeded_votes', type: 'uint128' },
                    { name: 'valid_votes', type: 'uint128' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'normalizeVotesStep',
                inputs: [
                    { name: 'start_addr', type: 'address' },
                    { name: 'treasury_votes', type: 'uint128' },
                    { name: 'exceeded_votes', type: 'uint128' },
                    { name: 'valid_votes', type: 'uint128' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'distributeEpochQubesStep',
                inputs: [
                    { name: 'start_addr', type: 'address' },
                    { name: 'bonus_treasury_votes', type: 'uint128' },
                    { name: 'distributed', type: 'map(address,uint128)' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getNormalizedVoting',
                inputs: [
                ],
                outputs: [
                    { name: '_votes', type: 'map(address,uint128)' },
                    { name: '_normalizedVotes', type: 'map(address,uint128)' },
                    { name: '_distribution', type: 'map(address,uint128)' },
                    { name: 'to_distribute_total', type: 'uint128' },
                    { name: 'to_distribute_team', type: 'uint128' },
                    { name: 'to_distribute_treasury', type: 'uint128' },
                ],
            },
            {
                name: 'withdrawTreasuryTokens',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'receiver', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdrawTeamTokens',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'receiver', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdrawPaymentTokens',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'receiver', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'castVote',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                    { name: 'support', type: 'bool' },
                ],
                outputs: [
                ],
            },
            {
                name: 'castVoteWithReason',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                    { name: 'support', type: 'bool' },
                    { name: 'reason', type: 'string' },
                ],
                outputs: [
                ],
            },
            {
                name: 'tryUnlockVoteTokens',
                inputs: [
                    { name: 'proposal_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'tryUnlockCastedVotes',
                inputs: [
                    { name: 'proposal_ids', type: 'uint32[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'installPlatformCode',
                inputs: [
                    { name: 'code', type: 'cell' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'installOrUpdateVeAccountCode',
                inputs: [
                    { name: 'code', type: 'cell' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgradeVeAccount',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'forceUpgradeVeAccounts',
                inputs: [
                    { name: 'users', type: 'address[]' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onVeAccountUpgrade',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'old_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onVoteEscrowAccountDeploy',
                inputs: [
                    { name: 'user', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'deployVoteEscrowAccount',
                inputs: [
                    { name: 'user', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'address' },
                ],
            },
            {
                name: 'getDetails',
                inputs: [
                ],
                outputs: [
                    { name: '_owner', type: 'address' },
                    { name: '_pendingOwner', type: 'address' },
                    { name: '_qube', type: 'address' },
                    { name: '_dao', type: 'address' },
                    { name: '_qubeWallet', type: 'address' },
                    { name: '_treasuryTokens', type: 'uint128' },
                    { name: '_teamTokens', type: 'uint128' },
                    { name: '_qubeBalance', type: 'uint128' },
                    { name: '_veQubeBalance', type: 'uint128' },
                    { name: '_lastUpdateTime', type: 'uint32' },
                    { name: '_distributionSupply', type: 'uint128' },
                    { name: '_qubeMinLockTime', type: 'uint32' },
                    { name: '_qubeMaxLockTime', type: 'uint32' },
                    { name: '_gaugeWhitelistPrice', type: 'uint128' },
                    { name: '_whitelistPayments', type: 'uint128' },
                    { name: '_initialized', type: 'bool' },
                    { name: '_paused', type: 'bool' },
                    { name: '_emergency', type: 'bool' },
                ],
            },
            {
                name: 'getCurrentEpochDetails',
                inputs: [
                ],
                outputs: [
                    { name: '_currentEpoch', type: 'uint32' },
                    { name: '_currentEpochStartTime', type: 'uint32' },
                    { name: '_currentEpochEndTime', type: 'uint32' },
                    { name: '_currentVotingStartTime', type: 'uint32' },
                    { name: '_currentVotingEndTime', type: 'uint32' },
                    { name: '_currentVotingTotalVotes', type: 'uint128' },
                ],
            },
            {
                name: 'getGaugeVotes',
                inputs: [
                    { name: 'gauge', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'uint128' },
                ],
            },
            {
                name: 'getGaugeDowntime',
                inputs: [
                    { name: 'gauge', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'uint8' },
                ],
            },
            {
                name: 'isGaugeWhitelisted',
                inputs: [
                    { name: 'gauge', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'bool' },
                ],
            },
            {
                name: 'getVotingDetails',
                inputs: [
                ],
                outputs: [
                    { name: '_epochTime', type: 'uint32' },
                    { name: '_votingTime', type: 'uint32' },
                    { name: '_timeBeforeVoting', type: 'uint32' },
                    { name: '_gaugeMaxVotesRatio', type: 'uint32' },
                    { name: '_gaugeMinVotesRatio', type: 'uint32' },
                    { name: '_gaugeMaxDowntime', type: 'uint8' },
                    { name: '_maxGaugesPerVote', type: 'uint32' },
                    { name: '_gaugesNum', type: 'uint32' },
                ],
            },
            {
                name: 'getCodes',
                inputs: [
                ],
                outputs: [
                    { name: '_platformCode', type: 'cell' },
                    { name: '_voteEscrowAccountCode', type: 'cell' },
                    { name: '_voteEscrowAccountVersion', type: 'uint32' },
                    { name: '_voteEscrowVersion', type: 'uint32' },
                ],
            },
            {
                name: 'calculateVeMint',
                inputs: [
                    { name: 'qube_amount', type: 'uint128' },
                    { name: 'lock_time', type: 'uint32' },
                ],
                outputs: [
                    { name: 've_amount', type: 'uint128' },
                ],
            },
            {
                name: 'encodeDepositPayload',
                inputs: [
                    { name: 'deposit_owner', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                    { name: 'lock_time', type: 'uint32' },
                    { name: 'call_id', type: 'uint32' },
                ],
                outputs: [
                    { name: 'payload', type: 'cell' },
                ],
            },
            {
                name: 'decodeDepositPayload',
                inputs: [
                    { name: 'additional_payload', type: 'cell' },
                ],
                outputs: [
                    { name: 'deposit_owner', type: 'address' },
                    { name: 'lock_time', type: 'uint32' },
                ],
            },
            {
                name: 'encodeWhitelistPayload',
                inputs: [
                    { name: 'whitelist_addr', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                    { name: 'call_id', type: 'uint32' },
                ],
                outputs: [
                    { name: 'payload', type: 'cell' },
                ],
            },
            {
                name: 'decodeWhitelistPayload',
                inputs: [
                    { name: 'additional_payload', type: 'cell' },
                ],
                outputs: [
                    { name: 'whitelist_addr', type: 'address' },
                ],
            },
            {
                name: 'encodeDistributionPayload',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                    { name: 'call_id', type: 'uint32' },
                ],
                outputs: [
                    { name: 'payload', type: 'cell' },
                ],
            },
            {
                name: 'encodeTokenTransferPayload',
                inputs: [
                    { name: 'deposit_type', type: 'uint8' },
                    { name: 'nonce', type: 'uint32' },
                    { name: 'call_id', type: 'uint32' },
                    { name: 'additional_payload', type: 'cell' },
                ],
                outputs: [
                    { name: 'payload', type: 'cell' },
                ],
            },
            {
                name: 'decodeTokenTransferPayload',
                inputs: [
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [
                    { name: 'deposit_type', type: 'uint8' },
                    { name: 'nonce', type: 'uint32' },
                    { name: 'call_id', type: 'uint32' },
                    { name: 'additional_payload', type: 'cell' },
                    { name: 'correct', type: 'bool' },
                ],
            },
            {
                name: 'getVoteEscrowAccountAddress',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'user', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'address' },
                ],
            },
            {
                name: 'distributionScheme',
                inputs: [
                ],
                outputs: [
                    { name: 'distributionScheme', type: 'uint32[]' },
                ],
            },
            {
                name: 'distributionSchedule',
                inputs: [
                ],
                outputs: [
                    { name: 'distributionSchedule', type: 'uint128[]' },
                ],
            },
            {
                name: 'gaugeWhitelist',
                inputs: [
                ],
                outputs: [
                    { name: 'gaugeWhitelist', type: 'map(address,bool)' },
                ],
            },
            {
                name: 'currentVotingVotes',
                inputs: [
                ],
                outputs: [
                    { name: 'currentVotingVotes', type: 'map(address,uint128)' },
                ],
            },
            {
                name: 'gaugeDowntimes',
                inputs: [
                ],
                outputs: [
                    { name: 'gaugeDowntimes', type: 'map(address,uint8)' },
                ],
            },
        ],
        data: [
            { key: 1, name: 'deploy_nonce', type: 'uint32' },
        ],
        events: [
            {
                name: 'NewOwner',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'prev_owner', type: 'address' },
                    { name: 'new_owner', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'NewPendingOwner',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'pending_owner', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Deposit',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 've_amount', type: 'uint128' },
                    { name: 'lock_time', type: 'uint32' },
                    { name: 'key', type: 'uint64' },
                ],
                outputs: [
                ],
            },
            {
                name: 'DepositRevert',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'GaugeWhitelist',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'gauge', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'GaugeRemoveWhitelist',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'gauge', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'WhitelistPriceUpdate',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'DistributionSupplyIncrease',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Withdraw',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'WithdrawRevert',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'VeQubesBurn',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'expiredDeposits', type: 'uint64[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'VoteEscrowAccountDeploy',
                inputs: [
                    { name: 'user', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Initialize',
                inputs: [
                    { name: 'init_time', type: 'uint32' },
                    { name: 'epoch_start', type: 'uint32' },
                    { name: 'epoch_end', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'DistributionScheduleUpdate',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'distribution', type: 'uint128[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'DistributionSchemeUpdate',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'distribution_scheme', type: 'uint32[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'VotingStart',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'start', type: 'uint32' },
                    { name: 'end', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'VotingEndRevert',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'VotingStartedAlready',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'start', type: 'uint32' },
                    { name: 'end', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Vote',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                    { name: 'votes', type: 'map(address,uint128)' },
                ],
                outputs: [
                ],
            },
            {
                name: 'VoteRevert',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'NewQubeLockLimits',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'new_min', type: 'uint32' },
                    { name: 'new_max', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'VotingEnd',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'votes', type: 'map(address,uint128)' },
                    { name: 'total_votes', type: 'uint128' },
                    { name: 'treasury_votes', type: 'uint128' },
                    { name: 'new_epoch', type: 'uint32' },
                    { name: 'new_epoch_start', type: 'uint32' },
                    { name: 'new_epoch_end', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'EpochDistribution',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'epoch_num', type: 'uint32' },
                    { name: 'farming_distribution', type: 'map(address,uint128)' },
                    { name: 'team_tokens', type: 'uint128' },
                    { name: 'treasury_tokens', type: 'uint128' },
                    { name: 'total_distributed', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'TreasuryWithdraw',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'receiver', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'TeamWithdraw',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'receiver', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'PaymentWithdraw',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'receiver', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'NewVotingParams',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'epochTime', type: 'uint32' },
                    { name: 'timeBeforeVoting', type: 'uint32' },
                    { name: 'votingTime', type: 'uint32' },
                    { name: 'gaugeMinVotesRatio', type: 'uint32' },
                    { name: 'gaugeMaxVotesRatio', type: 'uint32' },
                    { name: 'gaugeMaxDowntime', type: 'uint8' },
                    { name: 'maxGaugesPerVote', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Pause',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'new_state', type: 'bool' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Emergency',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'new_state', type: 'bool' },
                ],
                outputs: [
                ],
            },
            {
                name: 'PlatformCodeInstall',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'VeAccountCodeUpdate',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'old_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'VoteEscrowAccountUpgrade',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                    { name: 'old_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'deploy_nonce', type: 'uint32' },
            { name: 'platformCode', type: 'cell' },
            { name: 'veAccountCode', type: 'cell' },
            { name: 've_account_version', type: 'uint32' },
            { name: 've_version', type: 'uint32' },
            { name: 'owner', type: 'address' },
            { name: 'pendingOwner', type: 'address' },
            { name: 'qube', type: 'address' },
            { name: 'qubeWallet', type: 'address' },
            { name: 'dao', type: 'address' },
            { name: 'treasuryTokens', type: 'uint128' },
            { name: 'teamTokens', type: 'uint128' },
            { name: 'distributionScheme', type: 'uint32[]' },
            { name: 'qubeBalance', type: 'uint128' },
            { name: 'veQubeBalance', type: 'uint128' },
            { name: 'lastUpdateTime', type: 'uint32' },
            { name: 'distributionSupply', type: 'uint128' },
            { name: 'distributionSchedule', type: 'uint128[]' },
            { name: 'veQubeAverage', type: 'uint128' },
            { name: 'veQubeAveragePeriod', type: 'uint32' },
            { name: 'qubeMinLockTime', type: 'uint32' },
            { name: 'qubeMaxLockTime', type: 'uint32' },
            { name: 'initialized', type: 'bool' },
            { name: 'paused', type: 'bool' },
            { name: 'emergency', type: 'bool' },
            { name: 'currentEpoch', type: 'uint32' },
            { name: 'currentEpochStartTime', type: 'uint32' },
            { name: 'currentEpochEndTime', type: 'uint32' },
            { name: 'currentVotingStartTime', type: 'uint32' },
            { name: 'currentVotingEndTime', type: 'uint32' },
            { name: 'currentVotingTotalVotes', type: 'uint128' },
            { name: 'epochTime', type: 'uint32' },
            { name: 'votingTime', type: 'uint32' },
            { name: 'timeBeforeVoting', type: 'uint32' },
            { name: 'gaugeMaxVotesRatio', type: 'uint32' },
            { name: 'gaugeMinVotesRatio', type: 'uint32' },
            { name: 'gaugeMaxDowntime', type: 'uint8' },
            { name: 'maxGaugesPerVote', type: 'uint32' },
            { name: 'gaugesNum', type: 'uint32' },
            { name: 'gaugeWhitelist', type: 'map(address,bool)' },
            { name: 'currentVotingVotes', type: 'map(address,uint128)' },
            { name: 'gaugeDowntimes', type: 'map(address,uint8)' },
            { name: 'gaugeWhitelistPrice', type: 'uint128' },
            { name: 'whitelistPayments', type: 'uint128' },
            { name: 'deposit_nonce', type: 'uint32' },
            { components: [{ name: 'user', type: 'address' }, { name: 'amount', type: 'uint128' }, { name: 've_amount', type: 'uint128' }, { name: 'lock_time', type: 'uint32' }, { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' }], name: 'pending_deposits', type: 'map(uint32,tuple)' },
        ],
    } as const

}
