import * as React from 'react'

import { GaugesCreateForm } from '@/modules/Gauges/components/GaugesCreateForm'
import { GaugesCreateFormProvider } from '@/modules/Gauges/providers/GaugesCreateFormProvider'
import { GaugesTokensProvider } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { GaugesFavoritesProvider } from '@/modules/Gauges/providers/GaugesFavoritesProvider'

export function GaugesCreate(): JSX.Element {
    return (
        <div className="container container--large">
            <GaugesTokensProvider>
                <GaugesFavoritesProvider>
                    <GaugesCreateFormProvider>
                        <GaugesCreateForm />
                    </GaugesCreateFormProvider>
                </GaugesFavoritesProvider>
            </GaugesTokensProvider>
        </div>
    )
}
