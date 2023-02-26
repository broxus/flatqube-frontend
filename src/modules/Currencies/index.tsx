import * as React from 'react'
import { useIntl } from 'react-intl'

import { SectionTitle } from '@/components/common/SectionTitle'
import { CurrenciesList } from '@/modules/Currencies/components'
import { CurrenciesStoreProvider } from '@/modules/Currencies/providers'

export function Currencies(): JSX.Element {
    const intl = useIntl()

    return (
        <section className="section">
            <header className="section__header">
                <SectionTitle size="small">
                    {intl.formatMessage({ id: 'CURRENCIES_LIST_TITLE' })}
                </SectionTitle>
            </header>

            <CurrenciesStoreProvider>
                <CurrenciesList />
            </CurrenciesStoreProvider>
        </section>
    )
}
