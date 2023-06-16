import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { useP2PGraphStoreContext } from '@/modules/LimitOrders/context/P2PGraphStoreContext'
import { LimitGraph } from '@/modules/LimitOrders/components/LimitGraph'
import { PairIcons } from '@/components/common/PairIcons'
import { concatSymbols } from '@/utils'

function LimitGraphModal(): JSX.Element {
    const p2pGraph = useP2PGraphStoreContext()

    const onClose = (): void => {
        p2pGraph.setState('isShowChartModal', false)
    }

    return ReactDOM.createPortal(
        <div className="popup">
            <div onClick={onClose} className="popup-overlay" />
            <div className="popup__wrap popup__wrap-confirm-p2p">
                <Button
                    type="icon"
                    onClick={onClose}
                    className="popup-close"
                >
                    <Icon icon="close" />
                </Button>
                <h2 className="popup-title">
                    <div className="swap-stats__flex-row">
                        <PairIcons
                            leftToken={p2pGraph?.leftToken}
                            rightToken={p2pGraph?.rightToken}
                            small
                        />
                        <h2>
                            {concatSymbols(
                                p2pGraph?.leftToken?.symbol,
                                p2pGraph?.rightToken?.symbol,
                            )}
                        </h2>
                    </div>
                </h2>
                <LimitGraph
                    baseToken={p2pGraph.leftToken}
                    counterToken={p2pGraph.rightToken}
                    small
                />

            </div>
        </div>,
        document.body,
    )
}


export const SwapStatsModalContainer = observer(LimitGraphModal)
