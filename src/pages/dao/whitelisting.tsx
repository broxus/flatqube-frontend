import * as React from 'react'

import { Whitelisting } from '@/modules/QubeDao/whitelisting'
import { QubeDaoProvider } from '@/modules/QubeDao/providers/QubeDaoProvider'

export default function Page(): JSX.Element {
    return (
        <div className="container container--xsmall">
            <QubeDaoProvider>
                <Whitelisting />
            </QubeDaoProvider>
        </div>
    )
}
