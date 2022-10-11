import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

// import { Icon } from '@/components/common/Icon'
// import { Tooltip } from '@/components/common/Tooltip'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { GaugesTokens } from '@/modules/Gauges/components/GaugesTokens'
import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { GaugesUserDataContext } from '@/modules/Gauges/providers/GaugesUserDataProvider'
import { formattedAmount, formattedTokenAmount } from '@/utils'

import styles from './index.module.scss'

// TODO: Tooltip
function UserPerformanceLockedRewardInner(): JSX.Element {
    const intl = useIntl()
    // const infoRef = React.useRef<HTMLSpanElement>(null)
    const { qubeToken, extraTokens } = useContext(GaugesDataStoreContext)
    const {
        qubeLockedReward, extraLockedReward, lockedRewardUSDT, rewardIsLoading,
    } = useContext(GaugesUserDataContext)

    if (
        qubeToken
        && extraTokens
        && qubeLockedReward
        && extraLockedReward
        && lockedRewardUSDT
        && !rewardIsLoading
    ) {
        return (
            <GaugesPanel className={styles.lockedReward}>
                <h3 className={styles.title}>
                    {intl.formatMessage({
                        id: 'GAUGE_LOCKED_REWARD',
                    })}

                    {/* <span ref={infoRef}>
                        <Icon
                            className={styles.icon}
                            icon="infoFill"
                        />
                    </span>

                    <Tooltip
                        width={240}
                        alignY="top"
                        alignX="left"
                        target={infoRef}
                    >
                        {intl.formatMessage({
                            id: 'GAUGE_UNLOCKED_HINT',
                        }, {
                            percent: 10,
                            days: 20,
                        })}
                    </Tooltip> */}
                </h3>

                <div className={styles.amount}>
                    <div className={styles.value}>
                        $
                        {formattedAmount(lockedRewardUSDT)}
                    </div>
                </div>

                <GaugesTokens
                    items={[
                        {
                            amount: formattedTokenAmount(
                                qubeLockedReward,
                                qubeToken.decimals,
                            ),
                            token: qubeToken,
                        },
                        ...extraTokens.map((token, index) => ({
                            amount: formattedTokenAmount(
                                extraLockedReward[index],
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

export const UserPerformanceLockedReward = observer(UserPerformanceLockedRewardInner)
