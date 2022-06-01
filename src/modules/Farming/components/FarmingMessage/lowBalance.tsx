import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'

import './index.scss'

function FarmingMessageLowBalanceInner(): JSX.Element | null {
    const intl = useIntl()
    const farmingData = useFarmingDataStore()

    if (!farmingData.isAdmin && farmingData.rewardBalanceIsLow === true) {
        return (
            <div className="farming-message farming-message_danger">
                <h3>
                    {intl.formatMessage({
                        id: 'FARMING_MESSAGE_LOW_BALANCE_TITLE',
                    })}
                </h3>
            </div>
        )
    }

    return null
}

export const FarmingMessageLowBalance = observer(FarmingMessageLowBalanceInner)
