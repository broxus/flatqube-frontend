import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { SectionTitle } from '@/components/common/SectionTitle'
import { Farmings } from '@/modules/Farming'
import { appRoutes } from '@/routes'
import { Badge } from '@/components/common/Badge'

export default function Page(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="container container--large">
            <section className="section">
                <div className="section__header">
                    <SectionTitle>
                        {intl.formatMessage({
                            id: 'FARMING_LIST_TITLE',
                        })}
                        {' '}
                        <sup>
                            <Badge type="yellow" size="sm">
                                {intl.formatMessage({
                                    id: 'GAUGE_OLD',
                                })}
                            </Badge>
                        </sup>
                    </SectionTitle>
                    <Button
                        link={appRoutes.farmingCreate.path}
                        size="md"
                        type="primary"
                    >
                        {intl.formatMessage({
                            id: 'FARMING_LIST_CREATE_BTN',
                        })}
                    </Button>
                </div>

                <Farmings />
            </section>
        </div>
    )
}
