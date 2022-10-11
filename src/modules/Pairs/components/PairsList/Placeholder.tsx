import * as React from 'react'

import { Placeholder as PlaceholderBase } from '@/components/common/Placeholder'

import './index.scss'

export function Placeholder(): JSX.Element {
    return (
        <div className="list__row">
            <div className="list__cell visible@s">
                <PlaceholderBase width={10} />
            </div>
            <div className="list__cell">
                <div className="list__cell-inner">
                    <PlaceholderBase circle width={24} />
                    <PlaceholderBase width={120} />
                </div>
            </div>
            <div className="list__cell list__cell--right">
                <PlaceholderBase width={50} />
            </div>
            <div className="list__cell list__cell--right visible@s">
                <PlaceholderBase width={50} />
            </div>
            <div className="list__cell list__cell--right visible@s">
                <PlaceholderBase width={50} />
            </div>
        </div>
    )
}
