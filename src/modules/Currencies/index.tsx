import * as React from 'react'
import { Observer } from 'mobx-react-lite'

import { Pagination } from '@/components/common/Pagination'
import { CurrenciesList } from '@/modules/Currencies/components/CurrenciesList'
import { useCurrenciesStore } from '@/modules/Currencies/stores/CurrenciesStore'
import { CurrenciesOrdering } from '@/modules/Currencies/types'


export function Currencies(): JSX.Element {
    const store = useCurrenciesStore()

    const onNextPage = async () => {
        if (store.currentPage < store.totalPages) {
            store.changeState('currentPage', store.currentPage + 1)
            await store.load()
        }
    }

    const onPrevPage = async () => {
        if (store.currentPage > 1) {
            store.changeState('currentPage', store.currentPage - 1)
            await store.load()
        }
    }

    const onChangePage = async (value: number) => {
        store.changeState('currentPage', value)
        await store.load()
    }

    const onSwitchOrdering = async (value: CurrenciesOrdering) => {
        store.changeState('ordering', value)
        store.changeState('currentPage', 1)
        await store.load()
    }

    React.useEffect(() => {
        (async () => {
            await store.load()
        })()
        return () => {
            store.dispose()
        }
    }, [])

    return (
        <div className="card card--small card--flat">
            <Observer>
                {() => (
                    <>
                        <CurrenciesList
                            currencies={store.currencies}
                            isLoading={store.isLoading}
                            offset={store.limit * (store.currentPage - 1)}
                            ordering={store.ordering}
                            onSwitchOrdering={onSwitchOrdering}
                        />

                        <Pagination
                            currentPage={store.currentPage}
                            disabled={store.isLoading}
                            totalPages={store.totalPages}
                            onNext={onNextPage}
                            onPrev={onPrevPage}
                            onSubmit={onChangePage}
                        />
                    </>
                )}
            </Observer>
        </div>
    )
}
