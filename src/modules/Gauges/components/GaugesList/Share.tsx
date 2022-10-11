import { observer } from 'mobx-react-lite'
import * as React from 'react'

import { useContext } from '@/hooks/useContext'
import { GaugesListDataContext } from '@/modules/Gauges/providers/GaugesListDataProvider'
import { Spinner } from '@/components/common/Spinner'
import { formattedAmount } from '@/utils'

import styles from './index.module.scss'

type Props = {
    gaugeId: string;
}

function ShareInner({
    gaugeId,
}: Props): JSX.Element {
    const gaugesData = useContext(GaugesListDataContext)
    const share = gaugesData.share[gaugeId]

    if (share) {
        return (
            <>
                {formattedAmount(share)}
                %
            </>
        )
    }

    return (
        <Spinner
            size="xs"
            className={styles.dataSpinner}
        />
    )
}

export const Share = observer(ShareInner)
