import * as React from 'react'
import { Observer } from 'mobx-react-lite'

import { TokenIcons } from '@/components/common/TokenIcons'
import { useAddLiquidityFormStoreContext } from '@/modules/Liqudity/context'

export function PoolsIcons(): JSX.Element {
    const formStore = useAddLiquidityFormStoreContext()

    return (
        <Observer>
            {() => (
                <TokenIcons
                    icons={(formStore.leftToken && formStore.rightToken) ? [
                        { address: formStore.leftToken?.root, icon: formStore.leftToken?.icon },
                        { address: formStore.rightToken?.root, icon: formStore.rightToken?.icon },
                    ] : []}
                    size="medium"
                />
            )}
        </Observer>
    )
}
