import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { TokenAmountBadge } from '@/components/common/TokenAmountBadge'
import { useQubeDaoEpochContext } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { formattedAmount, formattedTokenAmount, isGoodBignumber } from '@/utils'
import { Placeholder } from '@/components/common/Placeholder'

import styles from './index.module.scss'

export function Stats(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochContext()

    return (
        <Observer>
            {() => {
                const isFetchingEpoch = epochStore.isFetchingEpoch || epochStore.isFetchingEpoch === undefined
                const isFetchingTokenPrice = (
                    daoContext.isFetchingTokenPrice
                    || daoContext.isFetchingTokenPrice === undefined
                )
                const isFetchingVotesSummary = (
                    epochStore.isFetchingVotesSummary
                    || epochStore.isFetchingVotesSummary === undefined
                )
                return (
                    <div className={styles.stats_grid}>
                        <div className={classNames('card card--xsmall card--flat', styles.card)}>
                            <div className={styles.stats_stat_term}>
                                {intl.formatMessage({
                                    id: 'QUBE_DAO_EPOCH_STAT_DISTRIBUTION_TERM',
                                })}
                            </div>
                            <div className={styles.stats_stat_value}>
                                {isFetchingEpoch ? (
                                    <Placeholder height={23} width={120} />
                                ) : (
                                    <TokenAmountBadge
                                        address={daoContext.tokenAddress.toString()}
                                        amount={formattedTokenAmount(
                                            epochStore.normalizedTotalDistribution,
                                            daoContext.tokenDecimals,
                                        )}
                                        icon={daoContext.token?.icon}
                                        size="xsmall"
                                        symbol={daoContext.tokenSymbol}
                                    />
                                )}
                                {(isFetchingEpoch || isFetchingTokenPrice) ? (
                                    <Placeholder height={18} width={50} />
                                ) : (isGoodBignumber(epochStore.distributionPrice) && (
                                    <span className={classNames('text-sm', styles.amount)}>
                                        {`~$${formattedAmount(epochStore.distributionPrice)}`}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="card card--xsmall card--flat">
                            <div className={styles.stats_stat_term}>
                                {intl.formatMessage(
                                    { id: 'QUBE_DAO_EPOCH_STAT_TOTAL_VOTED_TERM' },
                                    { symbol: daoContext.veSymbol },
                                )}
                            </div>
                            <div className={styles.stats_stat_value}>
                                {isFetchingVotesSummary ? (
                                    <Placeholder height={23} width={120} />
                                ) : (
                                    <TokenAmountBadge
                                        amount={formattedTokenAmount(
                                            epochStore.totalVeAmount,
                                            daoContext.veDecimals,
                                        )}
                                        icon={daoContext.veIcon}
                                        size="xsmall"
                                        symbol={daoContext.veSymbol}
                                    />
                                )}
                                {isFetchingVotesSummary ? (
                                    <Placeholder height={18} width={50} />
                                ) : (isGoodBignumber(epochStore.epochTotalVeShare) && (
                                    <span className="text-sm">
                                        {`~${formattedAmount(epochStore.epochTotalVeShare)}%`}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="card card--xsmall card--flat">
                            <div className={styles.stats_stat_term}>
                                {intl.formatMessage({
                                    id: 'QUBE_DAO_EPOCH_STAT_TOTAL_POOLS_NUMBER_TERM',
                                })}
                            </div>
                            <div className={styles.stats_stat_value}>
                                {isFetchingVotesSummary ? (
                                    <Placeholder height={22} width={120} />
                                ) : intl.formatMessage(
                                    { id: 'QUBE_DAO_EPOCH_STAT_TOTAL_POOLS_NUMBER_VALUE' },
                                    { value: epochStore.epochVotesSummary.length },
                                )}
                            </div>
                        </div>
                        <div className={styles.stats_stat_weight_grid}>
                            <div className="card card--xsmall card--flat">
                                <div className={styles.stats_stat_term}>
                                    {intl.formatMessage({
                                        id: 'QUBE_DAO_EPOCH_STAT_MIN_WEIGHT_TERM',
                                    })}
                                </div>
                                <div className={styles.stats_stat_value}>
                                    {isFetchingVotesSummary ? (
                                        <Placeholder height={22} width={30} />
                                    ) : `${formattedAmount(daoContext.minVotesRatio, 2)}%`}
                                </div>
                            </div>

                            <div className="card card--xsmall card--flat">
                                <div className={styles.stats_stat_term}>
                                    {intl.formatMessage({
                                        id: 'QUBE_DAO_EPOCH_STAT_MAX_WEIGHT_TERM',
                                    })}
                                </div>
                                <div className={styles.stats_stat_value}>
                                    {isFetchingVotesSummary ? (
                                        <Placeholder height={22} width={30} />
                                    ) : `${formattedAmount(daoContext.maxVotesRatio, 2)}%`}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }}
        </Observer>
    )
}
