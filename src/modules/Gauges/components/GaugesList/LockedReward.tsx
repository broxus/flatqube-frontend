import { observer } from 'mobx-react-lite'
import * as React from 'react'

import { useContext } from '@/hooks/useContext'
import { GaugesListDataContext } from '@/modules/Gauges/providers/GaugesListDataProvider'
import { formattedTokenAmount } from '@/utils'
import { Spinner } from '@/components/common/Spinner'

import styles from './index.module.scss'

type Props = {
    gaugeId: string;
}

function LockedRewardInner({
    gaugeId,
}: Props): JSX.Element {
    const gaugesData = useContext(GaugesListDataContext)
    const lockedReward = gaugesData.lockedReward[gaugeId]
    const extraTokens = gaugesData.extraTokens[gaugeId]
    const qubeReward = gaugesData.qubeLockedReward[gaugeId]
    const qubeToken = gaugesData.qubeToken[gaugeId]

    if (qubeReward && qubeToken && lockedReward && extraTokens) {
        return (
            <>
                <div>
                    {formattedTokenAmount(
                        qubeReward,
                        qubeToken.decimals,
                    )}
                    {' '}
                    {qubeToken.symbol}
                </div>
                {extraTokens.map((token, index) => (
                    <div key={token.root}>
                        {formattedTokenAmount(
                            lockedReward[index],
                            token.decimals,
                        )}
                        {' '}
                        {token.symbol}
                    </div>
                ))}
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

export const LockedReward = observer(LockedRewardInner)
