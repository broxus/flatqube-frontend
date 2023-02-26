export abstract class EverAbi {

    static EverWeverToTipP3 = {
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
                name: 'onWeverWallet',
                inputs: [
                    { name: '_weverWallet', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'buildExchangePayload',
                inputs: [
                    { name: 'pair', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'deployWalletValue', type: 'uint128' },
                    { name: 'expectedAmount', type: 'uint128' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'referrer', type: 'address' },
                    { name: 'outcoming', type: 'optional(address)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildCrossPairExchangePayload',
                inputs: [
                    { name: 'pool', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'deployWalletValue', type: 'uint128' },
                    { name: 'expectedAmount', type: 'uint128' },
                    { name: 'outcoming', type: 'address' },
                    { name: 'nextStepIndices', type: 'uint32[]' },
                    {
                        components: [
                            { name: 'amount', type: 'uint128' }, {
                                name: 'pool',
                                type: 'address',
                            }, { name: 'outcoming', type: 'address' }, {
                                name: 'numerator',
                                type: 'uint128',
                            }, { name: 'nextStepIndices', type: 'uint32[]' },
                        ],
                        name: 'steps',
                        type: 'tuple[]',
                    },
                    { name: 'amount', type: 'uint128' },
                    { name: 'referrer', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'onAcceptTokensTransfer',
                inputs: [
                    { name: 'value0', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'sender', type: 'address' },
                    { name: 'value3', type: 'address' },
                    { name: 'user', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'onAcceptTokensBurn',
                inputs: [
                    { name: 'value0', type: 'uint128' },
                    { name: 'value1', type: 'address' },
                    { name: 'value2', type: 'address' },
                    { name: 'user', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'weverRoot',
                inputs: [],
                outputs: [
                    { name: 'weverRoot', type: 'address' },
                ],
            },
            {
                name: 'weverVault',
                inputs: [],
                outputs: [
                    { name: 'weverVault', type: 'address' },
                ],
            },
            {
                name: 'everToTip3',
                inputs: [],
                outputs: [
                    { name: 'everToTip3', type: 'address' },
                ],
            },
            {
                name: 'weverWallet',
                inputs: [],
                outputs: [
                    { name: 'weverWallet', type: 'address' },
                ],
            },
        ],
        data: [
            { key: 1, name: 'randomNonce_', type: 'uint32' },
            { key: 2, name: 'weverRoot', type: 'address' },
            { key: 3, name: 'weverVault', type: 'address' },
            { key: 4, name: 'everToTip3', type: 'address' },
        ],
        events: [],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'randomNonce_', type: 'uint32' },
            { name: 'weverRoot', type: 'address' },
            { name: 'weverVault', type: 'address' },
            { name: 'everToTip3', type: 'address' },
            { name: 'weverWallet', type: 'address' },
        ],
    } as const

    static EverToTip3 = {
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
                name: 'onWeverWallet',
                inputs: [
                    { name: '_weverWallet', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'buildExchangePayload',
                inputs: [
                    { name: 'pair', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'deployWalletValue', type: 'uint128' },
                    { name: 'expectedAmount', type: 'uint128' },
                    { name: 'referrer', type: 'address' },
                    { name: 'outcoming', type: 'optional(address)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildCrossPairExchangePayload',
                inputs: [
                    { name: 'pool', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'deployWalletValue', type: 'uint128' },
                    { name: 'expectedAmount', type: 'uint128' },
                    { name: 'outcoming', type: 'address' },
                    { name: 'nextStepIndices', type: 'uint32[]' },
                    {
                        components: [
                            { name: 'amount', type: 'uint128' },
                            {
                                name: 'pool',
                                type: 'address',
                            },
                            { name: 'outcoming', type: 'address' },
                            {
                                name: 'numerator',
                                type: 'uint128',
                            },
                            { name: 'nextStepIndices', type: 'uint32[]' },
                        ],
                        name: 'steps',
                        type: 'tuple[]',
                    },
                    { name: 'referrer', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'onAcceptTokensMint',
                inputs: [
                    { name: 'value0', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'user', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'onAcceptTokensTransfer',
                inputs: [
                    { name: 'tokenRoot', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'sender', type: 'address' },
                    { name: 'value3', type: 'address' },
                    { name: 'user', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'onAcceptTokensBurn',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'value1', type: 'address' },
                    { name: 'value2', type: 'address' },
                    { name: 'user', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'weverRoot',
                inputs: [],
                outputs: [
                    { name: 'weverRoot', type: 'address' },
                ],
            },
            {
                name: 'weverVault',
                inputs: [],
                outputs: [
                    { name: 'weverVault', type: 'address' },
                ],
            },
            {
                name: 'weverWallet',
                inputs: [],
                outputs: [
                    { name: 'weverWallet', type: 'address' },
                ],
            },
        ],
        data: [
            { key: 1, name: 'randomNonce_', type: 'uint32' },
            { key: 2, name: 'weverRoot', type: 'address' },
            { key: 3, name: 'weverVault', type: 'address' },
        ],
        events: [
            {
                name: 'SwapEverToTip3Start',
                inputs: [
                    { name: 'pair', type: 'address' },
                    { name: 'operationType', type: 'uint8' },
                    { name: 'id', type: 'uint64' },
                    { name: 'user', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'SwapEverToTip3Success',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'tokenRoot', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'SwapEverToTip3Partial',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'tokenRoot', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'SwapEverToTip3Cancel',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'SwapTip3EverSuccessTransfer',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'SwapTip3EverCancelTransfer',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'tokenRoot', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'SwapEverWeverToTip3Unwrap',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                ],
                outputs: [],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'randomNonce_', type: 'uint32' },
            { name: 'weverRoot', type: 'address' },
            { name: 'weverVault', type: 'address' },
            { name: 'weverWallet', type: 'address' },
        ],
    } as const

    static Tip3ToEver = {
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
                name: 'onWeverWallet',
                inputs: [
                    { name: '_weverWallet', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'buildExchangePayload',
                inputs: [
                    { name: 'pair', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'expectedAmount', type: 'uint128' },
                    { name: 'referrer', type: 'address' },
                    { name: 'outcoming', type: 'optional(address)' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'buildCrossPairExchangePayload',
                inputs: [
                    { name: 'pool', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'deployWalletValue', type: 'uint128' },
                    { name: 'expectedAmount', type: 'uint128' },
                    { name: 'outcoming', type: 'address' },
                    { name: 'nextStepIndices', type: 'uint32[]' },
                    {
                        components: [
                            { name: 'amount', type: 'uint128' },
                            { name: 'pool', type: 'address' },
                            { name: 'outcoming', type: 'address' },
                            { name: 'numerator', type: 'uint128' },
                            { name: 'nextStepIndices', type: 'uint32[]' },
                        ],
                        name: 'steps',
                        type: 'tuple[]',
                    },
                    { name: 'referrer', type: 'address' },
                ],
                outputs: [
                    { name: 'value0', type: 'cell' },
                ],
            },
            {
                name: 'onAcceptTokensTransfer',
                inputs: [
                    { name: 'tokenRoot', type: 'address' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'sender', type: 'address' },
                    { name: 'value3', type: 'address' },
                    { name: 'user', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'onAcceptTokensBurn',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                    { name: 'value1', type: 'address' },
                    { name: 'value2', type: 'address' },
                    { name: 'user', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [],
            },
            {
                name: 'weverRoot',
                inputs: [],
                outputs: [
                    { name: 'weverRoot', type: 'address' },
                ],
            },
            {
                name: 'weverVault',
                inputs: [],
                outputs: [
                    { name: 'weverVault', type: 'address' },
                ],
            },
            {
                name: 'weverWallet',
                inputs: [],
                outputs: [
                    { name: 'weverWallet', type: 'address' },
                ],
            },
        ],
        data: [
            { key: 1, name: 'randomNonce_', type: 'uint32' },
            { key: 2, name: 'weverRoot', type: 'address' },
            { key: 3, name: 'weverVault', type: 'address' },
        ],
        events: [
            {
                name: 'SwapEverToTip3Start',
                inputs: [
                    { name: 'pair', type: 'address' },
                    { name: 'operationType', type: 'uint8' },
                    { name: 'id', type: 'uint64' },
                    { name: 'user', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'SwapEverToTip3Success',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'tokenRoot', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'SwapEverToTip3Partial',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'tokenRoot', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'SwapEverToTip3Cancel',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'SwapTip3EverSuccessTransfer',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'SwapTip3EverCancelTransfer',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                    { name: 'amount', type: 'uint128' },
                    { name: 'tokenRoot', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'SwapEverWeverToTip3Unwrap',
                inputs: [
                    { name: 'user', type: 'address' },
                    { name: 'id', type: 'uint64' },
                ],
                outputs: [],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: 'randomNonce_', type: 'uint32' },
            { name: 'weverRoot', type: 'address' },
            { name: 'weverVault', type: 'address' },
            { name: 'weverWallet', type: 'address' },
        ],
    } as const

    static WeverVault = {
        'ABI version': 2,
        version: '2.2',
        header: ['pubkey', 'time', 'expire'],
        functions: [
            {
                name: 'constructor',
                inputs: [
                    { name: 'owner_', type: 'address' },
                    { name: 'root', type: 'address' },
                    { name: 'root_tunnel', type: 'address' },
                    { name: 'receive_safe_fee', type: 'uint128' },
                    { name: 'settings_deploy_wallet_grams', type: 'uint128' },
                    { name: 'initial_balance', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'receiveTokenWalletAddress',
                inputs: [
                    { name: 'wallet', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'drain',
                inputs: [
                    { name: 'receiver', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'setConfiguration',
                inputs: [
                    {
                        components: [
                            { name: 'root_tunnel', type: 'address' }, {
                                name: 'root',
                                type: 'address',
                            }, { name: 'receive_safe_fee', type: 'uint128' }, {
                                name: 'settings_deploy_wallet_grams',
                                type: 'uint128',
                            }, { name: 'initial_balance', type: 'uint128' },
                        ],
                        name: '_configuration',
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'withdraw',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'grant',
                inputs: [
                    { name: 'amount', type: 'uint128' },
                ],
                outputs: [],
            },
            {
                name: 'wrap',
                inputs: [
                    { name: 'tokens', type: 'uint128' },
                    { name: 'owner_address', type: 'address' },
                    { name: 'gas_back_address', type: 'address' },
                    { name: 'payload', type: 'cell' },
                ],
                outputs: [],
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
                outputs: [],
            },
            {
                name: 'transferOwnership',
                inputs: [
                    { name: 'newOwner', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'renounceOwnership',
                inputs: [],
                outputs: [],
            },
            {
                name: '_randomNonce',
                inputs: [],
                outputs: [
                    { name: '_randomNonce', type: 'uint256' },
                ],
            },
            {
                name: 'owner',
                inputs: [],
                outputs: [
                    { name: 'owner', type: 'address' },
                ],
            },
            {
                name: 'configuration',
                inputs: [],
                outputs: [
                    {
                        components: [
                            { name: 'root_tunnel', type: 'address' }, {
                                name: 'root',
                                type: 'address',
                            }, { name: 'receive_safe_fee', type: 'uint128' }, {
                                name: 'settings_deploy_wallet_grams',
                                type: 'uint128',
                            }, { name: 'initial_balance', type: 'uint128' },
                        ],
                        name: 'configuration',
                        type: 'tuple',
                    },
                ],
            },
            {
                name: 'token_wallet',
                inputs: [],
                outputs: [
                    { name: 'token_wallet', type: 'address' },
                ],
            },
            {
                name: 'total_wrapped',
                inputs: [],
                outputs: [
                    { name: 'total_wrapped', type: 'uint128' },
                ],
            },
        ],
        data: [
            { key: 1, name: '_randomNonce', type: 'uint256' },
        ],
        events: [
            {
                name: 'OwnershipTransferred',
                inputs: [
                    { name: 'previousOwner', type: 'address' },
                    { name: 'newOwner', type: 'address' },
                ],
                outputs: [],
            },
        ],
        fields: [
            { name: '_pubkey', type: 'uint256' },
            { name: '_timestamp', type: 'uint64' },
            { name: '_constructorFlag', type: 'bool' },
            { name: '_randomNonce', type: 'uint256' },
            { name: 'owner', type: 'address' },
            {
                components: [
                    { name: 'root_tunnel', type: 'address' }, {
                        name: 'root',
                        type: 'address',
                    }, { name: 'receive_safe_fee', type: 'uint128' }, {
                        name: 'settings_deploy_wallet_grams',
                        type: 'uint128',
                    }, { name: 'initial_balance', type: 'uint128' },
                ],
                name: 'configuration',
                type: 'tuple',
            },
            { name: 'token_wallet', type: 'address' },
            { name: 'total_wrapped', type: 'uint128' },
        ],
    } as const

}
