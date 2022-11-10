import * as React from 'react'

import { GaugesListProvider } from '@/modules/Gauges/providers/GaugesListProvider'
import { GaugesList as GaugesListBase } from '@/modules/Gauges/components/GaugesList'
import { GaugesTokensProvider } from '@/modules/Gauges/providers/GaugesTokensProvider'
import { GaugesListDataProvider } from '@/modules/Gauges/providers/GaugesListDataProvider'
import { GaugesFavoritesProvider } from '@/modules/Gauges/providers/GaugesFavoritesProvider'
import { GaugesFavoritesList } from '@/modules/Gauges/components/GaugesList/Favorites'
import { GaugesBannerNew } from '@/modules/Gauges/components/GaugesBanners/BannerNew'
import { GaugesListHead } from '@/modules/Gauges/components/GaugesListHead'


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
