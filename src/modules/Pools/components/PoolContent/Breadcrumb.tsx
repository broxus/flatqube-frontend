import * as React from 'react'
import { useIntl } from 'react-intl'

import { Breadcrumb as BreadcrumbBase } from '@/components/common/Breadcrumb'
import { appRoutes } from '@/routes'
import { concatSymbols } from '@/utils'
import { PoolContent } from '@/modules/Pools/hooks/usePoolContent'
import { Placeholder } from '@/components/common/Placeholder'

type Props = {
    poolContent: PoolContent
}

export function PoolBreadcrumb({
    poolContent,
}: Props): JSX.Element {
    const intl = useIntl()
    const { leftToken, rightToken } = poolContent

    if (!leftToken && !rightToken) {
        return (
            <BreadcrumbBase
                key="placeholder"
                items={[{
                    title: (
                        <Placeholder width={220} />
                    ),
                }]}
            />
        )
    }

    return (
        <BreadcrumbBase
            items={[{
                link: appRoutes.poolList.makeUrl(),
                title: intl.formatMessage({
                    id: 'POOLS_LIST_ITEM_OVERVIEW',
                }),
            }, {
                title: intl.formatMessage({
                    id: 'POOLS_LIST_ITEM_TITLE',
                }, {
                    symbol: concatSymbols(
                        leftToken?.symbol,
                        rightToken?.symbol,
                    ),
                }),
            }]}
        />
    )
}
