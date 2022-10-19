import classNames from 'classnames'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { GaugesStatus, StatusType } from '@/modules/Gauges/components/GaugesStatus'
import { Pagination } from '@/components/common/Pagination'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { useContext } from '@/hooks/useContext'
import { GaugesDepositsContext } from '@/modules/Gauges/providers/GaugesDepositsProvider'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { formatDate, formattedAmount, formattedTokenAmount } from '@/utils'
import { DepositState } from '@/modules/Gauges/api/models'
import { Placeholder } from '@/components/common/Placeholder'
import { Spinner } from '@/components/common/Spinner'
import { getDuration } from '@/modules/Gauges/utils'

import styles from './index.module.scss'

const mapStatusType = (state: DepositState): StatusType => {
    switch (state) {
        case DepositState.Locked:
            return 'green'
        case DepositState.Unlocked:
            return 'default'
        case DepositState.NoBoost:
        default:
            return 'yellow'
    }
}

const mapStatusLabel = (state: DepositState): string => {
    switch (state) {
        case DepositState.Locked:
            return 'GAUGE_STATUS_LABEL_LOCKED'
        case DepositState.Unlocked:
            return 'GAUGE_STATUS_LABEL_UNLOCKED'
        case DepositState.NoBoost:
        default:
            return 'GAUGE_STATUS_LABEL_NO_BOOST'
    }
}

// TODO: Add user deposits if url has user address
function DepositsTableInner(): JSX.Element {
    const intl = useIntl()
    const { rootToken } = useContext(GaugesDataStoreContext)
    const deposits = useContext(GaugesDepositsContext)

    const totalPages = Math.ceil(deposits.total / deposits.limit)
    const currentPage = (deposits.offset / deposits.limit) + 1

    return (
        <GaugesPanel>
            <div className={classNames('list', styles.table)}>
                <div className="list__header">
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({
                            id: 'GAUGE_DEPOSITS_AMOUNT_LP',
                        })}
                    </div>
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({
                            id: 'GAUGE_DEPOSITS_STATUS',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_DEPOSITS_DATE',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_DEPOSITS_APR_BOOST',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_DEPOSITS_LOCK_PERIOD',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_DEPOSITS_END_LOCK',
                        })}
                    </div>
                </div>

                {rootToken && deposits.deposits.length > 0 ? (
                    <div className={styles.body}>
                        {deposits.isLoading && (
                            <div className={styles.spinner}>
                                <Spinner size="s" />
                            </div>
                        )}

                        {deposits.deposits.map(item => (
                            <div className="list__row" key={item.timestamp}>
                                <div className="list__cell list__cell--left">
                                    {formattedTokenAmount(item.lpAmount)}
                                </div>
                                <div className="list__cell list__cell--left">
                                    <GaugesStatus type={mapStatusType(item.state)}>
                                        {intl.formatMessage({
                                            id: mapStatusLabel(item.state),
                                        })}
                                    </GaugesStatus>
                                </div>
                                <div className="list__cell list__cell--right">
                                    {formatDate(item.timestamp * 1000)}
                                </div>
                                <div className="list__cell list__cell--right">
                                    {item.boost ? (
                                        <>
                                            {formattedAmount(
                                                new BigNumber(item.boost).decimalPlaces(9).toFixed(),
                                                undefined,
                                                { preserve: true, roundOn: false },
                                            )}
                                            x
                                        </>
                                    ) : '—'}
                                </div>
                                <div className="list__cell list__cell--right">
                                    {item.lockPeriod ? (
                                        intl.formatMessage({
                                            id: 'GAUGE_PERIOD',
                                        }, {
                                            ...getDuration(item.lockPeriod),
                                        })
                                    ) : '—'}
                                </div>
                                <div className="list__cell list__cell--right">
                                    {item.endLock ? formatDate(item.endLock * 1000) : '—'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.body}>
                        {!deposits.isLoaded || !rootToken ? (
                            <div className="list__row">
                                <div className="list__cell list__cell--left">
                                    <Placeholder width={120} />
                                </div>
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
                                <div className="list__cell list__cell--right">
                                    <Placeholder width={120} />
                                </div>
                            </div>
                        ) : (
                            <div className={classNames('list__row', styles.noData)}>
                                <div className="list__cell list__cell--center">
                                    {intl.formatMessage({
                                        id: 'GAUGE_NO_DATA',
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Pagination
                className={styles.pagination}
                totalPages={totalPages}
                currentPage={currentPage}
                onNext={deposits.nextPage}
                onPrev={deposits.prevPage}
                onSubmit={deposits.setPage}
            />
        </GaugesPanel>
    )
}

export const DepositsTable = observer(DepositsTableInner)
