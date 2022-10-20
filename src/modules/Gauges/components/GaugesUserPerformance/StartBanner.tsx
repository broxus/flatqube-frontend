import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { StartBannerPlaceholder } from '@/modules/Gauges/components/GaugesUserPerformance/StartBannerPlaceholder'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { useContext } from '@/hooks/useContext'
import { appRoutes } from '@/routes'
import { formattedAmount } from '@/utils'

import styles from './index.module.scss'

function UserPerformanceStartBannerInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)


    if (data.rootToken && data.poolTokens && data.maxApr) {
        const [leftToken, rightToken] = data.poolTokens

        return (
            <div
                className={classNames(styles.startBanner, {
                    [styles.withIcons]: leftToken && rightToken,
                })}
            >
                {leftToken?.icon && rightToken?.icon && (
                    <div className={styles.bannerIcons}>
                        <img
                            alt=""
                            className={classNames(styles.icon, styles.first)}
                            src={rightToken.icon}
                        />
                        <img
                            alt=""
                            className={classNames(styles.icon, styles.second)}
                            src={rightToken.icon}
                        />
                        <img
                            alt=""
                            className={classNames(styles.icon, styles.third)}
                            src={rightToken.icon}
                        />
                        <img
                            alt=""
                            className={classNames(styles.icon, styles.fourth)}
                            src={leftToken.icon}
                        />
                        <img
                            alt=""
                            className={classNames(styles.icon, styles.fifth)}
                            src={leftToken.icon}
                        />
                        <img
                            alt=""
                            className={classNames(styles.icon, styles.six)}
                            src={leftToken.icon}
                        />
                    </div>
                )}

                <h3 className={styles.title}>
                    {intl.formatMessage({
                        id: leftToken && rightToken
                            ? 'GAUGE_START_BANNER_TITLE_LP'
                            : 'GAUGE_START_BANNER_TITLE_SINGLE',
                    }, {
                        apr: formattedAmount(data.maxApr).replaceAll(' ', '\u00a0'),
                    })}
                </h3>

                {leftToken && rightToken && (
                    <p className={styles.text}>
                        {intl.formatMessage({
                            id: 'GAUGE_START_BANNER_TEXT_LP',
                        }, {
                            left: leftToken.symbol,
                            right: rightToken.symbol,
                        })}
                    </p>
                )}

                <div className={styles.action}>
                    <Button
                        size="md"
                        type="primary"
                        href={leftToken && rightToken
                            ? appRoutes.poolCreate.makeUrl({
                                leftTokenRoot: leftToken.root,
                                rightTokenRoot: rightToken.root,
                            })
                            : appRoutes.swap.makeUrl({
                                leftTokenRoot: data.rootToken?.root,
                            })}
                    >
                        {intl.formatMessage({
                            id: leftToken && rightToken
                                ? 'GAUGE_GET_LP_TOKENS'
                                : 'GAUGE_GET_DEPOSIT_TOKENS',
                        })}
                    </Button>

                    <Button
                        size="md"
                        type="secondary"
                        href="https://broxus.medium.com/flatqube-dao-f20da95b9548"
                    >
                        {intl.formatMessage({
                            id: 'GAUGE_SEE_GUIDE',
                        })}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <StartBannerPlaceholder />
    )
}

export const UserPerformanceStartBanner = observer(UserPerformanceStartBannerInner)
