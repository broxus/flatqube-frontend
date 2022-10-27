import * as React from 'react'
import { useIntl } from 'react-intl'


import { PageHeader } from '@/components/common/PageHeader'
import { QubeDaoWhitelistingForm } from '@/modules/QubeDao/components/QubeDaoWhitelistingForm'
import { QubeDaoWhitelistingFormStoreProvider } from '@/modules/QubeDao/providers/QubeDaoWhitelistingFormStoreProvider'

export function Whitelisting(): JSX.Element {
    const intl = useIntl()

    return (
        <>
            <PageHeader title={intl.formatMessage({ id: 'QUBE_DAO_WHITELIST_FORM_TITLE' })} />
            <section className="section">
                <QubeDaoWhitelistingFormStoreProvider>
                    <QubeDaoWhitelistingForm />
                </QubeDaoWhitelistingFormStoreProvider>
            </section>
        </>
    )
}
