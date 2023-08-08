import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { AccountExplorerLink } from '@/components/common/AccountExplorerLink'
import { Button } from '@/components/common/Button'
import { CopyToClipboard } from '@/components/common/CopyToClipboard'
import { PageHeader } from '@/components/common/PageHeader'
import { Placeholder } from '@/components/common/Placeholder'
import { RateChange } from '@/components/common/RateChange'
import { TokenIcon } from '@/components/common/TokenIcon'
import { USDTRootAddress, WEVERRootAddress } from '@/config'
import { useCurrencyStoreContext } from '@/modules/Currencies/providers'
import { appRoutes } from '@/routes'
import { checkForScam, formattedAmount, sliceAddress } from '@/utils'

import styles from './index.module.scss'

export function CurrencyPageHeader(): JSX.Element {
    const intl = useIntl()

    const currencyStore = useCurrencyStoreContext()

    const symbol = currencyStore.token?.symbol || currencyStore.currency?.currency

    return (
        <Observer>
            {() => {
                const isFetching = currencyStore.isFetching === undefined || currencyStore.isFetching

                return (
                    <PageHeader
                        actions={isFetching ? null : [
                            <Button
                                key="add-liquidity"
                                link={appRoutes.liquidityAdd.makeUrl({
                                    leftTokenRoot: currencyStore.address,
                                })}
                                type="secondary"
                            >
                                {intl.formatMessage({ id: 'CURRENCY_ADD_LIQUIDITY_BTN_TEXT' })}
                            </Button>,
                            <Button
                                key="trade"
                                link={appRoutes.swap.makeUrl({
                                    leftTokenRoot: currencyStore.address === WEVERRootAddress.toString()
                                        ? USDTRootAddress.toString()
                                        : 'combined',
                                    rightTokenRoot: currencyStore.address,
                                })}
                                type="primary"
                            >
                                {intl.formatMessage({ id: 'CURRENCY_TRADE_BTN_TEXT' })}
                            </Button>,
                        ]}
                        breadcrumb={isFetching ? [{
                            title: <Placeholder width={150} />,
                        }] : [{
                            link: appRoutes.tokens.makeUrl(),
                            title: intl.formatMessage({ id: 'CURRENCY_BREADCRUMB_ROOT' }),
                        }, {
                            title: (
                                <>
                                    {currencyStore.currency?.currency}
                                    &nbsp;
                                    &nbsp;
                                    <AccountExplorerLink
                                        address={currencyStore.address}
                                        className="text-muted"
                                    >
                                        {sliceAddress(currencyStore.address)}
                                    </AccountExplorerLink>
                                    <CopyToClipboard text={currencyStore.address} />
                                </>
                            ),
                        }]}
                        className={styles.currency_header}
                        title={(
                            <div className={styles.currency_header__title_wrapper}>
                                {isFetching ? (
                                    <>
                                        <Placeholder circle width={32} />
                                        <div>
                                            <Placeholder
                                                className={styles.currency_header__title}
                                                height={24}
                                                width={120}
                                            />
                                            <Placeholder
                                                className={styles.currency_header__price}
                                                height={36}
                                                width={100}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <TokenIcon
                                            address={currencyStore.currency?.address}
                                            name={currencyStore.token?.name || currencyStore.currency?.currency}
                                            icon={currencyStore.token?.icon}
                                        />
                                        <div>
                                            <div className={styles.currency_header__title}>
                                                {currencyStore.token?.name || currencyStore.currency?.currency}
                                                <span className="text-muted">
                                                    {symbol}
                                                </span>
                                                {symbol && checkForScam(symbol) && (
                                                    <span className="text-danger">[SCAM]</span>
                                                )}
                                            </div>
                                            <div className={styles.currency_header__price}>
                                                {`$${formattedAmount(currencyStore.currency?.price)}`}
                                                {currencyStore.currency?.priceChange !== undefined && (
                                                    <RateChange value={currencyStore.currency.priceChange} />
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    />
                )
            }}
        </Observer>
    )
}
