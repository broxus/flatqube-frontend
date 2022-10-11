import classNames from 'classnames'
import * as React from 'react'
import { useIntl } from 'react-intl'

import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { Pagination } from '@/components/common/Pagination'
import { Spinner } from '@/components/common/Spinner'
import { Placeholder } from '@/components/common/Placeholder'
import { GaugesFilters } from '@/modules/Gauges/components/GaugesFilters'
import { GaugesListItem } from '@/modules/Gauges/components/GaugesList/Item'
import { GaugesTitle } from '@/modules/Gauges/components/GaugesTitle'
import { GaugeItem } from '@/modules/Gauges/api/models'

import styles from './index.module.scss'

type Props = {
    total: number;
    limit: number;
    offset: number;
    title?: string;
    filters?: boolean;
    filtersPrefix?: string;
    isLoading?: boolean;
    isLoaded?: boolean;
    list: GaugeItem[];
    placeholdersCount?: number;
    nextPage: () => void;
    prevPage: () => void;
    onSubmitPage: (page: number) => void;
}

export function List({
    total,
    limit,
    offset,
    title,
    filters,
    filtersPrefix,
    isLoading,
    isLoaded,
    list,
    placeholdersCount = 10,
    nextPage,
    prevPage,
    onSubmitPage,
}: Props): JSX.Element {
    const intl = useIntl()

    const totalPages = Math.ceil(total / limit)
    const currentPage = (offset / limit) + 1

    return (
        <>
            {title && (
                <GaugesTitle className={styles.title}>
                    {intl.formatMessage({
                        id: title,
                    })}

                    {filters && (
                        <GaugesFilters prefix={filtersPrefix} />
                    )}
                </GaugesTitle>
            )}

            <GaugesPanel className={styles.list}>
                <div className={classNames('list', styles.table)}>
                    <div className="list__header">
                        <div className="list__cell list__cell--left">
                            {intl.formatMessage({
                                id: 'GAUGE_TABLE_FARMING_POOL',
                            })}
                        </div>
                        <div className="list__cell list__cell--left">
                            {intl.formatMessage({
                                id: 'GAUGE_TABLE_REWARD',
                            })}
                        </div>
                        <div className="list__cell list__cell--right">
                            {intl.formatMessage({
                                id: 'GAUGE_TABLE_TVL',
                            })}
                        </div>
                        <div className="list__cell list__cell--right">
                            {intl.formatMessage({
                                id: 'GAUGE_TABLE_APR_MIN',
                            })}
                        </div>
                        <div className="list__cell list__cell--right">
                            {intl.formatMessage({
                                id: 'GAUGE_TABLE_APR_MAX',
                            })}
                        </div>
                        <div className="list__cell list__cell--right">
                            {intl.formatMessage({
                                id: 'GAUGE_TABLE_SHARE',
                            })}
                        </div>
                        <div className="list__cell list__cell--right">
                            {intl.formatMessage({
                                id: 'GAUGE_TABLE_YOUR_REWARD',
                            })}
                        </div>
                        <div className="list__cell list__cell--right">
                            {intl.formatMessage({
                                id: 'GAUGE_TABLE_ENTITLED_REWARD',
                            })}
                        </div>
                    </div>

                    {list.length > 0 ? (
                        <div className={styles.body}>
                            {isLoading && (
                                <div className={styles.spinner}>
                                    <Spinner size="s" />
                                </div>
                            )}

                            {list.map(item => (
                                <GaugesListItem
                                    key={item.address}
                                    item={item}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.body}>
                            {!isLoaded ? (
                                <>
                                    {[...Array(placeholdersCount).keys()].map(index => (
                                        <div className="list__row" key={index}>
                                            <div className="list__cell list__cell--left">
                                                <Placeholder width={120} />
                                            </div>
                                            <div className="list__cell list__cell--left">
                                                <Placeholder width={24} circle />
                                            </div>
                                            <div className="list__cell list__cell--right">
                                                <div>
                                                    <Placeholder width={60} />
                                                </div>
                                                <Placeholder width={40} height={20} />
                                            </div>
                                            <div className="list__cell list__cell--right">
                                                <div>
                                                    <Placeholder width={60} />
                                                </div>
                                                <Placeholder width={40} height={20} />
                                            </div>
                                            <div className="list__cell list__cell--right">
                                                <div>
                                                    <Placeholder width={60} />
                                                </div>
                                                <Placeholder width={40} height={20} />
                                            </div>
                                            <div className="list__cell list__cell--right">
                                                <Placeholder width={80} />
                                            </div>
                                            <div className="list__cell list__cell--right">
                                                <Placeholder width={80} />
                                            </div>
                                            <div className="list__cell list__cell--right">
                                                <Placeholder width={80} />
                                            </div>
                                        </div>
                                    ))}
                                </>
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
                    onNext={nextPage}
                    onPrev={prevPage}
                    onSubmit={onSubmitPage}
                />
            </GaugesPanel>
        </>
    )
}
