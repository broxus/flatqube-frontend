import * as React from 'react'

import { Limit } from '@/modules/LimitOrders'

export default function Page(): JSX.Element {
    return (
        <div className="container container--large">
            <Limit />
        </div>
    )
}
