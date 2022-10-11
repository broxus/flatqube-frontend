import * as React from 'react'

import { Placeholder } from '@/components/common/Placeholder'
import { makeArray, uniqueId } from '@/utils'

export function DepositsListPlaceholder(): JSX.Element {
    const placeholder = React.useRef(makeArray(5, uniqueId))
    return (
        <>
            <div className="list__header">
                <div className="list__cell list__cell--left">
                    <Placeholder height={20} width={100} />
                </div>
                <div className="list__cell list__cell--left">
                    <Placeholder height={20} width={100} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={70} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={100} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder height={20} width={70} />
                </div>
            </div>
            {placeholder.current.map(key => (
                <div key={key} className="list__row">
                    <div className="list__cell list__cell--left">
                        <Placeholder height={20} width={130} />
                    </div>
                    <div className="list__cell list__cell--left">
                        <Placeholder height={20} width={130} />
                    </div>
                    <div className="list__cell list__cell--right">
                        <Placeholder height={24} width={50} />
                    </div>
                    <div className="list__cell list__cell--right">
                        <div>
                            <Placeholder height={20} width={50} />
                        </div>
                        <Placeholder height={16} width={120} />
                    </div>
                    <div className="list__cell list__cell--right">
                        <Placeholder height={20} width={50} />
                    </div>
                </div>
            ))}
        </>
    )
}
