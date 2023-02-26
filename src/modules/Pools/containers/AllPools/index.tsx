import * as React from 'react'
import { useIntl } from 'react-intl'

import { SectionTitle } from '@/components/common/SectionTitle'
import { PoolsStoreProvider } from '@/modules/Pools/context'
import { PoolsList } from '@/modules/Pools/components'

export function AllPools(): JSX.Element {
    const intl = useIntl()

    return (
        <section className="section">
            <header className="section__header">
                <SectionTitle size="small">
                    {intl.formatMessage({ id: 'POOLS_LIST_TITLE' })}
                </SectionTitle>
            </header>

            <PoolsStoreProvider>
                <PoolsList />
            </PoolsStoreProvider>
        </section>
    )
}
