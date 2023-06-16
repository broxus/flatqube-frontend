import * as React from 'react'
import { Observer } from 'mobx-react-lite'

import { useP2PGraphStoreContext } from '@/modules/LimitOrders/context/P2PGraphStoreContext'
import { LimitGraph } from '@/modules/LimitOrders/components/LimitGraph'
import { SwapStatsModalContainer } from '@/modules/LimitOrders/components/LimitGraphModal'

import './index.scss'


export function LimitGraphWrap(): JSX.Element {

    const p2pGraph = useP2PGraphStoreContext()

    return (
        <>
            <Observer>
                {() => (
                    <div className="limit__content">
                        <section className="section visible@m">
                            <LimitGraph
                                baseToken={p2pGraph.leftToken}
                                counterToken={p2pGraph.rightToken}
                            />
                        </section>
                    </div>
                )}
            </Observer>
            <Observer>
                {() => (p2pGraph.isShowChartModal ? (
                    <SwapStatsModalContainer key="isCreateConfirmationAwait" />
                ) : null
                )}
            </Observer>
        </>
    )
}
