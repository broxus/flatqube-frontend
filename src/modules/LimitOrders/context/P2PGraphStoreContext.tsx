import * as React from 'react'
import { reaction } from 'mobx'

import { P2PGraphStore } from '@/modules/LimitOrders/stores/P2PGraphStore'
import { error } from '@/utils'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { WalletService } from '@/stores/WalletService'
import { P2PGraphOptions } from '@/modules/LimitOrders/types'


export type P2PGraphStoreProviderProps = React.PropsWithChildren<{
    beforeInit?: (formStore: P2PGraphStore) => Promise<void>;
    tokensCache: TokensCacheService;
    wallet: WalletService;
} & P2PGraphOptions>

// @ts-ignore
export const P2PGraphStoreContext = React.createContext<P2PGraphStore>()

export function useP2PGraphStoreContext(): P2PGraphStore {
    return React.useContext(P2PGraphStoreContext)
}

export function P2PGraphStoreProvider({
    beforeInit,
    children,
    defaultLeftTokenAddress,
    defaultRightTokenAddress,
    tokensCache,
    wallet,
}: P2PGraphStoreProviderProps): JSX.Element {

    if (wallet === undefined) {
        throw new Error('Ever Wallet Service not being passed in props')
    }

    if (tokensCache === undefined) {
        throw new Error('Tokens Cache Service not being passed in props')
    }


    const options = React.useMemo(() => ({
        defaultLeftTokenAddress,
        defaultRightTokenAddress,
    }), [
        defaultLeftTokenAddress,
        defaultRightTokenAddress,
    ])

    const context = React.useMemo<P2PGraphStore>(
        () => new P2PGraphStore(wallet, tokensCache, { ...options }),
        [options],
    )

    React.useEffect(() => {
        const tokensListDisposer = reaction(
            () => tokensCache.isReady,
            async isReady => {
                context.setState('isPreparing', true)
                if (isReady) {
                    try {
                        await beforeInit?.(context)
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
        <P2PGraphStoreContext.Provider value={context}>
            {children}
        </P2PGraphStoreContext.Provider>
    )
}
