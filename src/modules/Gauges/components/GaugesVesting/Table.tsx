import classNames from 'classnames'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { GaugesTokens } from '@/modules/Gauges/components/GaugesTokens'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { formatDate, formattedAmount } from '@/utils'
import { getDuration } from '@/modules/Gauges/utils'

import styles from './index.module.scss'

function VestingTableInner(): JSX.Element {
    const intl = useIntl()
    const { qubeToken, extraTokens, rewardDetails } = useContext(GaugesDataStoreContext)
    const { qubeVestingTime, extraVestingTime } = useContext(GaugesUserDataContext)

    return (
        <GaugesPanel>
            <div className={classNames('list', styles.table)}>
                <div className="list__header">
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({
                            id: 'GAUGE_VESTING_REWARD_TOKEN',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_VESTING_RATIO',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_VESTING_PERIOD',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_VESTING_END_DATE',
                        })}
                    </div>
                </div>

                {qubeToken && extraTokens && rewardDetails ? (
                    <>
                        <div className="list__row">
                            <div className="list__cell list__cell--left">
                                <GaugesTokens
                                    items={[{
                                        token: qubeToken,
                                    }]}
                                />
                            </div>
                            <div className="list__cell list__cell--right">
                                {rewardDetails._qubeVestingRatio
                                    ? (
                                        <>
                                            {formattedAmount(
                                                new BigNumber(rewardDetails._qubeVestingRatio)
                                                    .div(10)
                                                    .decimalPlaces(1, BigNumber.ROUND_DOWN)
                                                    .toFixed(),
                                            )}
                                            %
                                        </>
                                    ) : (
                                        '—'
                                    )}
                            </div>
                            <div className="list__cell list__cell--right">
                                {getDuration(parseInt(rewardDetails._qubeVestingPeriod, 10))}
                            </div>
                            <div className="list__cell list__cell--right">
                                {qubeVestingTime ? formatDate(qubeVestingTime) : '—'}
                            </div>
                        </div>
                        {extraTokens.map((token, index) => (
                            <div
                                key={token.root}
                                className="list__row"
                            >
                                <div className="list__cell list__cell--left">
                                    <GaugesTokens
                                        items={[{
                                            token,
                                        }]}
                                    />
                                </div>
                                <div className="list__cell list__cell--right">
                                    {rewardDetails._extraVestingRatios[index]
                                        ? (
                                            <>
                                                {formattedAmount(
                                                    new BigNumber(rewardDetails._extraVestingRatios[index])
                                                        .div(10)
                                                        .decimalPlaces(1, BigNumber.ROUND_DOWN)
                                                        .toFixed(),
                                                )}
                                                %
                                            </>
                                        )
                                        : '—'}
                                </div>
                                <div className="list__cell list__cell--right">
                                    {rewardDetails._extraVestingPeriods[index]
                                        ? getDuration(parseInt(rewardDetails._extraVestingPeriods[index], 10))
                                        : '—'}
                                </div>
                                <div className="list__cell list__cell--right">
                                    {extraVestingTime && extraVestingTime[index]
                                        ? formatDate(extraVestingTime[index])
                                        : '—'}
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="list__row">
                        <div className="list__cell list__cell--left">
                            <Placeholder width={120} />
                        </div>
                        <div className="list__cell list__cell--right">
                            <Placeholder width={120} />
                        </div>
                        <div className="list__cell list__cell--right">
                            <Placeholder width={120} />
                        </div>
                        <div className="list__cell list__cell--right">
                            <Placeholder width={120} />
                        </div>
                    </div>
                )}
            </div>
        </GaugesPanel>
    )
}

export const VestingTable = observer(VestingTableInner)
