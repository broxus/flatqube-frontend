import * as React from 'react'
import { useIntl } from 'react-intl'

import { OrderingSwitcher } from '@/components/common/OrderingSwitcher'
import { PanelLoader } from '@/components/common/PanelLoader'
import { Item } from '@/modules/Currencies/components/CurrenciesList/Item'
import { CurrenciesOrdering, CurrencyInfo } from '@/modules/Currencies/types'
import { Placeholder } from '@/modules/Currencies/components/CurrenciesList/Placeholder'
import { makeArray, uniqueId } from '@/utils'

import './index.scss'


type Props = {
    currencies: CurrencyInfo[];
    isLoading: boolean;
    offset: number;
    ordering: CurrenciesOrdering | undefined;
    onSwitchOrdering: (value: CurrenciesOrdering) => void;
}


export function CurrenciesList({
    currencies,
    isLoading,
    offset = 0,
    ordering,
    onSwitchOrdering,
}: Props): JSX.Element {
    const intl = useIntl()

    const placeholder = React.useRef(makeArray(10, uniqueId))

    return (
        <div className="currencies-list list">
            <div className="list__header">
                <div className="list__cell list__cell--left visible@m">#</div>
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
                    <OrderingSwitcher
                        ascending="tvlascending"
                        descending="tvldescending"
                        value={ordering}
                        onSwitch={onSwitchOrdering}
                    >
                        {intl.formatMessage({
                            id: 'CURRENCIES_LIST_HEADER_TVL_CELL',
                        })}
                    </OrderingSwitcher>
                </div>
            </div>

            {isLoading && currencies.length === 0 ? (
                placeholder.current.map(key => (
                    <Placeholder key={key} />
                ))
            ) : (
                <PanelLoader loading={isLoading && currencies.length > 0}>
                    {currencies.map((currency, idx) => (
                        <Item
                            key={currency.address}
                            currency={currency}
                            idx={offset + idx + 1}
                        />
                    ))}
                </PanelLoader>
            )}
        </div>
    )
}
