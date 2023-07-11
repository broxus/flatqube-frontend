import * as React from 'react'
import { reaction } from 'mobx'

import { P2PFormStore } from '@/modules/LimitOrders/stores/P2PFormStore'
import { debug, error, storage } from '@/utils'
import { useP2PNotificationCallbacks } from '@/modules/LimitOrders/hooks/useP2PNotificationCallbacks'
import { LocalStorageSwapAmounts } from '@/misc'
import { TokensCacheService } from '@/stores/TokensCacheService'
import { WalletService } from '@/stores/WalletService'
import { P2PFormOptions } from '@/modules/LimitOrders/types'

export type P2PFormStoreProviderProps = React.PropsWithChildren<{
    beforeInit?: (formStore: P2PFormStore) => Promise<void>;
    tokensCache: TokensCacheService;
    wallet: WalletService;
} & P2PFormOptions>

// @ts-ignore
export const P2PFormStoreContext = React.createContext<P2PFormStore>()

export function useP2PFormStoreContext(): P2PFormStore {
    return React.useContext(P2PFormStoreContext)
}

export function P2PFormStoreProvider({
    beforeInit,
    children,
    defaultLeftTokenAddress,
    defaultRightTokenAddress,
    tokensCache,
    wallet,
}: P2PFormStoreProviderProps): JSX.Element {

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

    const context = React.useMemo<P2PFormStore>(
        () => new P2PFormStore(wallet, tokensCache, { ...options }),
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
                        const amountsStorage = storage.get('amounts')
                        if (amountsStorage) {
                            const amounts: LocalStorageSwapAmounts = JSON.parse(amountsStorage)
                            debug('LIMIT amounts', amounts)
                            const { leftAmount = '', rightAmount = '' } = amounts
                            context.setData({
                                leftAmount, rightAmount,
                            })
                        }
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
        <P2PFormStoreContext.Provider value={context}>
            {children}
        </P2PFormStoreContext.Provider>
    )
}
