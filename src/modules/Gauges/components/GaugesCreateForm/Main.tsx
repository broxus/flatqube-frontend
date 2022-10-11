import * as React from 'react'

import { CreateFormToken } from '@/modules/Gauges/components/GaugesCreateForm/Token'
import { CreateFormBoost } from '@/modules/Gauges/components/GaugesCreateForm/Boost'
import { CreateFormActions } from '@/modules/Gauges/components/GaugesCreateForm/Actions'
import { CreateFormRewards } from '@/modules/Gauges/components/GaugesCreateForm/Rewards'
import { DefaultReward } from '@/modules/Gauges/components/GaugesCreateForm/DefaultReward'

import styles from './index.module.scss'

export function CreateFormMain(): JSX.Element {
    return (
        <div className={styles.main}>
            <CreateFormToken />
            <CreateFormBoost />
            <DefaultReward />
            <CreateFormRewards />
            <CreateFormActions />
        </div>
    )
}
