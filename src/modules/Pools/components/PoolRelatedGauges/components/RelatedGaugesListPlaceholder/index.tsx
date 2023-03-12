import * as React from 'react'

import { Placeholder, Placeholder as PlaceholderBase } from '@/components/common/Placeholder'

export function RelatedGaugesListPlaceholder(): JSX.Element {
    return (
        <>
            <div className="list__header">
                <div className="list__cell list__cell--left">
                    <Placeholder height={20} width={100} />
                </div>
                <div className="list__cell list__cell--left">
                    <Placeholder height={20} width={80} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={50} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={70} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={70} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={70} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={100} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={100} />
                </div>
            </div>
            <div className="list__row">
                <div className="list__cell list__cell--left">
                    <div className="list__cell-inner">
                        <PlaceholderBase circle width={24} />
                        <PlaceholderBase width={120} />
                    </div>
                </div>
                <div className="list__cell list__cell--left">
                    <PlaceholderBase circle width={24} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={80} />
                    <div>
                        <Placeholder height={18} width={40} />
                    </div>
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={70} />
                    <div>
                        <Placeholder height={18} width={40} />
                    </div>
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={70} />
                    <div>
                        <Placeholder height={18} width={40} />
                    </div>
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={50} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={50} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={50} />
                </div>
            </div>
        </>
    )
}
