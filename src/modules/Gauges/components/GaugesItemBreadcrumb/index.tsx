import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { Breadcrumb, BreadcrumbItem } from '@/components/common/Breadcrumb'
import { Placeholder } from '@/components/common/Placeholder'
import { sliceAddress } from '@/utils'
import { appRoutes } from '@/routes'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'

function GaugesItemBreadcrumbInner(): JSX.Element {
    const intl = useIntl()
    const params = useParams<any>()
    const data = useContext(GaugesDataStoreContext)

    let symbol
    if (data.poolTokens && data.poolTokens.length > 0) {
        symbol = data.poolTokens.map(token => token.symbol).join('/')
    }

    if (!symbol) {
        return (
            <Breadcrumb
                items={[{
                    title: <Placeholder width={320} />,
                }]}
            />
        )
    }

    const items: BreadcrumbItem[] = [{
        link: appRoutes.gauges.makeUrl(),
        title: intl.formatMessage({
            id: 'GAUGE_ITEM_BREADCRUMB_LIST',
        }),
    }]

    if (params.user) {
        items.push({
            link: appRoutes.gaugesItem.makeUrl({
                address: params.address,
            }),
            title: intl.formatMessage({
                id: 'GAUGE_ITEM_BREADCRUMB_ITEM',
            }, {
                symbol,
            }),
        })
        items.push({
            title: intl.formatMessage({
                id: 'GAUGE_ITEM_BREADCRUMB_USER_ITEM',
            }, {
                address: sliceAddress(params.user),
            }),
        })
    }
    else {
        items.push({
            title: intl.formatMessage({
                id: 'GAUGE_ITEM_BREADCRUMB_ITEM',
            }, {
                symbol,
            }),
        })
    }

    return (
        <Breadcrumb
            key="breadcrumb"
            items={items}
        />
    )
}

export const GaugesItemBreadcrumb = observer(GaugesItemBreadcrumbInner)
