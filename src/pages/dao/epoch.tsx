import * as React from 'react'
import { useParams } from 'react-router-dom'

import { QubeDaoEpoch } from '@/modules/QubeDao/epoch'
import { QubeDaoProvider } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoEpochStoreProvider } from '@/modules/QubeDao/providers/QubeDaoEpochStoreProvider'

export default function Page(): JSX.Element {
    const params = useParams<{ epochNum: string }>()

    return (
        <div className="container container--large">
            <QubeDaoProvider>
                <QubeDaoEpochStoreProvider epochNum={params.epochNum}>
                    <QubeDaoEpoch />
                </QubeDaoEpochStoreProvider>
            </QubeDaoProvider>
        </div>
    )
}
