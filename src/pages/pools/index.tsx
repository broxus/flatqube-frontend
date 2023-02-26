import * as React from 'react'
import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { PageHeader } from '@/components/common/PageHeader'
import { Pools } from '@/modules/Pools'
import { appRoutes } from '@/routes'

export default function Page(): JSX.Element {
    const intl = useIntl()

    return (
        <div className="container container--large">
            <PageHeader
                actions={(
                    <>
                        <Button size="md" link={appRoutes.liquidityRemove.makeUrl()} type="secondary">
                            {intl.formatMessage({ id: 'POOLS_HEADER_REMOVE_LIQUIDITY_LINK_TEXT' })}
                        </Button>
                        <Button size="md" link={appRoutes.liquidityAdd.makeUrl()} type="primary">
                            {intl.formatMessage({ id: 'POOLS_HEADER_ADD_LIQUIDITY_LINK_TEXT' })}
                        </Button>
                    </>
                )}
                title={intl.formatMessage({ id: 'POOLS_HEADER_TITLE' })}
            />
            <Pools />
        </div>
    )
}
