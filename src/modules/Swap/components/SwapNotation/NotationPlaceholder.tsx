import * as React from 'react'

import { Chart } from '@/components/common/Chart'

import './index.scss'

export function NotationPlaceholder(): React.ReactElement {
    return (
        <div
            className="card swap-notation"
            style={({ height: '109px' })}
        >
            <Chart.Placeholder />
        </div>
    )
}
