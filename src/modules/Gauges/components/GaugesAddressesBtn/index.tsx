import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Icon } from '@/components/common/Icon'
import { GaugesDropdown } from '@/modules/Gauges/components/GaugesDropdown'
import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { CopyToClipboard } from '@/components/common/CopyToClipboard'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'

import styles from './index.module.scss'

function GaugesAddressesBtnInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)
    const userData = useContext(GaugesUserDataContext)

    return (
        <GaugesDropdown
            hideOnClickInside={false}
            width={370}
            content={(
                <div className={styles.items}>
                    {data.id && (
                        <div className={styles.item}>
                            {intl.formatMessage({
                                id: 'GAUGE_ADDRESSES_POOL',
                            })}
                            <div className={styles.address}>
                                <AccountExplorerLink address={data.id} />
                                <CopyToClipboard text={data.id} />
                            </div>
                        </div>
                    )}

                    {data.ownerAddress && (
                        <div className={styles.item}>
                            {intl.formatMessage({
                                id: 'GAUGE_ADDRESSES_OWNER',
                            })}
                            <div className={styles.address}>
                                <AccountExplorerLink address={data.ownerAddress} />
                                <CopyToClipboard text={data.ownerAddress} />
                            </div>
                        </div>
                    )}

                    {userData.address && (
                        <div className={styles.item}>
                            {intl.formatMessage({
                                id: 'GAUGE_ADDRESSES_USER',
                            })}
                            <div className={styles.address}>
                                <AccountExplorerLink address={userData.address} />
                                <CopyToClipboard text={userData.address} />
                            </div>
                        </div>
                    )}

                    {data.rootToken && (
                        <div className={styles.item}>
                            {intl.formatMessage({
                                id: 'GAUGE_ADDRESSES_TOKEN_ROOT',
                            })}
                            <div className={styles.address}>
                                <AccountExplorerLink address={data.rootToken.root} />
                                <CopyToClipboard text={data.rootToken.root} />
                            </div>
                        </div>
                    )}

                    {data.rewardsTokens?.map(token => (
                        <div className={styles.item} key={token.root}>
                            {intl.formatMessage({
                                id: 'GAUGE_ADDRESSES_TOKEN',
                            }, {
                                symbol: token.symbol,
                            })}
                            <div className={styles.address}>
                                <AccountExplorerLink address={token.root} />
                                <CopyToClipboard text={token.root} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        >
            <span className={styles.title}>
                <Icon
                    icon="externalLink"
                    className={styles.icon}
                />

                {intl.formatMessage({
                    id: 'GAUGE_ADDRESSES_TITLE',
                })}
            </span>
        </GaugesDropdown>
    )
}

export const GaugesAddressesBtn = observer(GaugesAddressesBtnInner)
