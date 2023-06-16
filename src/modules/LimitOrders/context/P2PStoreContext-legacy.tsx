import * as React from 'react'
import { reaction } from 'mobx'

import { P2PStore } from '@/modules/LimitOrders/stores/P2PStore-legacy'
import { P2PStoreProviderProps } from '@/modules/LimitOrders/types'
import { debug, error, storage } from '@/utils'
import { useP2PNotificationCallbacks } from '@/modules/LimitOrders/hooks/useP2PNotificationCallbacks'
import { LocalStorageSwapAmounts } from '@/misc'


// @ts-ignore
export const P2PStoreContext = React.createContext<P2PStore>()

export function useP2PStoreContext(): P2PStore {
    return React.useContext(P2PStoreContext)
}

export function P2PStoreProvider({
    // beforeInit,
    children,
    defaultLeftTokenAddress,
    defaultRightTokenAddress,
    tokensCache,
    wallet,
}: P2PStoreProviderProps): JSX.Element {

    if (wallet === undefined) {
        throw new Error('Ever Wallet Service not being passed in props')
    }

    if (tokensCache === undefined) {
        throw new Error('Tokens Cache Service not being passed in props')
    }
    const callbacks = useP2PNotificationCallbacks()

    const options = React.useMemo(() => ({
        ...callbacks,
        defaultLeftTokenAddress,
        defaultRightTokenAddress,
    }), [
        defaultLeftTokenAddress,
        defaultRightTokenAddress,
    ])

    const context = React.useMemo<P2PStore>(
        () => new P2PStore(wallet, tokensCache, { ...options }),
        [options],
    )

    React.useEffect(() => {
        const tokensListDisposer = reaction(
            () => tokensCache.isReady,
            async isReady => {
                context.setState('isPreparing', true)
                if (isReady) {
                    try {
                        // await beforeInit?.(context)
                        const amountsStorage = storage.get('amounts')
                        if (amountsStorage) {
                            const amounts: LocalStorageSwapAmounts = JSON.parse(amountsStorage)
                            debug('LIMIT amounts', amounts)
                            const { leftAmount = '', rightAmount = '' } = amounts
                            context.setData({
                                leftAmount, rightAmount,
                            })
                        }
                        // await context.init() // duplicate init
                    }
                    catch (e) {
                        error('P2P Store initializing error', e)
                    }
                    finally {
                        context.setState('isPreparing', false)
                    }
                }
            },
            { delay: 50, fireImmediately: true },
        )

        return () => {
            tokensListDisposer()
            context.dispose().catch((reason: any) => error(reason))
        }
    }, [context])

    return (
        <P2PStoreContext.Provider value={context}>
            {children}
        </P2PStoreContext.Provider>
    )
}
