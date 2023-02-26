import * as React from 'react'
import { useParams } from 'react-router-dom'

import { Currency } from '@/modules/Currencies/currency'
import { CurrencyStoreProvider } from '@/modules/Currencies/providers'

export default function Page(): JSX.Element {
    const { address } = useParams<{ address: string }>()

    return (
        <div className="container container--large">
            <CurrencyStoreProvider address={address}>
                <Currency />
            </CurrencyStoreProvider>
        </div>
    )
}
