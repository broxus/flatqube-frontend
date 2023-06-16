/* eslint-disable sort-keys */
import React, { useEffect, useRef } from 'react'
import * as Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

const style: Highcharts.CSSObject = {
    color: '#d9d9d9',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
    fontSize: '12px',
    fontWeight: '400',

}

const options: Highcharts.Options = {
    title: undefined,
    legend: {
        enabled: false,
    },
    chart: {
        backgroundColor: 'transparent',
        animation: false,
        height: 454,
    },
    xAxis: {
        // tickPosition: 'inside',
        minPadding: 0,
        maxPadding: 0,
        lineWidth: 0,
        tickWidth: 0,
        labels: {
            style,
        },
    },
    yAxis: [{
        lineWidth: 0,
        tickWidth: 0,
        gridLineWidth: 0,
        // tickLength: 5,
        tickPosition: 'inside',
        labels: {
            style,
            // align: 'left',
            // x: 8,
        },
        tickColor: '',
        title: undefined,
    }, {
        lineWidth: 0,
        tickWidth: 0,
        gridLineWidth: 0,
        opposite: true,
        linkedTo: 0,
        tickPosition: 'inside',
        labels: {
            style,
            // align: 'right',
            // x: -8,
        },
        title: undefined,
    }],
    plotOptions: {
        area: {
            fillOpacity: 0.2,
            lineWidth: 0.5,
            step: 'center',
        },
    },
    tooltip: {
        headerFormat: '<span style="font-size=10px;">Price: {point.key}</span><br/>',
        valueDecimals: 2,
    },
}

export function OrderBookChart(props: HighchartsReact.Props | {
    askData: Array<(number | [(number | string), (number | null)] | Highcharts.PointOptionsObject)>,
    bidData: Array<(number | [(number | string), (number | null)] | Highcharts.PointOptionsObject)>,
}): JSX.Element {
    const chartComponentRef = useRef<HighchartsReact.RefObject>(null)
    const { askData, bidData } = props
    useEffect(() => {
        options.series = [
            {
                color: {
                    linearGradient: {
                        x1: 0.05, x2: 0, y1: 0, y2: 0.95,
                    },
                    stops: [
                        [0, 'rgb(74, 180, 74, 0.4)'],
                        [1, 'rgba(74, 180, 74, 0.1)'],
                    ],
                },
                lineColor: 'rgba(74, 180, 74, 1)',
                name: 'Asks',
                type: 'area',
                data: askData,
            },
            {
                color: {
                    linearGradient: {
                        x1: 0.05, x2: 0, y1: 0, y2: 0.95,
                    },
                    stops: [
                        [0, 'rgb(235, 67, 97, 0.4)'],
                        [1, 'rgba(235, 67, 97, 0.1)'],
                    ],
                },
                lineColor: 'rgba(235, 67, 97, 1)',
                name: 'Bids',
                // color: '#fc5857',
                type: 'area',
                data: bidData,
            },
        ]
    }, [askData, bidData])

    return (
        <HighchartsReact
            allowChartUpdate
            highcharts={Highcharts}
            options={{
                ...options,
                series: [
                    {
                        color: {
                            linearGradient: {
                                x1: 0.05, x2: 0, y1: 0, y2: 0.95,
                            },
                            stops: [
                                [0, 'rgb(74, 180, 74, 0.4)'],
                                [1, 'rgba(74, 180, 74, 0.1)'],
                            ],
                        },
                        lineColor: 'rgba(74, 180, 74, 1)',
                        name: 'Asks',
                        type: 'area',
                        data: askData,
                    },
                    {
                        color: {
                            linearGradient: {
                                x1: 0.05, x2: 0, y1: 0, y2: 0.95,
                            },
                            stops: [
                                [0, 'rgb(235, 67, 97, 0.4)'],
                                [1, 'rgba(235, 67, 97, 0.1)'],
                            ],
                        },
                        lineColor: 'rgba(235, 67, 97, 1)',
                        name: 'Bids',
                        // color: '#fc5857',
                        type: 'area',
                        data: bidData,
                    },
                ],
            }}
            ref={chartComponentRef}
            {...props}
        />
    )
}
