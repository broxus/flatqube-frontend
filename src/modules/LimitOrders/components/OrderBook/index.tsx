import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Chart } from '@/components/common/Chart'
import { OrderBookData } from '@/modules/LimitOrders/types'
import { OrderBookChart } from '@/modules/LimitOrders/components/OrderBook/OrderBookChart'

type Props = {
    load: () => void;
    data: OrderBookData[] | null,
    loading?: boolean,
    noDataMessage?: React.ReactNode;
    orderBookPercent?: number;
}

function noDataMessageDefaultComponent(): JSX.Element {
    const intl = useIntl()
    return (
        <>
            {intl.formatMessage({
                id: 'CHART_NO_DATA',
            })}
        </>
    )
}

export function OrderBookWrap({
    load,
    data,
    loading = false,
    noDataMessage = noDataMessageDefaultComponent(),
    orderBookPercent,
}: Props): JSX.Element {
    React.useEffect(() => {
        load()
    }, [])
    let askData = data
            ?.filter(el => el.askSize)
            .map(el => [
                Number(el.rate),
                Number(el.askSize),
            ]),
        bidData = data
            ?.filter(el => el.bidSize)
            .map(el => [
                Number(el.rate),
                Number(el.bidSize),
            ])
    if (orderBookPercent) {
        askData = askData && askData?.filter(el => (el[0] < askData![0][0] * (1 + orderBookPercent / 100)))
        bidData = bidData?.length
            ? bidData?.filter(el => (el[0] > bidData![bidData!.length - 1][0] * (1 - orderBookPercent / 100)))
            : bidData
    }
    return (
        <div
            className={classNames({
                'chart--no-data': !data?.length && !loading,
            })}
            style={({
                height: '454px',
            })}
        >
            {loading && (
                <Chart.Placeholder />
            )}
            {(!data?.length && !loading) && (
                <div className="chart__no-data-message">
                    {noDataMessage}
                </div>
            )}
            {Boolean(data?.length)
                && (
                    <OrderBookChart
                        askData={askData}
                        bidData={bidData}
                    />
                )}
        </div>
    )
}
