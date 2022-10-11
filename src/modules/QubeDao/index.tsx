import * as React from 'react'

import { QubeDaoBaseStats } from '@/modules/QubeDao/components/QubeDaoBaseStats'
import { QubeDaoEpochs } from '@/modules/QubeDao/components/QubeDaoEpochs'
import { QubeDaoLastEpochDetails } from '@/modules/QubeDao/components/QubeDaoLastEpochDetails'
import { QubeDaoEpochStoreProvider } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'
import { QubeDaoEpochsStoreProvider } from '@/modules/QubeDao/providers/QubeDaoEpochsStoreProvider'

export function QubeDaoIndex(): JSX.Element {
    return (
        <>
            <QubeDaoEpochStoreProvider>
                <QubeDaoBaseStats />
                <QubeDaoLastEpochDetails />
            </QubeDaoEpochStoreProvider>
            <QubeDaoEpochsStoreProvider>
                <QubeDaoEpochs />
            </QubeDaoEpochsStoreProvider>
        </>
    )
}
