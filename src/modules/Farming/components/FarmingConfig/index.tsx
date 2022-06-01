import { DateTime } from 'luxon'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { Warning } from '@/components/common/Warning'
import { TextInput } from '@/components/common/TextInput'
import { useTokensCache } from '@/stores/TokensCacheService'
import { useFarmingEndDateConfigStore } from '@/modules/Farming/stores/FarmingEndDateConfigStore'
import { useFarmingDataStore } from '@/modules/Farming/stores/FarmingDataStore'
import { useFarmingRoundConfigStore } from '@/modules/Farming/stores/FarmingRoundConfigStore'

import './index.scss'

type Props = {
    onClose: () => void;
}

enum Tab {
    Speed = 1,
    EndTime = 2
}

function FarmingConfigInner({
    onClose,
}: Props): JSX.Element {
    const intl = useIntl()
    const tokensCache = useTokensCache()
    const farmingData = useFarmingDataStore()
    const farmingEndDateConfig = useFarmingEndDateConfigStore()
    const farmingRoundConfig = useFarmingRoundConfigStore()
    const [currentTab, setCurrentTab] = React.useState(Tab.Speed)
    const [confirmationVisible, setConfirmationVisible] = React.useState(false)
    const rewardTokens = farmingData.rewardTokensAddress?.map(root => tokensCache.get(root))
    const actualEndDateTime = DateTime.fromMillis(farmingData.endTime)

    const submitReward = async () => {
        await farmingRoundConfig.submit()
        onClose()
    }

    const submitEndDate = async () => {
        await farmingEndDateConfig.submit()
        onClose()
    }

    const showConfirmation = () => {
        setConfirmationVisible(true)
    }

    const hideConfirmation = () => {
        setConfirmationVisible(false)
    }

    return ReactDOM.createPortal(
        <div className="popup">
            <div onClick={onClose} className="popup-overlay" />
            <div className="popup__wrap farming-config">
                <h2 className="farming-config__title">
                    {intl.formatMessage({
                        id: confirmationVisible
                            ? 'FARMING_CONFIG_CONFIRMATION_TITLE'
                            : 'FARMING_CONFIG_TITLE',
                    })}

                    <Button
                        className="popup-close"
                        type="icon"
                        onClick={onClose}
                    >
                        <Icon icon="close" />
                    </Button>
                </h2>

                {confirmationVisible ? (
                    <>
                        <div className="farming-config__warning">
                            {intl.formatMessage({
                                id: 'FARMING_CONFIG_CONFIRMATION_TEXT',
                            })}
                        </div>

                        <div className="farming-config__action">
                            <Button
                                disabled={farmingEndDateConfig.loading}
                                onClick={hideConfirmation}
                                type="tertiary"
                            >
                                {intl.formatMessage({
                                    id: 'FARMING_CONFIG_CONFIRMATION_NO',
                                })}
                            </Button>
                            <Button
                                disabled={!farmingEndDateConfig.endDateIsValid
                                    || farmingEndDateConfig.loading}
                                onClick={submitEndDate}
                                type="danger"
                            >
                                {intl.formatMessage({
                                    id: 'FARMING_CONFIG_CONFIRMATION_YES',
                                })}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <ul className="farming-config__tabs">
                            <li
                                className={currentTab === Tab.Speed ? 'active' : undefined}
                                onClick={() => setCurrentTab(Tab.Speed)}
                            >
                                {intl.formatMessage({
                                    id: 'FARMING_CONFIG_TAB_SPEED',
                                })}
                            </li>
                            <li
                                className={currentTab === Tab.EndTime ? 'active' : undefined}
                                onClick={() => setCurrentTab(Tab.EndTime)}
                            >
                                {intl.formatMessage({
                                    id: 'FARMING_CONFIG_TAB_END_TIME',
                                })}
                            </li>
                        </ul>

                        {currentTab === Tab.Speed && (
                            <>
                                {rewardTokens?.map((token, index) => (
                                    token && (
                                        <div className="farming-config__filed" key={token.root}>
                                            <div className="farming-config__label">
                                                {intl.formatMessage({
                                                    id: 'FARMING_CONFIG_REWARD_AMOUNT_LABEL',
                                                }, {
                                                    symbol: token.symbol,
                                                })}
                                            </div>
                                            <TextInput
                                                placeholder={intl.formatMessage({
                                                    id: 'FARMING_CONFIG_REWARD_AMOUNT_PLACEHOLDER',
                                                })}
                                                value={farmingRoundConfig.amounts[index] || ''}
                                                onChange={value => farmingRoundConfig.setAmount(index, value)}
                                                disabled={farmingRoundConfig.loading
                                                    || farmingRoundConfig.blocked}
                                            />
                                        </div>
                                    )
                                ))}

                                <div className="farming-config__filed">
                                    <div className="farming-config__label">
                                        {intl.formatMessage({
                                            id: 'FARMING_CONFIG_START_LABEL',
                                        })}
                                    </div>
                                    <div className="farming-config__cols">
                                        <TextInput
                                            placeholder={intl.formatMessage({
                                                id: 'FARMING_CONFIG_DATE_PLACEHOLDER',
                                            })}
                                            value={farmingRoundConfig.startDate}
                                            onChange={farmingRoundConfig.setStartDate}
                                            disabled={farmingRoundConfig.loading
                                                || farmingRoundConfig.blocked}
                                        />
                                        <TextInput
                                            placeholder={intl.formatMessage({
                                                id: 'FARMING_CONFIG_TIME_PLACEHOLDER',
                                            })}
                                            value={farmingRoundConfig.startTime}
                                            onChange={farmingRoundConfig.setStartTime}
                                            disabled={farmingRoundConfig.loading
                                                || farmingRoundConfig.blocked}
                                        />
                                    </div>
                                </div>

                                <div className="farming-config__action">
                                    <Button
                                        disabled={farmingRoundConfig.loading
                                            || farmingRoundConfig.blocked
                                            || !farmingRoundConfig.rewardIsValid}
                                        type="primary"
                                        onClick={submitReward}
                                    >
                                        {intl.formatMessage({
                                            id: 'FARMING_CONFIG_SAVE_CHANGES',
                                        })}
                                    </Button>
                                </div>
                            </>
                        )}

                        {currentTab === Tab.EndTime && (
                            <>
                                {farmingData.endTime === 0 && (
                                    <div className="farming-config__warning">
                                        <Warning
                                            theme="warning"
                                            title={intl.formatMessage({
                                                id: 'FARMING_CONFIG_CONFIRMATION_TEXT',
                                            })}
                                        />
                                    </div>
                                )}

                                <div className="farming-config__filed">
                                    <div className="farming-config__label">
                                        {intl.formatMessage({
                                            id: 'FARMING_CONFIG_END_LABEL',
                                        })}
                                    </div>
                                    <div className="farming-config__cols">
                                        <TextInput
                                            placeholder={intl.formatMessage({
                                                id: 'FARMING_CONFIG_DATE_PLACEHOLDER',
                                            })}
                                            value={farmingData.endTime > 0
                                                ? actualEndDateTime.toFormat('yyyy.MM.dd')
                                                : farmingEndDateConfig.endDate}
                                            onChange={farmingEndDateConfig.setEndDate}
                                            disabled={farmingEndDateConfig.loading || farmingData.endTime > 0}
                                        />
                                        <TextInput
                                            placeholder={intl.formatMessage({
                                                id: 'FARMING_CONFIG_TIME_PLACEHOLDER',
                                            })}
                                            value={farmingData.endTime > 0
                                                ? actualEndDateTime.toFormat('hh:mm')
                                                : farmingEndDateConfig.endTime}
                                            onChange={farmingEndDateConfig.setEndTime}
                                            disabled={farmingEndDateConfig.loading || farmingData.endTime > 0}
                                        />
                                    </div>
                                </div>

                                <div className="farming-config__action">
                                    <Button
                                        disabled={
                                            farmingEndDateConfig.loading
                                            || !farmingEndDateConfig.endDateIsValid
                                            || farmingData.endTime > 0
                                        }
                                        type="danger"
                                        onClick={showConfirmation}
                                    >
                                        {intl.formatMessage({
                                            id: 'FARMING_CONFIG_CLOSE_POOL',
                                        })}
                                    </Button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>,
        document.body,
    )
}

export const FarmingConfig = observer(FarmingConfigInner)
