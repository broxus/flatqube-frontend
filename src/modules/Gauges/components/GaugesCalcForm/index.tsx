import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { GaugesCalcFormItem } from '@/modules/Gauges/components/GaugesCalcForm/Item'
import { useContext } from '@/hooks/useContext'
import { GaugesCalcContext } from '@/modules/Gauges/providers/GaugesCalcProvider'
import { Pagination } from '@/components/common/Pagination'
import { Spinner } from '@/components/common/Spinner'
import { GaugesCalcFormToolbar } from '@/modules/Gauges/components/GaugesCalcForm/Toolbar'
import { GaugesCalcFormPopup } from '@/modules/Gauges/components/GaugesCalcForm/Popup'
import { GaugesCalcFormFields } from '@/modules/Gauges/components/GaugesCalcForm/Fields'
import { MediaType, MediaTypeContext } from '@/context/MediaType'

import styles from './index.module.scss'

export function GaugesCalcForm(): JSX.Element {
    const intl = useIntl()
    const calc = useContext(GaugesCalcContext)
    const mediaType = useContext(MediaTypeContext)

    const [filtersVisible, setFiltersVisible] = React.useState(false)

    const showFilters = () => {
        setFiltersVisible(true)
    }

    const hideFilters = () => {
        setFiltersVisible(false)
    }

    return (
        <div className={styles.gaugesCalcForm}>
            <div className={styles.main}>
                <div className={styles.list}>
                    <Observer>
                        {() => (
                            calc.gauges && calc.isLoading ? (
                                <Spinner className={styles.spinner} />
                            ) : null
                        )}
                    </Observer>

                    <Observer>
                        {() => (
                            // eslint-disable-next-line no-nested-ternary
                            calc.gauges ? (
                                calc.gauges.length === 0 ? (
                                    <div className={styles.noData}>
                                        {intl.formatMessage({
                                            id: 'GAUGE_CALC_NO_DATA',
                                        })}
                                    </div>
                                ) : (
                                    // eslint-disable-next-line react/jsx-no-useless-fragment
                                    <>
                                        {calc.gauges?.map((gauge, index) => (
                                            <GaugesCalcFormItem
                                                key={gauge.address}
                                                index={index}
                                                gauge={gauge}
                                            />
                                        ))}
                                    </>
                                )
                            ) : (
                                <>
                                    {[...Array(calc.limit).keys()].map(index => (
                                        <GaugesCalcFormItem
                                            key={index}
                                            index={index}
                                        />
                                    ))}
                                </>
                            )
                        )}
                    </Observer>
                </div>

                <Observer>
                    {() => (
                        calc.totalPages && calc.totalPages > 1 ? (
                            <Pagination
                                totalPages={calc.totalPages}
                                currentPage={calc.page}
                                onSubmit={calc.setPage}
                                onNext={calc.nextPage}
                                onPrev={calc.prevPage}
                            />
                        ) : null
                    )}
                </Observer>
            </div>

            <Observer>
                {() => (
                    mediaType === MediaType.l || mediaType === MediaType.xl ? (
                        <GaugesCalcFormFields />
                    ) : (
                        <>
                            {filtersVisible && (
                                <GaugesCalcFormPopup
                                    onClose={hideFilters}
                                >
                                    <GaugesCalcFormFields
                                        asPopup
                                        onClose={hideFilters}
                                    />
                                </GaugesCalcFormPopup>
                            )}
                            <GaugesCalcFormToolbar
                                onFilter={showFilters}
                            />
                        </>
                    )
                )}
            </Observer>
        </div>
    )
}
