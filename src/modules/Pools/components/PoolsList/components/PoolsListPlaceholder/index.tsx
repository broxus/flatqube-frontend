import * as React from 'react'

import { Placeholder, Placeholder as PlaceholderBase } from '@/components/common/Placeholder'
import { makeArray, uniqueId } from '@/utils'

type Props = {
    rowsCount?: number;
}

export function PoolsListPlaceholder({ rowsCount }: Props): JSX.Element {
    const placeholder = React.useRef(makeArray(rowsCount ?? 10, uniqueId))
    return (
        <>
            <div className="list__header">
                <div className="list__cell list__cell--center">
                    <Placeholder height={20} width={25} />
                </div>
                <div className="list__cell list__cell--left">
                    <Placeholder height={20} width={50} />
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
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={80} />
                </div>
            </div>
            {placeholder.current.map(key => (
                <div key={key} className="list__row">
                    <div className="list__cell list__cell--center">
                        <Placeholder height={20} width={25} />
                    </div>
                    <div className="list__cell list__cell--left">
                        <div className="list__cell-inner">
                            <PlaceholderBase circle width={24} />
                            <PlaceholderBase height={24} width={120} />
                        </div>
                    </div>
                    <div className="list__cell list__cell--right">
                        <Placeholder height={20} width={80} />
                        <div>
                            <Placeholder height={18} width={40} />
                        </div>
                    </div>
                    <div className="list__cell list__cell--right">
                        <Placeholder height={20} width={80} />
                        <div>
                            <Placeholder height={18} width={40} />
                        </div>
                    </div>
                    <div className="list__cell list__cell--right">
                        <Placeholder height={20} width={60} />
                    </div>
                    <div className="list__cell list__cell--right">
                        <Placeholder height={20} width={50} />
                        <div>
                            <Placeholder height={18} width={40} />
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}
