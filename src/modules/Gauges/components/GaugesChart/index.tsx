import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Tabs } from '@/components/common/Tabs'
import { useContext } from '@/hooks/useContext'
import { GaugesChartContext } from '@/modules/Gauges/providers/GaugesChartProvider'
import { GaugesChartType } from '@/modules/Gauges/stores/GaugesChartStore'
import { Timeframe } from '@/modules/Gauges/api/models'
import { Area } from '@/modules/Charts/Area'

import styles from './index.module.scss'

function GaugesChartInner(): JSX.Element {
    const intl = useIntl()
    const chart = useContext(GaugesChartContext)

    const onClickTypeFn = (val: GaugesChartType) => () => {
        chart.setType(val)
    }

    const onClickTimeframeFn = (val: Timeframe) => () => {
        chart.setTimeframe(val)
    }

    return (
        <div className={styles.chart}>
            <div className={styles.head}>
                <Tabs
                    size="s"
                    items={[{
                        active: chart.type === GaugesChartType.Tvl,
                        label: 'TVL',
                        onClick: onClickTypeFn(GaugesChartType.Tvl),
                    }, {
                        active: chart.type === GaugesChartType.MinApr,
                        label: 'Min APR',
                        onClick: onClickTypeFn(GaugesChartType.MinApr),
                    }, {
                        active: chart.type === GaugesChartType.MaxApr,
                        label: 'Max APR',
                        onClick: onClickTypeFn(GaugesChartType.MaxApr),
                    }]}
                />

                <Tabs
                    size="s"
                    type="card"
                    items={[{
                        active: chart.timeframe === Timeframe.H1,
                        label: '1H',
                        onClick: onClickTimeframeFn(Timeframe.H1),
                    }, {
                        active: chart.timeframe === Timeframe.D1,
                        label: '1D',
                        onClick: onClickTimeframeFn(Timeframe.D1),
                    }]}
                />
            </div>

            <div className={styles.wrapper}>
                <Area
                    id={`${chart?.type}_${chart?.timeframe}`}
                    data={chart?.data}
                    fetch={chart?.fetch}
                    isFetching={chart?.loading}
                    timeframe={chart?.timeframe}
                />
            </div>
        </div>
    )
}

export const GaugesChart = observer(GaugesChartInner)
