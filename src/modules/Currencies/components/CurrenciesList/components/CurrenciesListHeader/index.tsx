import * as React from 'react'
import { useIntl } from 'react-intl'

import { OrderingSwitcher } from '@/components/common/OrderingSwitcher'
import { useCurrenciesStoreContext } from '@/modules/Currencies/providers'
import { CurrenciesOrdering } from '@/modules/Currencies/types'

export function CurrenciesListHeader(): JSX.Element {
    const intl = useIntl()

    const currenciesStore = useCurrenciesStoreContext()

    const onSwitchOrdering = async (value: CurrenciesOrdering) => {
        currenciesStore.setState({
            ordering: value,
            pagination: {
                ...currenciesStore.pagination,
                currentPage: 1,
            },
        })
        await currenciesStore.fetch()
    }

    return (
        <div className="list__header">
            <div className="list__cell list__cell--center visible@m">#</div>
            <div className="list__cell list__cell--left">
                {intl.formatMessage({
                    id: 'CURRENCIES_LIST_HEADER_NAME_CELL',
                })}
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage({
                    id: 'CURRENCIES_LIST_HEADER_PRICE_CELL',
                })}
            </div>
            <div className="list__cell list__cell--right visible@s">
                {intl.formatMessage({
                    id: 'CURRENCIES_LIST_HEADER_VOLUME24_CELL',
                })}
            </div>
            <div className="list__cell list__cell--right visible@s">
                <OrderingSwitcher<CurrenciesOrdering>
                    ascending={CurrenciesOrdering.TvlAscending}
                    descending={CurrenciesOrdering.TvlDescending}
                    value={currenciesStore.ordering}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage({
                        id: 'CURRENCIES_LIST_HEADER_TVL_CELL',
                    })}
                </OrderingSwitcher>
            </div>
        </div>
    )
}
