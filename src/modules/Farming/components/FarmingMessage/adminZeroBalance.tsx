import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'

import './index.scss'

function FarmingMessageAdminZeroBalanceInner(): JSX.Element | null {
    const intl = useIntl()
    const farmingData = useFarmingDataStore()

    if (farmingData.isAdmin && farmingData.rewardBalanceIsZero === true) {
        return (
            <div className="farming-message farming-message_danger">
                <div>
                    <h3>
                        {intl.formatMessage({
                            id: 'FARMING_MESSAGE_ADMIN_NULL_BALANCE_TITLE',
                        })}
                    </h3>
                    <p
                        dangerouslySetInnerHTML={{
                            __html: intl.formatMessage({
                                id: 'FARMING_MESSAGE_ADMIN_NULL_BALANCE_TEXT',
                            }),
                        }}
                    />
                </div>

                <div className="farming-message__actions">
                    <Button
                        href="#pool-management"
                        size="md"
                        type="primary"
                    >
                        {intl.formatMessage({
                            id: 'FARMING_MESSAGE_ADMIN_NULL_BALANCE_BTN',
                        })}
                    </Button>
                </div>
            </div>
        )
    }

    return null
}

export const FarmingMessageAdminZeroBalance = observer(FarmingMessageAdminZeroBalanceInner)
