import * as React from 'react'
import BigNumber from 'bignumber.js'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Placeholder } from '@/components/common/Placeholder'
import { PieChart } from '@/components/common/PieChart'
import { colors } from '@/modules/QubeDao/constants'
import { QubeDaoCandidateItem } from '@/modules/QubeDao/components/QubeDaoCandidateItem'
import { useQubeDaoEpochStore } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { useQubeDaoContext } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { formattedTokenAmount, isGoodBignumber, sliceAddress } from '@/utils'

import styles from './index.module.scss'

export function Chart(): JSX.Element {
    const intl = useIntl()

    const daoContext = useQubeDaoContext()
    const epochStore = useQubeDaoEpochStore()

    return (
        <Observer>
            {() => {
                const isFetching = (
                    epochStore.isFetchingVotesSummary
                    || epochStore.isFetchingVotesSummary === undefined
                    || epochStore.isFetchingGaugesDetails
                    || epochStore.isFetchingGaugesDetails === undefined
                )
                const halfCount = Math.ceil(epochStore.epochVotesSummary.length / 2)
                const leftLegend = epochStore.epochVotesSummary.slice(0, halfCount)
                const rightLegend = epochStore.epochVotesSummary.slice(
                    halfCount,
                    epochStore.epochVotesSummary.length,
                )
                const data = epochStore.epochVotesSummary.map(
                    (summary, idx) => ({
                        color: `${colors[idx]}9f` ?? `#${summary.gauge.split(':')[1].slice(0, 6)}9f`,
                        value: summary.totalAmount,
                    }),
                )
                const notDistributed = new BigNumber(epochStore.totalVeAmount)
                    .minus(epochStore.epochVotesAmount)
                    .toFixed()

                if (isGoodBignumber(notDistributed)) {
                    data.push({
                        color: 'rgba(255, 255, 255, 0.12)',
                        value: notDistributed,
                    })
                }

                return (
                    <div className={styles.stats_chart_holder}>
                        {isFetching ? (
                            <Placeholder
                                className={styles.stats_content_placeholder}
                                circle
                                width={230}
                            />
                        ) : (
                            <>
                                <div className={styles.stats_left_legend}>
                                    {leftLegend.map((summary, idx) => {
                                        const gaugeDetails = epochStore.gaugeDetails(summary.gauge)
                                        return (
                                            <div key={summary.gauge} className={styles.stats_left_legend__item}>
                                                <div className={styles.stats_right_legend__label}>
                                                    {gaugeDetails
                                                        ?.map(details => daoContext.tokensCache.get(
                                                            details.tokenRoot,
                                                        )?.symbol ?? details.tokenSymbol)
                                                        .join('/') ?? sliceAddress(summary.gauge)}
                                                </div>
                                                <div
                                                    className={styles.stats_legend__color}
                                                    style={{
                                                        background: `${colors[idx]}9f`
                                                            ?? `#${summary.gauge.split(':')[1].slice(0, 6)}9f`,
                                                    }}
                                                />
                                            </div>
                                        )
                                    })}
                                </div>
                                <div>
                                    <PieChart
                                        data={data}
                                        renderTooltip={(idx, percent) => {
                                            const summary = epochStore.epochVotesSummary[idx]
                                            if (summary === undefined) {
                                                return (
                                                    <>
                                                        {intl.formatMessage({
                                                            id: 'QUBE_DAO_EPOCH_STAT_NOT_DISTRIBUTED_HINT',
                                                        })}
                                                        <div className="margin-top">
                                                            {`${formattedTokenAmount(
                                                                notDistributed ?? 0,
                                                                daoContext.veDecimals,
                                                            )} ${daoContext.veSymbol}`}
                                                        </div>
                                                        <div>{`${percent}%`}</div>
                                                    </>
                                                )
                                            }
                                            const gaugeDetails = epochStore.gaugeDetails(summary.gauge)
                                            return (
                                                <>
                                                    <QubeDaoCandidateItem
                                                        address={summary.gauge}
                                                        gaugeDetails={gaugeDetails}
                                                        size="xsmall"
                                                    />
                                                    <div className="margin-top">
                                                        {`${formattedTokenAmount(
                                                            summary.totalAmount ?? 0,
                                                            daoContext.veDecimals,
                                                        )} ${daoContext.veSymbol}`}
                                                    </div>
                                                    <div>{`${percent}%`}</div>
                                                </>
                                            )
                                        }}
                                    />
                                </div>
                                <div className={styles.stats_right_legend}>
                                    {rightLegend.map((summary, idx) => {
                                        const gaugeDetails = epochStore.gaugeDetails(summary.gauge)
                                        return (
                                            <div key={summary.gauge} className={styles.stats_right_legend__item}>
                                                <div
                                                    className={styles.stats_legend__color}
                                                    style={{
                                                        background: `${colors[halfCount + idx]}9f`
                                                            ?? `#${summary.gauge.split(':')[1].slice(0, 6)}9f`,
                                                    }}
                                                />
                                                <div className={styles.stats_right_legend__label}>
                                                    {gaugeDetails
                                                        ?.map(details => daoContext.tokensCache.get(
                                                            details.tokenRoot,
                                                        )?.symbol ?? details.tokenSymbol)
                                                        .join('/') ?? sliceAddress(summary.gauge)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                )
            }}
        </Observer>
    )
}
