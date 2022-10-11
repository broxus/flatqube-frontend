import * as React from 'react'
import { useIntl } from 'react-intl'

import { PageHeader } from '@/components/common/PageHeader'
import { QubeDaoBalance } from '@/modules/QubeDao/balance'
import { QubeDaoDepositsStoreProvider } from '@/modules/QubeDao/providers/QubeDaoDepositsStoreProvider'
import { QubeDaoContext, QubeDaoProvider } from '@/modules/QubeDao/providers/QubeDaoProvider'
import { QubeDaoTransactionsStoreProvider } from '@/modules/QubeDao/providers/QubeDaoTransactionsStoreProvider'
import { WalletMiddleware } from '@/modules/WalletMiddleware'
import { appRoutes } from '@/routes'

export default function Page(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="container container--large">
            <PageHeader
                breadcrumb={[
                    {
                        link: appRoutes.dao.makeUrl(),
                        title: intl.formatMessage({ id: 'QUBE_DAO_BREADCRUMB_BALANCE_ROOT' }),
                    },
                    {
                        title: intl.formatMessage({ id: 'QUBE_DAO_BREADCRUMB_BALANCE' }),
                    },
                ]}
                title={intl.formatMessage({
                    id: 'QUBE_DAO_BALANCE_HEADER_TITLE',
                })}
            />

            <QubeDaoProvider>
                <QubeDaoContext.Consumer>
                    {context => (
                        <WalletMiddleware
                            message={intl.formatMessage(
                                { id: 'QUBE_DAO_BALANCE_WALLET_MIDDLEWARE_MESSAGE' },
                                { veSymbol: context.veSymbol },
                            )}
                        >
                            <QubeDaoDepositsStoreProvider>
                                <QubeDaoTransactionsStoreProvider>
                                    <QubeDaoBalance />
                                </QubeDaoTransactionsStoreProvider>
                            </QubeDaoDepositsStoreProvider>
                        </WalletMiddleware>
                    )}
                </QubeDaoContext.Consumer>
            </QubeDaoProvider>
        </div>
    )
}
