import * as React from 'react'
import { useIntl } from 'react-intl'

import { Currencies } from '@/modules/Currencies'


export default function Page(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="container container--large">
            <section className="section">
                <header className="section__header">
                    <h2 className="section-title">
                        {intl.formatMessage({
                            id: 'CURRENCIES_HEADER_TITLE',
                        })}
                    </h2>
                </header>

                <Currencies />
            </section>
        </div>
    )
}
