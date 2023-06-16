import * as React from 'react'
import { observer } from 'mobx-react-lite'
// import { useIntl } from 'react-intl'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useP2PFormStoreContext } from '@/modules/LimitOrders/context/P2PFormStoreContext'
// import { useLimitSettings } from '@/modules/LimitOrders/hooks/useLimitSettings'

import './index.scss'


function Settings(): JSX.Element {
    const p2pFormStore = useP2PFormStoreContext()
    // const settings = useLimitSettings()

    return (
        <div className="swap-settings hidden@m">
            <Button
                // ref={settings.triggerRef}
                className="swap-settings__btn"
                onClick={() => p2pFormStore.setState('isShowChartModal', true)}
            >
                <Icon icon="chartUp" />
            </Button>
        </div>
    )
}


export const LimitSettings = observer(Settings)
