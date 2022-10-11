import * as React from 'react'
import { useIntl } from 'react-intl'

import { UserPerformanceAvailableReward } from '@/modules/Gauges/components/GaugesUserPerformance/AvailableReward'
import { UserPerformanceBalance } from '@/modules/Gauges/components/GaugesUserPerformance/Balance'
import { UserPerformanceLockedReward } from '@/modules/Gauges/components/GaugesUserPerformance/LockedReward'
import { UserStatus } from '@/modules/Gauges/components/GaugesUserPerformance/UserStatus'
import { GaugesTitle } from '@/modules/Gauges/components/GaugesTitle'
import { useContext } from '@/hooks/useContext'
import { MediaType, MediaTypeContext } from '@/context/MediaType'
import { UserStatusMobile } from '@/modules/Gauges/components/GaugesUserPerformance/UserStatusMobile'

import styles from './index.module.scss'

export function GaugesUserPerformance(): JSX.Element {
    const intl = useIntl()
    const mediaType = useContext(MediaTypeContext)

    const isDesktop = mediaType === MediaType.l || mediaType === MediaType.xl

    return (
        <>
            <GaugesTitle>
                {intl.formatMessage({
                    id: 'GAUGE_YOUR_FARMING_PERFORMANCE',
                })}
            </GaugesTitle>

            <div className={styles.content}>
                <UserPerformanceBalance />
                <UserPerformanceAvailableReward />
                <UserPerformanceLockedReward />

                {(isDesktop) ? (
                    <UserStatus />
                ) : (
                    <UserStatusMobile />
                )}
            </div>
        </>
    )
}
