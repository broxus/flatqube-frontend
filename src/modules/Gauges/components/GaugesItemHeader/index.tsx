import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { GaugesFavoriteBtn } from '@/modules/Gauges/components/GaugesFavoriteBtn'
import { GaugesAddressesBtn } from '@/modules/Gauges/components/GaugesAddressesBtn'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { TokenIcon } from '@/components/common/TokenIcon'
import { Placeholder } from '@/components/common/Placeholder'
import { appRoutes } from '@/routes'
import { ItemHeaderStatus } from '@/modules/Gauges/components/GaugesItemHeader/Status'
import { MediaType, MediaTypeContext } from '@/context/MediaType'

import styles from './index.module.scss'

function GaugesItemHeaderInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)
    const mediaType = useContext(MediaTypeContext)

    if (data.rewardsTokens && data.poolTokens) {
        const [leftToken, rightToken] = data.poolTokens

        const tokenLinkBtn = (
            <Button
                className={styles.tokenLink}
                link={leftToken && rightToken
                    ? appRoutes.poolCreate.makeUrl({
                        leftTokenRoot: leftToken.root,
                        rightTokenRoot: rightToken.root,
                    })
                    : appRoutes.swap.makeUrl({
                        leftTokenRoot: data.rootToken?.root,
                    })}
                type="tertiary"
            >
                {intl.formatMessage({
                    id: leftToken && rightToken
                        ? 'GAUGE_GET_LP_TOKENS'
                        : 'GAUGE_GET_DEPOSIT_TOKENS',
                })}
            </Button>
        )

        return (
            <div className={styles.itemHeader}>
                <div className={styles.main}>
                    <div className={styles.route}>
                        <div className={styles.icons}>
                            {data.poolTokens.length > 1 ? (
                                data.poolTokens.map(token => (
                                    <TokenIcon
                                        key={token.root}
                                        className={styles.icon}
                                        address={token.root}
                                        icon={token.icon}
                                        size="small"
                                    />
                                ))
                            ) : (
                                <TokenIcon
                                    className={styles.icon}
                                    address={data.rootToken?.root}
                                    icon={data.rootToken?.icon}
                                    size="small"
                                />
                            )}
                        </div>

                        <svg
                            width="32" height="24" viewBox="0 0 32 24"
                            fill="none" xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M23 6L29 12M29 12L23 18M29 12H3" stroke="white" strokeOpacity="0.48"
                                strokeWidth="1.6"
                            />
                        </svg>

                        <div className={styles.icons}>
                            {data.rewardsTokens?.map(item => (
                                <TokenIcon
                                    key={item.root}
                                    className={styles.icon}
                                    address={item.root}
                                    icon={item.icon}
                                    size="small"
                                />
                            ))}
                        </div>
                    </div>

                    <h1 className={styles.title}>
                        {intl.formatMessage({
                            id: 'GAUGE_ITEM_TITLE',
                        }, {
                            symbol: data.poolTokens.length > 1
                                ? data.poolTokens.map(token => token.symbol).join('/')
                                : data.rootToken?.symbol,
                        })}
                    </h1>

                    {mediaType === MediaType.xl && (
                        <ItemHeaderStatus />
                    )}
                </div>

                <div className={styles.side}>
                    {mediaType !== MediaType.xl && (
                        <ItemHeaderStatus />
                    )}

                    <GaugesFavoriteBtn />

                    <GaugesAddressesBtn />

                    {mediaType !== MediaType.s && tokenLinkBtn}
                </div>

                {mediaType === MediaType.s && (
                    <div className={styles.footer}>
                        {tokenLinkBtn}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={styles.itemHeader}>
            <div className={styles.main}>
                <Placeholder width={24} circle />
                <h1 className={styles.title}>
                    <Placeholder width={250} />
                </h1>
            </div>
            <Placeholder width={180} height={36} />
        </div>
    )
}

export const GaugesItemHeader = observer(GaugesItemHeaderInner)
