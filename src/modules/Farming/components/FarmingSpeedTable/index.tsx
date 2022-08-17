import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { TokenIcon } from '@/components/common/TokenIcon'
import { useTokensCache } from '@/stores/TokensCacheService'
import { formatDateUTC, formattedAmount } from '@/utils'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { Placeholder } from '@/components/common/Placeholder'
import { Pagination } from '@/components/common/Pagination'
import { usePagination } from '@/hooks/usePagination'

import './index.scss'

const PAGINATION_LIMIT = 5

export function FarmingSpeedTableInner(): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()
    const pagination = usePagination()

    const rewardTokens = farmingData.rewardTokensAddress
        ?.map(root => tokensCache.get(root))

    const { roundStartTimes, roundRps, endTime } = farmingData

    const totalPages = roundRps
        ? Math.ceil(roundRps.length / PAGINATION_LIMIT)
        : 1

    const offset = (pagination.currentPage - 1) * PAGINATION_LIMIT

    const items = roundRps
        ? roundRps
            .map((rps, i) => ({
                rps,
                start: roundStartTimes?.[i],
                end: endTime > 0 && !roundStartTimes?.[i + 1]
                    ? endTime
                    : roundStartTimes?.[i + 1],
            }))
            .reverse()
            .slice(offset, offset + PAGINATION_LIMIT)
        : undefined

    return (
        <div className="card card--small card--flat">
            <div className="list farming-speed">
                <div className="list__header">
                    <div className="list__cell list__cell--left">
                        {intl.formatMessage({
                            id: 'FARMING_SPEED_TITLE',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'FARMING_SPEED_START_TITLE',
                        })}
                    </div>
                    <div className="list__cell list__cell--right">
                        {intl.formatMessage({
                            id: 'FARMING_SPEED_END_TITLE',
                        })}
                    </div>
                </div>

                {(roundRps === undefined || rewardTokens === undefined) ? (
                    <>
                        <div className="list__row">
                            <div className="list__cell list__cell--left">
                                <div className="farming-speed__token">
                                    <Placeholder width={120} />
                                </div>
                                <div className="farming-speed__token">
                                    <Placeholder width={120} />
                                </div>
                            </div>
                            <div className="list__cell list__cell--right">
                                <Placeholder width={120} />
                            </div>
                            <div className="list__cell list__cell--right">
                                <Placeholder width={120} />
                            </div>
                        </div>
                        <div className="list__row">
                            <div className="list__cell list__cell--left">
                                <div className="farming-speed__token">
                                    <Placeholder width={120} />
                                </div>
                                <div className="farming-speed__token">
                                    <Placeholder width={120} />
                                </div>
                            </div>
                            <div className="list__cell list__cell--right">
                                <Placeholder width={120} />
                            </div>
                            <div className="list__cell list__cell--right">
                                <Placeholder width={120} />
                            </div>
                        </div>
                    </>
                ) : (
                    items?.map(({ rps, start, end }, index) => (
                        /* eslint-disable react/no-array-index-key */
                        <div className="list__row" key={index}>
                            <div className="list__cell list__cell--left">
                                {rewardTokens.map((token, idx) => (
                                    token && (
                                        <div className="farming-speed__token" key={token.root}>
                                            <TokenIcon
                                                size="xsmall"
                                                icon={token.icon}
                                                address={token.root}
                                            />
                                            {intl.formatMessage({
                                                id: 'FARMING_TOKEN',
                                            }, {
                                                amount: formattedAmount(rps[idx], undefined, {
                                                    preserve: true,
                                                }),
                                                symbol: token.symbol,
                                            })}
                                        </div>
                                    )
                                ))}
                            </div>
                            <div className="list__cell list__cell--right">
                                {start ? formatDateUTC(start) : '—'}
                            </div>
                            <div className="list__cell list__cell--right">
                                {end ? formatDateUTC(end) : '—'}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {totalPages > 1 && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={pagination.currentPage}
                    onNext={pagination.onNext}
                    onPrev={pagination.onPrev}
                    onSubmit={pagination.onSubmit}
                />
            )}
        </div>
    )
}

export const FarmingSpeedTable = observer(FarmingSpeedTableInner)
