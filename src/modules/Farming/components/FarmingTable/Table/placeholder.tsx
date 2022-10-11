import * as React from 'react'

import { Placeholder as PlaceholderBase } from '@/components/common/Placeholder'

import './index.scss'

export function Placeholder(): JSX.Element {
    return (
        <div className="list__row">
            <div className="list__cell list__cell--left">
                <PlaceholderBase width={120} />
            </div>
            <div className="list__cell list__cell--left">
                <PlaceholderBase circle width={24} />
            </div>
            <div className="list__cell list__cell--left list__cell--right">
                <div>
                    <PlaceholderBase width={80} />
                </div>
                <div className="farming-table__rate-change">
                    <PlaceholderBase width={50} />
                </div>
            </div>
            <div className="list__cell list__cell--left list__cell--right">
                <div>
                    <PlaceholderBase width={80} />
                </div>
                <div className="farming-table__rate-change">
                    <PlaceholderBase width={50} />
                </div>
            </div>
            <div className="list__cell list__cell--left list__cell--right">
                <PlaceholderBase width={30} />
            </div>
            <div className="list__cell list__cell--left list__cell--right">
                <PlaceholderBase width={70} />
            </div>
            <div className="list__cell list__cell--left list__cell--right">
                <PlaceholderBase width={70} />
            </div>
        </div>
    )
}
