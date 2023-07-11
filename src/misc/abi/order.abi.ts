export abstract class OrderAbi {

    static Root = {
        'ABI version': 2,
        version: '2.2',
        header: [
            'pubkey',
            'time',
            'expire',
        ],
        functions: [
            {
                name: 'constructor',
                inputs: [],
                outputs: [],
            },
            {
                name: 'onTokenWallet',
                inputs: [
                    {
                        name: '_wallet',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onTokenWalletReceive',
                inputs: [
                    {
                        name: '_wallet',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onTokenWalletBeneficiary',
                inputs: [
                    {
                        name: '_wallet',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'getFeeParams',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        components: [
                            {
                                name: 'numerator',
                                type: 'uint128',
                            },
                            {
                                name: 'denominator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingNumerator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingDenominator',
                                type: 'uint128',
                            },
                            {
                                name: 'beneficiary',
                                type: 'address',
                            },
                        ],
                        name: 'params',
                        type: 'tuple',
                    },
                ],
            },
            {
                name: 'getVersion',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'uint32',
                    },
                ],
            },
            {
                name: 'getVersionOrder',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'uint32',
                    },
                ],
            },
            {
                name: 'getSpentToken',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'getSpentWallet',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'getFactory',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'getDeployer',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'getDex',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'expectedAddressOrder',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                    {
                        name: '_factory',
                        type: 'address',
                    },
                    {
                        name: '_root',
                        type: 'address',
                    },
                    {
                        name: '_owner',
                        type: 'address',
                    },
                    {
                        name: '_spentToken',
                        type: 'address',
                    },
                    {
                        name: '_receiveToken',
                        type: 'address',
                    },
                    {
                        name: 'timeTx',
                        type: 'uint64',
                    },
                    {
                        name: 'nowTx',
                        type: 'uint64',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'setFeeParams',
                inputs: [
                    {
                        components: [
                            {
                                name: 'numerator',
                                type: 'uint128',
                            },
                            {
                                name: 'denominator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingNumerator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingDenominator',
                                type: 'uint128',
                            },
                            {
                                name: 'beneficiary',
                                type: 'address',
                            },
                        ],
                        name: 'params',
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'buildPayload',
                inputs: [
                    {
                        name: 'callbackId',
                        type: 'uint64',
                    },
                    {
                        name: 'user',
                        type: 'address',
                    },
                    {
                        name: 'tokenReceive',
                        type: 'address',
                    },
                    {
                        name: 'expectedTokenAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'backPK',
                        type: 'uint256',
                    },
                    {
                        name: 'backMatchingPK',
                        type: 'uint256',
                    },
                    {
                        name: 'cancelPayload',
                        type: 'optional(cell)',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'cell',
                    },
                ],
            },
            {
                name: 'proxyTokensTransfer',
                inputs: [
                    {
                        name: '_tokenWallet',
                        type: 'address',
                    },
                    {
                        name: '_gasValue',
                        type: 'uint128',
                    },
                    {
                        name: '_amount',
                        type: 'uint128',
                    },
                    {
                        name: '_recipient',
                        type: 'address',
                    },
                    {
                        name: '_deployWalletValue',
                        type: 'uint128',
                    },
                    {
                        name: '_remainingGasTo',
                        type: 'address',
                    },
                    {
                        name: '_notify',
                        type: 'bool',
                    },
                    {
                        name: '_payload',
                        type: 'cell',
                    },
                ],
                outputs: [],
            },
            {
                name: 'sendGas',
                inputs: [
                    {
                        name: 'to',
                        type: 'address',
                    },
                    {
                        name: '_value',
                        type: 'uint128',
                    },
                    {
                        name: '_flag',
                        type: 'uint16',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onAcceptTokensTransfer',
                inputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                    {
                        name: 'amount',
                        type: 'uint128',
                    },
                    {
                        name: 'sender',
                        type: 'address',
                    },
                    {
                        name: 'value3',
                        type: 'address',
                    },
                    {
                        name: 'originalGasTo',
                        type: 'address',
                    },
                    {
                        name: 'payload',
                        type: 'cell',
                    },
                ],
                outputs: [],
            },
            {
                name: 'setOrderCode',
                inputs: [
                    {
                        name: '_code',
                        type: 'cell',
                    },
                    {
                        name: '_versionOrder',
                        type: 'uint32',
                    },
                ],
                outputs: [],
            },
            {
                name: 'upgrade',
                inputs: [
                    {
                        name: '_code',
                        type: 'cell',
                    },
                    {
                        name: '_newVersion',
                        type: 'uint32',
                    },
                    {
                        name: '_sendGasTo',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
        ],
        data: [],
        events: [
            {
                name: 'CreateOrder',
                inputs: [
                    {
                        name: 'order',
                        type: 'address',
                    },
                    {
                        name: 'owner',
                        type: 'address',
                    },
                    {
                        name: 'spentToken',
                        type: 'address',
                    },
                    {
                        name: 'spentAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'receiveToken',
                        type: 'address',
                    },
                    {
                        name: 'expectedAmount',
                        type: 'uint128',
                    },
                ],
                outputs: [],
            },
            {
                name: 'CreateOrderReject',
                inputs: [
                    {
                        name: 'errorCode',
                        type: 'uint16',
                    },
                ],
                outputs: [],
            },
            {
                name: 'OrderCodeUpgraded',
                inputs: [
                    {
                        name: 'oldVersion',
                        type: 'uint32',
                    },
                    {
                        name: 'newVersion',
                        type: 'uint32',
                    },
                ],
                outputs: [],
            },
            {
                name: 'OrderRootCodeUpgraded',
                inputs: [
                    {
                        name: 'newVersion',
                        type: 'uint32',
                    },
                ],
                outputs: [],
            },
        ],
        fields: [
            {
                name: '_pubkey',
                type: 'uint256',
            },
            {
                name: '_timestamp',
                type: 'uint64',
            },
            {
                name: '_constructorFlag',
                type: 'bool',
            },
            {
                name: 'factory',
                type: 'address',
            },
            {
                name: 'spentToken',
                type: 'address',
            },
            {
                name: 'version',
                type: 'uint32',
            },
            {
                name: 'versionOrder',
                type: 'uint32',
            },
            {
                name: 'orderCode',
                type: 'cell',
            },
            {
                name: 'orderPlatformCode',
                type: 'cell',
            },
            {
                name: 'spentTokenWallet',
                type: 'address',
            },
            {
                name: 'deployer',
                type: 'address',
            },
            {
                name: 'dexRoot',
                type: 'address',
            },
            {
                components: [
                    {
                        name: 'numerator',
                        type: 'uint128',
                    },
                    {
                        name: 'denominator',
                        type: 'uint128',
                    },
                    {
                        name: 'matchingNumerator',
                        type: 'uint128',
                    },
                    {
                        name: 'matchingDenominator',
                        type: 'uint128',
                    },
                    {
                        name: 'beneficiary',
                        type: 'address',
                    },
                ],
                name: 'fee',
                type: 'tuple',
            },
        ],
    } as const

    static Factory = {
        'ABI version': 2,
        version: '2.2',
        header: [
            'pubkey',
            'time',
            'expire',
        ],
        functions: [
            {
                name: 'constructor',
                inputs: [
                    {
                        name: '_owner',
                        type: 'address',
                    },
                    {
                        name: '_version',
                        type: 'uint32',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onOrderRootDeployedCallback',
                inputs: [
                    {
                        name: '_orderRoot',
                        type: 'address',
                    },
                    {
                        name: 'token',
                        type: 'address',
                    },
                    {
                        name: 'sendGasTo',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'transferOwner',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                    {
                        name: 'newOwner',
                        type: 'address',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'acceptOwner',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'getOwner',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'getPendingOwner',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'getVersion',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'uint32',
                    },
                ],
            },
            {
                name: 'getVersionRoot',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'uint32',
                    },
                ],
            },
            {
                name: 'getVersionOrder',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'uint32',
                    },
                ],
            },
            {
                name: 'getFeeParams',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        components: [
                            {
                                name: 'numerator',
                                type: 'uint128',
                            },
                            {
                                name: 'denominator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingNumerator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingDenominator',
                                type: 'uint128',
                            },
                            {
                                name: 'beneficiary',
                                type: 'address',
                            },
                        ],
                        name: 'value0',
                        type: 'tuple',
                    },
                ],
            },
            {
                name: 'getExpectedAddressOrderRoot',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                    {
                        name: 'token',
                        type: 'address',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                ],
            },
            {
                name: 'setEmergency',
                inputs: [
                    {
                        name: 'enabled',
                        type: 'bool',
                    },
                    {
                        name: 'orderAddress',
                        type: 'address',
                    },
                    {
                        name: 'manager',
                        type: 'uint256',
                    },
                ],
                outputs: [],
            },
            {
                name: 'setPlatformRootOrderCodeOnce',
                inputs: [
                    {
                        name: '_orderRootPlatform',
                        type: 'cell',
                    },
                ],
                outputs: [],
            },
            {
                name: 'setPlatformOrderCodeOnce',
                inputs: [
                    {
                        name: '_orderPlatform',
                        type: 'cell',
                    },
                ],
                outputs: [],
            },
            {
                name: 'setFeeParams',
                inputs: [
                    {
                        components: [
                            {
                                name: 'numerator',
                                type: 'uint128',
                            },
                            {
                                name: 'denominator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingNumerator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingDenominator',
                                type: 'uint128',
                            },
                            {
                                name: 'beneficiary',
                                type: 'address',
                            },
                        ],
                        name: 'params',
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'proxyRootTokensTransfer',
                inputs: [
                    {
                        name: 'root',
                        type: 'address',
                    },
                    {
                        name: '_tokenWallet',
                        type: 'address',
                    },
                    {
                        name: '_gasValue',
                        type: 'uint128',
                    },
                    {
                        name: '_amount',
                        type: 'uint128',
                    },
                    {
                        name: '_recipient',
                        type: 'address',
                    },
                    {
                        name: '_deployWalletValue',
                        type: 'uint128',
                    },
                    {
                        name: '_remainingGasTo',
                        type: 'address',
                    },
                    {
                        name: '_notify',
                        type: 'bool',
                    },
                    {
                        name: '_payload',
                        type: 'cell',
                    },
                ],
                outputs: [],
            },
            {
                name: 'sendGasRoot',
                inputs: [
                    {
                        name: 'root',
                        type: 'address',
                    },
                    {
                        name: 'to',
                        type: 'address',
                    },
                    {
                        name: '_value',
                        type: 'uint128',
                    },
                    {
                        name: '_flag',
                        type: 'uint16',
                    },
                ],
                outputs: [],
            },
            {
                name: 'setRootFeeParams',
                inputs: [
                    {
                        components: [
                            {
                                name: 'numerator',
                                type: 'uint128',
                            },
                            {
                                name: 'denominator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingNumerator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingDenominator',
                                type: 'uint128',
                            },
                            {
                                name: 'beneficiary',
                                type: 'address',
                            },
                        ],
                        name: 'params',
                        type: 'tuple',
                    },
                    {
                        name: 'roots',
                        type: 'address[]',
                    },
                ],
                outputs: [],
            },
            {
                name: 'setOrderFeeParams',
                inputs: [
                    {
                        components: [
                            {
                                name: 'numerator',
                                type: 'uint128',
                            },
                            {
                                name: 'denominator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingNumerator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingDenominator',
                                type: 'uint128',
                            },
                            {
                                name: 'beneficiary',
                                type: 'address',
                            },
                        ],
                        name: 'params',
                        type: 'tuple',
                    },
                    {
                        name: 'orders',
                        type: 'address[]',
                    },
                ],
                outputs: [],
            },
            {
                name: 'setOrderRootCode',
                inputs: [
                    {
                        name: '_orderRootCode',
                        type: 'cell',
                    },
                ],
                outputs: [],
            },
            {
                name: 'setOrderCode',
                inputs: [
                    {
                        name: '_orderCode',
                        type: 'cell',
                    },
                ],
                outputs: [],
            },
            {
                name: 'upgradeOrderRoot',
                inputs: [
                    {
                        name: 'listOrderRoots',
                        type: 'address[]',
                    },
                ],
                outputs: [],
            },
            {
                name: 'upgradeOrderCodeInOrderRoot',
                inputs: [
                    {
                        name: 'listOrderRoots',
                        type: 'address[]',
                    },
                ],
                outputs: [],
            },
            {
                name: 'upgradeOrder',
                inputs: [
                    {
                        name: 'listOrders',
                        type: 'address[]',
                    },
                ],
                outputs: [],
            },
            {
                name: 'withdrawFee',
                inputs: [
                    {
                        name: 'amount',
                        type: 'uint128',
                    },
                    {
                        name: 'recipient',
                        type: 'address',
                    },
                    {
                        name: 'deployWalletValue',
                        type: 'uint128',
                    },
                    {
                        name: 'tokenWallet',
                        type: 'address',
                    },
                    {
                        name: 'sendGasTo',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'createOrderRoot',
                inputs: [
                    {
                        name: 'token',
                        type: 'address',
                    },
                    {
                        name: 'callbackId',
                        type: 'uint64',
                    },
                ],
                outputs: [],
            },
            {
                name: 'upgrade',
                inputs: [
                    {
                        name: 'newCode',
                        type: 'cell',
                    },
                    {
                        name: 'newVersion',
                        type: 'uint32',
                    },
                    {
                        name: 'sendGasTo',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
        ],
        data: [
            {
                key: 1,
                name: 'randomNonce',
                type: 'uint32',
            },
            {
                key: 2,
                name: 'dexRoot',
                type: 'address',
            },
        ],
        events: [
            {
                name: 'RequestedOwnerTransfer',
                inputs: [
                    {
                        name: 'oldOwner',
                        type: 'address',
                    },
                    {
                        name: 'newOwner',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'OwnerTransferAccepted',
                inputs: [
                    {
                        name: 'oldOwner',
                        type: 'address',
                    },
                    {
                        name: 'newOwner',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'OrderFactoryUpgrade',
                inputs: [
                    {
                        name: 'oldVersion',
                        type: 'uint32',
                    },
                    {
                        name: 'newVersion',
                        type: 'uint32',
                    },
                ],
                outputs: [],
            },
            {
                name: 'OrderFeesParamsUpdated',
                inputs: [
                    {
                        components: [
                            {
                                name: 'numerator',
                                type: 'uint128',
                            },
                            {
                                name: 'denominator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingNumerator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingDenominator',
                                type: 'uint128',
                            },
                            {
                                name: 'beneficiary',
                                type: 'address',
                            },
                        ],
                        name: 'params',
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'PlatformOrderRootCodeUpgraded',
                inputs: [],
                outputs: [],
            },
            {
                name: 'PlatformOrderCodeUpgraded',
                inputs: [],
                outputs: [],
            },
            {
                name: 'OrderRootCodeUpgraded',
                inputs: [
                    {
                        name: 'oldVersion',
                        type: 'uint32',
                    },
                    {
                        name: 'newVersion',
                        type: 'uint32',
                    },
                ],
                outputs: [],
            },
            {
                name: 'OrderCodeUpgraded',
                inputs: [
                    {
                        name: 'oldVersion',
                        type: 'uint32',
                    },
                    {
                        name: 'newVersion',
                        type: 'uint32',
                    },
                ],
                outputs: [],
            },
            {
                name: 'CreateOrderRoot',
                inputs: [
                    {
                        name: 'order',
                        type: 'address',
                    },
                    {
                        name: 'token',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'CreateOrderRootReject',
                inputs: [
                    {
                        name: 'token',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
        ],
        fields: [
            {
                name: '_pubkey',
                type: 'uint256',
            },
            {
                name: '_timestamp',
                type: 'uint64',
            },
            {
                name: '_constructorFlag',
                type: 'bool',
            },
            {
                name: 'randomNonce',
                type: 'uint32',
            },
            {
                name: 'dexRoot',
                type: 'address',
            },
            {
                name: 'version',
                type: 'uint32',
            },
            {
                name: 'versionOrderRoot',
                type: 'uint32',
            },
            {
                name: 'versionOrder',
                type: 'uint32',
            },
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'pendingOwner',
                type: 'address',
            },
            {
                components: [
                    {
                        name: 'numerator',
                        type: 'uint128',
                    },
                    {
                        name: 'denominator',
                        type: 'uint128',
                    },
                    {
                        name: 'matchingNumerator',
                        type: 'uint128',
                    },
                    {
                        name: 'matchingDenominator',
                        type: 'uint128',
                    },
                    {
                        name: 'beneficiary',
                        type: 'address',
                    },
                ],
                name: 'fee',
                type: 'tuple',
            },
            {
                name: 'orderRootCode',
                type: 'cell',
            },
            {
                name: 'orderRootPlatformCode',
                type: 'cell',
            },
            {
                name: 'orderCode',
                type: 'cell',
            },
            {
                name: 'orderPlatformCode',
                type: 'cell',
            },
        ],
    } as const

    static Order = {
        'ABI version': 2,
        version: '2.2',
        header: [
            'pubkey',
            'time',
            'expire',
        ],
        functions: [
            {
                name: 'constructor',
                inputs: [],
                outputs: [],
            },
            {
                name: 'onTokenWalletReceive',
                inputs: [
                    {
                        name: '_wallet',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onDexPair',
                inputs: [
                    {
                        name: '_dexPair',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onDexPairTokenRoots',
                inputs: [
                    {
                        name: 'value0',
                        type: 'address',
                    },
                    {
                        name: 'value1',
                        type: 'address',
                    },
                    {
                        name: 'value2',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onSpentWallet',
                inputs: [
                    {
                        name: '_wallet',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onReceiveWallet',
                inputs: [
                    {
                        name: '_wallet',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'buildPayload',
                inputs: [
                    {
                        name: 'callbackId',
                        type: 'uint64',
                    },
                    {
                        name: 'deployWalletValue',
                        type: 'uint128',
                    },
                    {
                        name: 'recipient',
                        type: 'address',
                    },
                    {
                        name: 'successPayload',
                        type: 'optional(cell)',
                    },
                    {
                        name: 'cancelPayload',
                        type: 'optional(cell)',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'cell',
                    },
                ],
            },
            {
                name: 'currentStatus',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'uint8',
                    },
                ],
            },
            {
                name: 'getDetails',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        components: [
                            {
                                name: 'factory',
                                type: 'address',
                            },
                            {
                                name: 'root',
                                type: 'address',
                            },
                            {
                                name: 'owner',
                                type: 'address',
                            },
                            {
                                name: 'timeTx',
                                type: 'uint64',
                            },
                            {
                                name: 'nowTx',
                                type: 'uint64',
                            },
                            {
                                name: 'state',
                                type: 'uint8',
                            },
                            {
                                name: 'spentToken',
                                type: 'address',
                            },
                            {
                                name: 'receiveToken',
                                type: 'address',
                            },
                            {
                                name: 'spentWallet',
                                type: 'address',
                            },
                            {
                                name: 'receiveWallet',
                                type: 'address',
                            },
                            {
                                name: 'initialAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'expectedAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'currentAmountSpentToken',
                                type: 'uint128',
                            },
                            {
                                name: 'currentAmountReceiveToken',
                                type: 'uint128',
                            },
                            {
                                name: 'version',
                                type: 'uint32',
                            },
                            {
                                name: 'backPK',
                                type: 'uint256',
                            },
                            {
                                name: 'backMatchingPK',
                                type: 'uint256',
                            },
                            {
                                name: 'dexRoot',
                                type: 'address',
                            },
                            {
                                name: 'dexPair',
                                type: 'address',
                            },
                            {
                                name: 'msgSender',
                                type: 'address',
                            },
                            {
                                name: 'swapAttempt',
                                type: 'uint64',
                            },
                            {
                                name: 'matchingOrder',
                                type: 'address',
                            },
                        ],
                        name: 'value0',
                        type: 'tuple',
                    },
                ],
            },
            {
                name: 'getFeeParams',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                ],
                outputs: [
                    {
                        components: [
                            {
                                name: 'numerator',
                                type: 'uint128',
                            },
                            {
                                name: 'denominator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingNumerator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingDenominator',
                                type: 'uint128',
                            },
                            {
                                name: 'beneficiary',
                                type: 'address',
                            },
                        ],
                        name: 'params',
                        type: 'tuple',
                    },
                ],
            },
            {
                name: 'getExpectedSpentAmount',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                    {
                        name: 'amount',
                        type: 'uint128',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'uint128',
                    },
                    {
                        name: 'value1',
                        type: 'uint128',
                    },
                ],
            },
            {
                name: 'getExpectedReceiveAmount',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                    {
                        name: 'amount',
                        type: 'uint128',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'uint128',
                    },
                    {
                        name: 'value1',
                        type: 'uint128',
                    },
                ],
            },
            {
                name: 'getExpectedSpendAmountOfMatching',
                inputs: [
                    {
                        name: 'answerId',
                        type: 'uint32',
                    },
                    {
                        name: 'amount',
                        type: 'uint128',
                    },
                ],
                outputs: [
                    {
                        name: 'value0',
                        type: 'uint128',
                    },
                    {
                        name: 'value1',
                        type: 'uint128',
                    },
                ],
            },
            {
                name: 'setFeeParams',
                inputs: [
                    {
                        components: [
                            {
                                name: 'numerator',
                                type: 'uint128',
                            },
                            {
                                name: 'denominator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingNumerator',
                                type: 'uint128',
                            },
                            {
                                name: 'matchingDenominator',
                                type: 'uint128',
                            },
                            {
                                name: 'beneficiary',
                                type: 'address',
                            },
                        ],
                        name: 'params',
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onAcceptTokensTransfer',
                inputs: [
                    {
                        name: 'tokenRoot',
                        type: 'address',
                    },
                    {
                        name: 'amount',
                        type: 'uint128',
                    },
                    {
                        name: 'sender',
                        type: 'address',
                    },
                    {
                        name: 'value3',
                        type: 'address',
                    },
                    {
                        name: 'originalGasTo',
                        type: 'address',
                    },
                    {
                        name: 'payload',
                        type: 'cell',
                    },
                ],
                outputs: [],
            },
            {
                name: 'cancel',
                inputs: [
                    {
                        name: 'callbackId',
                        type: 'uint64',
                    },
                ],
                outputs: [],
            },
            {
                name: 'backendSwap',
                inputs: [
                    {
                        name: 'callbackId',
                        type: 'uint64',
                    },
                ],
                outputs: [],
            },
            {
                name: 'swap',
                inputs: [
                    {
                        name: 'callbackId',
                        type: 'uint64',
                    },
                    {
                        name: 'deployWalletValue',
                        type: 'uint128',
                    },
                ],
                outputs: [],
            },
            {
                name: 'backendMatching',
                inputs: [
                    {
                        name: 'callbackId',
                        type: 'uint64',
                    },
                    {
                        name: 'limitOrder',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'matching',
                inputs: [
                    {
                        name: 'callbackId',
                        type: 'uint64',
                    },
                    {
                        name: 'deployWalletValue',
                        type: 'uint128',
                    },
                    {
                        name: '_orderRoot',
                        type: 'address',
                    },
                    {
                        name: '_owner',
                        type: 'address',
                    },
                    {
                        name: '_timeTx',
                        type: 'uint64',
                    },
                    {
                        name: '_nowTx',
                        type: 'uint64',
                    },
                ],
                outputs: [],
            },
            {
                name: 'matchingCheck',
                inputs: [
                    {
                        name: 'callbackId',
                        type: 'uint64',
                    },
                    {
                        name: 'deployWalletValue',
                        type: 'uint128',
                    },
                    {
                        components: [
                            {
                                name: 'factory',
                                type: 'address',
                            },
                            {
                                name: 'root',
                                type: 'address',
                            },
                            {
                                name: 'owner',
                                type: 'address',
                            },
                            {
                                name: 'timeTx',
                                type: 'uint64',
                            },
                            {
                                name: 'nowTx',
                                type: 'uint64',
                            },
                            {
                                name: 'state',
                                type: 'uint8',
                            },
                            {
                                name: 'spentToken',
                                type: 'address',
                            },
                            {
                                name: 'receiveToken',
                                type: 'address',
                            },
                            {
                                name: 'spentWallet',
                                type: 'address',
                            },
                            {
                                name: 'receiveWallet',
                                type: 'address',
                            },
                            {
                                name: 'initialAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'expectedAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'currentAmountSpentToken',
                                type: 'uint128',
                            },
                            {
                                name: 'currentAmountReceiveToken',
                                type: 'uint128',
                            },
                            {
                                name: 'version',
                                type: 'uint32',
                            },
                            {
                                name: 'backPK',
                                type: 'uint256',
                            },
                            {
                                name: 'backMatchingPK',
                                type: 'uint256',
                            },
                            {
                                name: 'dexRoot',
                                type: 'address',
                            },
                            {
                                name: 'dexPair',
                                type: 'address',
                            },
                            {
                                name: 'msgSender',
                                type: 'address',
                            },
                            {
                                name: 'swapAttempt',
                                type: 'uint64',
                            },
                            {
                                name: 'matchingOrder',
                                type: 'address',
                            },
                        ],
                        name: 'detailsLO',
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'matchingCancel',
                inputs: [],
                outputs: [],
            },
            {
                name: 'enableEmergency',
                inputs: [
                    {
                        name: '_emergencyManager',
                        type: 'uint256',
                    },
                ],
                outputs: [],
            },
            {
                name: 'disableEmergency',
                inputs: [],
                outputs: [],
            },
            {
                name: 'proxyTokensTransfer',
                inputs: [
                    {
                        name: '_tokenWallet',
                        type: 'address',
                    },
                    {
                        name: '_gasValue',
                        type: 'uint128',
                    },
                    {
                        name: '_amount',
                        type: 'uint128',
                    },
                    {
                        name: '_recipient',
                        type: 'address',
                    },
                    {
                        name: '_deployWalletValue',
                        type: 'uint128',
                    },
                    {
                        name: '_remainingGasTo',
                        type: 'address',
                    },
                    {
                        name: '_notify',
                        type: 'bool',
                    },
                    {
                        name: '_payload',
                        type: 'cell',
                    },
                ],
                outputs: [],
            },
            {
                name: 'sendGas',
                inputs: [
                    {
                        name: 'to',
                        type: 'address',
                    },
                    {
                        name: '_value',
                        type: 'uint128',
                    },
                    {
                        name: '_flag',
                        type: 'uint16',
                    },
                ],
                outputs: [],
            },
            {
                name: 'upgrade',
                inputs: [
                    {
                        name: '_code',
                        type: 'cell',
                    },
                    {
                        name: '_newVersion',
                        type: 'uint32',
                    },
                    {
                        name: '_sendGasTo',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
        ],
        data: [],
        events: [
            {
                name: 'StateChanged',
                inputs: [
                    {
                        name: 'from',
                        type: 'uint8',
                    },
                    {
                        name: 'to',
                        type: 'uint8',
                    },
                    {
                        components: [
                            {
                                name: 'factory',
                                type: 'address',
                            },
                            {
                                name: 'root',
                                type: 'address',
                            },
                            {
                                name: 'owner',
                                type: 'address',
                            },
                            {
                                name: 'timeTx',
                                type: 'uint64',
                            },
                            {
                                name: 'nowTx',
                                type: 'uint64',
                            },
                            {
                                name: 'state',
                                type: 'uint8',
                            },
                            {
                                name: 'spentToken',
                                type: 'address',
                            },
                            {
                                name: 'receiveToken',
                                type: 'address',
                            },
                            {
                                name: 'spentWallet',
                                type: 'address',
                            },
                            {
                                name: 'receiveWallet',
                                type: 'address',
                            },
                            {
                                name: 'initialAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'expectedAmount',
                                type: 'uint128',
                            },
                            {
                                name: 'currentAmountSpentToken',
                                type: 'uint128',
                            },
                            {
                                name: 'currentAmountReceiveToken',
                                type: 'uint128',
                            },
                            {
                                name: 'version',
                                type: 'uint32',
                            },
                            {
                                name: 'backPK',
                                type: 'uint256',
                            },
                            {
                                name: 'backMatchingPK',
                                type: 'uint256',
                            },
                            {
                                name: 'dexRoot',
                                type: 'address',
                            },
                            {
                                name: 'dexPair',
                                type: 'address',
                            },
                            {
                                name: 'msgSender',
                                type: 'address',
                            },
                            {
                                name: 'swapAttempt',
                                type: 'uint64',
                            },
                            {
                                name: 'matchingOrder',
                                type: 'address',
                            },
                        ],
                        name: 'value2',
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'PartExchange',
                inputs: [
                    {
                        name: 'spentToken',
                        type: 'address',
                    },
                    {
                        name: 'spentAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'receiveToken',
                        type: 'address',
                    },
                    {
                        name: 'receiveAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'currentSpentTokenAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'currentReceiveTokenAmount',
                        type: 'uint128',
                    },
                    {
                        name: 'fee',
                        type: 'uint128',
                    },
                    {
                        name: 'initiator',
                        type: 'address',
                    },
                ],
                outputs: [],
            },
            {
                name: 'OrderCodeUpgraded',
                inputs: [
                    {
                        name: 'oldVersion',
                        type: 'uint32',
                    },
                    {
                        name: 'newVersion',
                        type: 'uint32',
                    },
                ],
                outputs: [],
            },
        ],
        fields: [
            {
                name: '_pubkey',
                type: 'uint256',
            },
            {
                name: '_timestamp',
                type: 'uint64',
            },
            {
                name: '_constructorFlag',
                type: 'bool',
            },
            {
                name: 'factory',
                type: 'address',
            },
            {
                name: 'root',
                type: 'address',
            },
            {
                name: 'owner',
                type: 'address',
            },
            {
                name: 'spentToken',
                type: 'address',
            },
            {
                name: 'receiveToken',
                type: 'address',
            },
            {
                name: 'timeTx',
                type: 'uint64',
            },
            {
                name: 'nowTx',
                type: 'uint64',
            },
            {
                name: 'dexRoot',
                type: 'address',
            },
            {
                name: 'orderPlatformCode',
                type: 'cell',
            },
            {
                name: 'initialAmount',
                type: 'uint128',
            },
            {
                name: 'expectedAmount',
                type: 'uint128',
            },
            {
                name: 'currentAmountSpentToken',
                type: 'uint128',
            },
            {
                name: 'currentAmountReceiveToken',
                type: 'uint128',
            },
            {
                name: 'backPK',
                type: 'uint256',
            },
            {
                name: 'backMatchingPK',
                type: 'uint256',
            },
            {
                name: 'version',
                type: 'uint32',
            },
            {
                components: [
                    {
                        name: 'numerator',
                        type: 'uint128',
                    },
                    {
                        name: 'denominator',
                        type: 'uint128',
                    },
                    {
                        name: 'matchingNumerator',
                        type: 'uint128',
                    },
                    {
                        name: 'matchingDenominator',
                        type: 'uint128',
                    },
                    {
                        name: 'beneficiary',
                        type: 'address',
                    },
                ],
                name: 'fee',
                type: 'tuple',
            },
            {
                name: 'dexPair',
                type: 'address',
            },
            {
                name: 'spentWallet',
                type: 'address',
            },
            {
                name: 'receiveWallet',
                type: 'address',
            },
            {
                name: 'autoExchange',
                type: 'bool',
            },
            {
                name: 'state',
                type: 'uint8',
            },
            {
                name: 'swapAttempt',
                type: 'uint64',
            },
            {
                name: 'prevState',
                type: 'uint8',
            },
            {
                name: 'emergencyManager',
                type: 'uint256',
            },
            {
                name: 'matchingOrder',
                type: 'address',
            },
            {
                name: 'tmp_transactions',
                type: 'map(address,uint128)',
            },
        ],
    } as const

    static Callbacks = {
        'ABI version': 2,
        header: ['time'],
        functions: [
            {
                name: 'onOrderRootCreateSuccess',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    {
                        name: 'result',
                        components: [
                            { name: 'factory', type: 'address' },
                            { name: 'spentToken', type: 'address' },
                            { name: 'oldVersion', type: 'uint32' },
                            { name: 'newVersion', type: 'uint32' },
                            { name: 'deployer', type: 'address' },
                        ],
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onOrderRootCreateReject',
                inputs: [
                    { name: 'id', type: 'uint64' },
                ],
                outputs: [],
            },
            {
                name: 'onOrderCreateOrderSuccess',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'order', type: 'address' },
                ],
                outputs: [],
            },
            {
                name: 'onOrderCreateOrderReject',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'errorCode', type: 'uint16' },
                ],
                outputs: [],
            },
            {
                name: 'onOrderPartExchangeSuccess',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'owner', type: 'address' },
                    { name: 'fee', type: 'uint128' },
                    {
                        name: 'result',
                        components: [
                            { name: 'spentToken', type: 'address' },
                            { name: 'spentAmount', type: 'uint128' },
                            { name: 'receiveToken', type: 'address' },
                            { name: 'receiveAmount', type: 'uint128' },
                            { name: 'currentSpentTokenAmount', type: 'uint128' },
                            { name: 'currentReceiveTokenAmount', type: 'uint128' },
                        ],
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onOrderStateFilled',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    { name: 'owner', type: 'address' },
                    { name: 'fee', type: 'uint128' },
                    {
                        name: 'result',
                        components: [
                            { name: 'spentToken', type: 'address' },
                            { name: 'spentAmount', type: 'uint128' },
                            { name: 'receiveToken', type: 'address' },
                            { name: 'receiveAmount', type: 'uint128' },
                        ],
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onOrderStateCancelled',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    {
                        name: 'result',
                        components: [
                            { name: 'spentToken', type: 'address' },
                            { name: 'currentSpentTokenAmount', type: 'uint128' },
                        ],
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onOrderStateCancelledReject',
                inputs: [
                    { name: 'id', type: 'uint64' },
                ],
                outputs: [],
            },
            {
                name: 'onOrderReject',
                inputs: [
                    { name: 'id', type: 'uint64' },
                ],
                outputs: [],
            },
            {
                name: 'onOrderSwapSuccess',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    {
                        name: 'result',
                        components: [
                            { name: 'owner', type: 'address' },
                            { name: 'initiator', type: 'address' },
                            { name: 'reward', type: 'uint128' },
                        ],
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
            {
                name: 'onOrderSwapCancel',
                inputs: [
                    { name: 'id', type: 'uint64' },
                ],
                outputs: [],
            },
            {
                name: 'onMatchingCancel',
                inputs: [
                    { name: 'id', type: 'uint64' },
                ],
                outputs: [],
            },
            {
                name: 'onMatchingInProgress',
                inputs: [
                    { name: 'id', type: 'uint64' },
                    {
                        name: 'result',
                        components: [
                            { name: 'mainOrder', type: 'address' },
                            { name: 'alienOrder', type: 'address' },
                            { name: 'spentToken', type: 'address' },
                            { name: 'receiveToken', type: 'address' },
                            { name: 'spentAmount', type: 'uint128' },
                            { name: 'receiveAmount', type: 'uint128' },
                            { name: 'rewardInitiator', type: 'uint128' },
                        ],
                        type: 'tuple',
                    },
                ],
                outputs: [],
            },
        ],
        data: [],
        events: [],
    } as const

}
