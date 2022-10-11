import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { GaugesTokens } from '@/modules/Gauges/components/GaugesTokens'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { formattedAmount, formattedTokenAmount } from '@/utils'
import { Button } from '@/components/common/Button'
import { GaugesClaimRewardContext } from '@/modules/Gauges/providers/GaugesClaimRewardProvider'
import { Spinner } from '@/components/common/Spinner'

import styles from './index.module.scss'

function UserPerformanceAvailableRewardInner(): JSX.Element {
    const intl = useIntl()
    const data = useContext(GaugesDataStoreContext)
    const userData = useContext(GaugesUserDataContext)
    const claimReward = useContext(GaugesClaimRewardContext)

    if (
        data.qubeToken
        && data.extraTokens
        && userData.qubeUnlockedReward
        && userData.extraUnlockedReward
        && userData.unlockedRewardUSDT
        && !userData.rewardIsLoading
    ) {
        return (
            <GaugesPanel className={styles.availableReward}>
                <h3 className={styles.title}>
                    {intl.formatMessage({
                        id: 'GAUGE_AVAILABLE_REWARD',
                    })}
                </h3>

                <div className={styles.amount}>
                    <div className={styles.value}>
                        $
                        {formattedAmount(userData.unlockedRewardUSDT)}
                    </div>

                    {claimReward.hasReward && (
                        <Button
                            size="sm"
                            type="secondary"
                            onClick={claimReward.claim}
                            disabled={claimReward.isLoading}
                            className={styles.btnClaim}
                        >
                            {intl.formatMessage({
                                id: 'GAUGE_BALANCE_WITHDRAW_CLAIM_TAB',
                            })}
                            {claimReward.isLoading && (
                                <Spinner size="xs" />
                            )}
                        </Button>
                    )}
                </div>

                <GaugesTokens
                    items={[
                        {
                            amount: formattedTokenAmount(
                                userData.qubeUnlockedReward,
                                data.qubeToken.decimals,
                            ),
                            token: data.qubeToken,
                        },
                        ...data.extraTokens.map((token, index) => ({
                            amount: formattedTokenAmount(
                                userData.extraUnlockedReward?.[index],
                                token.decimals,
                            ),
                            token,
                        })),
                    ]}
                />
            </GaugesPanel>
        )
    }

    return (
        <GaugesPanel>
            <h3 className={styles.title}>
                <Placeholder width={220} />
            </h3>
            <div className={styles.amount}>
                <Placeholder width={100} />
            </div>
        </GaugesPanel>
    )
}

export const UserPerformanceAvailableReward = observer(UserPerformanceAvailableRewardInner)
