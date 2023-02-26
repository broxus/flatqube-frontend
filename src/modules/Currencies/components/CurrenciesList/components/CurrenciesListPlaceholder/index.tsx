import * as React from 'react'

import { Placeholder } from '@/components/common/Placeholder'
import { makeArray, uniqueId } from '@/utils'

export function CurrenciesListPlaceholder(): JSX.Element {
    const placeholder = React.useRef(makeArray(10, uniqueId))
    return (
        <>
            <div className="list__header">
                <div className="list__cell list__cell--center visible@m">
                    <Placeholder width={25} />
                </div>
                <div className="list__cell list__cell--left">
                    <Placeholder width={60} />
                </div>
                <div className="list__cell list__cell--right">
                    <Placeholder width={50} />
                </div>
                <div className="list__cell list__cell--right visible@s">
                    <Placeholder width={100} />
                </div>
                <div className="list__cell list__cell--right visible@s">
                    <Placeholder width={70} />
                </div>
            </div>
            {placeholder.current.map(key => (
                <div key={key} className="list__row">
                    <div className="list__cell list__cell--center visible@m">
                        <Placeholder width={25} />
                    </div>
                    <div className="list__cell">
                        <div className="list__cell-inner">
                            <Placeholder circle width={24} />
                            <Placeholder height={24} width={60} />
                        </div>
                    </div>
                    <div className="list__cell list__cell--right">
                        <Placeholder height={20} width={80} />
                        <div>
                            <Placeholder height={18} width={40} />
                        </div>
                    </div>
                    <div className="list__cell list__cell--right visible@s">
                        <Placeholder height={20} width={80} />
                        <div>
                            <Placeholder height={18} width={40} />
                        </div>
                    </div>
                    <div className="list__cell list__cell--right visible@s">
                        <Placeholder height={20} width={80} />
                        <div>
                            <Placeholder height={18} width={40} />
                        </div>
                    </div>
                </div>
            ))}
        </>
    )
}
