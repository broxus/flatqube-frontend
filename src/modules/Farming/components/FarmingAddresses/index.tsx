import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { CopyToClipboard } from '@/components/common/CopyToClipboard'
import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { Placeholder } from '@/components/common/Placeholder'
import { useWallet } from '@/stores/WalletService'

function FarmingAddressesInner(): JSX.Element {
    const intl = useIntl()
    const wallet = useWallet()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()
    const rewardTokens = farmingData.rewardTokensAddress?.map(root => tokensCache.get(root))

    return (
        <div className="farming-panel">
            <h2 className="farming-panel__title">
                {intl.formatMessage({
                    id: 'FARMING_ADDRESSES_TITLE',
                })}
            </h2>
            <div className="farming-map">
                <div className="farming-map__item" key="pool-address">
                    <div className="farming-map__label">
                        {intl.formatMessage({
                            id: 'FARMING_ADDRESSES_POOL',
                        })}
                    </div>
                    <div className="farming-map__value">
                        {farmingData.poolAddress ? (
                            <>
                                <AccountExplorerLink address={farmingData.poolAddress} />
                                <CopyToClipboard text={farmingData.poolAddress} />
                            </>
                        ) : (
                            <Placeholder width={120} />
                        )}
                    </div>
                </div>

                <div className="farming-map__item" key="owner-address">
                    <div className="farming-map__label">
                        {intl.formatMessage({
                            id: 'FARMING_ADDRESSES_OWNER',
                        })}
                    </div>
                    <div className="farming-map__value">
                        {farmingData.poolOwnerAddress ? (
                            <>
                                <AccountExplorerLink address={farmingData.poolOwnerAddress} />
                                <CopyToClipboard text={farmingData.poolOwnerAddress} />
                            </>
                        ) : (
                            <Placeholder width={120} />
                        )}
                    </div>
                </div>

                {wallet.isConnected && (
                    <div className="farming-map__item" key="user-address">
                        <div className="farming-map__label">
                            {intl.formatMessage({
                                id: 'FARMING_ADDRESSES_USER',
                            })}
                        </div>
                        <div className="farming-map__value">
                            {farmingData.userPoolDataAddress ? (
                                <>
                                    <AccountExplorerLink address={farmingData.userPoolDataAddress} />
                                    <CopyToClipboard text={farmingData.userPoolDataAddress} />
                                </>
                            ) : (
                                <Placeholder width={120} />
                            )}
                        </div>
                    </div>
                )}

                <div className="farming-map__item" key="token-address">
                    <div className="farming-map__label">
                        {intl.formatMessage({
                            id: 'FARMING_ADDRESSES_TOKEN_ROOT',
                        })}
                    </div>
                    <div className="farming-map__value">
                        {farmingData.lpTokenAddress ? (
                            <>
                                <AccountExplorerLink address={farmingData.lpTokenAddress} />
                                <CopyToClipboard text={farmingData.lpTokenAddress} />
                            </>
                        ) : (
                            <Placeholder width={120} />
                        )}
                    </div>
                </div>

                {rewardTokens?.map(token => (
                    token && (
                        <div className="farming-map__item" key={token.root}>
                            <div className="farming-map__label">
                                {intl.formatMessage({
                                    id: 'FARMING_ADDRESSES_TOKEN',
                                }, {
                                    symbol: token.symbol,
                                })}
                            </div>
                            <div className="farming-map__value">
                                <AccountExplorerLink address={token.root} />
                                <CopyToClipboard text={token.root} />
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    )
}

export const FarmingAddresses = observer(FarmingAddressesInner)
