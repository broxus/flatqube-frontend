import * as React from 'react'
import { Observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { PageHeader } from '@/components/common/PageHeader'
import { Builder } from '@/modules/Builder'
import { FilterField } from '@/modules/Builder/components'
import { WalletMiddleware } from '@/modules/WalletMiddleware'
import { useWallet } from '@/stores/WalletService'


export default function Page(): JSX.Element {
    const intl = useIntl()
    const wallet = useWallet()

    return (
        <div className="container container--large">
            <section className="section">
                <PageHeader
                    actions={(
                        <Observer>
                            {() => (
                                <div className="section__header-actions">
                                    {wallet.isReady && (
                                        <>
                                            <FilterField className="filter" />
                                            <Button
                                                link="/builder/create"
                                                size="md"
                                                type="primary"
                                            >
                                                {intl.formatMessage({
                                                    id: 'BUILDER_HEADER_CREATE_LINK_TEXT',
                                                })}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </Observer>
                    )}
                    title={intl.formatMessage({ id: 'BUILDER_HEADER_TITLE' })}
                />

                <WalletMiddleware>
                    <Builder />
                </WalletMiddleware>
            </section>
        </div>
    )
}
