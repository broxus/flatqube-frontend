import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { useContext } from '@/hooks/useContext'
import { GaugesCreateFormContext } from '@/modules/Gauges/providers/GaugesCreateFormProvider'
import { CreateFormReward } from '@/modules/Gauges/components/GaugesCreateForm/Reward'

function CreateFormRewardsInner(): JSX.Element {
    const form = useContext(GaugesCreateFormContext)

    return (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
            {form.rewards?.map((_, index) => (
                <CreateFormReward
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    rewardIndex={index}
                />
            ))}
        </>
    )
}

export const CreateFormRewards = observer(CreateFormRewardsInner)
