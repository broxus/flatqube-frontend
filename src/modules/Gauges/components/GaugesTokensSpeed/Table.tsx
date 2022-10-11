import classNames from 'classnames'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Pagination } from '@/components/common/Pagination'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { useContext } from '@/hooks/useContext'
import { GaugesTokens, TokenItem } from '@/modules/Gauges/components/GaugesTokens'
import { GaugesTokensSpeedContext } from '@/modules/Gauges/providers/GaugesTokensSpeedProvider'
import { formatDate, formattedTokenAmount } from '@/utils'
import { Spinner } from '@/components/common/Spinner'
import { Placeholder } from '@/components/common/Placeholder'
import { GaugesTokensContext } from '@/modules/Gauges/providers/GaugesTokensProvider'

import styles from './index.module.scss'

function TokensSpeedTableInner(): JSX.Element {
    const intl = useIntl()
    const tokensSpeed = useContext(GaugesTokensSpeedContext)
    const tokens = useContext(GaugesTokensContext)

    const totalPages = Math.ceil(tokensSpeed.total / tokensSpeed.limit)
    const currentPage = (tokensSpeed.offset / tokensSpeed.limit) + 1

    return (
        <GaugesPanel>
            <div className={classNames('list', styles.table)}>
                <div className="list__header">
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({
                            id: 'GAUGE_TOKENS_SPEED_SPEED',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_TOKENS_SPEED_START',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'GAUGE_TOKENS_SPEED_END',
                        })}
                    </div>
                </div>

                {tokensSpeed.rewardRounds.length > 0 ? (
                    <div className={styles.body}>
                        {tokensSpeed.isLoading && (
                            <div className={styles.spinner}>
                                <Spinner size="s" />
                            </div>
                        )}

                        {tokensSpeed.rewardRounds.map((item, index) => (
                            // eslint-disable-next-line
                            <div className="list__row" key={index}>
                                <div className="list__cell list__cell--left">
                                    <GaugesTokens
                                        items={item.rewardTokens.reduce<TokenItem[]>((acc, reward) => {
                                            const token = tokens.byRoot[reward.tokenRoot]

                                            if (token) {
                                                return [...acc, {
                                                    amount: formattedTokenAmount(
                                                        reward.farmingSpeed,
                                                        token.decimals,
                                                    ),
                                                    token,
                                                }]
                                            }

                                            return acc
                                        }, [])}
                                    />
                                </div>
                                <div className="list__cell list__cell--right">
                                    {formatDate(item.startDate * 1000)}
                                </div>
                                <div className="list__cell list__cell--right">
                                    {item.endDate ? formatDate(item.endDate * 1000) : '—'}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.body}>
                        {!tokensSpeed.isLoaded ? (
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
                onNext={tokensSpeed.nextPage}
                onPrev={tokensSpeed.prevPage}
                onSubmit={tokensSpeed.setPage}
            />
        </GaugesPanel>
    )
}

export const TokensSpeedTable = observer(TokensSpeedTableInner)
