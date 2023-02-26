import * as React from 'react'
import { useIntl } from 'react-intl'

import { PageHeader } from '@/components/common/PageHeader'
import { Currencies } from '@/modules/Currencies'

export default function Page(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="container container--large">
            <PageHeader
                title={intl.formatMessage({
                    id: 'CURRENCIES_HEADER_TITLE',
                })}
            />
            <Currencies />
        </div>
    )
}
