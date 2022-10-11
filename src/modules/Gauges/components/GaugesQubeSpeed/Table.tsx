import classNames from 'classnames'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import BigNumber from 'bignumber.js'

import { Pagination } from '@/components/common/Pagination'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { useContext } from '@/hooks/useContext'
import { GaugesQubeSpeedContext } from '@/modules/Gauges/providers/GaugesQubeSpeedProvider'
import { formatDate, formattedTokenAmount } from '@/utils'
import { Spinner } from '@/components/common/Spinner'
import { Placeholder } from '@/components/common/Placeholder'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'

import styles from './index.module.scss'

function QubeSpeedTableInner(): JSX.Element {
    const intl = useIntl()
    const tokens = useContext(GaugesTokensContext)
    const qubeSpeed = useContext(GaugesQubeSpeedContext)

    const totalPages = Math.ceil(qubeSpeed.total / qubeSpeed.limit)
    const currentPage = (qubeSpeed.offset / qubeSpeed.limit) + 1

    return (
        <GaugesPanel>
            <div className={classNames('list', styles.table)}>
                <div className="list__header">
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({
                            id: 'GAUGE_QUBE_SPEED_REWARD_BUDGET',
                        })}
                    </div>
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({
                            id: 'GAUGE_QUBE_SPEED_SPEED',
                        })}
                    </div>
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({
                            id: 'GAUGE_QUBE_SPEED_START',
                        })}
                    </div>
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({
                            id: 'GAUGE_QUBE_SPEED_END',
                        })}
                    </div>
                </div>

                {qubeSpeed.rewardRounds.length > 0 ? (
                    <div className={styles.body}>
                        {qubeSpeed.isLoading && (
                            <div className={styles.spinner}>
                                <Spinner size="s" />
                            </div>
                        )}

                        {qubeSpeed.rewardRounds.map((item, index) => (
                            // eslint-disable-next-line
                            <div className="list__row" key={index}>
                                <div className="list__cell list__cell--left">
                                    {item.rewardTokens.map(reward => {
                                        const token = tokens.byRoot[reward.tokenRoot]

                                        if (token) {
                                            return (
                                                <div key={token.root}>
                                                    {formattedTokenAmount(
                                                        new BigNumber(reward.budget).abs().toFixed(),
                                                        token.decimals,
                                                    )}
                                                    {' '}
                                                    {reward.tokenSymbol}
                                                </div>
                                            )
                                        }

                                        return null
                                    })}
                                </div>
                                <div className="list__cell list__cell--left">
                                    {item.rewardTokens.map(reward => {
                                        const token = tokens.byRoot[reward.tokenRoot]

                                        if (token) {
                                            return (
                                                <div key={token.root}>
                                                    {
                                                        formattedTokenAmount(
                                                            reward.farmingSpeed,
                                                            token.decimals,
                                                        )
                                                    }
                                                    {' '}
                                                    {reward.tokenSymbol}
                                                </div>
                                            )
                                        }

                                        return null
                                    })}
                                </div>
                                <div className="list__cell list__cell--left">
                                    {formatDate(item.startDate * 1000)}
                                </div>
                                <div className="list__cell list__cell--left">
                                    {item.endDate
                                        ? formatDate(item.endDate * 1000)
                                        : (
                                            // eslint-disable-next-line react/jsx-no-useless-fragment
                                            <>
                                                {index === 0 ? (
                                                    // eslint-disable-next-line react/jsx-no-useless-fragment
                                                    <>
                                                        {currentPage === 1 || !qubeSpeed.prevRound
                                                            ? '—'
                                                            : formatDate(qubeSpeed.prevRound.startDate * 1000)}
                                                    </>
                                                ) : (
                                                    formatDate(qubeSpeed.rewardRounds[index - 1].startDate * 1000)
                                                )}
                                            </>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.body}>
                        {!qubeSpeed.isLoaded ? (
                            <div className="list__row">
                                <div className="list__cell list__cell--left">
                                    <Placeholder width={120} />
                                </div>
                                <div className="list__cell list__cell--left">
                                    <Placeholder width={120} />
                                </div>
                                <div className="list__cell list__cell--left">
                                    <Placeholder width={120} />
                                </div>
                                <div className="list__cell list__cell--left">
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
                onNext={qubeSpeed.nextPage}
                onPrev={qubeSpeed.prevPage}
                onSubmit={qubeSpeed.setPage}
            />
        </GaugesPanel>
    )
}

export const QubeSpeedTable = observer(QubeSpeedTableInner)
