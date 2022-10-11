import * as React from 'react'

import { GaugesListHead } from '@/modules/Gauges/components/GaugesListHead'
import { GaugesListProvider } from '@/modules/Gauges/providers/GaugesListProvider'
import { GaugesList as GaugesListBase } from '@/modules/Gauges/components/GaugesList'
import { GaugesTokensProvider } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { GaugesListDataProvider } from '@/modules/Gauges/providers/GaugesListDataProvider'
import { GaugesBannerNew } from '@/modules/Gauges/components/GaugesBanners/BannerNew'
import { GaugesFavoritesProvider } from '@/modules/Gauges/providers/GaugesFavoritesProvider'
import { GaugesFavoritesList } from '@/modules/Gauges/components/GaugesList/Favorites'

export function GaugesList(): JSX.Element {
    return (
        <div className="container container--large">
            <GaugesListHead />
            <GaugesBannerNew />
            <GaugesTokensProvider>
                <GaugesListDataProvider>
                    <GaugesFavoritesProvider>
                        <GaugesListProvider isFavorites>
                            <GaugesFavoritesList />
                        </GaugesListProvider>
                        <GaugesListProvider>
                            <GaugesListBase />
                        </GaugesListProvider>
                    </GaugesFavoritesProvider>
                </GaugesListDataProvider>
            </GaugesTokensProvider>
        </div>
    )
}
