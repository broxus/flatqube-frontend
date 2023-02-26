import * as React from 'react'
import { useIntl } from 'react-intl'

import { SectionTitle } from '@/components/common/SectionTitle'
import { PoolsStoreProvider } from '@/modules/Pools/context'
import { PoolsList } from '@/modules/Pools/components'
import { useFavoritesPoolsStorage } from '@/modules/Pools/hooks/useFavoritesPoolsStorage'

export function FavoritesPools(): JSX.Element | null {
    const intl = useIntl()
    const pools = useFavoritesPoolsStorage()

    if (pools.length === 0) {
        return null
    }

    return (
        <section className="section">
            <header className="section__header">
                <SectionTitle size="small">
                    {intl.formatMessage({ id: 'POOLS_FAVORITE_LIST_TITLE' })}
                </SectionTitle>
            </header>

            <PoolsStoreProvider params={{ pools }}>
                <PoolsList placeholderRowsCount={pools.length > 10 ? 10 : pools.length} />
            </PoolsStoreProvider>
        </section>
    )
}
