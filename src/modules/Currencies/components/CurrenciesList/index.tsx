import * as React from 'react'
import classNames from 'classnames'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'

import { PanelLoader } from '@/components/common/PanelLoader'
import { CurrenciesListHeader } from '@/modules/Currencies/components/CurrenciesList/components/CurrenciesListHeader'
import { CurrenciesListPlaceholder } from '@/modules/Currencies/components/CurrenciesList/components/CurrenciesListPlaceholder'
import { CurrenciesListItem } from '@/modules/Currencies/components/CurrenciesList/components/CurrenciesListItem'
import { CurrenciesListEmpty } from '@/modules/Currencies/components/CurrenciesList/components/CurrenciesListEmpty'
import { CurrenciesListPagination } from '@/modules/Currencies/components/CurrenciesList/components/CurrenciesListPagination'
import { useCurrenciesStoreContext } from '@/modules/Currencies/providers'

import styles from './index.module.scss'

export function CurrenciesList(): JSX.Element {
    const currenciesStore = useCurrenciesStoreContext()

    React.useEffect(() => reaction(
        () => currenciesStore.tokensCache.isReady,
        async isTokensCacheReady => {
            if (isTokensCacheReady) {
                await currenciesStore.fetch()
            }
        },
        { delay: 50, fireImmediately: true },
    ), [])

    return (
        <Observer>
            {() => (
                <div className="card card--flat card--xsmall">
                    <div className={classNames('list', styles.currencies_list, styles.list)}>
                        {currenciesStore.currencies.length > 0 && (
                            <CurrenciesListHeader />
                        )}

                        {(() => {
                            const isFetching = currenciesStore.isFetching === undefined || currenciesStore.isFetching

                            switch (true) {
                                case isFetching && currenciesStore.currencies.length === 0:
                                    return <CurrenciesListPlaceholder />

                                case currenciesStore.currencies.length > 0: {
                                    return (
                                        <PanelLoader loading={isFetching}>
                                            {currenciesStore.currencies.map((currency, idx) => (
                                                <CurrenciesListItem
                                                    key={currency.address}
                                                    idx={(
                                                        currenciesStore.pagination.limit
                                                        * (currenciesStore.pagination.currentPage - 1)
                                                    ) + idx + 1}
                                                    currency={currency}
                                                />
                                            ))}
                                        </PanelLoader>
                                    )
                                }

                                default:
                                    return <CurrenciesListEmpty />
                            }
                        })()}
                    </div>

                    {currenciesStore.pagination && currenciesStore.pagination.totalPages > 1 && (
                        <CurrenciesListPagination />
                    )}
                </div>
            )}
        </Observer>
    )
}
