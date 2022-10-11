import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Drop } from '@/components/common/Drop'
import { Checkbox } from '@/components/common/Checkbox'
import { useContext } from '@/hooks/useContext'
import { GaugesListContext } from '@/modules/Gauges/providers/GaugesListProvider'
import { useGaugesLocationFilters } from '@/modules/Gauges/hooks/useGaugesLocationFilter'
import { AmountInput } from '@/components/common/AmountInput'
import * as types from '@/modules/Gauges/types'

import styles from './index.module.scss'

type Props = {
    prefix?: string;
}

export function GaugesFilters({
    prefix,
}: Props): JSX.Element {
    const intl = useIntl()
    const filters = useGaugesLocationFilters(prefix)
    const list = useContext(GaugesListContext)

    const [local, setLocal] = React.useState<types.GaugesFilters>({})

    const count = React.useMemo(
        () => Object.keys(filters.filters).length,
        [filters.filters],
    )

    const resetEnabled = React.useMemo(
        () => Object.keys(filters.filters).length > 0,
        [filters.filters],
    )

    const applyEnabled = React.useMemo(
        () => local.aprMaxFrom !== filters.filters.aprMaxFrom
            || local.aprMaxTo !== filters.filters.aprMaxTo
            || local.aprMinFrom !== filters.filters.aprMinFrom
            || local.aprMinTo !== filters.filters.aprMinTo
            || local.tvlFrom !== filters.filters.tvlFrom
            || local.tvlTo !== filters.filters.tvlTo,
        [local, filters.filters],
    )

    const changeLocal = (key: keyof types.GaugesFilters) => (value: string) => {
        setLocal(prev => ({
            ...prev,
            [key]: value || undefined,
        }))
    }

    const changeFilter = <K extends keyof types.GaugesFilters>(key: K) => (value: types.GaugesFilters[K]) => {
        filters.set({
            ...filters.filters,
            [key]: value,
        })
    }

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        filters.set({
            ...filters.filters,
            ...local,
        })
    }

    const reset = () => {
        filters.set({})
    }

    React.useEffect(() => {
        list.setFilters(filters.filters)
        setLocal(filters.filters)
    }, [filters.filters])

    return (
        <div className={styles.filters}>
            <Drop
                placement="bottom-right"
                trigger="click"
                overlay={(
                    <form
                        onSubmit={onSubmit}
                        className={styles.content}
                    >
                        <h3 className={styles.title}>
                            {intl.formatMessage({
                                id: 'GAUGE_FILTER_TITLE',
                            })}
                        </h3>

                        <h4 className={styles.subTitle}>
                            {intl.formatMessage({
                                id: 'GAUGE_FILTER_POOL_BALANCE',
                            })}
                        </h4>

                        <div>
                            <Checkbox
                                label={intl.formatMessage({
                                    id: 'GAUGE_FILTER_WITH_LOW_BALANCE',
                                })}
                                checked={filters.filters.isLowBalance === true}
                                onChange={changeFilter('isLowBalance')}
                            />
                        </div>

                        <h4 className={styles.subTitle}>
                            {intl.formatMessage({
                                id: 'GAUGE_FILTER_TVL',
                            })}
                        </h4>

                        <div className={styles.fields}>
                            <AmountInput
                                maxIsVisible={false}
                                onChange={changeLocal('tvlFrom')}
                                value={local.tvlFrom}
                                placeholder={intl.formatMessage({
                                    id: 'GAUGE_FILTER_FROM',
                                })}
                            />
                            <AmountInput
                                maxIsVisible={false}
                                onChange={changeLocal('tvlTo')}
                                value={local.tvlTo}
                                placeholder={intl.formatMessage({
                                    id: 'GAUGE_FILTER_TO',
                                })}
                            />
                        </div>

                        <h4 className={styles.subTitle}>
                            {intl.formatMessage({
                                id: 'GAUGE_FILTER_APR_MIN',
                            })}
                        </h4>

                        <div className={styles.fields}>
                            <AmountInput
                                maxIsVisible={false}
                                onChange={changeLocal('aprMinFrom')}
                                value={local.aprMinFrom}
                                placeholder={intl.formatMessage({
                                    id: 'GAUGE_FILTER_FROM',
                                })}
                            />
                            <AmountInput
                                maxIsVisible={false}
                                onChange={changeLocal('aprMinTo')}
                                value={local.aprMinTo}
                                placeholder={intl.formatMessage({
                                    id: 'GAUGE_FILTER_TO',
                                })}
                            />
                        </div>

                        <h4 className={styles.subTitle}>
                            {intl.formatMessage({
                                id: 'GAUGE_FILTER_APR_MAX',
                            })}
                        </h4>

                        <div className={styles.fields}>
                            <AmountInput
                                maxIsVisible={false}
                                onChange={changeLocal('aprMaxFrom')}
                                value={local.aprMaxFrom}
                                placeholder={intl.formatMessage({
                                    id: 'GAUGE_FILTER_FROM',
                                })}
                            />
                            <AmountInput
                                maxIsVisible={false}
                                onChange={changeLocal('aprMaxTo')}
                                value={local.aprMaxTo}
                                placeholder={intl.formatMessage({
                                    id: 'GAUGE_FILTER_TO',
                                })}
                            />
                        </div>

                        <div className={styles.footer}>
                            <Button
                                disabled={!resetEnabled}
                                type="secondary"
                                onClick={reset}
                            >
                                {intl.formatMessage({
                                    id: 'FARMING_FILTER_CLEAR',
                                })}
                            </Button>
                            <Button
                                submit
                                disabled={!applyEnabled}
                                type="primary"
                            >
                                {intl.formatMessage({
                                    id: 'FARMING_FILTER_APPLY',
                                })}
                            </Button>
                        </div>
                    </form>
                )}
            >
                <Button
                    type="secondary"
                    className={styles.button}
                >
                    {intl.formatMessage({
                        id: 'GAUGE_FILTERS',
                    })}
                    {count > 0 && (
                        <span className={styles.counter}>
                            {count}
                        </span>
                    )}
                </Button>
            </Drop>
        </div>
    )
}
