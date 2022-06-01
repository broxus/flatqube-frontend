import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { TokenIcon } from '@/components/common/TokenIcon'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { RateChange } from '@/components/common/RateChange'
import { CurrencyPairs } from '@/modules/Currencies/components/CurrencyPairs'
import { CurrencyTransactions } from '@/modules/Currencies/components/CurrencyTransactions'
import { Stats } from '@/modules/Currencies/components/Stats'
import { useCurrencyStore } from '@/modules/Currencies/providers/CurrencyStoreProvider'
import { useTokensCache } from '@/stores/TokensCacheService'
import { parseCurrencyBillions, sliceAddress } from '@/utils'
import { Placeholder } from '@/components/common/Placeholder'

import './currency.scss'


function CurrencyInner(): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const store = useCurrencyStore()

    const token = React.useMemo(() => (
        store.currency?.address ? tokensCache.get(store.currency.address) : undefined
    ), [store.currency?.address, tokensCache.tokens])

    const price = React.useMemo(
        () => (store.currency?.price
            ? parseCurrencyBillions(store.currency?.price)
            : undefined),
        [store.currency?.price],
    )

    return (
        <div className="container container--large">
            <section className="section">
                <Breadcrumb
                    items={store.currency ? [{
                        link: '/tokens',
                        title: intl.formatMessage({ id: 'CURRENCY_BREADCRUMB_ROOT' }),
                    }, {
                        title: (
                            <>
                                {store.currency?.currency}
                                <span>{sliceAddress(store.currency?.address)}</span>
                            </>
                        ),
                    }] : [{
                        title: (
                            <Placeholder width={150} />
                        ),
                    }]}
                />

                <header className="currency-page__header">
                    <div>
                        <div className="currency-page__token">
                            {token || store.currency ? (
                                <>
                                    <TokenIcon
                                        address={token?.root || store.currency?.address}
                                        className="currency-page__token-icon"
                                        name={token?.symbol}
                                        size="small"
                                        icon={token?.icon}
                                    />
                                    <div className="currency-page__token-name">
                                        {token?.name || store.currency?.currency}
                                        <span>
                                            {token?.symbol}
                                        </span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Placeholder circle width={24} />
                                    <Placeholder width={170} />
                                </>
                            )}
                        </div>
                        <div className="currency-page__price">
                            <div className="currency-page__price-currency-cost">
                                {price ?? (
                                    <Placeholder width={100} />
                                )}
                            </div>
                            {store.currency?.priceChange !== undefined && (
                                <RateChange value={store.currency.priceChange} />
                            )}
                        </div>
                    </div>

                    <div className="currency-page__header-actions">
                        {store.currency?.address && (
                            <AccountExplorerLink
                                address={store.currency?.address}
                                className="btn btn-md btn-icon"
                            >
                                <Icon icon="externalLink" />
                            </AccountExplorerLink>
                        )}
                        <div className="currency-page__header-actions-inner">
                            <Button
                                size="md"
                                type="secondary"
                                link={store.currency
                                    ? `/pool/${store.currency?.address}`
                                    : undefined}
                                disabled={!store.currency}
                            >
                                {intl.formatMessage({
                                    id: 'CURRENCY_ADD_LIQUIDITY_BTN_TEXT',
                                })}
                            </Button>
                            <Button
                                size="md"
                                type="primary"
                                link={store.currency
                                    ? `/swap/${store.currency?.address}`
                                    : undefined}
                                disabled={!store.currency}
                            >
                                {intl.formatMessage({
                                    id: 'CURRENCY_TRADE_BTN_TEXT',
                                })}
                            </Button>
                        </div>
                    </div>
                </header>

                <Stats />
            </section>

            <CurrencyPairs key="pairs" />

            <CurrencyTransactions key="transactions" />
        </div>
    )
}


export const Currency = observer(CurrencyInner)
