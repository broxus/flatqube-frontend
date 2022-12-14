export abstract class DexAbi {

    static Account = {
        'ABI version': 2,
        version: '2.2',
        header: ['pubkey', 'time', 'expire'],
        functions: [
            {
                name: 'constructor',
                inputs: [],
                outputs: [],
            },
            {
                name: 'resetGas',
                inputs: [
                    { name: 'receiver', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'getRoot',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'address' },
                ],
            },
            {
                name: 'getOwner',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'address' },
                ],
            },
            {
                name: 'getVersion',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'uint32' },
                ],
            },
            {
                name: 'getVault',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'address' },
                ],
            },
            {
                name: 'getWalletData',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'token_root', type: 'address' },
                ],
                outputs: [
                    { name: 'wallet', type: 'address' },
                    { name: 'balance', type: 'uint128' },
                ],
            },
            {
                name: 'getWallets',
                inputs: [],
                outputs: [
                    { name: 'value0', type: 'map(address,address)' },
                ],
            },
            {
                name: 'getBalances',
                inputs: [],
                outputs: [
                    { name: 'value0', type: 'map(address,uint128)' },
                ],
            },
            {
                name: 'onAcceptTokensTransfer',
                inputs: [
                    { name: 'token_root', type: 'address' },
                    { name: 'tokens_amount', type: 'uint128' },
                    { name: 'value2', type: 'address' },
                    { name: 'sender_wallet', type: 'address' },
                    { name: 'original_gas_to', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'withdraw',
                inputs: [
                    { name: 'call_id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'token_root', type: 'address' },
                    { name: 'recipient_address', type: 'address' },
                    { name: 'deploy_wallet_grams', type: 'uint128' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'transfer',
                inputs: [
                    { name: 'call_id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'token_root', type: 'address' },
                    { name: 'recipient', type: 'address' },
                    { name: 'willing_to_deploy', type: 'bool' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'internalAccountTransfer',
                inputs: [
                    { name: 'call_id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'token_root', type: 'address' },
                    { name: 'sender_owner', type: 'address' },
                    { name: 'willing_to_deploy', type: 'bool' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'internalPairTransfer',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'token_root', type: 'address' },
                    { name: 'sender_left_root', type: 'address' },
                    { name: 'sender_right_root', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'exchange',
                inputs: [
                    { name: 'call_id', type: 'uint64' },
                    { name: 'spent_amount', type: 'uint128' },
                    { name: 'spent_token_root', type: 'address' },
                    { name: 'receive_token_root', type: 'address' },
                    { name: 'expected_amount', type: 'uint128' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'depositLiquidity',
                inputs: [
                    { name: 'call_id', type: 'uint64' },
                    { name: 'left_root', type: 'address' },
                    { name: 'left_amount', type: 'uint128' },
                    { name: 'right_root', type: 'address' },
                    { name: 'right_amount', type: 'uint128' },
                    { name: 'expected_lp_root', type: 'address' },
                    { name: 'auto_change', type: 'bool' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'withdrawLiquidity',
                inputs: [
                    { name: 'call_id', type: 'uint64' },
                    { name: 'lp_amount', type: 'uint128' },
                    { name: 'lp_root', type: 'address' },
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'addPair',
                inputs: [
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'checkPairCallback',
                inputs: [
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                    { name: 'lp_root', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'onTokenWallet',
                inputs: [
                    { name: 'wallet', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'onVaultTokenWallet',
                inputs: [
                    { name: 'wallet', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'requestUpgrade',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'upgrade',
                inputs: [
                    { name: 'code', type: 'cell' },
                    { name: 'new_version', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'successCallback',
                inputs: [
                    { name: 'call_id', type: 'uint64' },
                ],
                outputs: [],
            },
            {
                name: 'platform_code',
                inputs: [],
                outputs: [
                    { name: 'platform_code', type: 'cell' },
                ],
            },
        ],
        data: [],
        events: [
            {
                name: 'AddPair',
                inputs: [
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                    { name: 'pair', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'WithdrawTokens',
                inputs: [
                    { name: 'root', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'balance', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'TransferTokens',
                inputs: [
                    { name: 'root', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'balance', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'ExchangeTokens',
                inputs: [
                    { name: 'from', type: 'address' },
                    { name: 'to', type: 'address' },
                    { name: 'spent_amount', type: 'uint128' },
                    { name: 'expected_amount', type: 'uint128' },
                    { name: 'balance', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'DepositLiquidity',
                inputs: [
                    { name: 'left_root', type: 'address' },
                    { name: 'left_amount', type: 'uint128' },
                    { name: 'right_root', type: 'address' },
                    { name: 'right_amount', type: 'uint128' },
                    { name: 'auto_change', type: 'bool' },
                ],
                outputs: [],
            },
            {
                name: 'WithdrawLiquidity',
                inputs: [
                    { name: 'lp_amount', type: 'uint128' },
                    { name: 'lp_balance', type: 'uint128' },
                    { name: 'lp_root', type: 'address' },
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'TokensReceived',
                inputs: [
                    { name: 'token_root', type: 'address' },
                    { name: 'tokens_amount', type: 'uint128' },
                    { name: 'balance', type: 'uint128' },
                    { name: 'sender_wallet', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'TokensReceivedFromAccount',
                inputs: [
                    { name: 'token_root', type: 'address' },
                    { name: 'tokens_amount', type: 'uint128' },
                    { name: 'balance', type: 'uint128' },
                    { name: 'sender', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'TokensReceivedFromPair',
                inputs: [
                    { name: 'token_root', type: 'address' },
                    { name: 'tokens_amount', type: 'uint128' },
                    { name: 'balance', type: 'uint128' },
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'OperationRollback',
                inputs: [
                    { name: 'token_root', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'balance', type: 'uint128' },
                    { name: 'from', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'ExpectedPairNotExist',
                inputs: [
                    { name: 'pair', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'AccountCodeUpgraded',
                inputs: [
                    { name: 'version', type: 'uint32' },
                ],
                outputs: [],
            },
            {
                name: 'CodeUpgradeRequested',
                inputs: [],
                outputs: [],
            },
            {
                name: 'GarbageCollected',
                inputs: [],
                outputs: [],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'root', type: 'address' },
            { name: 'vault', type: 'address' },
            { name: 'current_version', type: 'uint32' },
            { name: 'platform_code', type: 'cell' },
            { name: 'owner', type: 'address' },
            { name: '_wallets', type: 'map(address,address)' },
            { name: '_balances', type: 'map(address,uint128)' },
            {
                components: [{
                    components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }],
                    name: 'token_operations',
                    type: 'tuple[]',
                }, { name: 'send_gas_to', type: 'address' }, { name: 'expected_callback_sender', type: 'address' }],
                name: '_tmp_operations',
                type: 'map(uint64,tuple)',
            },
            { name: '_tmp_deploying_wallets', type: 'map(address,address)' },
            {
                components: [{ name: 'call_id', type: 'uint64' }, {
                    name: 'recipient_address',
                    type: 'address',
                }, { name: 'deploy_wallet_grams', type: 'uint128' }],
                name: '_tmp_withdrawals',
                type: 'map(address,tuple)',
            },
        ],
    } as const

    static Callbacks = {
        'ABI version': 2,
        header: ['time'],
        functions: [
            {
                name: 'dexAccountOnSuccess',
                inputs: [{ name: 'nonce', type: 'uint64' }],
                outputs: [],
            },
            {
                name: 'dexAccountOnBounce',
                inputs: [
                    { name: 'nonce', type: 'uint64' },
                    { name: 'functionId', type: 'uint32' },
                ],
                outputs: [],
            },
            {
                name: 'dexPairDepositLiquiditySuccess',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'via_account', type: 'bool' },
                    {
                        name: 'result',
                        components: [
                            { name: 'step_1_left_deposit', type: 'uint128' },
                            { name: 'step_1_right_deposit', type: 'uint128' },
                            { name: 'step_1_lp_reward', type: 'uint128' },
                            { name: 'step_2_left_to_right', type: 'bool' },
                            { name: 'step_2_right_to_left', type: 'bool' },
                            { name: 'step_2_spent', type: 'uint128' },
                            { name: 'step_2_fee', type: 'uint128' },
                            { name: 'step_2_received', type: 'uint128' },
                            { name: 'step_3_left_deposit', type: 'uint128' },
                            { name: 'step_3_right_deposit', type: 'uint128' },
                            { name: 'step_3_lp_reward', type: 'uint128' },
                        ],
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'dexPairDepositLiquiditySuccessV2',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'via_account', type: 'bool' },
                    {
                        name: 'result',
                        components: [
                            { name: 'old_balances', type: 'uint128[]' },
                            { name: 'amounts', type: 'uint128[]' },
                            { name: 'lp_reward', type: 'uint128' },
                            { name: 'result_balances', type: 'uint128[]' },
                            { name: 'invariant', type: 'uint128' },
                            { name: 'differences', type: 'uint128[]' },
                            { name: 'sell', type: 'bool[]' },
                            { name: 'pool_fees', type: 'uint128[]' },
                            { name: 'beneficiary_fees', type: 'uint128[]' },
                        ],
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'dexPairExchangeSuccess',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'via_account', type: 'bool' },
                    {
                        name: 'result',
                        components: [
                            { name: 'left_to_right', type: 'bool' },
                            { name: 'spent', type: 'uint128' },
                            { name: 'fee', type: 'uint128' },
                            { name: 'received', type: 'uint128' },
                        ],
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'dexPairWithdrawSuccess',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'via_account', type: 'bool' },
                    {
                        name: 'result',
                        components: [
                            { name: 'lp', type: 'uint128' },
                            { name: 'left', type: 'uint128' },
                            { name: 'right', type: 'uint128' },
                        ],
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'dexPairOperationCancelled',
                inputs: [{ name: 'id', type: 'uint64' }],
                outputs: [],
            },
            {
                name: 'onSwapEverToTip3Success',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'tokenRoot', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'onSwapEverToTip3Partial',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'tokenRoot', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'onSwapEverToTip3Cancel',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'onSwapTip3ToEverSuccess',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'onSwapTip3ToEverCancel',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'tokenRoot', type: 'address' },
                ],
                outputs: [],
            },
        ],
        data: [],
        events: [],
    } as const

    static Pair = {
        'ABI version': 2,
        version: '2.2',
        header: ['pubkey', 'time', 'expire'],
        functions: [
            {
                name: 'constructor',
                inputs: [
                ],
                outputs: [
                ],
            },
            {
                name: 'buildExchangePayload',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'deploy_wallet_grams', type: 'uint128' },
                    { name: 'expected_amount', type: 'uint128' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildExchangePayloadV2',
                inputs: [
                    { name: '_id', type: 'uint64' },
                    { name: '_deployWalletGrams', type: 'uint128' },
                    { name: '_expectedAmount', type: 'uint128' },
                    { name: '_recipient', type: 'address' },
                    { name: '_referrer', type: 'address' },
                    { name: '_successPayload', type: 'optional(cell)' },
                    { name: '_cancelPayload', type: 'optional(cell)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildDepositLiquidityPayload',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'deploy_wallet_grams', type: 'uint128' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildDepositLiquidityPayloadV2',
                inputs: [
                    { name: '_id', type: 'uint64' },
                    { name: '_deployWalletGrams', type: 'uint128' },
                    { name: '_expectedAmount', type: 'uint128' },
                    { name: '_recipient', type: 'address' },
                    { name: '_referrer', type: 'address' },
                    { name: '_successPayload', type: 'optional(cell)' },
                    { name: '_cancelPayload', type: 'optional(cell)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildWithdrawLiquidityPayload',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'deploy_wallet_grams', type: 'uint128' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildWithdrawLiquidityPayloadV2',
                inputs: [
                    { name: '_id', type: 'uint64' },
                    { name: '_deployWalletGrams', type: 'uint128' },
                    { name: '_expectedLeftAmount', type: 'uint128' },
                    { name: '_expectedRightAmount', type: 'uint128' },
                    { name: '_recipient', type: 'address' },
                    { name: '_referrer', type: 'address' },
                    { name: '_successPayload', type: 'optional(cell)' },
                    { name: '_cancelPayload', type: 'optional(cell)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildCrossPairExchangePayload',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'deploy_wallet_grams', type: 'uint128' },
                    { name: 'expected_amount', type: 'uint128' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: 'steps', type: 'tuple[]' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildCrossPairExchangePayloadV2',
                inputs: [
                    { name: '_id', type: 'uint64' },
                    { name: '_deployWalletGrams', type: 'uint128' },
                    { name: '_expectedAmount', type: 'uint128' },
                    { name: '_outcoming', type: 'address' },
                    { name: '_nextStepIndices', type: 'uint32[]' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'roots', type: 'address[]' }, { name: 'outcoming', type: 'address' }, { name: 'numerator', type: 'uint128' }, { name: 'nextStepIndices', type: 'uint32[]' }], name: '_steps', type: 'tuple[]' },
                    { name: '_recipient', type: 'address' },
                    { name: '_referrer', type: 'address' },
                    { name: '_successPayload', type: 'optional(cell)' },
                    { name: '_cancelPayload', type: 'optional(cell)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'expectedDepositLiquidity',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'left_amount', type: 'uint128' },
                    { name: 'right_amount', type: 'uint128' },
                    { name: 'auto_change', type: 'bool' },
                ],
                outputs: [
                    { components: [{ name: 'step_1_left_deposit', type: 'uint128' }, { name: 'step_1_right_deposit', type: 'uint128' }, { name: 'step_1_lp_reward', type: 'uint128' }, { name: 'step_2_left_to_right', type: 'bool' }, { name: 'step_2_right_to_left', type: 'bool' }, { name: 'step_2_spent', type: 'uint128' }, { name: 'step_2_fee', type: 'uint128' }, { name: 'step_2_received', type: 'uint128' }, { name: 'step_3_left_deposit', type: 'uint128' }, { name: 'step_3_right_deposit', type: 'uint128' }, { name: 'step_3_lp_reward', type: 'uint128' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'depositLiquidity',
                inputs: [
                    { name: '_callId', type: 'uint64' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_operations', type: 'tuple[]' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_expected', type: 'tuple' },
                    { name: '_autoChange', type: 'bool' },
                    { name: '_accountOwner', type: 'address' },
                    { name: 'value5', type: 'uint32' },
                    { name: '_remainingGasTo', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'expectedWithdrawLiquidity',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'lp_amount', type: 'uint128' },
                ],
                outputs: [
                    { name: 'expected_left_amount', type: 'uint128' },
                    { name: 'expected_right_amount', type: 'uint128' },
                ],
            },
            {
                name: 'withdrawLiquidity',
                inputs: [
                    { name: '_callId', type: 'uint64' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_operation', type: 'tuple' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: 'value2', type: 'tuple[]' },
                    { name: '_accountOwner', type: 'address' },
                    { name: 'value4', type: 'uint32' },
                    { name: '_remainingGasTo', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'expectedExchange',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'spent_token_root', type: 'address' },
                ],
                outputs: [
                    { name: 'expected_amount', type: 'uint128' },
                    { name: 'expected_fee', type: 'uint128' },
                ],
            },
            {
                name: 'expectedSpendAmount',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'receive_amount', type: 'uint128' },
                    { name: 'receive_token_root', type: 'address' },
                ],
                outputs: [
                    { name: 'expected_amount', type: 'uint128' },
                    { name: 'expected_fee', type: 'uint128' },
                ],
            },
            {
                name: 'exchange',
                inputs: [
                    { name: '_callId', type: 'uint64' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_operation', type: 'tuple' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_expected', type: 'tuple' },
                    { name: '_accountOwner', type: 'address' },
                    { name: 'value4', type: 'uint32' },
                    { name: '_remainingGasTo', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'crossPoolExchange',
                inputs: [
                    { name: '_id', type: 'uint64' },
                    { name: 'value1', type: 'uint32' },
                    { name: 'value2', type: 'uint8' },
                    { name: '_prevPoolTokenRoots', type: 'address[]' },
                    { name: '_op', type: 'uint8' },
                    { name: '_spentTokenRoot', type: 'address' },
                    { name: '_spentAmount', type: 'uint128' },
                    { name: '_senderAddress', type: 'address' },
                    { name: '_recipient', type: 'address' },
                    { name: '_remainingGasTo', type: 'address' },
                    { name: '_deployWalletGrams', type: 'uint128' },
                    { name: '_payload', type: 'cell' },
                    { name: '_notifySuccess', type: 'bool' },
                    { name: '_successPayload', type: 'cell' },
                    { name: '_notifyCancel', type: 'bool' },
                    { name: '_cancelPayload', type: 'cell' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onAcceptTokensTransfer',
                inputs: [
                    { name: '_tokenRoot', type: 'address' },
                    { name: '_tokensAmount', type: 'uint128' },
                    { name: '_senderAddress', type: 'address' },
                    { name: '_senderWallet', type: 'address' },
                    { name: '_remainingGasTo', type: 'address' },
                    { name: '_payload', type: 'cell' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getRoot',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'dex_root', type: 'address' },
                ],
            },
            {
                name: 'getTokenRoots',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'left', type: 'address' },
                    { name: 'right', type: 'address' },
                    { name: 'lp', type: 'address' },
                ],
            },
            {
                name: 'getTokenWallets',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'left', type: 'address' },
                    { name: 'right', type: 'address' },
                    { name: 'lp', type: 'address' },
                ],
            },
            {
                name: 'getVersion',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'version', type: 'uint32' },
                ],
            },
            {
                name: 'getPoolType',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'uint8' },
                ],
            },
            {
                name: 'getVault',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'dex_vault', type: 'address' },
                ],
            },
            {
                name: 'getVaultWallets',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'left', type: 'address' },
                    { name: 'right', type: 'address' },
                ],
            },
            {
                name: 'getFeeParams',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'denominator', type: 'uint128' }, { name: 'pool_numerator', type: 'uint128' }, { name: 'beneficiary_numerator', type: 'uint128' }, { name: 'referrer_numerator', type: 'uint128' }, { name: 'beneficiary', type: 'address' }, { name: 'threshold', type: 'map(address,uint128)' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'getAccumulatedFees',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'accumulatedFees', type: 'uint128[]' },
                ],
            },
            {
                name: 'isActive',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'bool' },
                ],
            },
            {
                name: 'getBalances',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'lp_supply', type: 'uint128' }, { name: 'left_balance', type: 'uint128' }, { name: 'right_balance', type: 'uint128' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'setFeeParams',
                inputs: [
                    { components: [{ name: 'denominator', type: 'uint128' }, { name: 'pool_numerator', type: 'uint128' }, { name: 'beneficiary_numerator', type: 'uint128' }, { name: 'referrer_numerator', type: 'uint128' }, { name: 'beneficiary', type: 'address' }, { name: 'threshold', type: 'map(address,uint128)' }], name: '_params', type: 'tuple' },
                    { name: '_remainingGasTo', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdrawBeneficiaryFee',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'checkPair',
                inputs: [
                    { name: '_accountOwner', type: 'address' },
                    { name: 'value1', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgrade',
                inputs: [
                    { name: '_code', type: 'cell' },
                    { name: '_newVersion', type: 'uint32' },
                    { name: '_newType', type: 'uint8' },
                    { name: '_remainingGasTo', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'liquidityTokenRootDeployed',
                inputs: [
                    { name: '_lpRootAddress', type: 'address' },
                    { name: '_remainingGasTo', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'liquidityTokenRootNotDeployed',
                inputs: [
                    { name: 'value0', type: 'address' },
                    { name: '_remainingGasTo', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onTokenWallet',
                inputs: [
                    { name: '_wallet', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onVaultTokenWallet',
                inputs: [
                    { name: '_wallet', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setOracleOptions',
                inputs: [
                    { components: [{ name: 'minInterval', type: 'uint8' }, { name: 'minRateDeltaNumerator', type: 'uint128' }, { name: 'minRateDeltaDenominator', type: 'uint128' }, { name: 'cardinality', type: 'uint16' }], name: '_newOptions', type: 'tuple' },
                    { name: '_remainingGasTo', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getOracleOptions',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'minInterval', type: 'uint8' }, { name: 'minRateDeltaNumerator', type: 'uint128' }, { name: 'minRateDeltaDenominator', type: 'uint128' }, { name: 'cardinality', type: 'uint16' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'removeLastNPoints',
                inputs: [
                    { name: '_count', type: 'uint16' },
                    { name: '_remainingGasTo', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getObservation',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: '_timestamp', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'timestamp', type: 'uint32' }, { name: 'price0To1Cumulative', type: 'uint256' }, { name: 'price1To0Cumulative', type: 'uint256' }], name: 'value0', type: 'optional(tuple)' },
                ],
            },
            {
                name: 'observation',
                inputs: [
                    { name: '_timestamp', type: 'uint32' },
                    { name: '_callbackTo', type: 'address' },
                    { name: '_payload', type: 'cell' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getRate',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: '_fromTimestamp', type: 'uint32' },
                    { name: '_toTimestamp', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'price0To1', type: 'uint256' }, { name: 'price1To0', type: 'uint256' }, { name: 'fromTimestamp', type: 'uint32' }, { name: 'toTimestamp', type: 'uint32' }], name: 'value0', type: 'optional(tuple)' },
                    { name: 'value1', type: 'uint128[]' },
                ],
            },
            {
                name: 'rate',
                inputs: [
                    { name: '_fromTimestamp', type: 'uint32' },
                    { name: '_toTimestamp', type: 'uint32' },
                    { name: '_callbackTo', type: 'address' },
                    { name: '_payload', type: 'cell' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getExpectedAmountByTWAP',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: '_amount', type: 'uint128' },
                    { name: '_tokenRoot', type: 'address' },
                    { name: '_fromTimestamp', type: 'uint32' },
                    { name: '_toTimestamp', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'uint128' },
                ],
            },
            {
                name: 'platform_code',
                inputs: [
                ],
                outputs: [
                    { name: 'platform_code', type: 'cell' },
                ],
            },
        ],
        data: [
        ],
        events: [
            {
                name: 'OracleInitialized',
                inputs: [
                    { components: [{ name: 'timestamp', type: 'uint32' }, { name: 'price0To1Cumulative', type: 'uint256' }, { name: 'price1To0Cumulative', type: 'uint256' }], name: 'value0', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'OracleUpdated',
                inputs: [
                    { components: [{ name: 'timestamp', type: 'uint32' }, { name: 'price0To1Cumulative', type: 'uint256' }, { name: 'price1To0Cumulative', type: 'uint256' }], name: 'value0', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'OracleOptionsUpdated',
                inputs: [
                    { components: [{ name: 'minInterval', type: 'uint8' }, { name: 'minRateDeltaNumerator', type: 'uint128' }, { name: 'minRateDeltaDenominator', type: 'uint128' }, { name: 'cardinality', type: 'uint16' }], name: 'value0', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'PairCodeUpgraded',
                inputs: [
                    { name: 'version', type: 'uint32' },
                    { name: 'pool_type', type: 'uint8' },
                ],
                outputs: [
                ],
            },
            {
                name: 'FeesParamsUpdated',
                inputs: [
                    { components: [{ name: 'denominator', type: 'uint128' }, { name: 'pool_numerator', type: 'uint128' }, { name: 'beneficiary_numerator', type: 'uint128' }, { name: 'referrer_numerator', type: 'uint128' }, { name: 'beneficiary', type: 'address' }, { name: 'threshold', type: 'map(address,uint128)' }], name: 'params', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'DepositLiquidity',
                inputs: [
                    { name: 'sender', type: 'address' },
                    { name: 'owner', type: 'address' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: 'tokens', type: 'tuple[]' },
                    { name: 'lp', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'WithdrawLiquidity',
                inputs: [
                    { name: 'sender', type: 'address' },
                    { name: 'owner', type: 'address' },
                    { name: 'lp', type: 'uint128' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: 'tokens', type: 'tuple[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Exchange',
                inputs: [
                    { name: 'sender', type: 'address' },
                    { name: 'recipient', type: 'address' },
                    { name: 'spentTokenRoot', type: 'address' },
                    { name: 'spentAmount', type: 'uint128' },
                    { name: 'receiveTokenRoot', type: 'address' },
                    { name: 'receiveAmount', type: 'uint128' },
                    { components: [{ name: 'feeTokenRoot', type: 'address' }, { name: 'pool_fee', type: 'uint128' }, { name: 'beneficiary_fee', type: 'uint128' }, { name: 'beneficiary', type: 'address' }], name: 'fees', type: 'tuple[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Sync',
                inputs: [
                    { name: 'reserves', type: 'uint128[]' },
                    { name: 'lp_supply', type: 'uint128' },
                ],
                outputs: [
                ],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'platform_code', type: 'cell' },
            { components: [{ name: 'price0To1Cumulative', type: 'uint256' }, { name: 'price1To0Cumulative', type: 'uint256' }], name: '_points', type: 'map(uint32,tuple)' },
            { name: '_length', type: 'uint16' },
            { components: [{ name: 'minInterval', type: 'uint8' }, { name: 'minRateDeltaNumerator', type: 'uint128' }, { name: 'minRateDeltaDenominator', type: 'uint128' }, { name: 'cardinality', type: 'uint16' }], name: '_options', type: 'tuple' },
            { name: '_root', type: 'address' },
            { name: '_active', type: 'bool' },
            { name: '_currentVersion', type: 'uint32' },
            { components: [{ name: 'denominator', type: 'uint128' }, { name: 'pool_numerator', type: 'uint128' }, { name: 'beneficiary_numerator', type: 'uint128' }, { name: 'referrer_numerator', type: 'uint128' }, { name: 'beneficiary', type: 'address' }, { name: 'threshold', type: 'map(address,uint128)' }], name: '_fee', type: 'tuple' },
            { name: '_typeToRootAddresses', type: 'map(uint8,address[])' },
            { name: '_typeToWalletAddresses', type: 'map(uint8,address[])' },
            { name: '_typeToReserves', type: 'map(uint8,uint128[])' },
        ],
    } as const

    static Root = {
        'ABI version': 2,
        version: '2.2',
        header: ['pubkey', 'time', 'expire'],
        functions: [
            {
                name: 'constructor',
                inputs: [
                    { name: 'initial_owner', type: 'address' },
                    { name: 'initial_vault', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'installPlatformOnce',
                inputs: [
                    { name: 'code', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'installOrUpdateAccountCode',
                inputs: [
                    { name: 'code', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'installOrUpdatePairCode',
                inputs: [
                    { name: 'code', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'getAccountVersion',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'uint32' },
                ],
            },
            {
                name: 'getPairVersion',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'uint32' },
                ],
            },
            {
                name: 'setVaultOnce',
                inputs: [
                    { name: 'new_vault', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'getVault',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'address' },
                ],
            },
            {
                name: 'setActive',
                inputs: [
                    { name: 'new_active', type: 'bool' },
                ],
                outputs: [],
            },
            {
                name: 'isActive',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'bool' },
                ],
            },
            {
                name: 'upgrade',
                inputs: [
                    { name: 'code', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'requestUpgradeAccount',
                inputs: [
                    { name: 'current_version', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                    { name: 'account_owner', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'forceUpgradeAccount',
                inputs: [
                    { name: 'account_owner', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'upgradePair',
                inputs: [
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'resetGas',
                inputs: [
                    { name: 'receiver', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'resetTargetGas',
                inputs: [
                    { name: 'target', type: 'address' },
                    { name: 'receiver', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'getOwner',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'dex_owner', type: 'address' },
                ],
            },
            {
                name: 'getPendingOwner',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'dex_pending_owner', type: 'address' },
                ],
            },
            {
                name: 'transferOwner',
                inputs: [
                    { name: 'new_owner', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'acceptOwner',
                inputs: [],
                outputs: [],
            },
            {
                name: 'getExpectedAccountAddress',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'account_owner', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'address' },
                ],
            },
            {
                name: 'getExpectedPairAddress',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'address' },
                ],
            },
            {
                name: 'deployAccount',
                inputs: [
                    { name: 'account_owner', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'deployPair',
                inputs: [
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'onPairCreated',
                inputs: [
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'platform_code',
                inputs: [],
                outputs: [
                    { name: 'platform_code', type: 'cell' },
                ],
            },
            {
                name: 'account_code',
                inputs: [],
                outputs: [
                    { name: 'account_code', type: 'cell' },
                ],
            },
            {
                name: 'pair_code',
                inputs: [],
                outputs: [
                    { name: 'pair_code', type: 'cell' },
                ],
            },
        ],
        data: [
            { key: 1, name: '_nonce', type: 'uint32' },
        ],
        events: [
            {
                name: 'AccountCodeUpgraded',
                inputs: [
                    { name: 'version', type: 'uint32' },
                ],
                outputs: [],
            },
            {
                name: 'PairCodeUpgraded',
                inputs: [
                    { name: 'version', type: 'uint32' },
                ],
                outputs: [],
            },
            {
                name: 'RootCodeUpgraded',
                inputs: [],
                outputs: [],
            },
            {
                name: 'ActiveUpdated',
                inputs: [
                    { name: 'new_active', type: 'bool' },
                ],
                outputs: [],
            },
            {
                name: 'RequestedPairUpgrade',
                inputs: [
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'RequestedForceAccountUpgrade',
                inputs: [
                    { name: 'account_owner', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'RequestedOwnerTransfer',
                inputs: [
                    { name: 'old_owner', type: 'address' },
                    { name: 'new_owner', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'OwnerTransferAccepted',
                inputs: [
                    { name: 'old_owner', type: 'address' },
                    { name: 'new_owner', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'NewPairCreated',
                inputs: [
                    { name: 'left_root', type: 'address' },
                    { name: 'right_root', type: 'address' },
                ],
                outputs: [],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: '_nonce', type: 'uint32' },
            { name: 'platform_code', type: 'cell' },
            { name: 'has_platform_code', type: 'bool' },
            { name: 'account_code', type: 'cell' },
            { name: 'account_version', type: 'uint32' },
            { name: 'pair_code', type: 'cell' },
            { name: 'pair_version', type: 'uint32' },
            { name: 'active', type: 'bool' },
            { name: 'owner', type: 'address' },
            { name: 'vault', type: 'address' },
            { name: 'pending_owner', type: 'address' },
        ],
    } as const

    static StablePair = {
        'ABI version': 2,
        version: '2.2',
        header: ['pubkey', 'time', 'expire'],
        functions: [
            {
                name: 'constructor',
                inputs: [
                ],
                outputs: [
                ],
            },
            {
                name: 'getRoot',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'dex_root', type: 'address' },
                ],
            },
            {
                name: 'getTokenRoots',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'left', type: 'address' },
                    { name: 'right', type: 'address' },
                    { name: 'lp', type: 'address' },
                ],
            },
            {
                name: 'getTokenWallets',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'left', type: 'address' },
                    { name: 'right', type: 'address' },
                    { name: 'lp', type: 'address' },
                ],
            },
            {
                name: 'getVersion',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'version', type: 'uint32' },
                ],
            },
            {
                name: 'getPoolType',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'uint8' },
                ],
            },
            {
                name: 'getVault',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'dex_vault', type: 'address' },
                ],
            },
            {
                name: 'getVaultWallets',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'left', type: 'address' },
                    { name: 'right', type: 'address' },
                ],
            },
            {
                name: 'getAccumulatedFees',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'accumulatedFees', type: 'uint128[]' },
                ],
            },
            {
                name: 'getFeeParams',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'denominator', type: 'uint128' }, { name: 'pool_numerator', type: 'uint128' }, { name: 'beneficiary_numerator', type: 'uint128' }, { name: 'referrer_numerator', type: 'uint128' }, { name: 'beneficiary', type: 'address' }, { name: 'threshold', type: 'map(address,uint128)' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'getAmplificationCoefficient',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'value', type: 'uint128' }, { name: 'precision', type: 'uint128' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'isActive',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'bool' },
                ],
            },
            {
                name: 'getBalances',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { components: [{ name: 'lp_supply', type: 'uint128' }, { name: 'left_balance', type: 'uint128' }, { name: 'right_balance', type: 'uint128' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'setAmplificationCoefficient',
                inputs: [
                    { components: [{ name: 'value', type: 'uint128' }, { name: 'precision', type: 'uint128' }], name: '_A', type: 'tuple' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'setFeeParams',
                inputs: [
                    { components: [{ name: 'denominator', type: 'uint128' }, { name: 'pool_numerator', type: 'uint128' }, { name: 'beneficiary_numerator', type: 'uint128' }, { name: 'referrer_numerator', type: 'uint128' }, { name: 'beneficiary', type: 'address' }, { name: 'threshold', type: 'map(address,uint128)' }], name: 'params', type: 'tuple' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'withdrawBeneficiaryFee',
                inputs: [
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'buildExchangePayload',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'deploy_wallet_grams', type: 'uint128' },
                    { name: 'expected_amount', type: 'uint128' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildExchangePayloadV2',
                inputs: [
                    { name: '_id', type: 'uint64' },
                    { name: '_deployWalletGrams', type: 'uint128' },
                    { name: '_expectedAmount', type: 'uint128' },
                    { name: '_recipient', type: 'address' },
                    { name: '_referrer', type: 'address' },
                    { name: '_successPayload', type: 'optional(cell)' },
                    { name: '_cancelPayload', type: 'optional(cell)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildDepositLiquidityPayload',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'deploy_wallet_grams', type: 'uint128' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildDepositLiquidityPayloadV2',
                inputs: [
                    { name: '_id', type: 'uint64' },
                    { name: '_deployWalletGrams', type: 'uint128' },
                    { name: '_expectedAmount', type: 'uint128' },
                    { name: '_recipient', type: 'address' },
                    { name: '_referrer', type: 'address' },
                    { name: '_successPayload', type: 'optional(cell)' },
                    { name: '_cancelPayload', type: 'optional(cell)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildWithdrawLiquidityPayload',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'deploy_wallet_grams', type: 'uint128' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildWithdrawLiquidityPayloadV2',
                inputs: [
                    { name: '_id', type: 'uint64' },
                    { name: '_deployWalletGrams', type: 'uint128' },
                    { name: '_expectedLeftAmount', type: 'uint128' },
                    { name: '_expectedRightAmount', type: 'uint128' },
                    { name: '_recipient', type: 'address' },
                    { name: '_referrer', type: 'address' },
                    { name: '_successPayload', type: 'optional(cell)' },
                    { name: '_cancelPayload', type: 'optional(cell)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildCrossPairExchangePayload',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'deploy_wallet_grams', type: 'uint128' },
                    { name: 'expected_amount', type: 'uint128' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: 'steps', type: 'tuple[]' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildCrossPairExchangePayloadV2',
                inputs: [
                    { name: '_id', type: 'uint64' },
                    { name: '_deployWalletGrams', type: 'uint128' },
                    { name: '_expectedAmount', type: 'uint128' },
                    { name: '_outcoming', type: 'address' },
                    { name: '_nextStepIndices', type: 'uint32[]' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'roots', type: 'address[]' }, { name: 'outcoming', type: 'address' }, { name: 'numerator', type: 'uint128' }, { name: 'nextStepIndices', type: 'uint32[]' }], name: '_steps', type: 'tuple[]' },
                    { name: '_recipient', type: 'address' },
                    { name: '_referrer', type: 'address' },
                    { name: '_successPayload', type: 'optional(cell)' },
                    { name: '_cancelPayload', type: 'optional(cell)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'onAcceptTokensTransfer',
                inputs: [
                    { name: 'token_root', type: 'address' },
                    { name: 'tokens_amount', type: 'uint128' },
                    { name: 'sender_address', type: 'address' },
                    { name: 'sender_wallet', type: 'address' },
                    { name: 'original_gas_to', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [
                ],
            },
            {
                name: 'expectedDepositLiquidityV2',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'amounts', type: 'uint128[]' },
                ],
                outputs: [
                    { components: [{ name: 'old_balances', type: 'uint128[]' }, { name: 'amounts', type: 'uint128[]' }, { name: 'lp_reward', type: 'uint128' }, { name: 'result_balances', type: 'uint128[]' }, { name: 'invariant', type: 'uint128' }, { name: 'differences', type: 'uint128[]' }, { name: 'sell', type: 'bool[]' }, { name: 'pool_fees', type: 'uint128[]' }, { name: 'beneficiary_fees', type: 'uint128[]' }], name: 'value0', type: 'tuple' },
                ],
            },
            {
                name: 'depositLiquidity',
                inputs: [
                    { name: 'call_id', type: 'uint64' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_operations', type: 'tuple[]' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_expected', type: 'tuple' },
                    { name: 'auto_change', type: 'bool' },
                    { name: 'account_owner', type: 'address' },
                    { name: 'value5', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'expectedWithdrawLiquidity',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'lp_amount', type: 'uint128' },
                ],
                outputs: [
                    { name: 'expected_left_amount', type: 'uint128' },
                    { name: 'expected_right_amount', type: 'uint128' },
                ],
            },
            {
                name: 'withdrawLiquidity',
                inputs: [
                    { name: 'call_id', type: 'uint64' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_operation', type: 'tuple' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_expected', type: 'tuple[]' },
                    { name: 'account_owner', type: 'address' },
                    { name: 'value4', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'expectedExchange',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'spent_token_root', type: 'address' },
                ],
                outputs: [
                    { name: 'expected_amount', type: 'uint128' },
                    { name: 'expected_fee', type: 'uint128' },
                ],
            },
            {
                name: 'expectedSpendAmount',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                    { name: 'receive_amount', type: 'uint128' },
                    { name: 'receive_token_root', type: 'address' },
                ],
                outputs: [
                    { name: 'expected_amount', type: 'uint128' },
                    { name: 'expected_fee', type: 'uint128' },
                ],
            },
            {
                name: 'exchange',
                inputs: [
                    { name: 'call_id', type: 'uint64' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_operation', type: 'tuple' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: '_expected', type: 'tuple' },
                    { name: 'account_owner', type: 'address' },
                    { name: 'value4', type: 'uint32' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'crossPoolExchange',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'value1', type: 'uint32' },
                    { name: 'value2', type: 'uint8' },
                    { name: 'prev_pool_token_roots', type: 'address[]' },
                    { name: 'op', type: 'uint8' },
                    { name: 'spent_token_root', type: 'address' },
                    { name: 'spent_amount', type: 'uint128' },
                    { name: 'sender_address', type: 'address' },
                    { name: 'recipient', type: 'address' },
                    { name: 'original_gas_to', type: 'address' },
                    { name: 'deploy_wallet_grams', type: 'uint128' },
                    { name: 'payload', type: 'cell' },
                    { name: 'notify_success', type: 'bool' },
                    { name: 'success_payload', type: 'cell' },
                    { name: 'notify_cancel', type: 'bool' },
                    { name: 'cancel_payload', type: 'cell' },
                ],
                outputs: [
                ],
            },
            {
                name: 'checkPair',
                inputs: [
                    { name: 'account_owner', type: 'address' },
                    { name: 'value1', type: 'uint32' },
                ],
                outputs: [
                ],
            },
            {
                name: 'upgrade',
                inputs: [
                    { name: 'code', type: 'cell' },
                    { name: 'new_version', type: 'uint32' },
                    { name: 'new_type', type: 'uint8' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onTokenWallet',
                inputs: [
                    { name: 'wallet', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onTokenDecimals',
                inputs: [
                    { name: '_decimals', type: 'uint8' },
                ],
                outputs: [
                ],
            },
            {
                name: 'onVaultTokenWallet',
                inputs: [
                    { name: 'wallet', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'liquidityTokenRootDeployed',
                inputs: [
                    { name: 'lp_root_', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'liquidityTokenRootNotDeployed',
                inputs: [
                    { name: 'value0', type: 'address' },
                    { name: 'send_gas_to', type: 'address' },
                ],
                outputs: [
                ],
            },
            {
                name: 'getVirtualPrice',
                inputs: [
                    { name: 'answerId', type: 'uint32' },
                ],
                outputs: [
                    { name: 'value0', type: 'optional(uint256)' },
                ],
            },
            {
                name: 'getPriceImpact',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'spent_token_root', type: 'address' },
                    { name: 'price_amount', type: 'uint128' },
                ],
                outputs: [
                    { name: 'value0', type: 'optional(uint256)' },
                ],
            },
            {
                name: 'platform_code',
                inputs: [
                ],
                outputs: [
                    { name: 'platform_code', type: 'cell' },
                ],
            },
        ],
        data: [
        ],
        events: [
            {
                name: 'AmplificationCoefficientUpdated',
                inputs: [
                    { components: [{ name: 'value', type: 'uint128' }, { name: 'precision', type: 'uint128' }], name: 'A', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'PairCodeUpgraded',
                inputs: [
                    { name: 'version', type: 'uint32' },
                    { name: 'pool_type', type: 'uint8' },
                ],
                outputs: [
                ],
            },
            {
                name: 'FeesParamsUpdated',
                inputs: [
                    { components: [{ name: 'denominator', type: 'uint128' }, { name: 'pool_numerator', type: 'uint128' }, { name: 'beneficiary_numerator', type: 'uint128' }, { name: 'referrer_numerator', type: 'uint128' }, { name: 'beneficiary', type: 'address' }, { name: 'threshold', type: 'map(address,uint128)' }], name: 'params', type: 'tuple' },
                ],
                outputs: [
                ],
            },
            {
                name: 'DepositLiquidity',
                inputs: [
                    { name: 'sender', type: 'address' },
                    { name: 'owner', type: 'address' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: 'tokens', type: 'tuple[]' },
                    { name: 'lp', type: 'uint128' },
                ],
                outputs: [
                ],
            },
            {
                name: 'WithdrawLiquidity',
                inputs: [
                    { name: 'sender', type: 'address' },
                    { name: 'owner', type: 'address' },
                    { name: 'lp', type: 'uint128' },
                    { components: [{ name: 'amount', type: 'uint128' }, { name: 'root', type: 'address' }], name: 'tokens', type: 'tuple[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Exchange',
                inputs: [
                    { name: 'sender', type: 'address' },
                    { name: 'recipient', type: 'address' },
                    { name: 'spentTokenRoot', type: 'address' },
                    { name: 'spentAmount', type: 'uint128' },
                    { name: 'receiveTokenRoot', type: 'address' },
                    { name: 'receiveAmount', type: 'uint128' },
                    { components: [{ name: 'feeTokenRoot', type: 'address' }, { name: 'pool_fee', type: 'uint128' }, { name: 'beneficiary_fee', type: 'uint128' }, { name: 'beneficiary', type: 'address' }], name: 'fees', type: 'tuple[]' },
                ],
                outputs: [
                ],
            },
            {
                name: 'Sync',
                inputs: [
                    { name: 'reserves', type: 'uint128[]' },
                    { name: 'lp_supply', type: 'uint128' },
                ],
                outputs: [
                ],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'platform_code', type: 'cell' },
            { name: 'root', type: 'address' },
            { name: 'vault', type: 'address' },
            { name: 'active', type: 'bool' },
            { name: 'current_version', type: 'uint32' },
            { components: [{ name: 'root', type: 'address' }, { name: 'wallet', type: 'address' }, { name: 'vaultWallet', type: 'address' }, { name: 'balance', type: 'uint128' }, { name: 'decimals', type: 'uint8' }, { name: 'accumulatedFee', type: 'uint128' }, { name: 'rate', type: 'uint256' }, { name: 'precisionMul', type: 'uint256' }, { name: 'decimalsLoaded', type: 'bool' }, { name: 'initialized', type: 'bool' }], name: 'tokenData', type: 'tuple[]' },
            { name: 'tokenIndex', type: 'map(address,uint8)' },
            { name: 'PRECISION', type: 'uint256' },
            { name: 'lp_root', type: 'address' },
            { name: 'lp_wallet', type: 'address' },
            { name: 'lp_supply', type: 'uint128' },
            { components: [{ name: 'denominator', type: 'uint128' }, { name: 'pool_numerator', type: 'uint128' }, { name: 'beneficiary_numerator', type: 'uint128' }, { name: 'referrer_numerator', type: 'uint128' }, { name: 'beneficiary', type: 'address' }, { name: 'threshold', type: 'map(address,uint128)' }], name: 'fee', type: 'tuple' },
            { components: [{ name: 'value', type: 'uint128' }, { name: 'precision', type: 'uint128' }], name: 'A', type: 'tuple' },
        ],
    } as const

}
