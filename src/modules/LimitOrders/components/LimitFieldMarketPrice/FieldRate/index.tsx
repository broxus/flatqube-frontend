import * as React from 'react'
import { Observer } from 'mobx-react-lite'

import { Button } from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import { Token } from '@/misc'
import { useP2PFormStoreContext } from '@/modules/LimitOrders/context/P2PFormStoreContext'
import { PairIcons } from '@/components/common/PairIcons'
import { SwapDirection } from '@/modules/Swap/types'

import './index.scss'

type Props = {
    leftToken?: Token;
    rightToken?: Token;
}

export function FieldRate({
    leftToken,
    rightToken,
}: Props): JSX.Element {
    const p2pFormStore = useP2PFormStoreContext()

    if (leftToken?.symbol === undefined || rightToken?.symbol === undefined) {
        return <> </>
    }
    return (
        <div className="field-rate">
            <Observer>
                {() => (
                    <PairIcons
                        leftToken={p2pFormStore.rateDirection === SwapDirection.LTR ? leftToken : rightToken}
                        rightToken={p2pFormStore.rateDirection === SwapDirection.LTR ? rightToken : leftToken}
                        small
                    />
                )}
            </Observer>

            <Button
                size="xs"
                className="field-rate__reverse-btn"
                onClick={p2pFormStore.toggleRateDirection}
            >
                <Icon icon="reverseHorizontal" />
            </Button>
        </div>
    )
}
