import * as React from 'react'
import { Observer } from 'mobx-react-lite'

import { TokenIcons } from '@/components/common/TokenIcons'
import { useAddLiquidityFormStoreContext } from '@/modules/Pools/context'

export function AddLiquidityPoolsIcons(): JSX.Element {
    const formStore = useAddLiquidityFormStoreContext()

    return (
        <Observer>
            {() => (
                <TokenIcons
                    icons={formStore.tokens.map(token => ({
                        address: token.address.toString(),
                        icon: token.icon,
                    }))}
                    size="medium"
                />
            )}
        </Observer>
    )
}
