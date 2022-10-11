import * as React from 'react'
import { useIntl } from 'react-intl'

import { PageHeader } from '@/components/common/PageHeader'
import { QubeDaoIndex } from '@/modules/QubeDao'
import { QubeDaoProvider } from '@/modules/QubeDao/providers/QubeDaoProvider'

export default function Page(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="container container--large">
            <PageHeader
                title={intl.formatMessage({
                    id: 'QUBE_DAO_INDEX_HEADER_TITLE',
                })}
            />
            <QubeDaoProvider>
                <QubeDaoIndex />
            </QubeDaoProvider>
        </div>
    )
}
