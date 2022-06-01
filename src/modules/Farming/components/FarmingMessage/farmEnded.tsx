import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'

import './index.scss'

function FarmingMessageFarmEndedInner(): JSX.Element | null {
    const intl = useIntl()
    const farmingData = useFarmingDataStore()

    if (!farmingData.isAdmin && !farmingData.isActive) {
        return (
            <div className="farming-message">
                <h3>
                    {intl.formatMessage({
                        id: 'FARMING_MESSAGE_FARM_ENDED_TITLE',
                    })}
                </h3>
            </div>
        )
    }

    return null
}

export const FarmingMessageFarmEnded = observer(FarmingMessageFarmEndedInner)
