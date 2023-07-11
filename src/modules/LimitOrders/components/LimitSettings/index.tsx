import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useP2PFormStoreContext } from '@/modules/LimitOrders/context/P2PFormStoreContext'

import './index.scss'


function Settings(): JSX.Element {
    const p2pFormStore = useP2PFormStoreContext()

    return (
        <div className="swap-settings hidden@m">
            <Button
                className="swap-settings__btn"
                onClick={() => p2pFormStore.setState('isShowChartModal', true)}
            >
                <Icon icon="chartUp" />
            </Button>
        </div>
    )
}


export const LimitSettings = observer(Settings)
