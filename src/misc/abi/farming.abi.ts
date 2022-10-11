export abstract class FarmAbi {

    static Fabric = {
        'ABI version': 2,
        version: '2.2',
        header: ['time', 'expire'],
        functions: [
            {
                name: 'constructor',
                inputs: [
                    { name: '_owner', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'transferOwnership',
                inputs: [
                    { name: 'new_owner', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'installNewFarmPoolCode',
                inputs: [
                    { name: 'farm_pool_code', type: 'cell' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'installNewUserDataCode',
                inputs: [
                    { name: 'user_data_code', type: 'cell' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgradePools',
                inputs: [
                    { name: 'pools', type: 'address[]' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'updatePoolsUserDataCode',
                inputs: [
                    { name: 'pools', type: 'address[]' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'forceUpdateUserData',
                inputs: [
                    { name: 'pool', type: 'address' },
                    { name: 'user', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processUpgradePoolRequest',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processUpdatePoolUserDataRequest',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'deployFarmPool',
                inputs: [
                    { name: 'pool_owner', type: 'address' },
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128[]' }], name: 'reward_rounds', type: 'tuple[]' },
                    { name: 'tokenRoot', type: 'address' },
                    { name: 'rewardTokenRoot', type: 'address[]' },
                    { name: 'vestingPeriod', type: 'uint32' },
                    { name: 'vestingRatio', type: 'uint32' },
                    { name: 'withdrawAllLockPeriod', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onPoolDeploy',
                inputs: [
                    { name: 'pool_deploy_nonce', type: 'uint64' },
                    { name: 'pool_owner', type: 'address' },
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128[]' }], name: 'reward_rounds', type: 'tuple[]' },
                    { name: 'tokenRoot', type: 'address' },
                    { name: 'rewardTokenRoot', type: 'address[]' },
                    { name: 'vestingPeriod', type: 'uint32' },
                    { name: 'vestingRatio', type: 'uint32' },
                    { name: 'withdrawAllLockPeriod', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgrade',
                inputs: [
                    { name: 'new_code', type: 'cell' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'fabric_version',
                inputs: [
                ],
                outputs: [
                    { name: 'fabric_version', type: 'uint32' },
                ],
            },
            {
                name: 'farm_pool_version',
                inputs: [
                ],
                outputs: [
                    { name: 'farm_pool_version', type: 'uint32' },
                ],
            },
            {
                name: 'user_data_version',
                inputs: [
                ],
                outputs: [
                    { name: 'user_data_version', type: 'uint32' },
                ],
            },
            {
                name: 'pools_count',
                inputs: [
                ],
                outputs: [
                    { name: 'pools_count', type: 'uint64' },
                ],
            },
            {
                name: 'owner',
                inputs: [
                ],
                outputs: [
                    { name: 'owner', type: 'address' },
                ],
            },
            {
                name: 'FarmPoolUserDataCode',
                inputs: [
                ],
                outputs: [
                    { name: 'FarmPoolUserDataCode', type: 'cell' },
                ],
            },
            {
                name: 'FarmPoolCode',
                inputs: [
                ],
                outputs: [
                    { name: 'FarmPoolCode', type: 'cell' },
                ],
            },
            {
                name: 'PlatformCode',
                inputs: [
                ],
                outputs: [
                    { name: 'PlatformCode', type: 'cell' },
                ],
            },
            {
                name: 'nonce',
                inputs: [
                ],
                outputs: [
                    { name: 'nonce', type: 'uint128' },
                ],
            },
        ],
        data: [
            { key: 1, name: 'FarmPoolUserDataCode', type: 'cell' },
            { key: 2, name: 'FarmPoolCode', type: 'cell' },
            { key: 3, name: 'PlatformCode', type: 'cell' },
            { key: 4, name: 'nonce', type: 'uint128' },
        ],
        events: [
            {
                name: 'NewFarmPool',
                inputs: [
                    { name: 'pool', type: 'address' },
                    { name: 'pool_owner', type: 'address' },
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128[]' }], name: 'reward_rounds', type: 'tuple[]' },
                    { name: 'tokenRoot', type: 'address' },
                    { name: 'rewardTokenRoot', type: 'address[]' },
                    { name: 'vestingPeriod', type: 'uint32' },
                    { name: 'vestingRatio', type: 'uint32' },
                    { name: 'withdrawAllLockPeriod', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'FarmPoolCodeUpdated',
                inputs: [
                    { name: 'prev_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'UserDataCodeUpdated',
                inputs: [
                    { name: 'prev_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'FabricUpdated',
                inputs: [
                    { name: 'prev_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'NewOwner',
                inputs: [
                    { name: 'prev_owner', type: 'address' },
                    { name: 'new_owner', type: 'address' },
                ],
                outputs: [
                ],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'fabric_version', type: 'uint32' },
            { name: 'farm_pool_version', type: 'uint32' },
            { name: 'user_data_version', type: 'uint32' },
            { name: 'pools_count', type: 'uint64' },
            { name: 'owner', type: 'address' },
            { name: 'FarmPoolUserDataCode', type: 'cell' },
            { name: 'FarmPoolCode', type: 'cell' },
            { name: 'PlatformCode', type: 'cell' },
            { name: 'nonce', type: 'uint128' },
        ],
    } as const

    static Pool = {
        'ABI version': 2,
        version: '2.2',
        header: ['time', 'expire'],
        functions: [
            {
                name: 'constructor',
                inputs: [
                    { name: '_owner', type: 'address' },
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128[]' }], name: '_rewardRounds', type: 'tuple[]' },
                    { name: '_tokenRoot', type: 'address' },
                    { name: '_rewardTokenRoot', type: 'address[]' },
                    { name: '_vestingPeriod', type: 'uint32' },
                    { name: '_vestingRatio', type: 'uint32' },
                    { name: '_withdrawAllLockPeriod', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgrade',
                inputs: [
                    { name: 'new_code', type: 'cell' },
                    { name: 'new_version', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
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
                    { components: [{ name: 'lastRewardTime', type: 'uint32' }, { name: 'farmEndTime', type: 'uint32' }, { name: 'vestingPeriod', type: 'uint32' }, { name: 'vestingRatio', type: 'uint32' }, { name: 'tokenRoot', type: 'address' }, { name: 'tokenWallet', type: 'address' }, { name: 'tokenBalance', type: 'uint128' }, { components: [{ name: 'startTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128[]' }], name: 'rewardRounds', type: 'tuple[]' }, { name: 'accRewardPerShare', type: 'uint256[]' }, { name: 'rewardTokenRoot', type: 'address[]' }, { name: 'rewardTokenWallet', type: 'address[]' }, { name: 'rewardTokenBalance', type: 'uint128[]' }, { name: 'rewardTokenBalanceCumulative', type: 'uint128[]' }, { name: 'unclaimedReward', type: 'uint128[]' }, { name: 'owner', type: 'address' }, { name: 'fabric', type: 'address' }, { name: 'user_data_version', type: 'uint32' }, { name: 'pool_version', type: 'uint32' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'requestUpdateUserDataCode',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'requestUpgradePool',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'updateUserDataCode',
                inputs: [
                    { name: 'new_code', type: 'cell' },
                    { name: 'new_version', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'forceUpgradeUserData',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgradeUserData',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
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
                name: 'receiveTokenWalletAddress',
                inputs: [
                    { name: 'wallet', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'encodeDepositPayload',
                inputs: [
                    { name: 'deposit_owner', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                    { name: 'deposit_payload', type: 'cell' },
                ],
            },
            {
                name: 'decodeDepositPayload',
                inputs: [
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [
                    { name: 'deposit_owner', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                    { name: 'correct', type: 'bool' },
                ],
            },
            {
                name: 'onAcceptTokensTransfer',
                inputs: [
                    { name: 'tokenRoot', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'sender', type: 'address' },
                    { name: 'senderWallet', type: 'address' },
                    { name: 'remainingGasTo', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [
                ],
            },
            {
                name: 'finishDeposit',
                inputs: [
                    { name: '_deposit_nonce', type: 'uint64' },
                    { name: '_vested', type: 'uint128[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdraw',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdrawAll',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'claimReward',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'finishWithdraw',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: '_withdrawAmount', type: 'uint128' },
                    { name: '_vested', type: 'uint128[]' },
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdrawUnclaimed',
                inputs: [
                    { name: 'to', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdrawUnclaimedAll',
                inputs: [
                    { name: 'to', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'addRewardRound',
                inputs: [
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128[]' }], name: 'reward_round', type: 'tuple' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setEndTime',
                inputs: [
                    { name: 'farm_end_time', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'safeWithdraw',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'finishSafeWithdraw',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'send_gas_to', type: 'address' },
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
                    { name: '_accRewardPerShare', type: 'uint256[]' },
                    { name: '_unclaimedReward', type: 'uint128[]' },
                ],
            },
            {
                name: 'getUserDataAddress',
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
            { key: 2, name: 'userDataCode', type: 'cell' },
            { key: 3, name: 'fabric', type: 'address' },
            { key: 4, name: 'deploy_nonce', type: 'uint64' },
            { key: 5, name: 'user_data_version', type: 'uint32' },
            { key: 6, name: 'pool_version', type: 'uint32' },
        ],
        events: [
            {
                name: 'Deposit',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'reward', type: 'uint128[]' },
                    { name: 'reward_debt', type: 'uint128[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Withdraw',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'reward', type: 'uint128[]' },
                    { name: 'reward_debt', type: 'uint128[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Claim',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'reward', type: 'uint128[]' },
                    { name: 'reward_debt', type: 'uint128[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'RewardDeposit',
                inputs: [
                    { name: 'token_root', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'RewardRoundAdded',
                inputs: [
                    { components: [{ name: 'startTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128[]' }], name: 'reward_round', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'farmEndSet',
                inputs: [
                    { name: 'time', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'UserDataCodeUpdated',
                inputs: [
                    { name: 'prev_version', type: 'uint32' },
                    { name: 'new_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'PoolUpdated',
                inputs: [
                    { name: 'prev_version', type: 'uint32' },
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
            { name: 'withdrawAllLockPeriod', type: 'uint32' },
            { name: 'lastRewardTime', type: 'uint32' },
            { name: 'farmEndTime', type: 'uint32' },
            { name: 'vestingPeriod', type: 'uint32' },
            { name: 'vestingRatio', type: 'uint32' },
            { name: 'tokenRoot', type: 'address' },
            { name: 'tokenWallet', type: 'address' },
            { name: 'tokenBalance', type: 'uint128' },
            { components: [{ name: 'startTime', type: 'uint32' }, { name: 'rewardPerSecond', type: 'uint128[]' }], name: 'rewardRounds', type: 'tuple[]' },
            { name: 'accRewardPerShare', type: 'uint256[]' },
            { name: 'rewardTokenRoot', type: 'address[]' },
            { name: 'rewardTokenWallet', type: 'address[]' },
            { name: 'rewardTokenBalance', type: 'uint128[]' },
            { name: 'rewardTokenBalanceCumulative', type: 'uint128[]' },
            { name: 'unclaimedReward', type: 'uint128[]' },
            { name: 'owner', type: 'address' },
            { name: 'deposit_nonce', type: 'uint64' },
            { components: [{ name: 'user', type: 'address' }, { name: 'amount', type: 'uint128' }, { name: 'send_gas_to', type: 'address' }, { name: 'nonce', type: 'uint32' }], name: 'deposits', type: 'map(uint64,tuple)' },
            { name: 'platformCode', type: 'cell' },
            { name: 'userDataCode', type: 'cell' },
            { name: 'fabric', type: 'address' },
            { name: 'deploy_nonce', type: 'uint64' },
            { name: 'user_data_version', type: 'uint32' },
            { name: 'pool_version', type: 'uint32' },
        ],
    } as const

    static User = {
        'ABI version': 2,
        version: '2.2',
        header: ['time', 'expire'],
        functions: [
            {
                name: 'constructor',
                inputs: [
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
                    { components: [{ name: 'pool_debt', type: 'uint128[]' }, { name: 'entitled', type: 'uint128[]' }, { name: 'vestingTime', type: 'uint32[]' }, { name: 'amount', type: 'uint128' }, { name: 'rewardDebt', type: 'uint128[]' }, { name: 'farmPool', type: 'address' }, { name: 'user', type: 'address' }, { name: 'current_version', type: 'uint32' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'pendingReward',
                inputs: [
                    { name: '_accRewardPerShare', type: 'uint256[]' },
                    { name: 'poolLastRewardTime', type: 'uint32' },
                    { name: 'farmEndTime', type: 'uint32' },
                ],
                outputs: [
                    { name: '_entitled', type: 'uint128[]' },
                    { name: '_vested', type: 'uint128[]' },
                    { name: '_pool_debt', type: 'uint128[]' },
                    { name: '_vesting_time', type: 'uint32[]' },
                ],
            },
            {
                name: 'increasePoolDebt',
                inputs: [
                    { name: '_pool_debt', type: 'uint128[]' },
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'code_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processDeposit',
                inputs: [
                    { name: 'nonce', type: 'uint64' },
                    { name: '_amount', type: 'uint128' },
                    { name: '_accRewardPerShare', type: 'uint256[]' },
                    { name: 'poolLastRewardTime', type: 'uint32' },
                    { name: 'farmEndTime', type: 'uint32' },
                    { name: 'code_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processWithdraw',
                inputs: [
                    { name: '_amount', type: 'uint128' },
                    { name: '_accRewardPerShare', type: 'uint256[]' },
                    { name: 'poolLastRewardTime', type: 'uint32' },
                    { name: 'farmEndTime', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                    { name: 'code_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processWithdrawAll',
                inputs: [
                    { name: '_accRewardPerShare', type: 'uint256[]' },
                    { name: 'poolLastRewardTime', type: 'uint32' },
                    { name: 'farmEndTime', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                    { name: 'code_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processClaimReward',
                inputs: [
                    { name: '_accRewardPerShare', type: 'uint256[]' },
                    { name: 'poolLastRewardTime', type: 'uint32' },
                    { name: 'farmEndTime', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'nonce', type: 'uint32' },
                    { name: 'code_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'processSafeWithdraw',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'code_version', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgrade',
                inputs: [
                    { name: 'new_code', type: 'cell' },
                    { name: 'new_version', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
        ],
        data: [
        ],
        events: [
            {
                name: 'UserDataUpdated',
                inputs: [
                    { name: 'prev_version', type: 'uint32' },
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
            { name: 'current_version', type: 'uint32' },
            { name: 'platform_code', type: 'cell' },
            { name: 'lastRewardTime', type: 'uint32' },
            { name: 'vestingPeriod', type: 'uint32' },
            { name: 'vestingRatio', type: 'uint32' },
            { name: 'amount', type: 'uint128' },
            { name: 'vestingTime', type: 'uint32[]' },
            { name: 'rewardDebt', type: 'uint128[]' },
            { name: 'entitled', type: 'uint128[]' },
            { name: 'pool_debt', type: 'uint128[]' },
            { name: 'farmPool', type: 'address' },
            { name: 'user', type: 'address' },
        ],
    } as const

}
