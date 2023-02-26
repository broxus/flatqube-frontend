import * as React from 'react'
import { useIntl } from 'react-intl'

import { OrderingSwitcher } from '@/components/common/OrderingSwitcher'
import { useCurrencyTransactionsStoreContext } from '@/modules/Currencies/providers'
import { CurrencyTransactionsOrdering } from '@/modules/Currencies/types'

export function TransactionsListHeader(): JSX.Element {
    const intl = useIntl()

    const transactionsStore = useCurrencyTransactionsStoreContext()

    const onSwitchOrdering = async (value: CurrencyTransactionsOrdering) => {
        transactionsStore.setState('ordering', value)
        await transactionsStore.fetch(true)
    }

    return (
        <div className="list__header">
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'CURRENCY_TRANSACTIONS_LIST_HEADER_TYPE_CELL' })}
            </div>
            <div className="list__cell list__cell--left">
                {intl.formatMessage({ id: 'CURRENCY_TRANSACTIONS_LIST_HEADER_TOKENS_CELL' })}
            </div>
            <div className="list__cell list__cell--right">
                <OrderingSwitcher
                    ascending={CurrencyTransactionsOrdering.TvAscending}
                    descending={CurrencyTransactionsOrdering.TvDescending}
                    value={transactionsStore.ordering}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage(
                        { id: 'CURRENCY_TRANSACTIONS_LIST_HEADER_TOTAL_VALUE_CELL' },
                    )}
                </OrderingSwitcher>
            </div>
            <div className="list__cell list__cell--right">
                {intl.formatMessage(
                    { id: 'CURRENCY_TRANSACTIONS_LIST_HEADER_ACCOUNT_CELL' },
                )}
            </div>
            <div className="list__cell list__cell--right">
                <OrderingSwitcher
                    ascending={CurrencyTransactionsOrdering.BlockTimeAscending}
                    descending={CurrencyTransactionsOrdering.BlockTimeDescending}
                    value={transactionsStore.ordering}
                    onSwitch={onSwitchOrdering}
                >
                    {intl.formatMessage({ id: 'CURRENCY_TRANSACTIONS_LIST_HEADER_DATE_CELL' })}
                </OrderingSwitcher>
            </div>
        </div>
    )
}
