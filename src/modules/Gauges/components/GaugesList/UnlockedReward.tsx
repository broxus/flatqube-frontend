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

function UnlockedRewardInner({
    gaugeId,
}: Props): JSX.Element {
    const gaugesData = useContext(GaugesListDataContext)
    const unlockedReward = gaugesData.unlockedReward[gaugeId]
    const extraTokens = gaugesData.extraTokens[gaugeId]
    const qubeReward = gaugesData.qubeUnlockedReward[gaugeId]
    const qubeToken = gaugesData.qubeToken[gaugeId]

    if (qubeReward && qubeToken && unlockedReward && extraTokens) {
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
                            unlockedReward[index],
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

export const UnlockedReward = observer(UnlockedRewardInner)
