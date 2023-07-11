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
        // eslint-disable-next-line prefer-const
        bidData = data
            ?.filter(el => el.bidSize)
            .map(el => [
                Number(el.rate),
                Number(el.bidSize),
            ])
    if (orderBookPercent) {
        const dataBoundary: {
            ask?: number,
            bid?: number,
        } = {
            ask: undefined,
            bid: undefined,
        }
        if (askData?.length) {
            dataBoundary.ask = askData[0][0] * (1 + orderBookPercent / 100)
            if (bidData?.length) {
                if (askData[0][0] < bidData![bidData!.length - 1][0]) {
                    dataBoundary.ask = bidData![bidData!.length - 1][0] * (1 + orderBookPercent / 100)
                }
            }
            askData = askData?.filter(el => (dataBoundary?.ask ? (el[0] < dataBoundary?.ask) : true))
        }
        if (bidData?.length) {
            dataBoundary.bid = bidData![bidData!.length - 1][0] * (1 - orderBookPercent / 100)
            if (askData?.length) {
                if (askData[0][0] < bidData![bidData!.length - 1][0]) {
                    dataBoundary.bid = askData[0][0] * (1 - orderBookPercent / 100)
                }
            }
            bidData = bidData?.filter(el => (dataBoundary.bid ? (el[0] > dataBoundary.bid) : true))
        }
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
