import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { GaugesPanel } from '@/modules/Gauges/components/GaugesPanel'
import { GaugesTokens } from '@/modules/Gauges/components/GaugesTokens'
import { useContext } from '@/hooks/useContext'
import { GaugesDataStoreContext } from '@/modules/Gauges/providers/GaugesDataProvider'
import { Placeholder } from '@/components/common/Placeholder'
import { formattedTokenAmount } from '@/utils'

import styles from './index.module.scss'

function StatisticsFarmingSpeedInner(): JSX.Element {
    const intl = useIntl()
    const {
        qubeToken, extraTokens, qubeTokenSpeed, extraTokenSpeed,
    } = useContext(GaugesDataStoreContext)

    if (qubeToken && extraTokens && qubeTokenSpeed && extraTokenSpeed) {
        return (
            <GaugesPanel className={styles.farmingSpeed}>
                <div className={styles.title}>
                    {intl.formatMessage({
                        id: 'GAUGE_FARMING_SPEED',
                    })}
                </div>

                <GaugesTokens
                    items={[
                        {
                            amount: formattedTokenAmount(
                                qubeTokenSpeed,
                                qubeToken.decimals,
                            ),
                            token: qubeToken,
                        },
                        ...extraTokens.map((token, index) => ({
                            amount: formattedTokenAmount(
                                extraTokenSpeed[index],
                                extraTokens[index].decimals,
                            ),
                            token,
                        })),
                    ]}
                />
            </GaugesPanel>
        )
    }

    return (
        <GaugesPanel className={styles.farmingSpeed}>
            <h3 className={styles.title}>
                <Placeholder width={220} />
            </h3>
            <div>
                <Placeholder width={60} height={24} />
                <br />
                <Placeholder width={60} height={24} />
            </div>
        </GaugesPanel>
    )
}

export const StatisticsFarmingSpeed = observer(StatisticsFarmingSpeedInner)
