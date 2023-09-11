import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { appRoutes } from '@/routes'
import { Badge } from '@/components/common/Badge'
import { GaugesHead } from '@/modules/Gauges/components/GaugesHead'

export function GaugesListHead(): JSX.Element {
    const intl = useIntl()

    return (
        <GaugesHead
            action={(
                <Button
                    size="md"
                    type="primary"
                    link={appRoutes.gaugesCreate.makeUrl()}
                >
                    {intl.formatMessage({
                        id: 'GAUGE_LIST_CREATE_BTN',
                    })}
                </Button>
            )}
        >
            {intl.formatMessage({
                id: 'GAUGE_LIST_TITLE',
            })}
            {' '}
            <sup>
                <Badge size="sm">
                    {intl.formatMessage({
                        id: 'GAUGE_NEW',
                    })}
                </Badge>
            </sup>
        </GaugesHead>
    )
}
