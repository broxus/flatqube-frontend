import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'

import { Breadcrumb, BreadcrumbItem } from '@/components/common/Breadcrumb'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { appRoutes } from '@/routes'
import { Placeholder } from '@/components/common/Placeholder'
import { sliceAddress } from '@/utils'

export function FarmingBreadcrumbInner(): JSX.Element {
    const intl = useIntl()
    const params = useParams<any>()
    const farmingData = useFarmingDataStore()

    if (!farmingData.symbol) {
        return (
            <Breadcrumb
                key="placeholder"
                items={[{
                    title: (
                        <Placeholder width={320} />
                    ),
                }]}
            />
        )
    }

    const items: BreadcrumbItem[] = [{
        link: appRoutes.farming.makeUrl(),
        title: intl.formatMessage({
            id: 'FARMING_ITEM_BREADCRUMB_LIST',
        }),
    }]

    if (params.user) {
        items.push({
            link: appRoutes.farmingItem.makeUrl({
                address: params.address,
            }),
            title: intl.formatMessage({
                id: 'FARMING_ITEM_BREADCRUMB_ITEM',
            }, {
                symbol: farmingData.symbol,
            }),
        })
        items.push({
            title: intl.formatMessage({
                id: 'FARMING_ITEM_BREADCRUMB_USER_ITEM',
            }, {
                address: sliceAddress(params.user),
            }),
        })
    }
    else {
        items.push({
            title: intl.formatMessage({
                id: 'FARMING_ITEM_BREADCRUMB_ITEM',
            }, {
                symbol: farmingData.symbol,
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

export const FarmingBreadcrumb = observer(FarmingBreadcrumbInner)
