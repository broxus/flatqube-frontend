import * as React from 'react'
import { useIntl } from 'react-intl'

import { Token } from '@/modules/Builder/token'
import { PageHeader } from '@/components/common/PageHeader'


export default function Page(): JSX.Element {
    const intl = useIntl()
    return (
        <div className="container container--large">
            <section className="manage-token section">
                <PageHeader
                    title={intl.formatMessage({
                        id: 'BUILDER_MANAGE_TOKEN_HEADER_TITLE',
                    })}
                />
                <Token />
            </section>
        </div>
    )
}
