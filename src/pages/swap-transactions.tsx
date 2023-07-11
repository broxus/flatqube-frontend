import * as React from 'react'
import { reaction } from 'mobx'
import { Observer } from 'mobx-react-lite'

import { useSwapPoolStoreContext } from '@/modules/Swap/context/SwapPoolStoreProvider'
import { SwapPoolTransactionsStoreProvider } from '@/modules/Swap/context/SwapPoolTransactionsStoreProvider'
import { SwapPoolTransactionsWrap } from '@/modules/Swap/components/SwapPoolTransactionsWrap'

export function SwapTransactions(): JSX.Element {
    const swapPoolStore = useSwapPoolStoreContext()

    React.useEffect(() => reaction(
        () => [
            swapPoolStore?.tokensCache.isReady,
            swapPoolStore?.address,
        ],
        async (
            [isReady, address],
            prevVals,
        ) => {
            if (isReady && address) {
                const prevAddress = prevVals?.[1]
                if (address !== prevAddress) {
                    await swapPoolStore?.init()
                }
            }
        },
        { delay: 50, fireImmediately: true },
    ), [])

    return (
        <Observer>
            {() => (
                <div style={({ marginTop: '64px' })}>
                    <SwapPoolTransactionsStoreProvider>
                        <SwapPoolTransactionsWrap notFound={swapPoolStore?.notFound} />
                    </SwapPoolTransactionsStoreProvider>
                </div>
            )}
        </Observer>
    )
}
