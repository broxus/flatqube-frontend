import * as React from 'react'

import { useP2PNotifyStore } from '@/stores/P2PNotifyStore'
import { useP2PNotificationCallbacks } from '@/modules/LimitOrders/hooks/useP2PNotificationCallbacks'

export function P2PGlobalNotify(): JSX.Element {
    const p2pNotifyCallbacks = useP2PNotificationCallbacks()
    const p2pNotify = React.useRef(useP2PNotifyStore(p2pNotifyCallbacks))
    React.useEffect(() => {
        p2pNotify.current.init()
    }, [])
    return <> </>
}
