import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Breadcrumb } from '@/components/common/Breadcrumb'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { appRoutes } from '@/routes'
import { Placeholder } from '@/components/common/Placeholder'

export function FarmingBreadcrumbInner(): JSX.Element {
    const intl = useIntl()
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

    return (
        <Breadcrumb
            key="breadcrumb"
            items={[{
                link: appRoutes.farming.makeUrl(),
                title: intl.formatMessage({
                    id: 'FARMING_ITEM_BREADCRUMB_LIST',
                }),
            }, {
                title: intl.formatMessage({
                    id: 'FARMING_ITEM_BREADCRUMB_ITEM',
                }, {
                    symbol: farmingData.symbol,
                }),
            }]}
        />
    )
}

export const FarmingBreadcrumb = observer(FarmingBreadcrumbInner)
