import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { appRoutes } from '@/routes'
import { Badge } from '@/components/common/Badge'

import styles from './index.module.scss'

export function GaugesListHead(): JSX.Element {
    const intl = useIntl()

    return (
        <div className={styles.head}>
            <h1 className={styles.title}>
                {intl.formatMessage({
                    id: 'GAUGE_LIST_TITLE',
                })}
                {' '}
                <sup>
                    <Badge>
                        {intl.formatMessage({
                            id: 'GAUGE_NEW',
                        })}
                    </Badge>
                </sup>
            </h1>

            <Button
                size="md"
                type="primary"
                link={appRoutes.gaugesCreate.makeUrl()}
            >
                {intl.formatMessage({
                    id: 'GAUGE_LIST_CREATE_BTN',
                })}
            </Button>
        </div>
    )
}
