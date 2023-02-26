import * as React from 'react'
import { Link } from 'react-router-dom'

import { RateChange } from '@/components/common/RateChange'
import { CurrencyBadge } from '@/modules/Currencies/components/CurrenciesCommon/CurrencyBadge'
import { useCurrenciesStoreContext } from '@/modules/Currencies/providers'
import type { CurrencyResponse } from '@/modules/Currencies/types'
import { parseCurrencyBillions } from '@/utils'
import { appRoutes } from '@/routes'
import { Token } from '@/misc'

type Props = {
    currency: CurrencyResponse;
    idx: number;
}

export function CurrenciesListItem({ currency, idx }: Props): JSX.Element {
    const currenciesStore = useCurrenciesStoreContext()

    const token = React.useMemo(
        () => currenciesStore.tokensCache.get(currency.address) ?? (
            {
                address: currency.address,
                root: currency.address,
                symbol: currency.currency,
            } as unknown as Token),
        [currency.address],
    )
    const price = React.useMemo(() => parseCurrencyBillions(currency.price), [currency.price])
    const volume24h = React.useMemo(() => parseCurrencyBillions(currency.volume24h), [currency.volume24h])
    const tvl = React.useMemo(() => parseCurrencyBillions(currency.tvl), [currency.tvl])

    return (
        <div className="list__row">
            <div className="list__cell list__cell--center visible@m">{idx}</div>
            <Link to={appRoutes.token.makeUrl({ address: currency.address })} className="list__cell">
                <div className="list__cell-inner">
                    <CurrencyBadge address={currency.address} linkable={false} token={token} />
                </div>
            </Link>
            <div className="list__cell list__cell--right">
                {price}
                <div>
                    <RateChange value={currency.priceChange} size="sm" />
                </div>
            </div>
            <div className="list__cell list__cell--right visible@s">
                {volume24h}
                <div>
                    <RateChange value={currency.volumeChange24h} size="sm" />
                </div>
            </div>
            <div className="list__cell list__cell--right visible@s">
                {tvl}
                <div>
                    <RateChange value={currency.tvlChange} size="sm" />
                </div>
            </div>
        </div>
    )
}
