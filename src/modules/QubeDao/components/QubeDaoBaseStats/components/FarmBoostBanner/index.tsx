import * as React from 'react'
import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { appRoutes } from '@/routes'
import { formattedTokenAmount } from '@/utils'
import { Placeholder } from '@/components/common/Placeholder'

import styles from './index.module.scss'

function QubeDaoFarmBoostBannerInternal(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()

    switch (true) {
        case daoContext.isSyncingBalances || daoContext.isSyncingBalances === undefined:
            return (
                <div
                    className={classNames(
                        'card card--ghost card--flat card--xsmall',
                        styles.farm_boost_banner,
                        styles.farm_boost_banner_placeholder,
                    )}
                >
                    <div className="width-expand">
                        <div className="margin-vertical">
                            <p><Placeholder height={24} width={200} /></p>
                            <p><Placeholder height={24} width={140} /></p>
                        </div>
                        <Placeholder className="width-expand" height={44} />
                    </div>
                </div>
            )

        case new BigNumber(daoContext.userVeBalance ?? 0).gt(0):
            return (
                <div className={styles.farm_boost_banner__holder}>
                    <div className="card card--ghost card--flat card--xsmall">
                        <div className={styles.farm_boost_banner__suptitle}>
                            {intl.formatMessage({ id: 'QUBE_DAO_BASE_STATS_USER_VE_BALANCE_SUPHEADER' })}
                        </div>
                        <div className={styles.farm_boost_banner__lead}>
                            {`${formattedTokenAmount(daoContext.userVeBalance, daoContext.veDecimals)} ${daoContext.veSymbol}`}
                        </div>
                        <Button
                            className="margin-top width-expand"
                            link={appRoutes.daoBalance.makeUrl()}
                            type="secondary"
                        >
                            {intl.formatMessage({ id: 'QUBE_DAO_BASE_STATS_USER_VE_BALANCE_LINK_TEXT' })}
                        </Button>
                    </div>
                    {new BigNumber(daoContext.token?.balance ?? 0).gt(0) ? (
                        <div className={classNames('card card--ghost card--flat card--xsmall', styles.farm_boost_banner)}>
                            <div className="width-expand">
                                <div className={styles.farm_boost_banner__lead}>
                                    {intl.formatMessage(
                                        { id: 'QUBE_DAO_BASE_STATS_DEPOSIT_LEAD_HAS_BALANCE' },
                                        {
                                            symbol: daoContext.tokenSymbol,
                                            value: formattedTokenAmount(
                                                daoContext.token?.balance,
                                                daoContext.tokenDecimals,
                                            ),
                                        },
                                    )}
                                </div>
                                <Button
                                    className="margin-top width-expand"
                                    link={appRoutes.daoBalance.makeUrl()}
                                    type="primary"
                                >
                                    {intl.formatMessage({ id: 'QUBE_DAO_BASE_STATS_INCREASE_FARMING_SPEED_LINK_TEXT' })}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className={classNames('card card--ghost card--flat card--xsmall', styles.farm_boost_banner)}>
                            <div className="width-expand">
                                <div className={styles.farm_boost_banner__lead}>
                                    {intl.formatMessage(
                                        { id: 'QUBE_DAO_BASE_STATS_DEPOSIT_LEAD_NO_BALANCE' },
                                        { symbol: daoContext.tokenSymbol },
                                    )}
                                </div>
                                <Button
                                    className="margin-top width-expand"
                                    link={appRoutes.swap.makeUrl({
                                        leftTokenRoot: 'combined',
                                        rightTokenRoot: daoContext.tokenAddress.toString(),
                                    })}
                                    type="primary"
                                >
                                    {`Get ${daoContext.tokenSymbol} tokens`}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )

        default:
            return (
                <div className={classNames('card card--ghost card--flat card--xsmall', styles.farm_boost_banner)}>
                    <div className="width-expand">
                        <h3 className={styles.farm_boost_banner__title}>
                            {intl.formatMessage({ id: 'QUBE_DAO_BASE_STATS_BOOST_FARMING_SPEED_TITLE' })}
                        </h3>
                        <p className="margin-vertical">
                            {intl.formatMessage(
                                { id: 'QUBE_DAO_BASE_STATS_BOOST_FARMING_SPEED_NOTE' },
                                { symbol: daoContext.tokenSymbol },
                            )}
                        </p>
                        <Button
                            className="width-expand"
                            link={daoContext.wallet.isReady ? appRoutes.daoBalance.makeUrl() : undefined}
                            size="md"
                            type="primary"
                            onClick={daoContext.wallet.isReady ? undefined : daoContext.wallet.connect}
                        >
                            {intl.formatMessage({ id: 'QUBE_DAO_BASE_STATS_BOOST_FARMING_SPEED_LINK_TEXT' })}
                        </Button>
                    </div>
                </div>
            )
    }
}

export const QubeDaoFarmBoostBanner = observer(QubeDaoFarmBoostBannerInternal)
