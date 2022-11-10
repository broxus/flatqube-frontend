/* eslint-disable no-nested-ternary */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { TokenIcons } from '@/components/common/TokenIcons'
import { appRoutes } from '@/routes'
import { Icon } from '@/components/common/Icon'
import { Tooltip } from '@/components/common/Tooltip'
import { GaugesStatus, StatusType } from '@/modules/Gauges/components/GaugesStatus'
import { useContext } from '@/hooks/useContext'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { GaugeItem } from '@/modules/Gauges/api/models'
import { Placeholder } from '@/components/common/Placeholder'
import { formattedAmount } from '@/utils'
import { GaugesCalcContext } from '@/modules/Gauges/providers/GaugesCalcProvider'

import styles from './index.module.scss'

type Props = {
    index: number;
    gauge?: GaugeItem;
}

function GaugesCalcFormItemInner({
    index,
    gauge,
}: Props): JSX.Element {
    const intl = useIntl()
    const tokens = useContext(GaugesTokensContext)
    const calc = useContext(GaugesCalcContext)
    const infoRef = React.useRef<HTMLSpanElement>(null)

    let statusType: StatusType = 'red',
        statusLabel = 'GAUGE_LOW'
    if (calc.lpBoostActive && calc.veBoostActive && gauge?.hasQubeReward) {
        statusType = 'green'
        statusLabel = 'GAUGE_HIGH'
    }
    else if (calc.lpBoostActive || (calc.veBoostActive && gauge?.hasQubeReward)) {
        statusType = 'yellow'
        statusLabel = 'GAUGE_MIDDLE'
    }

    const lpLockBoost = React.useMemo(
        () => calc.lpLockBoost?.[index],
        [calc.lpLockBoost, index],
    )
    const lpLockApr = React.useMemo(
        () => (lpLockBoost && gauge
            ? new BigNumber(gauge.minApr).times(lpLockBoost).plus(gauge.minApr).toString()
            : undefined),
        [lpLockBoost, gauge?.minApr],
    )
    const veLockBoost = React.useMemo(
        () => calc.veLockBoost?.[index],
        [calc.veLockBoost],
    )
    const veLockApr = React.useMemo(
        () => (veLockBoost && gauge
            ? new BigNumber(gauge.minApr).times(veLockBoost).toString()
            : undefined),
        [veLockBoost, gauge?.minApr],
    )
    const boost = React.useMemo(
        () => new BigNumber(1).plus(lpLockBoost ?? '0').plus(veLockBoost ?? '0').toString(),
        [lpLockBoost, veLockBoost],
    )
    const apr = React.useMemo(
        () => (gauge
            ? new BigNumber(gauge.minApr).times(boost).toString()
            : undefined),
        [gauge?.minApr, boost],
    )

    const veQubeForMaxApr = calc.veQubeForMaxApr?.[index]

    return (
        <div className={styles.root}>
            <div className={styles.head}>
                {gauge ? (
                    <TokenIcons
                        icons={gauge.poolTokens.map(item => ({
                            address: item.tokenRoot,
                            icon: tokens.byRoot[item.tokenRoot]?.icon,
                            name: item.tokenSymbol,
                        }))}
                    />
                ) : (
                    <Placeholder width={24} circle />
                )}

                {gauge ? (
                    <Link
                        to={appRoutes.gaugesItem.makeUrl({
                            address: gauge.address,
                        })}
                    >
                        {gauge?.poolTokens.map(item => item.tokenSymbol).join('/')}
                    </Link>
                ) : (
                    <Placeholder width={100} />
                )}
            </div>

            <div className={styles.info}>
                <div className={styles.item}>
                    <div className={styles.label}>
                        {intl.formatMessage({
                            id: 'GAUGE_CALC_TVL',
                        })}
                    </div>
                    <div className={styles.value}>
                        {gauge ? (
                            `$${formattedAmount(gauge.tvl)}`
                        ) : (
                            <Placeholder width={70} />
                        )}
                    </div>
                </div>

                <div className={styles.item}>
                    <div className={styles.label}>
                        {intl.formatMessage({
                            id: 'GAUGE_CALC_MIN_APR',
                        })}
                    </div>
                    <div className={styles.value}>
                        {gauge ? (
                            <>
                                <span>
                                    {formattedAmount(gauge.minApr)}
                                    %
                                </span>
                                <em>1x</em>
                            </>
                        ) : (
                            <Placeholder width={70} />
                        )}
                    </div>
                </div>

                <div className={styles.item}>
                    <div className={styles.label}>
                        {intl.formatMessage({
                            id: 'GAUGE_CALC_MAX_APR',
                        })}
                    </div>
                    <div className={styles.value}>
                        {gauge ? (
                            <>
                                <span>
                                    {formattedAmount(gauge.maxApr)}
                                    %
                                </span>
                                <em>
                                    {gauge.hasQubeReward
                                        ? new BigNumber(gauge.maxBoost)
                                            .minus(1)
                                            .plus(2.5)
                                            .decimalPlaces(2)
                                            .toString()
                                        : gauge.maxBoost}
                                    x
                                </em>
                            </>
                        ) : (
                            <Placeholder width={70} />
                        )}
                    </div>
                </div>

                <div className={styles.item}>
                    <div className={styles.label}>
                        {intl.formatMessage({
                            id: 'GAUGE_CALC_VEQUBE_MAX_APR',
                        })}
                    </div>
                    <div className={styles.value}>
                        {gauge ? (
                            veQubeForMaxApr ? formattedAmount(veQubeForMaxApr) : '—'
                        ) : (
                            <Placeholder width={70} />
                        )}
                    </div>
                </div>
            </div>

            <div className={styles.side}>
                {gauge ? (
                    <>
                        <span
                            ref={infoRef}
                            className={styles.aprInfo}
                        >
                            {intl.formatMessage({
                                id: 'GAUGE_CALC_YOUR_BOOSTED_APR',
                            })}
                            <Icon icon="infoFill" />
                        </span>

                        <Tooltip
                            alignY="bottom"
                            alignX="right"
                            target={infoRef}
                        >
                            <>
                                <h4 className={styles.title}>
                                    {intl.formatMessage({
                                        id: 'GAUGE_CALC_BOOSTED_APR',
                                    }, {
                                        value: `${formattedAmount(apr ?? '0')}%`,
                                    })}
                                </h4>

                                <dl className={styles.data}>
                                    <dt>
                                        {formattedAmount(gauge.minApr)}
                                        %
                                    </dt>
                                    <dd>
                                        {intl.formatMessage({
                                            id: 'GAUGE_CALC_DEFAULT_APR',
                                        })}
                                    </dd>

                                    <dt>
                                        {formattedAmount(lpLockApr ?? '0')}
                                        %
                                    </dt>
                                    <dd>
                                        {intl.formatMessage({
                                            id: 'GAUGE_CALC_BOOST_LP_LOCK',
                                        })}
                                    </dd>

                                    <dt>
                                        {formattedAmount(veLockApr ?? '0')}
                                        %
                                    </dt>
                                    <dd>
                                        {intl.formatMessage({
                                            id: 'GAUGE_CALC_BOOST_QUBE_LOCK',
                                        })}
                                    </dd>
                                </dl>
                            </>
                        </Tooltip>
                    </>
                ) : (
                    <Placeholder width={140} />
                )}

                <div className={styles.apr}>
                    {gauge ? (
                        <>
                            <GaugesStatus type={statusType}>
                                {intl.formatMessage({
                                    id: statusLabel,
                                })}
                            </GaugesStatus>
                            {formattedAmount(apr)}
                            %
                        </>
                    ) : (
                        <Placeholder width={100} />
                    )}
                </div>

                {gauge && (
                    <div className={styles.boost}>
                        {intl.formatMessage({
                            id: 'GAUGE_CALC_BOOST',
                        }, {
                            value: formattedAmount(boost),
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export const GaugesCalcFormItem = observer(GaugesCalcFormItemInner)
