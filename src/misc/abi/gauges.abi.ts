export class GaugeAbi {

    static Root = {
        'ABI version': 2,
        version: '2.2',
        header: ['time'],
        functions: [
            {
                name: 'constructor',
                inputs: [
                    { name: '_owner', type: 'address' },
                    { name: '_voteEscrow', type: 'address' },
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
                name: 'dummy',
                inputs: [
                    { name: 'user_wallet', type: 'address' },
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
                    { name: '_deposit_nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'finishDeposit',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'qube_reward', type: 'uint128' },
                    { name: 'extra_reward', type: 'uint128[]' },
                    { name: 'claim', type: 'bool' },
                    { name: 'boosted_bal_old', type: 'uint128' },
                    { name: 'boosted_bal_new', type: 'uint128' },
                    { name: '_deposit_nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdraw',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'claim', type: 'bool' },
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
                    { name: 'amount', type: 'uint128' },
                    { name: 'qube_reward', type: 'uint128' },
                    { name: 'extra_reward', type: 'uint128[]' },
                    { name: 'claim', type: 'bool' },
                    { name: 'boosted_bal_old', type: 'uint128' },
                    { name: 'boosted_bal_new', type: 'uint128' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'claimReward',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'revertClaim',
                inputs: [
                    { name: 'user', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'finishClaim',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'qube_reward', type: 'uint128' },
                    { name: 'extra_reward', type: 'uint128[]' },
                    { name: 'boosted_bal_old', type: 'uint128' },
                    { name: 'boosted_bal_new', type: 'uint128' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'burnLockBoostedBalance',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'expired_boosted', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdrawUnclaimed',
                inputs: [
                    { name: 'ids', type: 'uint128[]' },
                    { name: 'to', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'addRewardRounds',
                inputs: [
                    { name: 'ids', type: 'uint256[]' },
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'new_rounds', type: 'tuple[]' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setExtraFarmEndTime',
                inputs: [
                    { name: 'ids', type: 'uint256[]' },
                    { name: 'farm_end_times', type: 'uint32[]' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'calculateRewardData',
                inputs: [
                ],
                outputs: [
                    { name: '_lastRewardTime', type: 'uint32' },
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: '_extraRewardRounds', type: 'tuple[][]' },
                    { name: '_extra_sync_idx', type: 'uint256[]' },
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: '_qubeRewardRounds', type: 'tuple[]' },
                    { name: '_qube_sync_idx', type: 'uint256' },
                ],
            },
            {
                name: 'calculateSupplyAverage',
                inputs: [
                ],
                outputs: [
                    { name: '_lockBoostedSupplyAverage', type: 'uint128' },
                    { name: '_lockBoostedSupplyAveragePeriod', type: 'uint32' },
                    { name: '_supplyAverage', type: 'uint128' },
                    { name: '_supplyAveragePeriod', type: 'uint32' },
                    { name: '_lastAverageUpdateTime', type: 'uint32' },
                ],
            },
            {
                name: 'calcSyncData',
                inputs: [
                ],
                outputs: [
                    { components: [{ name: 'depositSupply', type: 'uint128' }, { name: 'depositSupplyAverage', type: 'uint128' }, { name: 'depositSupplyAveragePeriod', type: 'uint32' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'extraRewardRounds', type: 'tuple[][]' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'qubeRewardRounds', type: 'tuple[]' }, { name: 'poolLastRewardTime', type: 'uint32' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'setupTokens',
                inputs: [
                    { name: '_depositTokenRoot', type: 'address' },
                    { name: '_qubeTokenRoot', type: 'address' },
                    { name: '_extraRewardTokenRoot', type: 'address[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setupVesting',
                inputs: [
                    { name: '_qubeVestingPeriod', type: 'uint32' },
                    { name: '_qubeVestingRatio', type: 'uint32' },
                    { name: '_extraVestingPeriods', type: 'uint32[]' },
                    { name: '_extraVestingRatios', type: 'uint32[]' },
                    { name: '_withdrawAllLockPeriod', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setupBoostLock',
                inputs: [
                    { name: '_maxBoost', type: 'uint32' },
                    { name: '_maxLockTime', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'initialize',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
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
                name: 'requestUpdateGaugeAccountCode',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'updateGaugeAccountCode',
                inputs: [
                    { name: 'new_code', type: 'cell' },
                    { name: 'new_version', type: 'uint32' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'requestUpgradeGauge',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'forceUpgradeGaugeAccount',
                inputs: [
                    { name: 'user', type: 'address' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgradeGaugeAccount',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onGaugeAccountUpgrade',
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
                name: 'onGaugeAccountDeploy',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getDetails',
                inputs: [
                ],
                outputs: [
                    { name: '_owner', type: 'address' },
                    { name: '_voteEscrow', type: 'address' },
                    { name: '_lockBoostedSupply', type: 'uint128' },
                    { name: '_totalBoostedSupply', type: 'uint128' },
                    { name: '_maxBoost', type: 'uint32' },
                    { name: '_maxLockTime', type: 'uint32' },
                    { name: '_lastExtraRewardRoundIdx', type: 'uint256[]' },
                    { name: '_lastQubeRewardRoundIdx', type: 'uint256' },
                    { name: '_lastRewardTime', type: 'uint32' },
                    { name: '_lastAverageUpdateTime', type: 'uint32' },
                    { name: '_initialized', type: 'bool' },
                ],
            },
            {
                name: 'getRewardDetails',
                inputs: [
                ],
                outputs: [
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: '_qubeRewardRounds', type: 'tuple[]' },
                    { name: '_qubeVestingPeriod', type: 'uint32' },
                    { name: '_qubeVestingRatio', type: 'uint32' },
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: '_extraRewardRounds', type: 'tuple[][]' },
                    { name: '_extraVestingPeriods', type: 'uint32[]' },
                    { name: '_extraVestingRatios', type: 'uint32[]' },
                    { name: '_extraRewardEnded', type: 'bool[]' },
                    { name: '_withdrawAllLockPeriod', type: 'uint32' },
                ],
            },
            {
                name: 'getTokenDetails',
                inputs: [
                ],
                outputs: [
                    { components: [{ name: 'root', type: 'address' }, { name: 'wallet', type: 'address' }, { name: 'balance', type: 'uint128' }, { name: 'cumulativeBalance', type: 'uint128' }], name: '_depositTokenData', type: 'tuple' },
                    { components: [{ name: 'root', type: 'address' }, { name: 'wallet', type: 'address' }, { name: 'balance', type: 'uint128' }, { name: 'cumulativeBalance', type: 'uint128' }], name: '_qubeTokenData', type: 'tuple' },
                    { components: [{ name: 'root', type: 'address' }, { name: 'wallet', type: 'address' }, { name: 'balance', type: 'uint128' }, { name: 'cumulativeBalance', type: 'uint128' }], name: '_extraTokenData', type: 'tuple[]' },
                ],
            },
            {
                name: 'getCodes',
                inputs: [
                ],
                outputs: [
                    { name: '_platformCode', type: 'cell' },
                    { name: '_gaugeAccountCode', type: 'cell' },
                    { name: '_gaugeAccountVersion', type: 'uint32' },
                    { name: '_gaugeVersion', type: 'uint32' },
                ],
            },
            {
                name: 'calculateBoostedAmount',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'lock_time', type: 'uint32' },
                ],
                outputs: [
                    { name: 'boosted_amount', type: 'uint128' },
                ],
            },
            {
                name: 'encodeDepositPayload',
                inputs: [
                    { name: 'deposit_owner', type: 'address' },
                    { name: 'lock_time', type: 'uint32' },
                    { name: 'claim', type: 'bool' },
                    { name: 'call_id', type: 'uint32' },
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                    { name: 'deposit_payload', type: 'cell' },
                ],
            },
            {
                name: 'encodeRewardDepositPayload',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                    { name: 'reward_deposit_payload', type: 'cell' },
                ],
            },
            {
                name: 'decodeRewardDepositPayload',
                inputs: [
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'nonce', type: 'uint32' },
                    { name: 'correct', type: 'bool' },
                ],
            },
            {
                name: 'decodeDepositPayload',
                inputs: [
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [
                    { name: 'deposit_owner', type: 'address' },
                    { name: 'lock_time', type: 'uint32' },
                    { name: 'claim', type: 'bool' },
                    { name: 'call_id', type: 'uint32' },
                    { name: 'nonce', type: 'uint32' },
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
                name: 'getGaugeAccountAddress',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'user', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'address' },
                ],
            },
        ],
        data: [
            { key: 1, name: 'platformCode', type: 'cell' },
            { key: 2, name: 'gaugeAccountCode', type: 'cell' },
            { key: 3, name: 'factory', type: 'address' },
            { key: 4, name: 'deploy_nonce', type: 'uint32' },
            { key: 5, name: 'gauge_account_version', type: 'uint32' },
            { key: 6, name: 'gauge_version', type: 'uint32' },
        ],
        events: [
            {
                name: 'Deposit',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'boosted_amount', type: 'uint128' },
                    { name: 'lock_time', type: 'uint32' },
                    { name: 'totalBoostedSupply', type: 'uint128' },
                    { name: 'lockBoostedSupply', type: 'uint128' },
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
                name: 'Withdraw',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'totalBoostedSupply', type: 'uint128' },
                    { name: 'lockBoostedSupply', type: 'uint128' },
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
                name: 'Claim',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                    { name: 'qube_reward', type: 'uint128' },
                    { name: 'extra_reward', type: 'uint128[]' },
                    { name: 'qube_debt', type: 'uint128' },
                    { name: 'extra_debt', type: 'uint128[]' },
                    { name: 'totalBoostedSupply', type: 'uint128' },
                    { name: 'lockBoostedSupply', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'ClaimRevert',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'LockBoostedBurn',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'lock_boosted_burned', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'WithdrawUnclaimed',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'to', type: 'address' },
                    { name: 'extra_amounts', type: 'uint128[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'RewardDeposit',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'sender', type: 'address' },
                    { name: 'reward_id', type: 'uint256' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'ExtraFarmEndSet',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'id', type: 'uint256' },
                    { name: 'farm_end_time', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'GaugeAccountCodeUpdated',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'prev_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'GaugeAccountCodeUpdateRejected',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'GaugeUpdated',
                inputs: [
                    { name: 'prev_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'RewardRoundAdded',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'id', type: 'uint256' },
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'new_reward_round', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'QubeRewardRoundAdded',
                inputs: [
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'new_qube_round', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'GaugeAccountUpgrade',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'user', type: 'address' },
                    { name: 'old_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'GaugeAccountDeploy',
                inputs: [
                    { name: 'user', type: 'address' },
                ],
                outputs: [
                ],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'withdrawAllLockPeriod', type: 'uint32' },
            { name: 'lastRewardTime', type: 'uint32' },
            { name: 'lastExtraRewardRoundIdx', type: 'uint256[]' },
            { name: 'lastQubeRewardRoundIdx', type: 'uint256' },
            { name: 'lastAverageUpdateTime', type: 'uint32' },
            { name: 'lockBoostedSupply', type: 'uint128' },
            { name: 'lockBoostedSupplyAverage', type: 'uint128' },
            { name: 'lockBoostedSupplyAveragePeriod', type: 'uint32' },
            { name: 'supplyAverage', type: 'uint128' },
            { name: 'supplyAveragePeriod', type: 'uint32' },
            { name: 'totalBoostedSupply', type: 'uint128' },
            { name: 'owner', type: 'address' },
            { name: 'voteEscrow', type: 'address' },
            { name: 'maxBoost', type: 'uint32' },
            { name: 'maxLockTime', type: 'uint32' },
            { name: 'init_mask', type: 'uint8' },
            { name: 'initialized', type: 'bool' },
            { components: [{ name: 'root', type: 'address' }, { name: 'wallet', type: 'address' }, { name: 'balance', type: 'uint128' }, { name: 'cumulativeBalance', type: 'uint128' }], name: 'depositTokenData', type: 'tuple' },
            { components: [{ name: 'root', type: 'address' }, { name: 'wallet', type: 'address' }, { name: 'balance', type: 'uint128' }, { name: 'cumulativeBalance', type: 'uint128' }], name: 'qubeTokenData', type: 'tuple' },
            { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'qubeRewardRounds', type: 'tuple[]' },
            { name: 'qubeVestingPeriod', type: 'uint32' },
            { name: 'qubeVestingRatio', type: 'uint32' },
            { components: [{ name: 'root', type: 'address' }, { name: 'wallet', type: 'address' }, { name: 'balance', type: 'uint128' }, { name: 'cumulativeBalance', type: 'uint128' }], name: 'extraTokenData', type: 'tuple[]' },
            { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'extraRewardRounds', type: 'tuple[][]' },
            { name: 'extraVestingPeriods', type: 'uint32[]' },
            { name: 'extraVestingRatios', type: 'uint32[]' },
            { name: 'extraRewardEnded', type: 'bool[]' },
            { name: 'deposit_nonce', type: 'uint32' },
            { components: [{ name: 'user', type: 'address' }, { name: 'amount', type: 'uint128' }, { name: 'boosted_amount', type: 'uint128' }, { name: 'lock_time', type: 'uint32' }, { name: 'claim', type: 'bool' }, { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' }], name: 'deposits', type: 'map(uint64,tuple)' },
            { name: 'platformCode', type: 'cell' },
            { name: 'gaugeAccountCode', type: 'cell' },
            { name: 'factory', type: 'address' },
            { name: 'deploy_nonce', type: 'uint32' },
            { name: 'gauge_account_version', type: 'uint32' },
            { name: 'gauge_version', type: 'uint32' },
        ],
    } as const

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
                name: 'increasePoolDebt',
                inputs: [
                    { name: 'qube_debt', type: 'uint128' },
                    { name: 'extra_debt', type: 'uint128[]' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processWithdraw',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'claim', type: 'bool' },
                    { components: [{ name: 'depositSupply', type: 'uint128' }, { name: 'depositSupplyAverage', type: 'uint128' }, { name: 'depositSupplyAveragePeriod', type: 'uint32' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'extraRewardRounds', type: 'tuple[][]' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'qubeRewardRounds', type: 'tuple[]' }, { name: 'poolLastRewardTime', type: 'uint32' }], name: 'gauge_sync_data', type: 'tuple' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processClaim',
                inputs: [
                    { components: [{ name: 'depositSupply', type: 'uint128' }, { name: 'depositSupplyAverage', type: 'uint128' }, { name: 'depositSupplyAveragePeriod', type: 'uint32' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'extraRewardRounds', type: 'tuple[][]' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'qubeRewardRounds', type: 'tuple[]' }, { name: 'poolLastRewardTime', type: 'uint32' }], name: 'gauge_sync_data', type: 'tuple' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processDeposit',
                inputs: [
                    { name: 'deposit_nonce', type: 'uint32' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'boostedAmount', type: 'uint128' },
                    { name: 'lockTime', type: 'uint32' },
                    { name: 'claim', type: 'bool' },
                    { components: [{ name: 'depositSupply', type: 'uint128' }, { name: 'depositSupplyAverage', type: 'uint128' }, { name: 'depositSupplyAveragePeriod', type: 'uint32' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'extraRewardRounds', type: 'tuple[][]' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'qubeRewardRounds', type: 'tuple[]' }, { name: 'poolLastRewardTime', type: 'uint32' }], name: 'gauge_sync_data', type: 'tuple' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'receiveVeAverage',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                    { name: 'veQubeBalance', type: 'uint128' },
                    { name: 'veQubeAverage', type: 'uint128' },
                    { name: 'veQubeAveragePeriod', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'revertAction',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'receiveVeAccAverage',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                    { name: 'veAccQube', type: 'uint128' },
                    { name: 'veAccQubeAverage', type: 'uint128' },
                    { name: 'veAccQubeAveragePeriod', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'syncDepositsRecursive',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                    { name: 'syncTime', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'updateQubeReward',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                    { name: 'intervalTBoostedBalance', type: 'uint128' },
                    { name: 'intervalLockBalance', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'updateExtraReward',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                    { name: 'intervalTBoostedBalance', type: 'uint128' },
                    { name: 'intervalLockBalance', type: 'uint128' },
                    { name: 'idx', type: 'uint256' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processDeposit_final',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processWithdraw_final',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processClaim_final',
                inputs: [
                    { name: 'nonce', type: 'uint32' },
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
                    { name: '_gauge', type: 'address' },
                    { name: '_user', type: 'address' },
                    { name: '_voteEscrow', type: 'address' },
                    { name: '_veAccount', type: 'address' },
                    { name: '_current_version', type: 'uint32' },
                    { name: '_balance', type: 'uint128' },
                    { name: '_lockBoostedBalance', type: 'uint128' },
                    { name: '_veBoostedBalance', type: 'uint128' },
                    { name: '_totalBoostedBalance', type: 'uint128' },
                    { name: '_lockedBalance', type: 'uint128' },
                    { name: '_lastUpdateTime', type: 'uint32' },
                    { name: '_lockedDepositsNum', type: 'uint32' },
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
                name: 'getAverages',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'veQubeAverage', type: 'uint128' }, { name: 'veQubeAveragePeriod', type: 'uint32' }, { name: 'veAccQubeAverage', type: 'uint128' }, { name: 'veAccQubeAveragePeriod', type: 'uint32' }, { name: 'lockBoostedBalanceAverage', type: 'uint128' }, { name: 'lockBoostedBalanceAveragePeriod', type: 'uint32' }, { name: 'gaugeSupplyAverage', type: 'uint128' }, { name: 'gaugeSupplyAveragePeriod', type: 'uint32' }], name: '_lastAverageState', type: 'tuple' },
                    { components: [{ name: 'veQubeAverage', type: 'uint128' }, { name: 'veQubeAveragePeriod', type: 'uint32' }, { name: 'veAccQubeAverage', type: 'uint128' }, { name: 'veAccQubeAveragePeriod', type: 'uint32' }, { name: 'lockBoostedBalanceAverage', type: 'uint128' }, { name: 'lockBoostedBalanceAveragePeriod', type: 'uint32' }, { name: 'gaugeSupplyAverage', type: 'uint128' }, { name: 'gaugeSupplyAveragePeriod', type: 'uint32' }], name: '_curAverageState', type: 'tuple' },
                ],
            },
            {
                name: 'getRewardDetails',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'accRewardPerShare', type: 'uint256' }, { name: 'lockedReward', type: 'uint128' }, { name: 'unlockedReward', type: 'uint128' }, { name: 'lastRewardTime', type: 'uint32' }], name: '_qubeReward', type: 'tuple' },
                    { components: [{ name: 'accRewardPerShare', type: 'uint256' }, { name: 'lockedReward', type: 'uint128' }, { name: 'unlockedReward', type: 'uint128' }, { name: 'lastRewardTime', type: 'uint32' }], name: '_extraReward', type: 'tuple[]' },
                    { components: [{ name: 'vestingTime', type: 'uint32' }, { name: 'vestingPeriod', type: 'uint32' }, { name: 'vestingRatio', type: 'uint32' }], name: '_qubeVesting', type: 'tuple' },
                    { components: [{ name: 'vestingTime', type: 'uint32' }, { name: 'vestingPeriod', type: 'uint32' }, { name: 'vestingRatio', type: 'uint32' }], name: '_extraVesting', type: 'tuple[]' },
                ],
            },
            {
                name: 'pendingReward',
                inputs: [
                    { name: '_veQubeAverage', type: 'uint128' },
                    { name: '_veQubeAveragePeriod', type: 'uint32' },
                    { name: '_veAccQubeAverage', type: 'uint128' },
                    { name: '_veAccQubeAveragePeriod', type: 'uint32' },
                    { components: [{ name: 'depositSupply', type: 'uint128' }, { name: 'depositSupplyAverage', type: 'uint128' }, { name: 'depositSupplyAveragePeriod', type: 'uint32' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'extraRewardRounds', type: 'tuple[][]' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'qubeRewardRounds', type: 'tuple[]' }, { name: 'poolLastRewardTime', type: 'uint32' }], name: 'gauge_sync_data', type: 'tuple' },
                ],
                outputs: [
                    { components: [{ name: 'accRewardPerShare', type: 'uint256' }, { name: 'lockedReward', type: 'uint128' }, { name: 'unlockedReward', type: 'uint128' }, { name: 'lastRewardTime', type: 'uint32' }], name: '_qubeReward', type: 'tuple' },
                    { components: [{ name: 'vestingTime', type: 'uint32' }, { name: 'vestingPeriod', type: 'uint32' }, { name: 'vestingRatio', type: 'uint32' }], name: '_qubeVesting', type: 'tuple' },
                    { components: [{ name: 'accRewardPerShare', type: 'uint256' }, { name: 'lockedReward', type: 'uint128' }, { name: 'unlockedReward', type: 'uint128' }, { name: 'lastRewardTime', type: 'uint32' }], name: '_extraReward', type: 'tuple[]' },
                    { components: [{ name: 'vestingTime', type: 'uint32' }, { name: 'vestingPeriod', type: 'uint32' }, { name: 'vestingRatio', type: 'uint32' }], name: '_extraVesting', type: 'tuple[]' },
                ],
            },
            {
                name: 'calculateTotalBoostedBalance',
                inputs: [
                    { name: '_lockBoostedBalance', type: 'uint128' },
                    { name: '_gaugeDepositSupply', type: 'uint128' },
                    { name: '_veAccBalance', type: 'uint128' },
                    { name: '_veSupply', type: 'uint128' },
                ],
                outputs: [
                    { name: '_veBoostedBalance', type: 'uint128' },
                    { name: '_totalBoostedBalance', type: 'uint128' },
                    { name: '_veBoostMultiplier', type: 'uint256' },
                    { name: '_lockBoostMultiplier', type: 'uint256' },
                    { name: '_totalBoostMultiplier', type: 'uint256' },
                ],
            },
            {
                name: 'calculateIntervalBalances',
                inputs: [
                    { components: [{ name: 'veQubeAverage', type: 'uint128' }, { name: 'veQubeAveragePeriod', type: 'uint32' }, { name: 'veAccQubeAverage', type: 'uint128' }, { name: 'veAccQubeAveragePeriod', type: 'uint32' }, { name: 'lockBoostedBalanceAverage', type: 'uint128' }, { name: 'lockBoostedBalanceAveragePeriod', type: 'uint32' }, { name: 'gaugeSupplyAverage', type: 'uint128' }, { name: 'gaugeSupplyAveragePeriod', type: 'uint32' }], name: '_curAverageState', type: 'tuple' },
                ],
                outputs: [
                    { name: 'intervalTBoostedBalance', type: 'uint128' },
                    { name: 'intervalLockBalance', type: 'uint128' },
                ],
            },
            {
                name: 'calculateRewards',
                inputs: [
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'reward_rounds', type: 'tuple[]' },
                    { components: [{ name: 'accRewardPerShare', type: 'uint256' }, { name: 'lockedReward', type: 'uint128' }, { name: 'unlockedReward', type: 'uint128' }, { name: 'lastRewardTime', type: 'uint32' }], name: 'reward_data', type: 'tuple' },
                    { components: [{ name: 'vestingTime', type: 'uint32' }, { name: 'vestingPeriod', type: 'uint32' }, { name: 'vestingRatio', type: 'uint32' }], name: 'vesting_data', type: 'tuple' },
                    { name: 'interval_balance', type: 'uint128' },
                    { name: 'pool_last_reward_time', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'accRewardPerShare', type: 'uint256' }, { name: 'lockedReward', type: 'uint128' }, { name: 'unlockedReward', type: 'uint128' }, { name: 'lastRewardTime', type: 'uint32' }], name: 'value0', type: 'tuple' },
                    { components: [{ name: 'vestingTime', type: 'uint32' }, { name: 'vestingPeriod', type: 'uint32' }, { name: 'vestingRatio', type: 'uint32' }], name: 'value1', type: 'tuple' },
                ],
            },
            {
                name: 'calculateLockBalanceAverage',
                inputs: [
                ],
                outputs: [
                    { name: '_balance', type: 'uint128' },
                    { name: '_lockedBalance', type: 'uint128' },
                    { name: '_lockBoostedBalance', type: 'uint128' },
                    { name: '_lockBoostedBalanceAverage', type: 'uint128' },
                    { name: '_lockBoostedBalanceAveragePeriod', type: 'uint32' },
                ],
            },
            {
                name: 'lockedDeposits',
                inputs: [
                ],
                outputs: [
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'boostedAmount', type: 'uint128' }, { name: 'lockTime', type: 'uint32' }, { name: 'createdAt', type: 'uint32' }], name: 'lockedDeposits', type: 'map(uint64,tuple)' },
                ],
            },
        ],
        data: [
        ],
        events: [
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'current_version', type: 'uint32' },
            { name: 'balance', type: 'uint128' },
            { name: 'lockBoostedBalance', type: 'uint128' },
            { name: 'veBoostedBalance', type: 'uint128' },
            { name: 'totalBoostedBalance', type: 'uint128' },
            { name: 'lockedBalance', type: 'uint128' },
            { components: [{ name: 'veQubeAverage', type: 'uint128' }, { name: 'veQubeAveragePeriod', type: 'uint32' }, { name: 'veAccQubeAverage', type: 'uint128' }, { name: 'veAccQubeAveragePeriod', type: 'uint32' }, { name: 'lockBoostedBalanceAverage', type: 'uint128' }, { name: 'lockBoostedBalanceAveragePeriod', type: 'uint32' }, { name: 'gaugeSupplyAverage', type: 'uint128' }, { name: 'gaugeSupplyAveragePeriod', type: 'uint32' }], name: 'lastAverageState', type: 'tuple' },
            { components: [{ name: 'veQubeAverage', type: 'uint128' }, { name: 'veQubeAveragePeriod', type: 'uint32' }, { name: 'veAccQubeAverage', type: 'uint128' }, { name: 'veAccQubeAveragePeriod', type: 'uint32' }, { name: 'lockBoostedBalanceAverage', type: 'uint128' }, { name: 'lockBoostedBalanceAveragePeriod', type: 'uint32' }, { name: 'gaugeSupplyAverage', type: 'uint128' }, { name: 'gaugeSupplyAveragePeriod', type: 'uint32' }], name: 'curAverageState', type: 'tuple' },
            { name: 'lastUpdateTime', type: 'uint32' },
            { name: 'lockedDepositsNum', type: 'uint32' },
            { name: 'gauge', type: 'address' },
            { name: 'user', type: 'address' },
            { name: 'voteEscrow', type: 'address' },
            { name: 'veAccount', type: 'address' },
            { components: [{ name: 'amount', type: 'uint128' }, { name: 'boostedAmount', type: 'uint128' }, { name: 'lockTime', type: 'uint32' }, { name: 'createdAt', type: 'uint32' }], name: 'lockedDeposits', type: 'map(uint64,tuple)' },
            { components: [{ name: 'accRewardPerShare', type: 'uint256' }, { name: 'lockedReward', type: 'uint128' }, { name: 'unlockedReward', type: 'uint128' }, { name: 'lastRewardTime', type: 'uint32' }], name: 'qubeReward', type: 'tuple' },
            { components: [{ name: 'accRewardPerShare', type: 'uint256' }, { name: 'lockedReward', type: 'uint128' }, { name: 'unlockedReward', type: 'uint128' }, { name: 'lastRewardTime', type: 'uint32' }], name: 'extraReward', type: 'tuple[]' },
            { components: [{ name: 'vestingTime', type: 'uint32' }, { name: 'vestingPeriod', type: 'uint32' }, { name: 'vestingRatio', type: 'uint32' }], name: 'qubeVesting', type: 'tuple' },
            { components: [{ name: 'vestingTime', type: 'uint32' }, { name: 'vestingPeriod', type: 'uint32' }, { name: 'vestingRatio', type: 'uint32' }], name: 'extraVesting', type: 'tuple[]' },
            { name: '_nonce', type: 'uint32' },
            { components: [{ name: 'amount', type: 'uint128' }, { name: 'claim', type: 'bool' }, { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' }], name: '_withdraws', type: 'map(uint32,tuple)' },
            { components: [{ name: 'deposit_nonce', type: 'uint32' }, { name: 'amount', type: 'uint128' }, { name: 'boostedAmount', type: 'uint128' }, { name: 'lockTime', type: 'uint32' }, { name: 'claim', type: 'bool' }, { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' }], name: '_deposits', type: 'map(uint32,tuple)' },
            { components: [{ components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' }], name: '_claims', type: 'map(uint32,tuple)' },
            { name: '_actions', type: 'map(uint32,uint8)' },
            { components: [{ name: 'poolLastRewardTime', type: 'uint32' }, { name: 'gaugeDepositSupply', type: 'uint128' }, { name: 'veSupply', type: 'uint128' }, { name: 'veAccBalance', type: 'uint128' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'extraRewardRounds', type: 'tuple[][]' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'endTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128' }, { name: 'accRewardPerShare', type: 'uint256' }], name: 'qubeRewardRounds', type: 'tuple[]' }], name: '_sync_data', type: 'map(uint32,tuple)' },
        ],
    } as const

    static Factory = {
        'ABI version': 2,
        version: '2.2',
        header: ['time'],
        functions: [
            {
                name: 'constructor',
                inputs: [
                    { name: '_owner', type: 'address' },
                    { name: '_qube', type: 'address' },
                    { name: '_vote_escrow', type: 'address' },
                    { name: '_qube_vesting_ratio', type: 'uint32' },
                    { name: '_qube_vesting_period', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgrade',
                inputs: [
                    { name: 'new_code', type: 'cell' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getDetails',
                inputs: [
                ],
                outputs: [
                    { name: '_gauges_count', type: 'uint32' },
                    { name: '_owner', type: 'address' },
                    { name: '_pending_owner', type: 'address' },
                    { name: '_default_qube_vesting_period', type: 'uint32' },
                    { name: '_default_qube_vesting_ratio', type: 'uint32' },
                    { name: '_qube', type: 'address' },
                    { name: '_voteEscrow', type: 'address' },
                ],
            },
            {
                name: 'getCodes',
                inputs: [
                ],
                outputs: [
                    { name: '_factory_version', type: 'uint32' },
                    { name: '_gauge_version', type: 'uint32' },
                    { name: '_gauge_account_version', type: 'uint32' },
                    { name: '_GaugeAccountCode', type: 'cell' },
                    { name: '_GaugeCode', type: 'cell' },
                    { name: '_PlatformCode', type: 'cell' },
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
                name: 'setDefaultQubeVestingParams',
                inputs: [
                    { name: '_vesting_period', type: 'uint32' },
                    { name: '_vesting_ratio', type: 'uint32' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'deployGauge',
                inputs: [
                    { name: 'gauge_owner', type: 'address' },
                    { name: 'depositTokenRoot', type: 'address' },
                    { name: 'maxBoost', type: 'uint32' },
                    { name: 'maxLockTime', type: 'uint32' },
                    { name: 'rewardTokenRoots', type: 'address[]' },
                    { name: 'vestingPeriods', type: 'uint32[]' },
                    { name: 'vestingRatios', type: 'uint32[]' },
                    { name: 'withdrawAllLockPeriod', type: 'uint32' },
                    { name: 'call_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'deployGaugeByOwner',
                inputs: [
                    { name: 'gauge_owner', type: 'address' },
                    { name: 'depositTokenRoot', type: 'address' },
                    { name: 'maxBoost', type: 'uint32' },
                    { name: 'maxLockTime', type: 'uint32' },
                    { name: 'qubeVestingPeriod', type: 'uint32' },
                    { name: 'qubeVestingRatio', type: 'uint32' },
                    { name: 'rewardTokenRoots', type: 'address[]' },
                    { name: 'vestingPeriods', type: 'uint32[]' },
                    { name: 'vestingRatios', type: 'uint32[]' },
                    { name: 'withdrawAllLockPeriod', type: 'uint32' },
                    { name: 'call_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onGaugeDeploy',
                inputs: [
                    { name: 'deploy_nonce', type: 'uint32' },
                    { name: 'call_id', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'installNewGaugeCode',
                inputs: [
                    { name: 'gauge_code', type: 'cell' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'installNewGaugeAccountCode',
                inputs: [
                    { name: 'gauge_account_code', type: 'cell' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgradeGauges',
                inputs: [
                    { name: 'gauges', type: 'address[]' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'updateGaugeAccountsCode',
                inputs: [
                    { name: 'gauges', type: 'address[]' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'forceUpgradeGaugeAccounts',
                inputs: [
                    { name: 'gauge', type: 'address' },
                    { name: 'users', type: 'address[]' },
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processUpgradeGaugeRequest',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processUpdateGaugeAccountCodeRequest',
                inputs: [
                    { components: [{ name: 'call_id', type: 'uint32' }, { name: 'nonce', type: 'uint32' }, { name: 'send_gas_to', type: 'address' }], name: 'meta', type: 'tuple' },
                ],
                outputs: [
                ],
            },
        ],
        data: [
            { key: 1, name: 'PlatformCode', type: 'cell' },
            { key: 2, name: 'nonce', type: 'uint128' },
        ],
        events: [
            {
                name: 'QubeVestingParamsUpdate',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'new_vesting_period', type: 'uint32' },
                    { name: 'new_vesting_ratio', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'GaugeCodeUpdate',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'prev_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'GaugeAccountCodeUpdate',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'prev_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'FactoryUpdate',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'prev_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
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
                name: 'NewGauge',
                inputs: [
                    { name: 'call_id', type: 'uint32' },
                    { name: 'gauge', type: 'address' },
                ],
                outputs: [
                ],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'factory_version', type: 'uint32' },
            { name: 'gauge_version', type: 'uint32' },
            { name: 'gauge_account_version', type: 'uint32' },
            { name: 'gauges_count', type: 'uint32' },
            { name: 'owner', type: 'address' },
            { name: 'pending_owner', type: 'address' },
            { name: 'default_qube_vesting_period', type: 'uint32' },
            { name: 'default_qube_vesting_ratio', type: 'uint32' },
            { name: 'qube', type: 'address' },
            { name: 'voteEscrow', type: 'address' },
            { name: 'GaugeAccountCode', type: 'cell' },
            { name: 'GaugeCode', type: 'cell' },
            { name: 'PlatformCode', type: 'cell' },
            { name: 'nonce', type: 'uint128' },
        ],
    } as const

}
