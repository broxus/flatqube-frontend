import * as React from 'react'

import { GaugesCalcHead } from '@/modules/Gauges/components/GaugesCalcHead'
import { GaugesCalcBanner } from '@/modules/Gauges/components/GaugesCalcBanner'
import { GaugesCalcForm } from '@/modules/Gauges/components/GaugesCalcForm'
import { GaugesCalcProvider } from '@/modules/Gauges/providers/GaugesCalcProvider'
import { GaugesTokensProvider } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { GaugesFavoritesProvider } from '@/modules/Gauges/providers/GaugesFavoritesProvider'
import { MediaTypeProvider } from '@/context/MediaType'

export function GaugesCalc(): JSX.Element {
    return (
        <div className="container container--large">
            <MediaTypeProvider>
                <GaugesFavoritesProvider>
                    <GaugesTokensProvider>
                        <GaugesCalcProvider>
                            <GaugesCalcHead />
                            <GaugesCalcBanner />
                            <GaugesCalcForm />
                        </GaugesCalcProvider>
                    </GaugesTokensProvider>
                </GaugesFavoritesProvider>
            </MediaTypeProvider>
        </div>
    )
}
